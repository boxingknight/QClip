// src/context/PlaybackContext.js
/**
 * Playback Context - Manages video playback state
 * Connects video player controls with timeline controls
 */

import React, { createContext, useContext, useState, useRef, useCallback } from 'react';

const PlaybackContext = createContext();

export const usePlayback = () => {
  const context = useContext(PlaybackContext);
  if (!context) {
    throw new Error('usePlayback must be used within PlaybackProvider');
  }
  return context;
};

export const PlaybackProvider = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef(null); // Ref to the actual video element

  // Register the video element
  const registerVideo = useCallback((videoElement) => {
    videoRef.current = videoElement;
    console.log('Video element registered:', !!videoElement);
  }, []);

  // Play video
  const play = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        console.log('Playback: Playing');
      }).catch((error) => {
        console.error('Playback: Play failed', error);
      });
    } else {
      console.warn('Playback: No video element registered');
    }
  }, []);

  // Pause video
  const pause = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
      console.log('Playback: Paused');
    }
  }, []);

  // Stop video (pause and reset to beginning)
  const stop = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
      console.log('Playback: Stopped');
    }
  }, []);

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  // Seek to specific time
  const seek = useCallback((time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(time, duration));
      setCurrentTime(time);
      console.log('Playback: Seeked to', time);
    }
  }, [duration]);

  // Update playback state (called by video element)
  const updatePlaybackState = useCallback((state) => {
    if (state.isPlaying !== undefined) setIsPlaying(state.isPlaying);
    if (state.currentTime !== undefined) setCurrentTime(state.currentTime);
    if (state.duration !== undefined) setDuration(state.duration);
  }, []);

  const value = {
    // State
    isPlaying,
    currentTime,
    duration,
    
    // Controls
    play,
    pause,
    stop,
    togglePlayPause,
    seek,
    
    // Video registration
    registerVideo,
    updatePlaybackState
  };

  return (
    <PlaybackContext.Provider value={value}>
      {children}
    </PlaybackContext.Provider>
  );
};

