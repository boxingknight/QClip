// src/components/timeline/Clip.js
/**
 * Clip component
 * Individual media clip with selection, dragging, and manipulation
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useTimeline } from '../../hooks/useTimeline';
import { useMagneticSnap } from '../../hooks/useMagneticSnap';
import { timeToPixels, pixelsToTime } from '../../utils/timelineCalculations';
import './Clip.css';

const Clip = ({ clip, trackHeight, zoom, trackId }) => {
  const {
    selection,
    selectClip,
    moveClip,
    saveState,
    magneticSnap
  } = useTimeline();
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, startTime: 0 });
  const { snapToNearest } = useMagneticSnap();
  const clipRef = useRef(null);

  const isSelected = selection.clips.includes(clip.id);

  // Calculate clip style
  const clipStyle = {
    left: `${timeToPixels(clip.startTime, zoom)}px`,
    width: `${timeToPixels(clip.duration, zoom)}px`,
    height: `${trackHeight - 32}px`
  };

  // Handle clip selection
  const handleClick = useCallback((e) => {
    e.stopPropagation();
    
    if (e.metaKey || e.ctrlKey) {
      // Multi-select with Cmd/Ctrl
      selectClip(clip.id, true);
    } else if (e.shiftKey) {
      // Range select with Shift (TODO: implement in Phase 3)
      selectClip(clip.id, false);
    } else {
      // Single select
      selectClip(clip.id, false);
    }
  }, [clip.id, selectClip]);

  // Handle drag start
  const handleMouseDown = useCallback((e) => {
    // Don't start drag if clicking on trim handles (will be added in Phase 3)
    if (e.target.classList.contains('clip-trim-handle')) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    
    // Select clip if not already selected
    if (!isSelected) {
      selectClip(clip.id, false);
    }

    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      startTime: clip.startTime
    });
  }, [clip.id, clip.startTime, isSelected, selectClip]);

  // Handle drag move
  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaTime = pixelsToTime(deltaX, zoom);
    let newStartTime = dragStart.startTime + deltaTime;

    // Apply magnetic snap if enabled
    if (magneticSnap) {
      const newStartTimePx = timeToPixels(newStartTime, zoom);
      newStartTime = snapToNearest(newStartTimePx, clip.id);
    }

    // Clamp to non-negative time
    newStartTime = Math.max(0, newStartTime);

    // Update clip position
    moveClip(clip.id, trackId, newStartTime);
  }, [
    isDragging,
    dragStart,
    zoom,
    magneticSnap,
    snapToNearest,
    clip.id,
    moveClip,
    trackId
  ]);

  // Handle drag end
  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      saveState(); // Save state for undo/redo
    }
  }, [isDragging, saveState]);

  // Setup drag listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'default';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Get clip type icon
  const getClipIcon = () => {
    switch (clip.type) {
      case 'video':
        return '🎬';
      case 'audio':
        return '🎵';
      case 'text':
        return '📝';
      case 'effect':
        return '✨';
      case 'image':
        return '🖼️';
      default:
        return '📄';
    }
  };

  return (
    <div
      ref={clipRef}
      className={`clip ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      data-type={clip.type}
      style={clipStyle}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      title={`${clip.name} (${clip.duration.toFixed(2)}s)`}
    >
      {/* Clip thumbnail/preview */}
      <div className="clip-thumbnail">
        {clip.thumbnailUrl ? (
          <img src={clip.thumbnailUrl} alt={clip.name} />
        ) : (
          <div className="clip-icon">{getClipIcon()}</div>
        )}
      </div>

      {/* Clip waveform for audio clips */}
      {clip.type === 'audio' && clip.waveformData && (
        <div className="clip-waveform">
          {/* Waveform visualization will be added later */}
          <div className="waveform-placeholder" />
        </div>
      )}

      {/* Clip label */}
      <div className="clip-label">
        <span className="clip-name">{clip.name}</span>
        <span className="clip-duration">{clip.duration.toFixed(1)}s</span>
      </div>

      {/* Trim handles (will be fully implemented in Phase 3) */}
      <div className="clip-trim-handle clip-trim-left" title="Trim start" />
      <div className="clip-trim-handle clip-trim-right" title="Trim end" />

      {/* Selection indicator */}
      {isSelected && <div className="clip-selection-outline" />}
    </div>
  );
};

export default Clip;

