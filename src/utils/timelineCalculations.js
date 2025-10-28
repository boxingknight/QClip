// src/utils/timelineCalculations.js

/**
 * Calculate clip position and width based on timeline zoom
 * @param {Object} clip - Clip object with startTime and duration
 * @param {number} zoom - Zoom level (1 = normal, 2 = double zoom, etc.)
 * @returns {Object} Position object with left and width percentages
 */
export const calculateClipPosition = (clip, zoom = 1) => {
  const timelineWidth = 100; // Percentage
  const secondsPerPercent = 60; // 60 seconds = 100% width at zoom 1
  
  const left = (clip.startTime / secondsPerPercent) * timelineWidth * zoom;
  const width = (clip.duration / secondsPerPercent) * timelineWidth * zoom;
  
  return {
    left: Math.max(0, left),
    width: Math.max(1, width) // Minimum 1% width for visibility
  };
};

/**
 * Get clip at a specific time point
 * @param {Array} tracks - Array of track objects
 * @param {Array} clips - Array of clip objects
 * @param {number} time - Time in seconds
 * @returns {Object|null} Clip object or null if no clip at that time
 */
export const getClipAtTime = (tracks, clips, time) => {
  for (const track of tracks) {
    for (const clipId of track.clips) {
      const clip = clips.find(c => c.id === clipId);
      if (clip && time >= clip.startTime && time <= clip.startTime + clip.duration) {
        return clip;
      }
    }
  }
  return null;
};

/**
 * Find gaps between clips in a track
 * @param {Array} clips - Array of clip objects for a track
 * @returns {Array} Array of gap objects with start and duration
 */
export const findClipGaps = (clips) => {
  if (clips.length === 0) return [];
  
  const sortedClips = clips.sort((a, b) => a.startTime - b.startTime);
  const gaps = [];
  
  // Check for gap at the beginning
  if (sortedClips[0].startTime > 0) {
    gaps.push({
      start: 0,
      duration: sortedClips[0].startTime
    });
  }
  
  // Check for gaps between clips
  for (let i = 0; i < sortedClips.length - 1; i++) {
    const currentClip = sortedClips[i];
    const nextClip = sortedClips[i + 1];
    const gap = nextClip.startTime - (currentClip.startTime + currentClip.duration);
    
    if (gap > 0) {
      gaps.push({
        start: currentClip.startTime + currentClip.duration,
        duration: gap
      });
    }
  }
  
  return gaps;
};

/**
 * Snap position to grid
 * @param {number} position - Position to snap
 * @param {number} gridSize - Grid size in seconds
 * @returns {number} Snapped position
 */
export const snapToGrid = (position, gridSize = 1) => {
  return Math.round(position / gridSize) * gridSize;
};

/**
 * Convert time to timeline position percentage
 * @param {number} time - Time in seconds
 * @param {number} zoom - Zoom level
 * @param {number} timelineDuration - Total timeline duration
 * @returns {number} Position percentage
 */
export const timeToPosition = (time, zoom = 1, timelineDuration = 60) => {
  return (time / timelineDuration) * 100 * zoom;
};

/**
 * Convert timeline position percentage to time
 * @param {number} position - Position percentage
 * @param {number} zoom - Zoom level
 * @param {number} timelineDuration - Total timeline duration
 * @returns {number} Time in seconds
 */
export const positionToTime = (position, zoom = 1, timelineDuration = 60) => {
  return (position / 100 / zoom) * timelineDuration;
};

/**
 * Check if two clips overlap
 * @param {Object} clip1 - First clip
 * @param {Object} clip2 - Second clip
 * @returns {boolean} True if clips overlap
 */
export const clipsOverlap = (clip1, clip2) => {
  const clip1End = clip1.startTime + clip1.duration;
  const clip2End = clip2.startTime + clip2.duration;
  
  return !(clip1End <= clip2.startTime || clip2End <= clip1.startTime);
};

/**
 * Calculate timeline duration from clips
 * @param {Array} clips - Array of clip objects
 * @returns {number} Timeline duration in seconds
 */
export const calculateTimelineDuration = (clips) => {
  if (clips.length === 0) return 0;
  
  return Math.max(...clips.map(clip => clip.startTime + clip.duration));
};

/**
 * Format time for display
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string (MM:SS)
 */
export const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Parse time string to seconds
 * @param {string} timeString - Time string in MM:SS format
 * @returns {number} Time in seconds
 */
export const parseTime = (timeString) => {
  const parts = timeString.split(':');
  if (parts.length !== 2) return 0;
  
  const minutes = parseInt(parts[0], 10) || 0;
  const seconds = parseInt(parts[1], 10) || 0;
  
  return minutes * 60 + seconds;
};
