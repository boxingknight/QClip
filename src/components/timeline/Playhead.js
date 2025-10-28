// src/components/timeline/Playhead.js
/**
 * Playhead component
 * Draggable playhead for timeline scrubbing
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useTimeline } from '../../hooks/useTimeline';
import { usePlayback } from '../../context/PlaybackContext';
import './Playhead.css';

const Playhead = ({ position, height }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, time: 0 });
  const playheadRef = useRef(null);
  
  const { playhead, setPlayhead, magneticSnap } = useTimeline();
  const { seek } = usePlayback();

  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, time: playhead });
    e.preventDefault();
    e.stopPropagation();
  }, [playhead]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaTime = deltaX / 100; // 100 pixels per second base
    const newTime = Math.max(0, dragStart.time + deltaTime);
    
    // Update timeline playhead position
    setPlayhead(newTime);
    
    // Seek the video to the new time
    seek(newTime);
    
    console.log('[Playhead] Scrubbing to:', newTime);
  }, [isDragging, dragStart, setPlayhead, seek]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={playheadRef}
      className={`playhead ${isDragging ? 'dragging' : ''}`}
      style={{
        left: `${position}px`,
        height: `${height}px`
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="playhead-line" />
      <div className="playhead-handle" />
    </div>
  );
};

export default Playhead;
