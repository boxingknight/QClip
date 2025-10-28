// src/hooks/useTimeline.js
/**
 * Custom hook for timeline functionality
 * Provides timeline state management and operations
 */

import { useCallback, useMemo } from 'react';
import { useTimeline as useTimelineContext } from '../context/TimelineContext';
import { useMagneticSnap } from './useMagneticSnap';
import { 
  timeToPixels, 
  pixelsToTime, 
  calculateClipPosition, 
  calculatePlayheadPosition,
  formatTime,
  formatDuration,
  calculateViewportBounds,
  calculateFitToContentZoom
} from '../utils/timelineCalculations';

/**
 * Main timeline hook
 * @param {Object} options - Configuration options
 * @returns {Object} Timeline state and functions
 */
export const useTimeline = (options = {}) => {
  const {
    pixelsPerSecond = 100,
    enableMagneticSnap = true,
    snapThreshold = 10
  } = options;

  // Get timeline context
  const timelineContext = useTimelineContext();
  
  // Extract state and functions
  const {
    clips,
    tracks,
    selection,
    playhead,
    zoom,
    duration,
    magneticSnap,
    snapThreshold: contextSnapThreshold,
    addClips,
    selectClip,
    setPlayhead,
    setZoom,
    moveClip,
    trimClip,
    splitClip,
    duplicateClip,
    removeClip,
    addTrack,
    removeTrack,
    renameTrack,
    reorderTracks,
    updateTrackSettings,
    selectMultipleClips,
    selectRange,
    clearSelection,
    enableMagneticSnap: setMagneticSnap,
    setSnapThreshold: setContextSnapThreshold,
    saveState,
    undo,
    redo,
    canUndo,
    canRedo,
    getSelectedClip,
    getSelectedClips
  } = timelineContext;

  // Use magnetic snap hook
  const magneticSnapHook = useMagneticSnap(
    clips,
    contextSnapThreshold || snapThreshold,
    zoom,
    pixelsPerSecond
  );

  // Calculate timeline dimensions
  const timelineDimensions = useMemo(() => {
    const totalDuration = Math.max(duration, ...clips.map(c => c.startTime + c.duration));
    const totalWidth = timeToPixels(totalDuration, zoom, pixelsPerSecond);
    
    return {
      totalDuration,
      totalWidth,
      pixelsPerSecondZoomed: pixelsPerSecond * zoom
    };
  }, [duration, clips, zoom, pixelsPerSecond]);

  // Calculate playhead position
  const playheadPosition = useMemo(() => {
    return calculatePlayheadPosition(playhead, zoom, pixelsPerSecond);
  }, [playhead, zoom, pixelsPerSecond]);

  // Get clips for a specific track
  const getTrackClips = useCallback((trackId) => {
    return clips.filter(clip => clip.trackId === trackId);
  }, [clips]);

  // Get visible clips in viewport
  const getVisibleClips = useCallback((viewportBounds) => {
    return clips.filter(clip => {
      const clipStart = clip.startTime;
      const clipEnd = clip.startTime + clip.duration;
      
      return !(clipEnd < viewportBounds.startTime || clipStart > viewportBounds.endTime);
    });
  }, [clips]);

  // Move clip with magnetic snap
  const moveClipWithSnap = useCallback((clipId, newTime, trackId) => {
    if (!enableMagneticSnap || !magneticSnap) {
      moveClip(clipId, newTime, trackId);
      return;
    }

    const snappedTime = magneticSnapHook.getSnappedTime(clipId, newTime);
    moveClip(clipId, snappedTime, trackId);
  }, [enableMagneticSnap, magneticSnap, magneticSnapHook, moveClip]);

  // Set playhead with snap
  const setPlayheadWithSnap = useCallback((time) => {
    if (!enableMagneticSnap || !magneticSnap) {
      setPlayhead(time);
      return;
    }

    const playheadSnaps = magneticSnapHook.getPlayheadSnapPoints(time);
    if (playheadSnaps.length > 0) {
      const snappedTime = pixelsToTime(playheadSnaps[0].position, zoom, pixelsPerSecond);
      setPlayhead(snappedTime);
    } else {
      setPlayhead(time);
    }
  }, [enableMagneticSnap, magneticSnap, magneticSnapHook, setPlayhead, zoom, pixelsPerSecond]);

  // Fit timeline to content
  const fitToContent = useCallback((viewportWidth) => {
    const optimalZoom = calculateFitToContentZoom(timelineDimensions.totalDuration, viewportWidth, pixelsPerSecond);
    setZoom(optimalZoom);
  }, [timelineDimensions.totalDuration, setZoom, pixelsPerSecond]);

  // Calculate viewport bounds
  const getViewportBounds = useCallback((scrollLeft, viewportWidth) => {
    return calculateViewportBounds(scrollLeft, viewportWidth, zoom, pixelsPerSecond);
  }, [zoom, pixelsPerSecond]);

  // Get clip position and dimensions
  const getClipPosition = useCallback((clip) => {
    return calculateClipPosition(clip, zoom, pixelsPerSecond);
  }, [zoom, pixelsPerSecond]);

  // Format time for display
  const formatTimeDisplay = useCallback((time) => {
    return formatTime(time);
  }, []);

  // Format duration for display
  const formatDurationDisplay = useCallback((duration) => {
    return formatDuration(duration);
  }, []);

  // Check if clip is selected
  const isClipSelected = useCallback((clipId) => {
    return selection.clips.includes(clipId);
  }, [selection.clips]);

  // Get selection info
  const selectionInfo = useMemo(() => {
    return {
      count: selection.clips.length,
      mode: selection.mode,
      clips: getSelectedClips(),
      hasSelection: selection.clips.length > 0
    };
  }, [selection, getSelectedClips]);

  // Timeline operations with state saving
  const performOperation = useCallback((operation) => {
    saveState();
    operation();
  }, [saveState]);

  // Enhanced clip operations
  const moveClipWithState = useCallback((clipId, newTime, trackId) => {
    performOperation(() => moveClipWithSnap(clipId, newTime, trackId));
  }, [performOperation, moveClipWithSnap]);

  const trimClipWithState = useCallback((clipId, trimIn, trimOut) => {
    performOperation(() => trimClip(clipId, trimIn, trimOut));
  }, [performOperation, trimClip]);

  const splitClipWithState = useCallback((clipId, splitTime) => {
    performOperation(() => splitClip(clipId, splitTime));
  }, [performOperation, splitClip]);

  const duplicateClipWithState = useCallback((clipId, startTime) => {
    performOperation(() => duplicateClip(clipId, startTime));
  }, [performOperation, duplicateClip]);

  const removeClipWithState = useCallback((clipId) => {
    performOperation(() => removeClip(clipId));
  }, [performOperation, removeClip]);

  // Track operations with state saving
  const addTrackWithState = useCallback((trackType, name) => {
    performOperation(() => addTrack(trackType, name));
  }, [performOperation, addTrack]);

  const removeTrackWithState = useCallback((trackId) => {
    performOperation(() => removeTrack(trackId));
  }, [performOperation, removeTrack]);

  const renameTrackWithState = useCallback((trackId, name) => {
    performOperation(() => renameTrack(trackId, name));
  }, [performOperation, renameTrack]);

  const reorderTracksWithState = useCallback((trackIds) => {
    performOperation(() => reorderTracks(trackIds));
  }, [performOperation, reorderTracks]);

  const updateTrackSettingsWithState = useCallback((trackId, settings) => {
    performOperation(() => updateTrackSettings(trackId, settings));
  }, [performOperation, updateTrackSettings]);

  return {
    // State
    clips,
    tracks,
    selection,
    playhead,
    zoom,
    duration,
    magneticSnap,
    snapThreshold: contextSnapThreshold || snapThreshold,
    
    // Timeline dimensions
    timelineDimensions,
    playheadPosition,
    
    // Selection info
    selectionInfo,
    
    // Core functions
    addClips,
    selectClip,
    setPlayhead: setPlayheadWithSnap,
    setZoom,
    
    // Enhanced clip operations
    moveClip: moveClipWithState,
    trimClip: trimClipWithState,
    splitClip: splitClipWithState,
    duplicateClip: duplicateClipWithState,
    removeClip: removeClipWithState,
    
    // Track operations
    addTrack: addTrackWithState,
    removeTrack: removeTrackWithState,
    renameTrack: renameTrackWithState,
    reorderTracks: reorderTracksWithState,
    updateTrackSettings: updateTrackSettingsWithState,
    
    // Selection operations
    selectMultipleClips,
    selectRange,
    clearSelection,
    
    // Magnetic snap
    enableMagneticSnap: setMagneticSnap,
    setSnapThreshold: setContextSnapThreshold,
    magneticSnap: magneticSnapHook,
    
    // Undo/Redo
    saveState,
    undo,
    redo,
    canUndo,
    canRedo,
    
    // Utility functions
    getSelectedClip,
    getSelectedClips,
    getTrackClips,
    getVisibleClips,
    getViewportBounds,
    getClipPosition,
    formatTime: formatTimeDisplay,
    formatDuration: formatDurationDisplay,
    isClipSelected,
    fitToContent,
    
    // Configuration
    pixelsPerSecond,
    enableMagneticSnap
  };
};
