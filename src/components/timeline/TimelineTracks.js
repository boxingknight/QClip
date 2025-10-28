// src/components/timeline/TimelineTracks.js
/**
 * TimelineTracks component
 * Container for all timeline tracks
 */

import React from 'react';
import { useTimeline } from '../../hooks/useTimeline';
import Track from './Track';
import './TimelineTracks.css';

const TimelineTracks = () => {
  const { tracks, clips, zoom } = useTimeline();

  return (
    <div className="timeline-tracks">
      {tracks.map(track => {
        // Filter clips for this track
        const trackClips = clips.filter(clip => clip.trackId === track.id);
        
        return (
          <Track 
            key={track.id} 
            track={track} 
            clips={trackClips}
            zoom={zoom}
          />
        );
      })}
    </div>
  );
};

export default TimelineTracks;
