// src/components/timeline/Track.js
/**
 * Track component
 * Individual timeline track with clips and interactive controls
 */

import React, { useState, useRef, useCallback } from 'react';
import { useTimeline } from '../../hooks/useTimeline';
import { timeToPixels, pixelsToTime } from '../../utils/timelineCalculations';
import Clip from './Clip';
import './Track.css';

const Track = ({ track, clips, zoom }) => {
  const { updateTrackSettings, removeTrack, addClip, clips: timelineClips } = useTimeline();
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
      e.dataTransfer.dropEffect = 'move';
    }
  }, [track.locked]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (track.locked) {
      return;
    }

    try {
      const clipId = e.dataTransfer.getData('text/plain');
      const sourceClip = timelineClips.find(clip => clip.id === clipId);
      
      if (!sourceClip) {
        console.warn('Source clip not found:', clipId);
        return;
      }

      // Calculate drop position
      const rect = trackRef.current.getBoundingClientRect();
      const dropX = e.clientX - rect.left;
      const dropTime = pixelsToTime(dropX, zoom);

      // Create timeline clip from project clip
      const timelineClip = {
        id: `timeline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: sourceClip.name,
        path: sourceClip.path,
        duration: sourceClip.duration || 10, // Default duration if not available
        startTime: Math.max(0, dropTime),
        trackId: track.id,
        type: track.type,
        thumbnailUrl: sourceClip.thumbnailUrl,
        fileSize: sourceClip.fileSize
      };

      addClip(timelineClip);
      console.log('Clip added to timeline:', timelineClip);
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  }, [track.locked, track.id, track.type, timelineClips, zoom, addClip]);

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
