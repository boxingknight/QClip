// src/components/timeline/Track.js
/**
 * Track component
 * Individual timeline track with clips and interactive controls
 */

import React, { useState, useRef, useCallback } from 'react';
import { useTimeline } from '../../hooks/useTimeline';
import { timeToPixels } from '../../utils/timelineCalculations';
import Clip from './Clip';
import './Track.css';

const Track = ({ track, clips, zoom }) => {
  const { updateTrackSettings, removeTrack } = useTimeline();
  const [isResizing, setIsResizing] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(track.name);
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

  return (
    <div 
      ref={trackRef}
      className={`track ${track.locked ? 'locked' : ''} ${!track.visible ? 'hidden' : ''}`}
      data-type={track.type}
      style={{ 
        height: `${track.height}px`,
        backgroundColor: track.color + '15' // Add transparency
      }}
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
