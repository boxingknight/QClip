// src/hooks/useMagneticSnap.js
/**
 * Custom hook for magnetic timeline snap behavior
 * Provides snap detection and positioning for professional timeline editing
 */

import { useCallback, useMemo } from 'react';
import { calculateSnapPoints, findNearestSnapPoint, pixelsToTime, timeToPixels } from '../utils/timelineCalculations';

/**
 * Hook for magnetic snap functionality
 * @param {Array} clips - Array of clip objects
 * @param {number} snapThreshold - Snap threshold in pixels (default: 10)
 * @param {number} zoom - Current zoom level
 * @param {number} pixelsPerSecond - Base pixels per second
 * @returns {Object} Snap functions and utilities
 */
export const useMagneticSnap = (clips = [], snapThreshold = 10, zoom = 1, pixelsPerSecond = 100) => {
  
  // Calculate snap points for all clips
  const snapPoints = useMemo(() => {
    return calculateSnapPoints(clips, snapThreshold, zoom, pixelsPerSecond);
  }, [clips, snapThreshold, zoom, pixelsPerSecond]);

  /**
   * Find snap points near a given position
   * @param {string} clipId - ID of the clip being moved (to exclude its own snap points)
   * @param {number} position - Position in pixels
   * @returns {Array} Array of nearby snap points
   */
  const findSnapPoints = useCallback((clipId, position) => {
    const nearbySnaps = [];
    
    snapPoints.forEach(snapPoint => {
      // Skip snap points from the same clip
      if (snapPoint.clipId === clipId) return;
      
      const distance = Math.abs(position - snapPoint.position);
      if (distance <= snapThreshold) {
        nearbySnaps.push({
          ...snapPoint,
          distance,
          strength: 1 - (distance / snapThreshold) // Strength from 0 to 1
        });
      }
    });
    
    // Sort by strength (strongest first)
    return nearbySnaps.sort((a, b) => b.strength - a.strength);
  }, [snapPoints, snapThreshold]);

  /**
   * Get snapped position for a given pixel position
   * @param {string} clipId - ID of the clip being moved
   * @param {number} position - Position in pixels
   * @returns {number} Snapped position in pixels
   */
  const getSnappedPosition = useCallback((clipId, position) => {
    const nearbySnaps = findSnapPoints(clipId, position);
    return nearbySnaps.length > 0 ? nearbySnaps[0].position : position;
  }, [findSnapPoints]);

  /**
   * Get snapped time for a given time value
   * @param {string} clipId - ID of the clip being moved
   * @param {number} time - Time in seconds
   * @returns {number} Snapped time in seconds
   */
  const getSnappedTime = useCallback((clipId, time) => {
    const position = timeToPixels(time, zoom, pixelsPerSecond);
    const snappedPosition = getSnappedPosition(clipId, position);
    return pixelsToTime(snappedPosition, zoom, pixelsPerSecond);
  }, [getSnappedPosition, zoom, pixelsPerSecond]);

  /**
   * Check if a position would snap
   * @param {string} clipId - ID of the clip being moved
   * @param {number} position - Position in pixels
   * @returns {boolean} True if position would snap
   */
  const wouldSnap = useCallback((clipId, position) => {
    const nearbySnaps = findSnapPoints(clipId, position);
    return nearbySnaps.length > 0;
  }, [findSnapPoints]);

  /**
   * Get snap feedback information
   * @param {string} clipId - ID of the clip being moved
   * @param {number} position - Position in pixels
   * @returns {Object|null} Snap feedback or null
   */
  const getSnapFeedback = useCallback((clipId, position) => {
    const nearbySnaps = findSnapPoints(clipId, position);
    if (nearbySnaps.length === 0) return null;
    
    const strongestSnap = nearbySnaps[0];
    return {
      snapPoint: strongestSnap,
      snappedPosition: strongestSnap.position,
      snappedTime: pixelsToTime(strongestSnap.position, zoom, pixelsPerSecond),
      strength: strongestSnap.strength,
      type: strongestSnap.type,
      clipId: strongestSnap.clipId
    };
  }, [findSnapPoints, zoom, pixelsPerSecond]);

  /**
   * Calculate snap points for a specific track
   * @param {string} trackId - Track ID
   * @returns {Array} Snap points for the track
   */
  const getTrackSnapPoints = useCallback((trackId) => {
    return snapPoints.filter(snapPoint => {
      const clip = clips.find(c => c.id === snapPoint.clipId);
      return clip && clip.trackId === trackId;
    });
  }, [snapPoints, clips]);

  /**
   * Calculate snap points for playhead
   * @param {number} playheadTime - Current playhead time
   * @returns {Array} Snap points near playhead
   */
  const getPlayheadSnapPoints = useCallback((playheadTime) => {
    const playheadPosition = timeToPixels(playheadTime, zoom, pixelsPerSecond);
    const nearbySnaps = [];
    
    snapPoints.forEach(snapPoint => {
      const distance = Math.abs(playheadPosition - snapPoint.position);
      if (distance <= snapThreshold) {
        nearbySnaps.push({
          ...snapPoint,
          distance,
          strength: 1 - (distance / snapThreshold)
        });
      }
    });
    
    return nearbySnaps.sort((a, b) => b.strength - a.strength);
  }, [snapPoints, snapThreshold, zoom, pixelsPerSecond]);

  /**
   * Calculate snap points for time markers
   * @param {number} duration - Timeline duration
   * @param {number} interval - Marker interval in seconds
   * @returns {Array} Time marker snap points
   */
  const getTimeMarkerSnapPoints = useCallback((duration, interval = 1) => {
    const markerSnaps = [];
    
    for (let time = 0; time <= duration; time += interval) {
      const position = timeToPixels(time, zoom, pixelsPerSecond);
      markerSnaps.push({
        time,
        position,
        type: 'time-marker',
        label: `${time}s`
      });
    }
    
    return markerSnaps;
  }, [zoom, pixelsPerSecond]);

  return {
    // Core snap functions
    findSnapPoints,
    getSnappedPosition,
    getSnappedTime,
    wouldSnap,
    getSnapFeedback,
    
    // Specialized snap functions
    getTrackSnapPoints,
    getPlayheadSnapPoints,
    getTimeMarkerSnapPoints,
    
    // Snap points data
    snapPoints,
    
    // Configuration
    snapThreshold,
    zoom,
    pixelsPerSecond
  };
};
