// src/components/timeline/tracks/TextTrack.js
/**
 * TextTrack component
 * Specialized track for text/subtitle clips
 */

import React from 'react';
import Track from '../Track';
import './TextTrack.css';

const TextTrack = ({ track, clips, zoom }) => {
  // Text tracks can have additional controls for font, style, etc.
  // For now, we use the base Track component with text-specific styling
  
  return (
    <Track
      track={{
        ...track,
        type: 'text',
        color: track.color || '#f59e0b' // Default text track color
      }}
      clips={clips}
      zoom={zoom}
    />
  );
};

export default TextTrack;

