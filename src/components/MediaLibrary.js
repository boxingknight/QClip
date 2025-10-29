/**
 * MediaLibrary component
 * Displays imported videos with thumbnails for drag-and-drop to timeline
 * Now uses separate MediaLibraryContext for proper separation from Timeline
 */

import React, { useState, useRef, useCallback } from 'react';
import { useMediaLibrary } from '../context/MediaLibraryContext';
import { useTimeline } from '../hooks/useTimeline';
import { formatFileSize, formatDuration, formatResolution } from '../utils/videoMetadata';
import './MediaLibrary.css';

const MediaLibrary = () => {
  const { 
    mediaItems, 
    selectedMediaId, 
    selectMedia, 
    reorderMedia,
    setDraggedMedia,
    clearDraggedMedia 
  } = useMediaLibrary();
  
  const { addClip } = useTimeline(); // For drag-and-drop to timeline
  const [draggedClip, setDraggedClip] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Handle media item click to select for preview
  const handleMediaClick = useCallback((e, mediaItem) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🎬 [MEDIA_LIBRARY] Media item clicked', { mediaItem, mediaId: mediaItem.id });
    
    // Select the media item for preview
    selectMedia(mediaItem.id);
    console.log('🎬 [MEDIA_LIBRARY] Media item selected for preview:', mediaItem.name);
  }, [selectMedia]);

  // Handle drag start - for dragging TO timeline, not for reordering
  const handleDragStart = useCallback((e, mediaItem, index) => {
    setDraggedClip(mediaItem);
    setDraggedMedia(mediaItem.id);
    
    // Set drag data for Timeline to consume
    e.dataTransfer.effectAllowed = 'copy'; // Use 'copy' to indicate adding to timeline
    e.dataTransfer.setData('text/plain', mediaItem.id);
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'media-library-item',
      mediaItem,
      sourceIndex: index
    }));
    
    console.log('🎬 [MEDIA_LIBRARY] Drag started for Timeline:', { mediaItem: mediaItem.name, index });
  }, [setDraggedMedia]);

  // Handle drag end - clean up drag state
  const handleDragEnd = useCallback(() => {
    setDraggedClip(null);
    clearDraggedMedia();
    setDragOverIndex(null);
    console.log('🎬 [MEDIA_LIBRARY] Drag ended');
  }, [clearDraggedMedia]);

  // Check if mediaItems is undefined or empty
  if (!mediaItems || mediaItems.length === 0) {
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
        <span className="media-count">{mediaItems.length} video{mediaItems.length !== 1 ? 's' : ''}</span>
      </div>
      
      <div className="media-library-content">
        {mediaItems.map((mediaItem, index) => (
          <div
            key={mediaItem.id}
            className={`media-item ${selectedMediaId === mediaItem.id ? 'selected' : ''} ${
              draggedClip?.id === mediaItem.id ? 'dragging' : ''
            }`}
            draggable
            onDragStart={(e) => handleDragStart(e, mediaItem, index)}
            onDragEnd={handleDragEnd}
            onClick={(e) => handleMediaClick(e, mediaItem)}
          >
            <div className="media-thumbnail">
              {mediaItem.thumbnail ? (
                <img src={mediaItem.thumbnail} alt={mediaItem.name} />
              ) : (
                <div className="thumbnail-placeholder">
                  <span className="play-icon">▶</span>
                </div>
              )}
            </div>
            
            <div className="media-info">
              <div className="media-name" title={mediaItem.name}>
                {mediaItem.name}
              </div>
              
              <div className="media-details">
                <div className="media-duration">
                  {formatDuration(mediaItem.duration)}
                </div>
                
                <div className="media-size">
                  {formatFileSize(mediaItem.fileSize)}
                </div>
                
                {mediaItem.width && mediaItem.height && (
                  <div className="media-resolution">
                    {formatResolution(mediaItem.width, mediaItem.height)}
                  </div>
                )}
              </div>
            </div>
            
            <div className="media-actions">
              <button
                className="drag-handle"
                title="Drag to reorder or add to timeline"
                onMouseDown={(e) => e.stopPropagation()}
              >
                ⋮⋮
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="media-library-footer">
        <p className="drag-hint">
          💡 Drag videos to timeline or reorder them here
        </p>
      </div>
    </div>
  );
};

export default MediaLibrary;