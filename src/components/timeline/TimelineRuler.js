// src/components/timeline/TimelineRuler.js
/**
 * Timeline Ruler component
 * Displays time markers and provides time reference for the timeline
 */

import React from 'react';
import { generateTimeMarkers } from '../../utils/timelineCalculations';
import './TimelineRuler.css';

const TimelineRuler = ({ duration, zoom, scrollLeft }) => {
  // Generate time markers based on zoom level
  const markers = generateTimeMarkers(duration, zoom);

  return (
    <div className="timeline-ruler">
      <div 
        className="timeline-ruler-content"
        style={{ 
          width: `${duration * 100 * zoom}px`,
          transform: `translateX(-${scrollLeft}px)`
        }}
      >
        {markers.map((marker, index) => (
          <div
            key={index}
            className={`time-marker ${marker.isMajor ? 'major' : 'minor'}`}
            style={{ left: `${marker.position}px` }}
          >
            <div className="time-marker-line" />
            <div className="time-marker-label">
              {marker.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineRuler;
