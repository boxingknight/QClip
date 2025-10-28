// src/components/timeline/TimelineFooter.js
/**
 * Timeline Footer component
 * Displays timeline overview, playback controls, and status information
 */

import React from 'react';
import { usePlayback } from '../../context/PlaybackContext';
import './TimelineFooter.css';

const TimelineFooter = ({ timelineInfo, scrollLeft, viewportWidth }) => {
  const { totalClips, totalDuration, currentTime, zoomLevel } = timelineInfo;
  const { isPlaying, play, pause, stop } = usePlayback();

  return (
    <div className="timeline-footer">
      <div className="timeline-footer-left">
        <span className="timeline-status">
          {totalClips} clips • {totalDuration} total
        </span>
      </div>
      
      <div className="timeline-footer-center">
        <div className="playback-controls">
          <button 
            className="playback-btn"
            onClick={play}
            disabled={isPlaying}
            title="Play (Space)"
            aria-label="Play"
          >
            ▶
          </button>
          <button 
            className="playback-btn"
            onClick={pause}
            disabled={!isPlaying}
            title="Pause (Space)"
            aria-label="Pause"
          >
            ⏸
          </button>
          <button 
            className="playback-btn"
            onClick={stop}
            title="Stop"
            aria-label="Stop"
          >
            ⏹
          </button>
        </div>
      </div>
      
      <div className="timeline-footer-right">
        <span className="timeline-position">
          {currentTime}
        </span>
        <span className="timeline-zoom">
          {zoomLevel}%
        </span>
      </div>
    </div>
  );
};

export default TimelineFooter;
