// src/components/timeline/Track.js
/**
 * Track component
 * Individual timeline track with clips
 */

import React from 'react';
import './Track.css';

const Track = ({ track, clips, viewportBounds, zoom }) => {
  return (
    <div 
      className="track"
      style={{ 
        height: `${track.height}px`,
        backgroundColor: track.color + '20' // Add transparency
      }}
    >
      <div className="track-header">
        <div className="track-name">
          {track.name}
        </div>
        <div className="track-controls">
          <button 
            className={`track-control-btn ${track.muted ? 'active' : ''}`}
            title="Mute"
          >
            M
          </button>
          <button 
            className={`track-control-btn ${track.soloed ? 'active' : ''}`}
            title="Solo"
          >
            S
          </button>
          <button 
            className={`track-control-btn ${track.locked ? 'active' : ''}`}
            title="Lock"
          >
            L
          </button>
          <button 
            className={`track-control-btn ${track.visible ? 'active' : ''}`}
            title="Visibility"
          >
            👁
          </button>
        </div>
      </div>
      
      <div className="track-content">
        {clips.map(clip => (
          <div
            key={clip.id}
            className="clip"
            style={{
              left: `${(clip.startTime || 0) * 100 * zoom}px`,
              width: `${(clip.duration || 0) * 100 * zoom}px`,
              height: `${track.height - 8}px`
            }}
          >
            <div className="clip-thumbnail">
              🎬
            </div>
            <div className="clip-label">
              {clip.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Track;
