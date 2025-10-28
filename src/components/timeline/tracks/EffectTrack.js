// src/components/timeline/tracks/EffectTrack.js
/**
 * EffectTrack component
 * Specialized track for effect/filter clips
 */

import React from 'react';
import Track from '../Track';
import './EffectTrack.css';

const EffectTrack = ({ track, clips, zoom }) => {
  // Effect tracks can have additional controls for effect parameters
  // For now, we use the base Track component with effect-specific styling
  
  return (
    <Track
      track={{
        ...track,
        type: 'effect',
        color: track.color || '#ec4899' // Default effect track color
      }}
      clips={clips}
      zoom={zoom}
    />
  );
};

export default EffectTrack;

