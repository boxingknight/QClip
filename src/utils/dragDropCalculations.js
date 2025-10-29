// src/utils/dragDropCalculations.js
/**
 * Drag and drop calculation utilities
 * Handles snap-to-clip detection and overlap validation for timeline drag & drop
 */

import { pixelsToTime, timeToPixels } from './timelineCalculations';

/**
 * Calculate snap targets based on TIME (not pixels) for zoom-independence
 * Uses 0.5 second threshold as professional video editor standard
 * @param {Object} draggedClip - The clip being dragged
 * @param {Array} allClips - All clips in the timeline
 * @param {number} snapThreshold - Threshold in seconds (default: 0.5)
 * @returns {Array} Array of snap targets sorted by distance
 */
export const calculateSnapTargets = (draggedClip, allClips, snapThreshold = 0.5) => {
  if (!draggedClip || !allClips || allClips.length === 0) {
    return [];
  }

  const targets = [];

  allClips.forEach(clip => {
    // Skip the clip being dragged
    if (clip.id === draggedClip.id) return;

    // Check start time (snap to clip start)
    const startDistance = Math.abs(draggedClip.startTime - clip.startTime);
    if (startDistance <= snapThreshold) {
      targets.push({
        type: 'start',
        time: clip.startTime,
        clipId: clip.id,
        distance: startDistance
      });
    }

    // Check end time (snap to clip end)
    const endTime = clip.startTime + clip.duration;
    const endDistance = Math.abs(draggedClip.startTime - endTime);
    if (endDistance <= snapThreshold) {
      targets.push({
        type: 'end',
        time: endTime,
        clipId: clip.id,
        distance: endDistance
      });
    }
  });

  // Sort by distance (closest first)
  return targets.sort((a, b) => a.distance - b.distance);
};

/**
 * Find the closest snap target within threshold
 * @param {number} time - Current time position
 * @param {Array} snapTargets - Array of snap targets from calculateSnapTargets
 * @param {number} threshold - Threshold in seconds (default: 0.5)
 * @returns {Object|null} Closest snap target or null
 */
export const findSnapTarget = (time, snapTargets, threshold = 0.5) => {
  if (!snapTargets || snapTargets.length === 0) return null;

  // Filter targets that are close to the current time
  const closeTargets = snapTargets.filter(target => {
    const distance = Math.abs(time - target.time);
    return distance <= threshold;
  });

  if (closeTargets.length === 0) return null;

  // Return closest target
  return closeTargets.reduce((closest, current) => {
    const closestDist = Math.abs(time - closest.time);
    const currentDist = Math.abs(time - current.time);
    return currentDist < closestDist ? current : closest;
  });
};

/**
 * Validate if a drop position is valid (no overlaps)
 * Returns true if clip can be placed at this position without overlapping other clips
 * @param {string} trackId - Target track ID
 * @param {number} time - Proposed start time for the clip
 * @param {Object} draggedClip - The clip being dragged
 * @param {Array} allClips - All clips in the timeline
 * @param {Array} currentTrackClips - Optional: pre-filtered clips on the target track
 * @returns {boolean} True if drop position is valid (no overlaps)
 */
export const isValidDropPosition = (trackId, time, draggedClip, allClips, currentTrackClips = null) => {
  if (!draggedClip || !allClips) return false;

  // Find track clips (all clips on the target track)
  const trackClips = currentTrackClips || allClips.filter(c => c.trackId === trackId);

  // Calculate dragged clip's time range
  const draggedClipStart = time;
  const draggedClipEnd = time + draggedClip.duration;

  // Check for overlaps with other clips on the same track
  const hasOverlap = trackClips.some(clip => {
    // Skip the clip being dragged (if it's on the same track)
    if (clip.id === draggedClip.id) return false;

    // Calculate existing clip's time range
    const clipStart = clip.startTime;
    const clipEnd = clip.startTime + clip.duration;

    // Check for overlap: clips overlap if their time ranges intersect
    // Two ranges [a1, a2] and [b1, b2] overlap if a1 < b2 && a2 > b1
    return (draggedClipStart < clipEnd && draggedClipEnd > clipStart);
  });

  return !hasOverlap;
};

/**
 * Calculate pixel position for snap line visual indicator
 * Converts time-based snap target to pixel position for rendering
 * @param {Object|null} snapTarget - Snap target from findSnapTarget
 * @param {number} zoom - Current zoom level
 * @returns {Object|null} Snap line data with pixel position or null
 */
export const calculateSnapLine = (snapTarget, zoom) => {
  if (!snapTarget) return null;

  return {
    x: timeToPixels(snapTarget.time, zoom),
    type: snapTarget.type,
    clipId: snapTarget.clipId,
    time: snapTarget.time
  };
};

