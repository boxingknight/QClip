// src/context/TimelineContext.js
import React, { createContext, useContext, useReducer, useState, useCallback } from 'react';

const TimelineContext = createContext();

// Helper function to get track color based on type
const getTrackColor = (trackType) => {
  const colors = {
    video: '#3b82f6',
    audio: '#10b981',
    text: '#f59e0b',
    effect: '#8b5cf6'
  };
  return colors[trackType] || '#64748b';
};

const initialState = {
  // Enhanced multi-track state structure
  clips: [],
  tracks: [
    { 
      id: 'video-1', 
      type: 'video', 
      name: 'Video Track 1', 
      height: 60, 
      muted: false, 
      soloed: false,
      locked: false, 
      visible: true,
      color: '#3b82f6',
      clips: [] 
    },
    { 
      id: 'video-2', 
      type: 'video', 
      name: 'Video Track 2', 
      height: 60, 
      muted: false, 
      soloed: false,
      locked: false, 
      visible: true,
      color: '#8b5cf6',
      clips: [] 
    },
    { 
      id: 'audio-1', 
      type: 'audio', 
      name: 'Audio Track', 
      height: 40, 
      muted: false, 
      soloed: false,
      locked: false, 
      visible: true,
      color: '#10b981',
      clips: [] 
    }
  ],
  
  // Selection state management
  selection: {
    clips: [],
    tracks: [],
    mode: 'single', // 'single' | 'multiple' | 'range'
    anchor: null
  },
  
  // Timeline navigation and zoom
  playhead: 0,
  zoom: 1,
  duration: 0,
  
  // Magnetic timeline settings
  magneticSnap: true,
  snapThreshold: 10, // pixels
  
  // Trim data per clip (legacy support)
  clipTrims: {},
  
  // Rendering state
  isRendering: false,
  renderProgress: 0,
  
  // Undo/Redo history
  history: [],
  historyIndex: -1
};

