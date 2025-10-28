// src/components/timeline/TimelineTracks.js
/**
 * TimelineTracks component
 * Container for all timeline tracks with specialized track type rendering
 */

import React from 'react';
import { useTimeline } from '../../hooks/useTimeline';
import Track from './Track';
import { VideoTrack, AudioTrack, TextTrack, EffectTrack } from './tracks';
import './TimelineTracks.css';

const TimelineTracks = () => {
  const { tracks, clips, zoom } = useTimeline();

  // Get the appropriate track component based on type
  const getTrackComponent = (track) => {
    switch (track.type) {
      case 'video':
        return VideoTrack;
      case 'audio':
        return AudioTrack;
      case 'text':
        return TextTrack;
      case 'effect':
        return EffectTrack;
      default:
        return Track;
    }
  };

  return (
    <div className="timeline-tracks">
      {tracks.map(track => {
        // Filter clips for this track
        const trackClips = clips.filter(clip => clip.trackId === track.id);
        
        // Get the appropriate track component
        const TrackComponent = getTrackComponent(track);
        
        return (
          <TrackComponent 
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
