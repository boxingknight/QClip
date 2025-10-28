// src/components/timeline/SnapIndicators.js
/**
 * SnapIndicators component
 * Visual indicators for magnetic timeline snapping
 */

import React from 'react';
import { useTimeline } from '../../hooks/useTimeline';
import { timeToPixels } from '../../utils/timelineCalculations';
import './SnapIndicators.css';

const SnapIndicators = ({ height }) => {
  const { clips, tracks, playhead, zoom, magneticSnap } = useTimeline();

  if (!magneticSnap) return null;

  // Collect all snap points (clip edges and playhead)
  const snapPoints = new Set();

  // Add playhead position
  snapPoints.add(playhead);

  // Add all clip start and end times
  clips.forEach(clip => {
    snapPoints.add(clip.startTime);
    snapPoints.add(clip.startTime + clip.duration);
  });

  // Convert to array and sort
  const sortedSnapPoints = Array.from(snapPoints).sort((a, b) => a - b);

  return (
    <div className="snap-indicators-container">
      {sortedSnapPoints.map((time, index) => {
        const position = timeToPixels(time, zoom);
        const isPlayhead = Math.abs(time - playhead) < 0.01;

        return (
          <div
            key={`snap-${index}`}
            className={`snap-indicator ${isPlayhead ? 'playhead-snap' : ''}`}
            style={{
              left: `${position}px`,
              height: `${height}px`
            }}
          />
        );
      })}
    </div>
  );
};

export default SnapIndicators;