const timelineReducer = (state, action) => {
  console.log('🎬 [REDUCER] Action received:', action.type, action);
  
  switch (action.type) {
    case 'ADD_CLIPS':
      // Calculate the end time of all existing clips on video-1 track
      const existingClipsOnTrack = state.clips.filter(c => c.trackId === 'video-1');
      let nextStartTime = 0;
      if (existingClipsOnTrack.length > 0) {
        // Find the maximum end time (startTime + duration) of existing clips
        nextStartTime = Math.max(...existingClipsOnTrack.map(c => c.startTime + c.duration));
      }
      
      const newClips = action.clips.map((clip, index) => ({
        id: clip.id,
        name: clip.name,
        path: clip.path,
        duration: clip.duration,
        originalDuration: clip.duration, // Store the ORIGINAL untrimmed duration - NEVER changes!
        startTime: nextStartTime + (index > 0 ? action.clips.slice(0, index).reduce((sum, c) => sum + c.duration, 0) : 0), // Place clips sequentially
        trackId: 'video-1', // Default to first video track
        trimIn: 0,
        trimOut: clip.duration,
        effects: [],
        trimmedPath: null,
        isTrimmed: false,
        trimStartOffset: 0,
        // Store metadata properties
        fileSize: clip.fileSize || 0,
        width: clip.width || 0,
        height: clip.height || 0,
        fps: clip.fps || 30,
        codec: clip.codec || 'unknown',
        hasAudio: clip.hasAudio || false,
        thumbnailUrl: clip.thumbnailUrl || null,
        metadataError: clip.metadataError || null
      }));

      // Initialize trim data for new clips
      const newClipTrims = { ...state.clipTrims };
      newClips.forEach(clip => {
        if (clip.duration) {
          newClipTrims[clip.id] = {
            inPoint: 0,
            outPoint: clip.duration
          };
        }
      });

      // Add clips to first video track
      const updatedTracks = state.tracks.map(track => 
        track.id === 'video-1' 
          ? { ...track, clips: [...track.clips, ...newClips.map(c => c.id)] }
          : track
      );

      // Auto-select first clip if no selection exists (for immediate playback)
      const shouldAutoSelect = state.selection.clips.length === 0 && newClips.length > 0;
      const updatedSelection = shouldAutoSelect
        ? { 
            clips: [newClips[0].id], 
            tracks: [],
            mode: 'single',
            anchor: newClips[0].id
          }
        : state.selection;

      console.log('ADD_CLIPS: Auto-selecting first clip?', { 
        shouldAutoSelect, 
        firstClipId: newClips[0]?.id,
        updatedSelection 
      });

      return {
        ...state,
        clips: [...state.clips, ...newClips],
        tracks: updatedTracks,
        clipTrims: newClipTrims,
        selection: updatedSelection,
        duration: Math.max(state.duration, ...newClips.map(c => c.startTime + c.duration))
      };

    case 'SET_PLAYHEAD':
      return {
        ...state,
        playhead: action.time
      };

    case 'SET_IN_POINT':
      const selectedClipIdIn = state.selection.clips[0];
      if (!selectedClipIdIn) return state;
      
      const clipId = selectedClipIdIn;
      const currentTrim = state.clipTrims[clipId] || { inPoint: 0, outPoint: 0 };
      
      return {
        ...state,
        clipTrims: {
          ...state.clipTrims,
          [clipId]: {
            ...currentTrim,
            inPoint: action.time
          }
        }
      };

    case 'SET_OUT_POINT':
      const selectedClipIdOut = state.selection.clips[0];
      if (!selectedClipIdOut) return state;
      
      const clipIdOut = selectedClipIdOut;
      const currentTrimOut = state.clipTrims[clipIdOut] || { inPoint: 0, outPoint: 0 };
      
      return {
        ...state,
        clipTrims: {
          ...state.clipTrims,
          [clipIdOut]: {
            ...currentTrimOut,
            outPoint: action.time
          }
        }
      };

    case 'RESET_TRIM':
      const selectedClipIdReset = state.selection.clips[0];
      if (!selectedClipIdReset) return state;
      
      const selectedClip = state.clips.find(c => c.id === selectedClipIdReset);
      if (!selectedClip) return state;
      
      return {
        ...state,
        clipTrims: {
          ...state.clipTrims,
          [selectedClipIdReset]: {
            inPoint: 0,
            outPoint: selectedClip.duration || 0
          }
        }
      };

    case 'APPLY_TRIM_SUCCESS':
      const { clipId: appliedClipId, outputPath, trimmedDuration, trimStartOffset } = action;
      
      const updatedClips = state.clips.map(clip =>
        clip.id === appliedClipId
          ? {
              ...clip,
              trimmedPath: outputPath,
              isTrimmed: true,
              duration: trimmedDuration,
              trimStartOffset: trimStartOffset
            }
          : clip
      );

      // Remove trim data for applied clip
      const updatedClipTrims = { ...state.clipTrims };
      delete updatedClipTrims[appliedClipId];

      return {
        ...state,
        clips: updatedClips,
        clipTrims: updatedClipTrims,
        isRendering: false,
        renderProgress: 0
      };

    case 'SET_RENDERING':
      return {
        ...state,
        isRendering: action.isRendering,
        renderProgress: action.renderProgress || 0
      };

    case 'UPDATE_CLIP_DURATION':
      const { clipId: durationClipId, duration } = action;
      
      return {
        ...state,
        clips: state.clips.map(clip =>
          clip.id === durationClipId
            ? { ...clip, duration }
            : clip
        )
      };

    // Track Management Actions
    case 'ADD_TRACK':
      const newTrack = {
        id: action.id || `track-${Date.now()}`,
        name: action.name || `Track ${state.tracks.length + 1}`,
        type: action.trackType || 'video',
        height: 60,
        muted: false,
        soloed: false,
        locked: false,
        visible: true,
        color: getTrackColor(action.trackType || 'video'),
        clips: []
      };
      return {
        ...state,
        tracks: [...state.tracks, newTrack]
      };

    case 'REMOVE_TRACK':
      return {
        ...state,
        tracks: state.tracks.filter(track => track.id !== action.trackId),
        clips: state.clips.filter(clip => clip.trackId !== action.trackId)
      };

    case 'RENAME_TRACK':
      return {
        ...state,
        tracks: state.tracks.map(track =>
          track.id === action.trackId
            ? { ...track, name: action.name }
            : track
        )
      };

    case 'REORDER_TRACKS':
      const reorderedTracks = action.trackIds.map(id => 
        state.tracks.find(track => track.id === id)
      ).filter(Boolean);
      return {
        ...state,
        tracks: reorderedTracks
      };

    case 'UPDATE_TRACK_SETTINGS':
      return {
        ...state,
        tracks: state.tracks.map(track =>
          track.id === action.trackId
            ? { ...track, ...action.settings }
            : track
        )
      };

    // Enhanced Clip Management Actions
    case 'ADD_CLIP':
      console.log('🎬 [ADD_CLIP REDUCER] Received action:', {
        trackId: action.trackId,
        clipId: action.id,
        clipName: action.name,
        startTime: action.startTime,
        duration: action.duration,
        fullAction: action
      });
      
      // 🎯 CRITICAL: Calculate startTime based on existing clips on the same track
      // Find all clips on the same track
      const clipsOnTrack = state.clips.filter(c => c.trackId === action.trackId);
      
      // Calculate next available start time (snap to end of last clip)
      let calculatedStartTime = 0;
      if (clipsOnTrack.length > 0) {
        // Find the clip with the latest end time
        const latestClip = clipsOnTrack.reduce((latest, current) => {
          const currentEnd = current.startTime + current.duration;
          const latestEnd = latest.startTime + latest.duration;
          return currentEnd > latestEnd ? current : latest;
        });
        calculatedStartTime = latestClip.startTime + latestClip.duration;
      }
      
      console.log('🎬 [ADD_CLIP POSITIONING]', {
        trackId: action.trackId,
        clipsOnTrack: clipsOnTrack.length,
        calculatedStartTime,
        requestedStartTime: action.startTime
      });
      
      const newClip = {
        id: action.id || `clip-${Date.now()}`,
        trackId: action.trackId,
        name: action.name,
        path: action.path,
        // ✅ Use calculated start time (snap to end) instead of drop position
        startTime: calculatedStartTime,
        duration: action.duration,
        originalDuration: action.duration, // Add missing originalDuration
        trimIn: 0,
        trimOut: action.duration,
        thumbnail: action.thumbnail,
        waveform: action.waveform,
        selected: false,
        locked: false,
        effects: [],
        trimmedPath: null, // Add missing trimmedPath
        isTrimmed: false,
        trimStartOffset: 0,
        // Add metadata properties
        fileSize: action.fileSize || 0,
        width: action.width || 0,
        height: action.height || 0,
        fps: action.fps || 0,
        codec: action.codec || '',
        hasAudio: action.hasAudio || false,
        thumbnailUrl: action.thumbnailUrl || null,
        type: action.type || 'video'
      };
      
      console.log('🎬 [ADD_CLIP REDUCER] Created clip object:', newClip);
      console.log('🎬 [ADD_CLIP REDUCER] Current clips count:', state.clips.length);
      console.log('🎬 [ADD_CLIP REDUCER] New clips count:', state.clips.length + 1);
      
      const newState = {
        ...state,
        clips: [...state.clips, newClip]
      };
      
      console.log('🎬 [ADD_CLIP REDUCER] ✅ Returning new state with clips:', newState.clips.length);
      
      return newState;

    case 'REMOVE_CLIP':
      return {
        ...state,
        clips: state.clips.filter(clip => clip.id !== action.clipId)
      };

    case 'MOVE_CLIP':
      return {
        ...state,
        clips: state.clips.map(clip =>
          clip.id === action.clipId
            ? { 
                ...clip, 
                startTime: action.startTime,
                trackId: action.trackId || clip.trackId
              }
            : clip
        )
      };

    case 'TRIM_CLIP':
      console.log('[TRIM_CLIP REDUCER]', {
        clipId: action.clipId,
        oldClip: state.clips.find(c => c.id === action.clipId),
        newTrimIn: action.trimIn,
        newTrimOut: action.trimOut,
        newDuration: action.trimOut - action.trimIn
      });
      
      // 🎯 CRITICAL: Implement ripple effect - reposition clips after trimmed clip
      const trimmedClip = state.clips.find(c => c.id === action.clipId);
      if (!trimmedClip) return state;
      
      const oldDuration = trimmedClip.duration;
      const newDuration = action.trimOut - action.trimIn;
      const durationDelta = newDuration - oldDuration;
      
      // Calculate the end time of the trimmed clip
      const trimmedClipEndTime = trimmedClip.startTime + oldDuration;
      
      console.log('[TRIM_CLIP RIPPLE EFFECT]', {
        clipId: action.clipId,
        oldDuration,
        newDuration,
        durationDelta,
        trimmedClipEndTime,
        trackId: trimmedClip.trackId
      });
      
      return {
        ...state,
        clips: state.clips.map(clip => {
          if (clip.id === action.clipId) {
            // Update the trimmed clip
            return {
              ...clip,
              trimIn: action.trimIn,
              trimOut: action.trimOut,
              duration: newDuration
            };
          } else if (
            clip.trackId === trimmedClip.trackId && 
            clip.startTime >= trimmedClipEndTime
          ) {
            // 🎯 RIPPLE EFFECT: Shift clips that come after the trimmed clip
            const newStartTime = clip.startTime + durationDelta;
            console.log(`[RIPPLE] Moving clip ${clip.id} from ${clip.startTime}s to ${newStartTime}s`);
            return {
              ...clip,
              startTime: Math.max(trimmedClip.startTime + newDuration, newStartTime)
            };
          }
          return clip;
        })
      };

    case 'SPLIT_CLIP':
      const originalClip = state.clips.find(c => c.id === action.clipId);
      if (!originalClip) return state;
      
      const splitTime = action.splitTime - originalClip.startTime;
      
      const firstClip = {
        ...originalClip,
        duration: splitTime,
        trimOut: originalClip.trimIn + splitTime
      };
      
      const secondClip = {
        ...originalClip,
        id: `clip-${Date.now()}`,
        startTime: action.splitTime,
        duration: originalClip.duration - splitTime,
        trimIn: originalClip.trimIn + splitTime,
        trimOut: originalClip.trimOut
      };
      
      return {
        ...state,
        clips: [
          ...state.clips.filter(c => c.id !== action.clipId),
          firstClip,
          secondClip
        ]
      };

    case 'DUPLICATE_CLIP':
      const clipToDuplicate = state.clips.find(c => c.id === action.clipId);
      if (!clipToDuplicate) return state;
      
      const duplicatedClip = {
        ...clipToDuplicate,
        id: `clip-${Date.now()}`,
        startTime: action.startTime || clipToDuplicate.startTime + clipToDuplicate.duration + 1,
        selected: false
      };
      
      return {
        ...state,
        clips: [...state.clips, duplicatedClip]
      };

    // Selection Management Actions
    case 'SELECT_CLIP':
      const isMultiSelect = action.addToSelection || false;
      let newSelection = { ...state.selection };
      
      if (isMultiSelect) {
        if (newSelection.clips.includes(action.clipId)) {
          newSelection.clips = newSelection.clips.filter(id => id !== action.clipId);
        } else {
          newSelection.clips = [...newSelection.clips, action.clipId];
        }
        newSelection.mode = newSelection.clips.length > 1 ? 'multiple' : 'single';
      } else {
        newSelection.clips = [action.clipId];
        newSelection.mode = 'single';
        newSelection.anchor = action.clipId;
      }
      
      return {
        ...state,
        selection: newSelection
      };

    case 'SELECT_MULTIPLE_CLIPS':
      return {
        ...state,
        selection: {
          clips: action.clipIds,
          tracks: [],
          mode: 'multiple',
          anchor: action.anchor
        }
      };

    case 'SELECT_RANGE':
      const clipsInRange = state.clips.filter(clip => 
        clip.startTime >= action.startTime && 
        clip.startTime + clip.duration <= action.endTime
      );
      return {
        ...state,
        selection: {
          clips: clipsInRange.map(clip => clip.id),
          tracks: [],
          mode: 'range',
          anchor: action.anchor
        }
      };

    case 'CLEAR_SELECTION':
      return {
        ...state,
        selection: {
          clips: [],
          tracks: [],
          mode: 'single',
          anchor: null
        }
      };

    // Timeline Navigation Actions
    case 'SET_ZOOM':
      return {
        ...state,
        zoom: Math.max(0.1, Math.min(10, action.zoom))
      };

    // Magnetic Timeline Actions
    case 'ENABLE_MAGNETIC_SNAP':
      return {
        ...state,
        magneticSnap: action.enabled
      };

    case 'SET_SNAP_THRESHOLD':
      return {
        ...state,
        snapThreshold: Math.max(1, Math.min(50, action.threshold))
      };

    // Undo/Redo Actions
    case 'SAVE_STATE':
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push({
        clips: [...state.clips],
        tracks: [...state.tracks],
        selection: { ...state.selection },
        playhead: state.playhead,
        zoom: state.zoom
      });
      
      return {
        ...state,
        history: newHistory.slice(-50), // Keep last 50 states
        historyIndex: newHistory.length - 1
      };

    case 'UNDO':
      if (state.historyIndex > 0) {
        const previousState = state.history[state.historyIndex - 1];
        return {
          ...state,
          clips: [...previousState.clips],
          tracks: [...previousState.tracks],
          selection: { ...previousState.selection },
          playhead: previousState.playhead,
          zoom: previousState.zoom,
          historyIndex: state.historyIndex - 1
        };
      }
      return state;

    case 'REDO':
      if (state.historyIndex < state.history.length - 1) {
        const nextState = state.history[state.historyIndex + 1];
        return {
          ...state,
          clips: [...nextState.clips],
          tracks: [...nextState.tracks],
          selection: { ...nextState.selection },
          playhead: nextState.playhead,
          zoom: nextState.zoom,
          historyIndex: state.historyIndex + 1
        };
      }
      return state;

    default:
      return state;
  }
};

