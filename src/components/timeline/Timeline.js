// src/components/timeline/Timeline.js
/**
 * Main Timeline component for professional video editing
 * Replaces the existing timeline with a multi-track professional interface
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTimeline } from '../../hooks/useTimeline';
import TimelineHeader from './TimelineHeader';
import TimelineRuler from './TimelineRuler';
import TimelineTracks from './TimelineTracks';
import TimelineFooter from './TimelineFooter';
import Playhead from './Playhead';
import './Timeline.css';

const Timeline = () => {
  const timelineRef = useRef(null);
  const [viewportWidth, setViewportWidth] = useState(800);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  const {
    clips,
    tracks,
    playhead,
    zoom,
    duration,
    timelineDimensions,
    playheadPosition,
    setPlayhead,
    setZoom,
    getViewportBounds,
    formatTime,
    formatDuration
  } = useTimeline();

  // Update viewport width on resize
  useEffect(() => {
    const updateViewportWidth = () => {
      if (timelineRef.current) {
        setViewportWidth(timelineRef.current.offsetWidth);
      }
    };

    updateViewportWidth();
    window.addEventListener('resize', updateViewportWidth);
    
    return () => window.removeEventListener('resize', updateViewportWidth);
  }, []);

  // Calculate viewport bounds
  const viewportBounds = getViewportBounds(scrollLeft, viewportWidth);

  // Handle timeline click to set playhead
  const handleTimelineClick = (e) => {
    if (e.target === timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left + scrollLeft;
      const clickTime = (clickX / (100 * zoom)); // 100 pixels per second base
      setPlayhead(Math.max(0, clickTime));
    }
  };

  // Handle scroll
  const handleScroll = (e) => {
    setScrollLeft(e.target.scrollLeft);
  };

  // Handle zoom change
  const handleZoomChange = (newZoom) => {
    setZoom(newZoom);
  };

  // Calculate timeline info
  const timelineInfo = {
    totalClips: clips.length,
    totalDuration: formatDuration(timelineDimensions.totalDuration),
    currentTime: formatTime(playhead),
    zoomLevel: Math.round(zoom * 100)
  };

  return (
    <div className="timeline-container">
      <TimelineHeader 
        timelineInfo={timelineInfo}
        zoom={zoom}
        onZoomChange={handleZoomChange}
      />
      
      <div className="timeline-main">
        <TimelineRuler 
          duration={timelineDimensions.totalDuration}
          zoom={zoom}
          scrollLeft={scrollLeft}
        />
        
        <div 
          ref={timelineRef}
          className="timeline-content"
          onClick={handleTimelineClick}
          onScroll={handleScroll}
        >
          <div 
            className="timeline-tracks-container"
            style={{ 
              width: `${timelineDimensions.totalWidth}px`,
              minWidth: '100%'
            }}
          >
            <TimelineTracks 
              tracks={tracks}
              clips={clips}
              viewportBounds={viewportBounds}
              zoom={zoom}
            />
            
            <Playhead 
              position={playheadPosition}
              height={tracks.length * 60} // Approximate height
            />
          </div>
        </div>
      </div>
      
      <TimelineFooter 
        timelineInfo={timelineInfo}
        scrollLeft={scrollLeft}
        viewportWidth={viewportWidth}
      />
    </div>
  );
};

export default Timeline;
