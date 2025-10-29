// src/components/timeline/SnapLine.js
/**
 * SnapLine component
 * Visual indicator showing where a clip will snap during drag & drop
 */

import React from 'react';
import './SnapLine.css';

const SnapLine = ({ snapLine, trackHeight }) => {
  if (!snapLine) return null;

  return (
    <div
      className="snap-line"
      style={{
        position: 'absolute',
        left: `${snapLine.x}px`,
        top: 0,
        bottom: 0,
        width: '2px',
        height: trackHeight || '100%',
        backgroundColor: '#6366f1',
        zIndex: 10,
        pointerEvents: 'none'
      }}
      aria-hidden="true"
    />
  );
};

export default SnapLine;
