// src/utils/timelineCalculations.js
/**
 * Timeline calculation utilities for professional timeline implementation
 * Handles time ↔ pixel conversion, zoom calculations, and clip positioning
 */

// Constants
const DEFAULT_PIXELS_PER_SECOND = 100;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 10;

/**
 * Convert time to pixel position
 * @param {number} time - Time in seconds
 * @param {number} zoom - Zoom level (1 = normal)
 * @param {number} pixelsPerSecond - Base pixels per second at zoom 1
 * @returns {number} Pixel position
 */
export const timeToPixels = (time, zoom = 1, pixelsPerSecond = DEFAULT_PIXELS_PER_SECOND) => {
  return time * pixelsPerSecond * zoom;
};

/**
 * Convert pixel position to time
 * @param {number} pixels - Pixel position
 * @param {number} zoom - Zoom level (1 = normal)
 * @param {number} pixelsPerSecond - Base pixels per second at zoom 1
 * @returns {number} Time in seconds
 */
export const pixelsToTime = (pixels, zoom = 1, pixelsPerSecond = DEFAULT_PIXELS_PER_SECOND) => {
  return pixels / (pixelsPerSecond * zoom);
};

/**
 * Calculate zoom level with bounds checking
 * @param {number} level - Desired zoom level
 * @returns {number} Clamped zoom level
 */
export const calculateZoom = (level) => {
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, level));
};

/**
 * Get zoom level as percentage
 * @param {number} zoom - Zoom level
 * @returns {number} Zoom percentage
 */
export const getZoomLevel = (zoom) => {
  return Math.round(zoom * 100);
};

/**
 * Calculate clip position and dimensions
 * @param {Object} clip - Clip object with startTime and duration
 * @param {number} zoom - Current zoom level
 * @param {number} pixelsPerSecond - Base pixels per second
 * @returns {Object} Position and dimensions
 */
export const calculateClipPosition = (clip, zoom = 1, pixelsPerSecond = DEFAULT_PIXELS_PER_SECOND) => {
  const startTime = clip.startTime || 0;
  const duration = clip.duration || 0;
  
  return {
    left: timeToPixels(startTime, zoom, pixelsPerSecond),
    width: timeToPixels(duration, zoom, pixelsPerSecond),
    height: clip.trackHeight || 60
  };
};

/**
 * Calculate playhead position
 * @param {number} playhead - Current playhead time
 * @param {number} zoom - Current zoom level
 * @param {number} pixelsPerSecond - Base pixels per second
 * @returns {number} Playhead pixel position
 */
export const calculatePlayheadPosition = (playhead, zoom = 1, pixelsPerSecond = DEFAULT_PIXELS_PER_SECOND) => {
  return timeToPixels(playhead, zoom, pixelsPerSecond);
};

/**
 * Generate time markers for timeline ruler
 * @param {number} duration - Total timeline duration
 * @param {number} zoom - Current zoom level
 * @param {number} pixelsPerSecond - Base pixels per second
 * @returns {Array} Array of time marker objects
 */
export const generateTimeMarkers = (duration, zoom = 1, pixelsPerSecond = DEFAULT_PIXELS_PER_SECOND) => {
  const markers = [];
  const pixelsPerSecondZoomed = pixelsPerSecond * zoom;
  
  // Determine marker interval based on zoom level
  let interval;
  if (pixelsPerSecondZoomed > 200) {
    interval = 1; // Every second
  } else if (pixelsPerSecondZoomed > 100) {
    interval = 5; // Every 5 seconds
  } else if (pixelsPerSecondZoomed > 50) {
    interval = 10; // Every 10 seconds
  } else if (pixelsPerSecondZoomed > 20) {
    interval = 30; // Every 30 seconds
  } else {
    interval = 60; // Every minute
  }
  
  // Generate markers
  for (let time = 0; time <= duration; time += interval) {
    markers.push({
      time,
      position: timeToPixels(time, zoom, pixelsPerSecond),
      label: formatTime(time),
      isMajor: time % (interval * 5) === 0 // Major markers every 5 intervals
    });
  }
  
  return markers;
};

/**
 * Format time as MM:SS or HH:MM:SS
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
};

/**
 * Format duration as human-readable string
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration string
 */
export const formatDuration = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return '0s';
  
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
};

/**
 * Calculate timeline viewport bounds
 * @param {number} scrollLeft - Horizontal scroll position
 * @param {number} viewportWidth - Viewport width
 * @param {number} zoom - Current zoom level
 * @param {number} pixelsPerSecond - Base pixels per second
 * @returns {Object} Viewport bounds in time
 */
export const calculateViewportBounds = (scrollLeft, viewportWidth, zoom = 1, pixelsPerSecond = DEFAULT_PIXELS_PER_SECOND) => {
  const startTime = pixelsToTime(scrollLeft, zoom, pixelsPerSecond);
  const endTime = pixelsToTime(scrollLeft + viewportWidth, zoom, pixelsPerSecond);
  
  return {
    startTime,
    endTime,
    duration: endTime - startTime
  };
};

