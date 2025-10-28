// src/components/timeline/TimelineHeader.js
/**
 * Timeline Header component
 * Contains playback controls, zoom controls, and timeline information
 */

import React from 'react';
import './TimelineHeader.css';

const TimelineHeader = ({ timelineInfo, zoom, onZoomChange }) => {
  const { totalClips, totalDuration, currentTime, zoomLevel } = timelineInfo;

  const handleZoomIn = () => {
    onZoomChange(Math.min(10, zoom * 1.2));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(0.1, zoom / 1.2));
  };

  const handleZoomReset = () => {
    onZoomChange(1);
  };

  const handleZoomFit = () => {
    // This would be implemented with viewport width calculation
    onZoomChange(1);
  };

  return (
    <div className="timeline-header">
      <div className="timeline-header-left">
        <div className="timeline-info">
          <span className="timeline-info-item">
            {totalClips} clips
          </span>
          <span className="timeline-info-item">
            {totalDuration} total
          </span>
          <span className="timeline-info-item">
            {currentTime}
          </span>
        </div>
      </div>
      
      <div className="timeline-header-center">
        <div className="playback-controls">
          <button className="playback-btn" title="Play">
            ▶
          </button>
          <button className="playback-btn" title="Pause">
            ⏸
          </button>
          <button className="playback-btn" title="Stop">
            ⏹
          </button>
        </div>
      </div>
      
      <div className="timeline-header-right">
        <div className="zoom-controls">
          <button 
            className="zoom-btn" 
            onClick={handleZoomOut}
            title="Zoom Out"
          >
            −
          </button>
          <span className="zoom-level">
            {zoomLevel}%
          </span>
          <button 
            className="zoom-btn" 
            onClick={handleZoomIn}
            title="Zoom In"
          >
            +
          </button>
          <button 
            className="zoom-btn zoom-reset" 
            onClick={handleZoomReset}
            title="Reset Zoom"
          >
            ⌂
          </button>
          <button 
            className="zoom-btn zoom-fit" 
            onClick={handleZoomFit}
            title="Fit to Content"
          >
            ⊞
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimelineHeader;
