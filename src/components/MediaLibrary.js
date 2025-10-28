/**
 * MediaLibrary component
 * Displays imported videos with thumbnails for drag-and-drop to timeline
 */

import React, { useState, useRef, useCallback } from 'react';
import { useProject } from '../context/ProjectContext';
import './MediaLibrary.css';

const MediaLibrary = () => {
  const { clips } = useProject();
  const [draggedClip, setDraggedClip] = useState(null);
  const [dragOverTrack, setDragOverTrack] = useState(null);

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

  // Format duration for display
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get file size for display
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (clips.length === 0) {
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
        <span className="clip-count">{clips.length} video{clips.length !== 1 ? 's' : ''}</span>
      </div>
      
      <div className="media-library-content">
        {clips.map((clip) => (
          <div
            key={clip.id}
            className={`media-item ${draggedClip?.id === clip.id ? 'dragging' : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, clip)}
            onDragEnd={handleDragEnd}
            title={`Drag to timeline: ${clip.name}`}
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
                <span className="resolution">
                  {clip.width && clip.height ? `${clip.width}×${clip.height}` : 'Unknown'}
                </span>
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