/**
 * Calculate optimal zoom level to fit content
 * @param {number} duration - Total content duration
 * @param {number} viewportWidth - Available viewport width
 * @param {number} pixelsPerSecond - Base pixels per second
 * @returns {number} Optimal zoom level
 */
export const calculateFitToContentZoom = (duration, viewportWidth, pixelsPerSecond = DEFAULT_PIXELS_PER_SECOND) => {
  if (duration <= 0 || viewportWidth <= 0) return 1;
  
  const requiredPixels = duration * pixelsPerSecond;
  const optimalZoom = viewportWidth / requiredPixels;
  
  return calculateZoom(optimalZoom);
};

/**
 * Calculate snap points for magnetic timeline
 * @param {Array} clips - Array of clip objects
 * @param {number} threshold - Snap threshold in pixels
 * @param {number} zoom - Current zoom level
 * @param {number} pixelsPerSecond - Base pixels per second
 * @returns {Array} Array of snap point objects
 */
export const calculateSnapPoints = (clips, threshold = 10, zoom = 1, pixelsPerSecond = DEFAULT_PIXELS_PER_SECOND) => {
  const snapPoints = [];
  
  clips.forEach(clip => {
    const startTime = clip.startTime || 0;
    const endTime = startTime + (clip.duration || 0);
    
    // Add clip start and end as snap points
    snapPoints.push({
      time: startTime,
      position: timeToPixels(startTime, zoom, pixelsPerSecond),
      type: 'clip-start',
      clipId: clip.id
    });
    
    snapPoints.push({
      time: endTime,
      position: timeToPixels(endTime, zoom, pixelsPerSecond),
      type: 'clip-end',
      clipId: clip.id
    });
    
    // Add clip center as snap point
    const centerTime = startTime + (clip.duration || 0) / 2;
    snapPoints.push({
      time: centerTime,
      position: timeToPixels(centerTime, zoom, pixelsPerSecond),
      type: 'clip-center',
      clipId: clip.id
    });
  });
  
  return snapPoints;
};

/**
 * Find nearest snap point
 * @param {number} position - Current position in pixels
 * @param {Array} snapPoints - Array of snap points
 * @param {number} threshold - Snap threshold in pixels
 * @returns {Object|null} Nearest snap point or null
 */
export const findNearestSnapPoint = (position, snapPoints, threshold = 10) => {
  let nearestSnap = null;
  let minDistance = Infinity;
  
  snapPoints.forEach(snapPoint => {
    const distance = Math.abs(position - snapPoint.position);
    if (distance <= threshold && distance < minDistance) {
      minDistance = distance;
      nearestSnap = snapPoint;
    }
  });
  
  return nearestSnap;
};

/**
 * Calculate clip bounds for collision detection
 * @param {Object} clip - Clip object
 * @param {number} zoom - Current zoom level
 * @param {number} pixelsPerSecond - Base pixels per second
 * @returns {Object} Clip bounds
 */
export const calculateClipBounds = (clip, zoom = 1, pixelsPerSecond = DEFAULT_PIXELS_PER_SECOND) => {
  const startTime = clip.startTime || 0;
  const duration = clip.duration || 0;
  
  return {
    left: timeToPixels(startTime, zoom, pixelsPerSecond),
    right: timeToPixels(startTime + duration, zoom, pixelsPerSecond),
    top: 0,
    bottom: clip.trackHeight || 60,
    width: timeToPixels(duration, zoom, pixelsPerSecond),
    height: clip.trackHeight || 60
  };
};

/**
 * Check if two clips overlap
 * @param {Object} clip1 - First clip
 * @param {Object} clip2 - Second clip
 * @param {number} zoom - Current zoom level
 * @param {number} pixelsPerSecond - Base pixels per second
 * @returns {boolean} True if clips overlap
 */
export const clipsOverlap = (clip1, clip2, zoom = 1, pixelsPerSecond = DEFAULT_PIXELS_PER_SECOND) => {
  const bounds1 = calculateClipBounds(clip1, zoom, pixelsPerSecond);
  const bounds2 = calculateClipBounds(clip2, zoom, pixelsPerSecond);
  
  return !(bounds1.right <= bounds2.left || bounds2.right <= bounds1.left);
};

/**
 * Calculate timeline scroll position for a given time
 * @param {number} time - Target time
 * @param {number} zoom - Current zoom level
 * @param {number} pixelsPerSecond - Base pixels per second
 * @param {number} viewportWidth - Viewport width
 * @returns {number} Scroll position
 */
export const calculateScrollPosition = (time, zoom = 1, pixelsPerSecond = DEFAULT_PIXELS_PER_SECOND, viewportWidth = 800) => {
  const targetPosition = timeToPixels(time, zoom, pixelsPerSecond);
  // Center the target time in the viewport
  return Math.max(0, targetPosition - viewportWidth / 2);
};