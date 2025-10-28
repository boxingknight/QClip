// src/components/timeline/TimelineFooter.js
/**
 * Timeline Footer component
 * Displays timeline overview and status information
 */

import React from 'react';
import './TimelineFooter.css';

const TimelineFooter = ({ timelineInfo, scrollLeft, viewportWidth }) => {
  const { totalClips, totalDuration, currentTime, zoomLevel } = timelineInfo;

  return (
    <div className="timeline-footer">
      <div className="timeline-footer-left">
        <span className="timeline-status">
          {totalClips} clips • {totalDuration} total
        </span>
      </div>
      
      <div className="timeline-footer-center">
        {/* Playback controls moved to TimelineHeader */}
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
