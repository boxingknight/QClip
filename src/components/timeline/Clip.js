// src/components/timeline/Clip.js
/**
 * Clip component
 * Individual media clip with selection, dragging, and manipulation
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useTimeline } from '../../hooks/useTimeline';
import { useMagneticSnap } from '../../hooks/useMagneticSnap';
import { timeToPixels, pixelsToTime } from '../../utils/timelineCalculations';
import ClipContextMenu from './ClipContextMenu';
import './Clip.css';

const Clip = ({ clip, trackHeight, zoom, trackId }) => {
  const {
    selection,
    selectClip,
    moveClip,
    trimClip,
    saveState,
    magneticSnap
  } = useTimeline();
  
  const [isDragging, setIsDragging] = useState(false);
  const [isTrimming, setIsTrimming] = useState(false);
  const [trimSide, setTrimSide] = useState(null); // 'left' or 'right'
  const [dragStart, setDragStart] = useState({ x: 0, startTime: 0, duration: 0 });
  const [contextMenu, setContextMenu] = useState(null);
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

  // Handle context menu
  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Select clip if not already selected
    if (!isSelected) {
      selectClip(clip.id, false);
    }
    
    setContextMenu({
      x: e.clientX,
      y: e.clientY
    });
  }, [clip.id, isSelected, selectClip]);

  // Handle trim start
  const handleTrimStart = useCallback((e, side) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Select clip if not already selected
    if (!isSelected) {
      selectClip(clip.id, false);
    }

    setIsTrimming(true);
    setTrimSide(side);
    setDragStart({
      x: e.clientX,
      startTime: clip.startTime,
      duration: clip.duration
    });
  }, [clip.id, clip.startTime, clip.duration, isSelected, selectClip]);

  // Handle drag start
  const handleMouseDown = useCallback((e) => {
    // Don't start drag if clicking on trim handles
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
      startTime: clip.startTime,
      duration: clip.duration
    });
  }, [clip.id, clip.startTime, clip.duration, isSelected, selectClip]);

  // Handle drag/trim move
  const handleMouseMove = useCallback((e) => {
    if (!isDragging && !isTrimming) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaTime = pixelsToTime(deltaX, zoom);

    if (isTrimming) {
      // Handle trimming
      const minDuration = 0.1; // Minimum clip duration in seconds

      if (trimSide === 'left') {
        // Trim from the start
        let newStartTime = dragStart.startTime + deltaTime;
        let newDuration = dragStart.duration - deltaTime;

        // Apply magnetic snap if enabled
        if (magneticSnap) {
          const newStartTimePx = timeToPixels(newStartTime, zoom);
          newStartTime = snapToNearest(newStartTimePx, clip.id);
          newDuration = dragStart.startTime + dragStart.duration - newStartTime;
        }

        // Clamp values
        newStartTime = Math.max(0, newStartTime);
        newDuration = Math.max(minDuration, newDuration);

        // Ensure we don't trim beyond the original clip boundaries
        const maxStartTime = dragStart.startTime + dragStart.duration - minDuration;
        newStartTime = Math.min(newStartTime, maxStartTime);
        newDuration = dragStart.startTime + dragStart.duration - newStartTime;

        // Update clip trim
        trimClip(clip.id, newStartTime, newDuration);
      } else if (trimSide === 'right') {
        // Trim from the end
        let newDuration = dragStart.duration + deltaTime;

        // Apply magnetic snap if enabled
        if (magneticSnap) {
          const newEndTimePx = timeToPixels(dragStart.startTime + newDuration, zoom);
          const snappedEndTime = snapToNearest(newEndTimePx, clip.id);
          newDuration = snappedEndTime - dragStart.startTime;
        }

        // Clamp duration
        newDuration = Math.max(minDuration, newDuration);

        // Update clip trim
        trimClip(clip.id, clip.startTime, newDuration);
      }
    } else if (isDragging) {
      // Handle normal dragging
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
    }
  }, [
    isDragging,
    isTrimming,
    trimSide,
    dragStart,
    zoom,
    magneticSnap,
    snapToNearest,
    clip.id,
    clip.startTime,
    moveClip,
    trimClip,
    trackId
  ]);

  // Handle drag/trim end
  const handleMouseUp = useCallback(() => {
    if (isDragging || isTrimming) {
      setIsDragging(false);
      setIsTrimming(false);
      setTrimSide(null);
      saveState(); // Save state for undo/redo
    }
  }, [isDragging, isTrimming, saveState]);

  // Setup drag/trim listeners
  useEffect(() => {
    if (isDragging || isTrimming) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      if (isDragging) {
        document.body.style.cursor = 'grabbing';
      } else if (isTrimming) {
        document.body.style.cursor = 'ew-resize';
      }
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'default';
      };
    }
  }, [isDragging, isTrimming, handleMouseMove, handleMouseUp]);

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
    <>
      <div
        ref={clipRef}
        className={`clip ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${isTrimming ? 'trimming' : ''}`}
        data-type={clip.type}
        style={clipStyle}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onContextMenu={handleContextMenu}
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

      {/* Trim handles */}
      <div 
        className="clip-trim-handle clip-trim-left" 
        title="Trim start"
        onMouseDown={(e) => handleTrimStart(e, 'left')}
      />
      <div 
        className="clip-trim-handle clip-trim-right" 
        title="Trim end"
        onMouseDown={(e) => handleTrimStart(e, 'right')}
      />

      {/* Selection indicator */}
      {isSelected && <div className="clip-selection-outline" />}
    </div>

      {/* Context menu */}
      {contextMenu && (
        <ClipContextMenu
          clip={clip}
          position={contextMenu}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
};

export default Clip;

