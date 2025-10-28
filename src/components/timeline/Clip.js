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
  
  // Debug: Log when clip duration changes
  useEffect(() => {
    console.log('[CLIP RENDER]', {
      clipId: clip.id,
      duration: clip.duration,
      trimIn: clip.trimIn,
      trimOut: clip.trimOut,
      width: clipStyle.width
    });
  }, [clip.id, clip.duration, clip.trimIn, clip.trimOut, clipStyle.width]);

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
    setDragStart({
      x: e.clientX,
      startTime: clip.startTime,
      duration: clip.duration,
      trimIn: clip.trimIn,
      trimOut: clip.trimOut
    });
  }, [clip.id, clip.startTime, clip.duration, clip.trimIn, clip.trimOut, isSelected, selectClip]);

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
      // Handle trimming using proper trim points
      const minDuration = 0.1; // Minimum clip duration in seconds
      
      // Get the original full duration from when clip was first imported (NEVER changes)
      const originalFullDuration = clip.originalDuration || clip.duration;

      if (trimSide === 'left') {
        // Trim from the start: move trimIn point, keep trimOut fixed
        let newTrimIn = dragStart.trimIn + deltaTime;
        
        // Apply magnetic snap if enabled
        if (magneticSnap) {
          const newTrimInPx = timeToPixels(newTrimIn, zoom);
          const snappedPx = snapToNearest(newTrimInPx, clip.id);
          newTrimIn = pixelsToTime(snappedPx, zoom); // ✅ CRITICAL FIX: Convert pixels back to time!
        }

        // Clamp values to prevent invalid states
        newTrimIn = Math.max(0, newTrimIn); // Can't go before start of original clip
        newTrimIn = Math.min(newTrimIn, dragStart.trimOut - minDuration); // Can't make duration too small
        
        console.log('[TRIM] Left trim:', { 
          deltaTime, 
          dragStartTrimIn: dragStart.trimIn,
          newTrimIn, 
          trimOut: dragStart.trimOut,
          newDuration: dragStart.trimOut - newTrimIn 
        });
        
        // Update clip trim points
        trimClip(clip.id, newTrimIn, dragStart.trimOut);
        
      } else if (trimSide === 'right') {
        // Trim from the end: move trimOut point, keep trimIn fixed
        let newTrimOut = dragStart.trimOut + deltaTime;
        
        console.log('🔍 [RIGHT TRIM DEBUG - STEP 1] After deltaTime calculation:', {
          dragStartTrimOut: dragStart.trimOut,
          deltaTime,
          newTrimOut_calculated: newTrimOut,
          clipOriginalDuration: clip.originalDuration,
          clipDuration: clip.duration,
          clipTrimOut: clip.trimOut
        });
        
        // Apply magnetic snap if enabled
        if (magneticSnap) {
          const newTrimOutPx = timeToPixels(newTrimOut, zoom);
          const snappedPx = snapToNearest(newTrimOutPx, clip.id);
          const beforeSnap = newTrimOut;
          newTrimOut = pixelsToTime(snappedPx, zoom); // ✅ CRITICAL FIX: Convert pixels back to time!
          console.log('🔍 [RIGHT TRIM DEBUG - STEP 2] After magnetic snap:', {
            beforeSnap,
            beforeSnapPx: newTrimOutPx,
            snappedPx,
            afterSnap: newTrimOut,
            changed: beforeSnap !== newTrimOut
          });
        }

        // Clamp values to prevent invalid states
        const beforeFirstClamp = newTrimOut;
        newTrimOut = Math.max(dragStart.trimIn + minDuration, newTrimOut); // Can't make duration too small
        console.log('🔍 [RIGHT TRIM DEBUG - STEP 3] After first clamp (Math.max):', {
          beforeFirstClamp,
          afterFirstClamp: newTrimOut,
          minAllowed: dragStart.trimIn + minDuration,
          changed: beforeFirstClamp !== newTrimOut
        });
        
        const beforeSecondClamp = newTrimOut;
        newTrimOut = Math.min(newTrimOut, originalFullDuration); // Can't extend beyond original clip end
        console.log('🔍 [RIGHT TRIM DEBUG - STEP 4] After second clamp (Math.min):', {
          beforeSecondClamp,
          afterSecondClamp: newTrimOut,
          originalFullDuration,
          changed: beforeSecondClamp !== newTrimOut
        });
        
        console.log('[TRIM] Right trim FINAL:', { 
          deltaTime, 
          dragStartTrimOut: dragStart.trimOut,
          newTrimOut, 
          trimIn: dragStart.trimIn,
          newDuration: newTrimOut - dragStart.trimIn,
          originalFullDuration
        });
        
        // Update clip trim points
        trimClip(clip.id, dragStart.trimIn, newTrimOut);
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

