// src/components/timeline/Track.js
/**
 * Track component
 * Individual timeline track with clips and interactive controls
 */

import React, { useState, useRef, useCallback } from 'react';
import { useTimeline } from '../../hooks/useTimeline';
import { timeToPixels, pixelsToTime } from '../../utils/timelineCalculations';
import { calculateSnapTargets, findSnapTarget, isValidDropPosition } from '../../utils/dragDropCalculations';
import Clip from './Clip';
import './Track.css';

const Track = ({ track, clips, zoom }) => {
  const { updateTrackSettings, removeTrack, addClip, moveClip, clips: timelineClips } = useTimeline();
  const [isResizing, setIsResizing] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(track.name);
  const [isDragOver, setIsDragOver] = useState(false);
  const resizeStartRef = useRef({ y: 0, height: 0 });
  const trackRef = useRef(null);

  // Handle track control toggles
  const handleToggleMute = useCallback(() => {
    updateTrackSettings(track.id, { muted: !track.muted });
  }, [track.id, track.muted, updateTrackSettings]);

  const handleToggleSolo = useCallback(() => {
    updateTrackSettings(track.id, { soloed: !track.soloed });
  }, [track.id, track.soloed, updateTrackSettings]);

  const handleToggleLock = useCallback(() => {
    updateTrackSettings(track.id, { locked: !track.locked });
  }, [track.id, track.locked, updateTrackSettings]);

  const handleToggleVisibility = useCallback(() => {
    updateTrackSettings(track.id, { visible: !track.visible });
  }, [track.id, track.visible, updateTrackSettings]);

  // Handle track name editing
  const handleNameDoubleClick = useCallback(() => {
    if (!track.locked) {
      setIsEditingName(true);
      setEditedName(track.name);
    }
  }, [track.locked, track.name]);

  const handleNameChange = useCallback((e) => {
    setEditedName(e.target.value);
  }, []);

  const handleNameBlur = useCallback(() => {
    setIsEditingName(false);
    if (editedName.trim() && editedName !== track.name) {
      updateTrackSettings(track.id, { name: editedName.trim() });
    } else {
      setEditedName(track.name);
    }
  }, [editedName, track.id, track.name, updateTrackSettings]);

  const handleNameKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      handleNameBlur();
    } else if (e.key === 'Escape') {
      setIsEditingName(false);
      setEditedName(track.name);
    }
  }, [handleNameBlur, track.name]);

  // Handle track height resizing
  const handleResizeStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStartRef.current = {
      y: e.clientY,
      height: track.height
    };
  }, [track.height]);

  const handleResizeMove = useCallback((e) => {
    if (!isResizing) return;
    
    const deltaY = e.clientY - resizeStartRef.current.y;
    const newHeight = Math.max(60, Math.min(300, resizeStartRef.current.height + deltaY));
    
    updateTrackSettings(track.id, { height: newHeight });
  }, [isResizing, track.id, updateTrackSettings]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Setup resize listeners
  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = 'ns-resize';
      
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
        document.body.style.cursor = 'default';
      };
    }
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!track.locked) {
      setIsDragOver(true);
      
      // Check drag data type to set appropriate drop effect
      // Note: Can't reliably get data during dragover in all browsers, so use effectAllowed
      if (e.dataTransfer.effectAllowed === 'copy') {
        // Media Library item - adding new clip
        e.dataTransfer.dropEffect = 'copy';
      } else if (e.dataTransfer.effectAllowed === 'move') {
        // Timeline clip - repositioning
        e.dataTransfer.dropEffect = 'move';
      }
    }
  }, [track.locked]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    console.log('🎬 [TRACK] DROP EVENT TRIGGERED!', {
      trackId: track.id,
      trackType: track.type,
      locked: track.locked
    });
    
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (track.locked) {
      console.warn('🎬 [TRACK] Track is locked, ignoring drop');
      return;
    }

    try {
      // Get JSON data (from both MediaLibrary and Timeline clips)
      const jsonData = e.dataTransfer.getData('application/json');
      console.log('🎬 [TRACK] JSON data from drag:', jsonData ? 'Present' : 'Missing');
      
      let dragData = null;
      let sourceClip = null;
      let isMediaLibraryItem = false;
      
      if (jsonData) {
        try {
          dragData = JSON.parse(jsonData);
          console.log('🎬 [TRACK] Parsed drag data:', dragData);
          
          // Handle Media Library items (PRESERVE - existing functionality)
          if (dragData.type === 'media-library-item') {
            sourceClip = dragData.mediaItem;
            isMediaLibraryItem = true;
            console.log('🎬 [TRACK] ✅ Dropping MediaLibrary item:', {
              name: sourceClip.name,
              duration: sourceClip.duration,
              path: sourceClip.path
            });
          }
          // Handle Timeline clips (NEW)
          else if (dragData.type === 'timeline-clip') {
            sourceClip = dragData.clip;
            isMediaLibraryItem = false;
            console.log('🎬 [TRACK] ✅ Dropping Timeline clip:', {
              clipId: dragData.clipId,
              trackId: dragData.trackId,
              name: sourceClip.name
            });
          }
        } catch (error) {
          console.error('🎬 [TRACK] ❌ Failed to parse JSON drag data:', error);
        }
      }
      
      // Fallback to text/plain (for compatibility)
      if (!sourceClip) {
        const clipId = e.dataTransfer.getData('text/plain');
        if (clipId) {
          sourceClip = timelineClips.find(clip => clip.id === clipId);
          if (sourceClip) {
            isMediaLibraryItem = false; // Timeline clip
            console.log('🎬 [TRACK] ✅ Dropping Timeline clip (fallback):', clipId);
          }
        }
      }
      
      if (!sourceClip) {
        console.error('🎬 [TRACK] ❌ Source clip not found');
        return;
      }

      // Calculate drop position
      const rect = trackRef.current.getBoundingClientRect();
      const dropX = e.clientX - rect.left;
      const dropTime = pixelsToTime(dropX, zoom);

      console.log('🎬 [TRACK] Drop position calculated:', {
        dropX,
        dropTime,
        zoom
      });

      // Handle Media Library items (PRESERVE existing behavior)
      if (isMediaLibraryItem) {
        // Create timeline clip from Media Library item
        // Use existing snap-to-end logic from ADD_CLIP reducer
        const timelineClip = {
          id: `timeline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: sourceClip.name,
          path: sourceClip.path,
          duration: sourceClip.duration || 10,
          startTime: Math.max(0, dropTime), // Will be adjusted by ADD_CLIP reducer to snap-to-end
          trackId: track.id,
          type: track.type,
          thumbnailUrl: sourceClip.thumbnailUrl,
          fileSize: sourceClip.fileSize,
          width: sourceClip.width,
          height: sourceClip.height,
          fps: sourceClip.fps,
          codec: sourceClip.codec,
          hasAudio: sourceClip.hasAudio,
          originalDuration: sourceClip.duration,
          trimIn: 0,
          trimOut: sourceClip.duration,
          trimmedPath: null,
          isTrimmed: false,
          trimStartOffset: 0,
          selected: false,
          locked: false,
          effects: []
        };

        addClip(track.id, timelineClip);
        console.log('🎬 [TRACK] ✅ Media Library clip added to timeline!');
        return; // Exit early after handling Media Library
      }

      // Handle Timeline clips (NEW - with snap-to-clip and overlap prevention)
      if (dragData && dragData.type === 'timeline-clip') {
        const sourceTrackId = dragData.trackId;
        
        // Calculate snap targets using time-based calculation
        const allOtherClips = timelineClips.filter(c => c.id !== sourceClip.id);
        const snapTargets = calculateSnapTargets(
          sourceClip,
          allOtherClips,
          0.5 // 0.5 second threshold
        );
        
        // Find closest snap target
        const snapTarget = findSnapTarget(dropTime, snapTargets, 0.5);
        const finalTime = snapTarget ? snapTarget.time : dropTime;
        
        console.log('🎬 [TRACK] Snap calculation:', {
          dropTime,
          snapTargets: snapTargets.length,
          snappedTime: finalTime,
          snapTarget: snapTarget
        });

        // Validate drop position (overlap prevention)
        const trackClips = timelineClips.filter(c => c.trackId === track.id);
        const isValid = isValidDropPosition(
          track.id,
          finalTime,
          sourceClip,
          timelineClips,
          trackClips
        );

        if (isValid) {
          // Move clip using existing moveClip function
          moveClip(sourceClip.id, finalTime, track.id);
          console.log('🎬 [TRACK] ✅ Timeline clip moved successfully:', {
            clipId: sourceClip.id,
            fromTrack: sourceTrackId,
            toTrack: track.id,
            newTime: finalTime
          });
        } else {
          console.warn('🎬 [TRACK] ⚠️ Invalid drop position (overlap prevented):', {
            clipId: sourceClip.id,
            dropTime: finalTime,
            trackId: track.id
          });
          // Could show toast notification here for user feedback
        }
        return; // Exit after handling Timeline clip
      }

    } catch (error) {
      console.error('🎬 [TRACK] ❌ Error handling drop:', error, error.stack);
    }
  }, [track.locked, track.id, track.type, timelineClips, zoom, addClip, moveClip]);

  return (
    <div 
      ref={trackRef}
      className={`track ${track.locked ? 'locked' : ''} ${!track.visible ? 'hidden' : ''} ${isDragOver ? 'drag-over' : ''}`}
      data-type={track.type}
      style={{ 
        height: `${track.height}px`,
        backgroundColor: track.color + '15' // Add transparency
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="track-header">
        <div className="track-name-section">
          {isEditingName ? (
            <input
              type="text"
              className="track-name-input"
              value={editedName}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyDown}
              autoFocus
            />
          ) : (
            <div 
              className="track-name"
              onDoubleClick={handleNameDoubleClick}
              title="Double-click to edit"
            >
              {track.name}
            </div>
          )}
          <span className="track-type-badge">{track.type}</span>
        </div>
        
        <div className="track-controls">
          <button 
            className={`track-control-btn ${track.muted ? 'active' : ''}`}
            onClick={handleToggleMute}
            title={track.muted ? 'Unmute' : 'Mute'}
            disabled={track.locked}
          >
            {track.muted ? 'M' : 'M'}
          </button>
          <button 
            className={`track-control-btn ${track.soloed ? 'active' : ''}`}
            onClick={handleToggleSolo}
            title={track.soloed ? 'Unsolo' : 'Solo'}
            disabled={track.locked}
          >
            {track.soloed ? 'S' : 'S'}
          </button>
          <button 
            className={`track-control-btn ${track.locked ? 'active' : ''}`}
            onClick={handleToggleLock}
            title={track.locked ? 'Unlock' : 'Lock'}
          >
            {track.locked ? '🔒' : '🔓'}
          </button>
          <button 
            className={`track-control-btn ${track.visible ? 'active' : ''}`}
            onClick={handleToggleVisibility}
            title={track.visible ? 'Hide' : 'Show'}
            disabled={track.locked}
          >
            {track.visible ? '👁' : '👁'}
          </button>
        </div>
      </div>
      
      <div className="track-content">
        {clips.map(clip => (
          <Clip
            key={clip.id}
            clip={clip}
            trackHeight={track.height}
            zoom={zoom}
            trackId={track.id}
          />
        ))}
      </div>

      {/* Resize handle */}
      <div 
        className="track-resize-handle"
        onMouseDown={handleResizeStart}
        title="Drag to resize track height"
      />
    </div>
  );
};

export default Track;
