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
    trimClip,
    saveState,
    magneticSnap,
    // Drag & Drop state and functions
    dragState,
    startDrag,
    completeDrag
  } = useTimeline();
  
  // Remove isDragging state (now using dragState from context)
  // Keep trimming state (still uses mouse events for precision)
  const [isTrimming, setIsTrimming] = useState(false);
  const [trimSide, setTrimSide] = useState(null); // 'left' or 'right'
  const [trimDragStart, setTrimDragStart] = useState({ x: 0, trimIn: 0, trimOut: 0 });
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
  
  // Calculate clip style (no debug logging needed)

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
    
    console.log('🎯 [TRIM START]', { 
      side, 
      clipId: clip.id,
      currentTrimIn: clip.trimIn, 
      currentTrimOut: clip.trimOut,
      duration: clip.duration,
      mouseX: e.clientX
    });
    
    // Select clip if not already selected
    if (!isSelected) {
      selectClip(clip.id, false);
    }

    setIsTrimming(true);
    setTrimSide(side);
    setTrimDragStart({
      x: e.clientX,
      trimIn: clip.trimIn,
      trimOut: clip.trimOut
    });
  }, [clip.id, clip.startTime, clip.duration, clip.trimIn, clip.trimOut, isSelected, selectClip]);

  // Handle HTML5 drag start (for moving clips)
  const handleDragStart = useCallback((e) => {
    // Prevent drag if clip is locked
    if (clip.locked) {
      e.preventDefault();
      return;
    }
    
    // Don't start drag if clicking on trim handles
    if (e.target.classList.contains('clip-trim-handle') || 
        e.target.closest('.clip-trim-handle')) {
      e.preventDefault();
      return;
    }
    
    // Select clip if not already selected
    if (!isSelected) {
      selectClip(clip.id, false);
    }
    
    // Set drag data (similar to Media Library format but different type)
    e.dataTransfer.effectAllowed = 'move'; // Use 'move' to indicate repositioning
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'timeline-clip',  // Different type from 'media-library-item'
      clipId: clip.id,
      trackId: clip.trackId,
      startTime: clip.startTime,
      clip: clip  // Include full clip data
    }));
    
    // Also set text/plain for fallback compatibility
    e.dataTransfer.setData('text/plain', clip.id);
    
    // Start drag state in context (for visual feedback)
    if (startDrag) {
      startDrag(clip.id, clip.trackId, clip.startTime);
    }
    
    console.log('🎬 [CLIP] Drag started:', { clipId: clip.id, trackId: clip.trackId });
  }, [clip, isSelected, selectClip, startDrag]);

  // Handle HTML5 drag end (cleanup)
  const handleDragEnd = useCallback((e) => {
    // Clean up drag state in context
    if (completeDrag) {
      completeDrag();
    }
    
    console.log('🎬 [CLIP] Drag ended');
  }, [completeDrag]);

  // Handle trim move (only trimming now - dragging uses HTML5 drag & drop)
  const handleMouseMove = useCallback((e) => {
    if (!isTrimming) return;

    const deltaX = e.clientX - trimDragStart.x;
    const deltaTime = pixelsToTime(deltaX, zoom);
    const minDuration = 0.1; // Minimum clip duration in seconds
    
    // Get the original full duration from when clip was first imported (NEVER changes)
    const originalFullDuration = clip.originalDuration || clip.duration;

    if (trimSide === 'left') {
      // Trim from the start: move trimIn point, keep trimOut fixed
      let newTrimIn = trimDragStart.trimIn + deltaTime;
      
      // Apply magnetic snap if enabled
      if (magneticSnap) {
        const newTrimInPx = timeToPixels(newTrimIn, zoom);
        const snappedPx = snapToNearest(newTrimInPx, clip.id);
        newTrimIn = pixelsToTime(snappedPx, zoom);
      }

      // Clamp values to prevent invalid states
      newTrimIn = Math.max(0, newTrimIn);
      newTrimIn = Math.min(newTrimIn, trimDragStart.trimOut - minDuration);
      
      // Update clip trim points
      trimClip(clip.id, newTrimIn, trimDragStart.trimOut);
      
    } else if (trimSide === 'right') {
      // Trim from the end: move trimOut point, keep trimIn fixed
      let newTrimOut = trimDragStart.trimOut + deltaTime;
      
      // Apply magnetic snap if enabled
      if (magneticSnap) {
        const newTrimOutPx = timeToPixels(newTrimOut, zoom);
        const snappedPx = snapToNearest(newTrimOutPx, clip.id);
        newTrimOut = pixelsToTime(snappedPx, zoom);
      }

      // Clamp values to prevent invalid states
      newTrimOut = Math.max(trimDragStart.trimIn + minDuration, newTrimOut);
      newTrimOut = Math.min(newTrimOut, originalFullDuration);
      
      // Update clip trim points
      trimClip(clip.id, trimDragStart.trimIn, newTrimOut);
    }
  }, [
    isTrimming,
    trimSide,
    trimDragStart,
    zoom,
    magneticSnap,
    snapToNearest,
    clip.id,
    clip.originalDuration,
    clip.duration,
    trimClip
  ]);

  // Handle trim end (only trimming now)
  const handleMouseUp = useCallback(() => {
    if (isTrimming) {
      setIsTrimming(false);
      setTrimSide(null);
      saveState(); // Save state for undo/redo
    }
  }, [isTrimming, saveState]);

  // Setup trim listeners (only for trimming - dragging uses HTML5 drag & drop)
  useEffect(() => {
    if (isTrimming) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'default';
      };
    }
  }, [isTrimming, handleMouseMove, handleMouseUp]);

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
        className={`clip ${isSelected ? 'selected' : ''} ${dragState?.isDragging && dragState?.draggedClip?.id === clip.id ? 'dragging' : ''} ${isTrimming ? 'trimming' : ''}`}
        data-type={clip.type}
        style={clipStyle}
        draggable={!clip.locked}  // Only draggable if not locked
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={handleClick}
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