export const TimelineProvider = ({ children }) => {
  const [state, dispatch] = useReducer(timelineReducer, initialState);

  // Drag state management (temporary UI state, not part of reducer)
  const [dragState, setDragState] = useState({
    isDragging: false,
    draggedClip: null,
    dragStartTrack: null,
    dragStartPosition: null,
    dropTarget: null,
    snapTarget: null,
    isValidDrop: false
  });

  // Drag state management functions
  const startDrag = useCallback((clipId, trackId, startTime) => {
    const clip = state.clips.find(c => c.id === clipId);
    if (!clip) {
      console.warn('🎬 [DRAG] Clip not found for drag:', clipId);
      return;
    }
    
    setDragState({
      isDragging: true,
      draggedClip: clip,
      dragStartTrack: trackId,
      dragStartPosition: startTime,
      dropTarget: null,
      snapTarget: null,
      isValidDrop: false
    });
    
    console.log('🎬 [DRAG] Started:', { clipId, trackId, startTime });
  }, [state.clips]);

  const updateDrag = useCallback((trackId, time) => {
    // Note: Snap calculation will be done in Track component using utilities
    // This just updates the drop target
    setDragState(prev => {
      if (!prev.isDragging) return prev;
      
      return {
        ...prev,
        dropTarget: trackId,
        // snapTarget will be calculated in Track component
        // isValidDrop will be calculated in Track component
      };
    });
  }, []);

  const completeDrag = useCallback(() => {
    console.log('🎬 [DRAG] Completed');
    setDragState({
      isDragging: false,
      draggedClip: null,
      dragStartTrack: null,
      dragStartPosition: null,
      dropTarget: null,
      snapTarget: null,
      isValidDrop: false
    });
  }, []);

  const cancelDrag = useCallback(() => {
    console.log('🎬 [DRAG] Cancelled');
    // Restore original position if needed (could be added later)
    completeDrag();
  }, [completeDrag]);

  const addClips = (clips) => {
    dispatch({ type: 'ADD_CLIPS', clips });
  };

  const setPlayhead = (time) => {
    dispatch({ type: 'SET_PLAYHEAD', time });
  };

  const setInPoint = (time) => {
    dispatch({ type: 'SET_IN_POINT', time });
  };

  const setOutPoint = (time) => {
    dispatch({ type: 'SET_OUT_POINT', time });
  };

  const resetTrim = () => {
    dispatch({ type: 'RESET_TRIM' });
  };

  const applyTrimSuccess = (clipId, outputPath, trimmedDuration, trimStartOffset) => {
    dispatch({ 
      type: 'APPLY_TRIM_SUCCESS', 
      clipId, 
      outputPath, 
      trimmedDuration, 
      trimStartOffset 
    });
  };

  const setRendering = (isRendering, renderProgress = 0) => {
    dispatch({ type: 'SET_RENDERING', isRendering, renderProgress });
  };

  const updateClipDuration = (clipId, duration) => {
    dispatch({ type: 'UPDATE_CLIP_DURATION', clipId, duration });
  };

  // Track Management Functions
  const addTrack = (trackType, name) => {
    dispatch({ type: 'ADD_TRACK', trackType, name });
  };

  const removeTrack = (trackId) => {
    dispatch({ type: 'REMOVE_TRACK', trackId });
  };

  const renameTrack = (trackId, name) => {
    dispatch({ type: 'RENAME_TRACK', trackId, name });
  };

  const reorderTracks = (trackIds) => {
    dispatch({ type: 'REORDER_TRACKS', trackIds });
  };

  const updateTrackSettings = (trackId, settings) => {
    dispatch({ type: 'UPDATE_TRACK_SETTINGS', trackId, settings });
  };

  // Enhanced Clip Management Functions
  const addClip = (trackId, clip) => {
    if (!trackId) {
      console.error('❌ [addClip] trackId is required');
      return;
    }
    if (!clip || typeof clip !== 'object') {
      console.error('❌ [addClip] clip must be an object, got:', typeof clip, clip);
      return;
    }
    
    console.log('🎬 [addClip] Dispatching ADD_CLIP:', {
      trackId,
      clipId: clip.id,
      clipName: clip.name,
      clipPath: clip.path,
      clipType: clip.type, // Log the clip's type property
      fullClip: clip
    });
    
    // ✅ CRITICAL: Spread clip FIRST, then override type to prevent clip.type from overwriting action.type
    dispatch({ ...clip, type: 'ADD_CLIP', trackId });
    
    console.log('🎬 [addClip] Dispatch complete!');
  };

  const removeClip = (clipId) => {
    dispatch({ type: 'REMOVE_CLIP', clipId });
  };

  const moveClip = (clipId, startTime, trackId) => {
    dispatch({ type: 'MOVE_CLIP', clipId, startTime, trackId });
  };

  const trimClip = (clipId, trimIn, trimOut) => {
    dispatch({ type: 'TRIM_CLIP', clipId, trimIn, trimOut });
  };

  const splitClip = (clipId, splitTime) => {
    dispatch({ type: 'SPLIT_CLIP', clipId, splitTime });
  };

  const duplicateClip = (clipId, startTime) => {
    dispatch({ type: 'DUPLICATE_CLIP', clipId, startTime });
  };

  // Selection Management Functions
  const selectClip = (clipId, addToSelection = false) => {
    console.log('TimelineContext: selectClip called', { clipId, addToSelection, currentSelection: state.selection });
    dispatch({ type: 'SELECT_CLIP', clipId, addToSelection });
  };

  const selectMultipleClips = (clipIds, anchor) => {
    dispatch({ type: 'SELECT_MULTIPLE_CLIPS', clipIds, anchor });
  };

  const selectRange = (startTime, endTime, anchor) => {
    dispatch({ type: 'SELECT_RANGE', startTime, endTime, anchor });
  };

  const clearSelection = () => {
    dispatch({ type: 'CLEAR_SELECTION' });
  };

  // Timeline Navigation Functions
  const setZoom = (zoom) => {
    dispatch({ type: 'SET_ZOOM', zoom });
  };

  // Magnetic Timeline Functions
  const enableMagneticSnap = (enabled) => {
    dispatch({ type: 'ENABLE_MAGNETIC_SNAP', enabled });
  };

  const setSnapThreshold = (threshold) => {
    dispatch({ type: 'SET_SNAP_THRESHOLD', threshold });
  };

  // Undo/Redo Functions
  const saveState = () => {
    dispatch({ type: 'SAVE_STATE' });
  };

  const undo = () => {
    dispatch({ type: 'UNDO' });
  };

  const redo = () => {
    dispatch({ type: 'REDO' });
  };

  // Helper functions
  const getSelectedClip = () => {
    const selectedClipId = state.selection.clips[0];
    const selectedClip = state.clips.find(clip => clip.id === selectedClipId);
    console.log('TimelineContext: getSelectedClip', { 
      selectedClipId, 
      selectedClip, 
      selectionClips: state.selection.clips,
      totalClips: state.clips.length 
    });
    return selectedClip;
  };

  const getSelectedClips = () => {
    return state.clips.filter(clip => state.selection.clips.includes(clip.id));
  };

  const getCurrentTrimData = () => {
    const selectedClip = getSelectedClip();
    if (!selectedClip) return { inPoint: 0, outPoint: 0 };
    return state.clipTrims[selectedClip.id] || { 
      inPoint: 0, 
      outPoint: selectedClip.duration || 0 
    };
  };

  const canUndo = () => state.historyIndex > 0;
  const canRedo = () => state.historyIndex < state.history.length - 1;

  const value = {
    // State
    clips: state.clips,
    tracks: state.tracks,
    selection: state.selection,
    playhead: state.playhead,
    zoom: state.zoom,
    duration: state.duration,
    magneticSnap: state.magneticSnap,
    snapThreshold: state.snapThreshold,
    clipTrims: state.clipTrims,
    isRendering: state.isRendering,
    renderProgress: state.renderProgress,
    history: state.history,
    historyIndex: state.historyIndex,
    
    // Legacy support
    selectedClipId: state.selection.clips[0] || null,
    
    // Actions
    addClips,
    selectClip,
    setPlayhead,
    setInPoint,
    setOutPoint,
    resetTrim,
    applyTrimSuccess,
    setRendering,
    updateClipDuration,
    
    // Track Management
    addTrack,
    removeTrack,
    renameTrack,
    reorderTracks,
    updateTrackSettings,
    
    // Enhanced Clip Management
    addClip,
    removeClip,
    moveClip,
    trimClip,
    splitClip,
    duplicateClip,
    
    // Selection Management
    selectMultipleClips,
    selectRange,
    clearSelection,
    
    // Timeline Navigation
    setZoom,
    
    // Magnetic Timeline
    enableMagneticSnap,
    setSnapThreshold,
    
    // Undo/Redo
    saveState,
    undo,
    redo,
    canUndo,
    canRedo,
    
    // Helpers
    getSelectedClip,
    getSelectedClips,
    getCurrentTrimData,
    
    // Drag & Drop State Management
    dragState,
    startDrag,
    updateDrag,
    completeDrag,
    cancelDrag
  };

  return (
    <TimelineContext.Provider value={value}>
      {children}
    </TimelineContext.Provider>
  );
};

export const useTimeline = () => {
  const context = useContext(TimelineContext);
  if (!context) {
    throw new Error('useTimeline must be used within a TimelineProvider');
  }
  return context;
};