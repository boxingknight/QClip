// src/components/timeline/SnapLine.js
/**
 * SnapLine component
 * Visual indicator shown when clip is actively snapping to a point
 */

import React, { useState, useEffect } from 'react';
import { timeToPixels } from '../../utils/timelineCalculations';
import { formatTime } from '../../utils/timelineCalculations';
import './SnapIndicators.css';

const SnapLine = ({ snapTime, height, zoom, show }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
    } else {
      // Delay hiding to allow fade-out animation
      const timeout = setTimeout(() => setVisible(false), 150);
      return () => clearTimeout(timeout);
    }
  }, [show]);

  if (!visible) return null;

  const position = timeToPixels(snapTime, zoom);

  return (
    <>
      <div
        className="snap-line"
        style={{
          left: `${position}px`,
          height: `${height}px`,
          opacity: show ? 1 : 0
        }}
      />
      <div
        className="snap-distance-indicator"
        style={{
          left: `${position}px`,
          top: '10px',
          opacity: show ? 1 : 0
        }}
      >
        {formatTime(snapTime)}
      </div>
    </>
  );
};

export default SnapLine;

