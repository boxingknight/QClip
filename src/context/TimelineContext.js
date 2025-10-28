// src/context/TimelineContext.js
import React, { createContext, useContext, useReducer } from 'react';

const TimelineContext = createContext();

const initialState = {
  clips: [],
  tracks: [
    { id: 'video-1', type: 'video', name: 'Video Track 1', clips: [], height: 60, muted: false, locked: false },
    { id: 'video-2', type: 'video', name: 'Video Track 2', clips: [], height: 60, muted: false, locked: false },
    { id: 'audio-1', type: 'audio', name: 'Audio Track', clips: [], height: 40, muted: false, locked: false }
  ],
  selectedClipId: null,
  playhead: 0,
  zoom: 1,
  duration: 0,
  // Trim data per clip (migrated from App.js)
  clipTrims: {},
  // Rendering state
  isRendering: false,
  renderProgress: 0
};

const timelineReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_CLIPS':
      const newClips = action.clips.map(clip => ({
        id: clip.id,
        name: clip.name,
        path: clip.path,
        duration: clip.duration,
        startTime: 0, // Default start time
        trackId: 'video-1', // Default to first video track
        trimIn: 0,
        trimOut: clip.duration,
        effects: [],
        trimmedPath: null,
        isTrimmed: false,
        trimStartOffset: 0
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

      return {
        ...state,
        clips: [...state.clips, ...newClips],
        tracks: updatedTracks,
        clipTrims: newClipTrims,
        selectedClipId: state.selectedClipId || (newClips.length > 0 ? newClips[0].id : null),
        duration: Math.max(state.duration, ...newClips.map(c => c.startTime + c.duration))
      };

    case 'SELECT_CLIP':
      return {
        ...state,
        selectedClipId: action.clipId
      };

    case 'SET_PLAYHEAD':
      return {
        ...state,
        playhead: action.time
      };

    case 'SET_IN_POINT':
      if (!state.selectedClipId) return state;
      
      const clipId = state.selectedClipId;
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
      if (!state.selectedClipId) return state;
      
      const clipIdOut = state.selectedClipId;
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
      if (!state.selectedClipId) return state;
      
      const selectedClip = state.clips.find(c => c.id === state.selectedClipId);
      if (!selectedClip) return state;
      
      return {
        ...state,
        clipTrims: {
          ...state.clipTrims,
          [state.selectedClipId]: {
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

    default:
      return state;
  }
};

export const TimelineProvider = ({ children }) => {
  const [state, dispatch] = useReducer(timelineReducer, initialState);

  const addClips = (clips) => {
    dispatch({ type: 'ADD_CLIPS', clips });
  };

  const selectClip = (clipId) => {
    dispatch({ type: 'SELECT_CLIP', clipId });
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

  // Helper functions
  const getSelectedClip = () => {
    return state.clips.find(clip => clip.id === state.selectedClipId);
  };

  const getCurrentTrimData = () => {
    if (!state.selectedClipId) return { inPoint: 0, outPoint: 0 };
    return state.clipTrims[state.selectedClipId] || { 
      inPoint: 0, 
      outPoint: getSelectedClip()?.duration || 0 
    };
  };

  const value = {
    // State
    clips: state.clips,
    tracks: state.tracks,
    selectedClipId: state.selectedClipId,
    playhead: state.playhead,
    zoom: state.zoom,
    duration: state.duration,
    clipTrims: state.clipTrims,
    isRendering: state.isRendering,
    renderProgress: state.renderProgress,
    
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
    
    // Helpers
    getSelectedClip,
    getCurrentTrimData
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