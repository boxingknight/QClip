/**
 * MediaLibrary component
 * Displays imported videos with thumbnails for drag-and-drop to timeline
 */

import React, { useState, useRef, useCallback } from 'react';
import { useTimeline } from '../hooks/useTimeline';
import { formatFileSize, formatDuration, formatResolution } from '../utils/videoMetadata';
import './MediaLibrary.css';

const MediaLibrary = () => {
  const { clips, selectClip } = useTimeline();
  const [draggedClip, setDraggedClip] = useState(null);
  const [dragOverTrack, setDragOverTrack] = useState(null);

  // Handle clip click to select for playback
  const handleClipClick = useCallback((e, clip) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Select the clip for playback
    selectClip(clip.id);
    console.log('Clip selected for playback:', clip.name);
  }, [selectClip]);

  // Handle drag start
  const handleDragStart = useCallback((e, clip) => {
    setDraggedClip(clip);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', clip.id);
    
    // Create a custom drag image
    const dragImage = e.target.cloneNode(true);
    dragImage.style.transform = 'rotate(5deg)';
    dragImage.style.opacity = '0.8';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 50, 50);
    
    // Clean up drag image after a short delay
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setDraggedClip(null);
    setDragOverTrack(null);
  }, []);

  // Check if clips is undefined or empty
  if (!clips || clips.length === 0) {
    return (
      <div className="media-library">
        <div className="media-library-header">
          <h3>Media Library</h3>
        </div>
        <div className="media-library-empty">
          <div className="empty-icon">📁</div>
          <p>No videos imported yet</p>
          <p className="empty-hint">Import videos to see them here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="media-library">
      <div className="media-library-header">
        <h3>Media Library</h3>
        <span className="clip-count">{clips?.length || 0} video{(clips?.length || 0) !== 1 ? 's' : ''}</span>
      </div>
      
      <div className="media-library-content">
        {(clips || []).map((clip) => (
          <div
            key={clip.id}
            className={`media-item ${draggedClip?.id === clip.id ? 'dragging' : ''}`}
            draggable
            onClick={(e) => handleClipClick(e, clip)}
            onDragStart={(e) => handleDragStart(e, clip)}
            onDragEnd={handleDragEnd}
            title={`Click to play, drag to timeline: ${clip.name}`}
          >
            <div className="media-thumbnail">
              {clip.thumbnailUrl ? (
                <img 
                  src={clip.thumbnailUrl} 
                  alt={clip.name}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="thumbnail-placeholder" style={{ display: clip.thumbnailUrl ? 'none' : 'flex' }}>
                <span className="video-icon">🎬</span>
              </div>
              <div className="duration-badge">
                {formatDuration(clip.duration)}
              </div>
            </div>
            
            <div className="media-info">
              <div className="media-name" title={clip.name}>
                {clip.name}
              </div>
              <div className="media-details">
                <span className="file-size">{formatFileSize(clip.fileSize || 0)}</span>
                <span className="resolution">{formatResolution(clip.width, clip.height)}</span>
                {clip.metadataError && (
                  <span className="metadata-error" title={clip.metadataError}>⚠️</span>
                )}
              </div>
            </div>
            
            <div className="drag-indicator">
              <span className="drag-icon">⋮⋮</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaLibrary;
