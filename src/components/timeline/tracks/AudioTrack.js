// src/components/timeline/tracks/AudioTrack.js
/**
 * AudioTrack component
 * Specialized track for audio clips with waveform visualization
 */

import React from 'react';
import Track from '../Track';
import './AudioTrack.css';

const AudioTrack = ({ track, clips, zoom }) => {
  // Audio tracks can have additional controls like volume faders
  // For now, we use the base Track component with audio-specific styling
  
  return (
    <Track
      track={{
        ...track,
        type: 'audio',
        color: track.color || '#10b981' // Default audio track color
      }}
      clips={clips}
      zoom={zoom}
    />
  );
};

export default AudioTrack;

