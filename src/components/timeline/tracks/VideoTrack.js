// src/components/timeline/tracks/VideoTrack.js
/**
 * VideoTrack component
 * Specialized track for video clips with preview thumbnails
 */

import React from 'react';
import Track from '../Track';
import './VideoTrack.css';

const VideoTrack = ({ track, clips, zoom }) => {
  // Video tracks can have additional controls/features
  // For now, we use the base Track component with video-specific styling
  
  return (
    <Track
      track={{
        ...track,
        type: 'video',
        color: track.color || '#6366f1' // Default video track color
      }}
      clips={clips}
      zoom={zoom}
    />
  );
};

export default VideoTrack;

