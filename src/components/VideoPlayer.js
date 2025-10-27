import React, { useRef, useState, useEffect } from 'react';
import './styles/VideoPlayer.css';

const VideoPlayer = ({ videoSrc, onTimeUpdate, selectedClip }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle video source changes
  useEffect(() => {
    if (!videoSrc) {
      // Reset player state when no video
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
      setError(null);
      if (videoRef.current) {
        videoRef.current.src = '';
      }
      return;
    }
    
    // Update video source
    const video = videoRef.current;
    if (video) {
      setIsLoading(true);
      setError(null);
      video.src = videoSrc;
      video.load();
    }
  }, [videoSrc]);

  // Event handlers
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration);
      setIsLoading(false);
      // Update parent with duration
      if (selectedClip) {
        onTimeUpdate?.({
          currentTime: video.currentTime,
          duration: video.duration
        });
      }
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      const current = video.currentTime;
      setCurrentTime(current);
      // Notify parent of time update
      onTimeUpdate?.({
        currentTime: current,
        duration: duration
      });
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(duration);
  };

  const handleError = (e) => {
    setError('Failed to load video. Please check the file format.');
    setIsLoading(false);
    console.error('Video error:', e);
  };

  const handlePlayPause = () => {
    const video = videoRef.current;
    
    if (!video || !videoSrc) {
      setError('No video loaded');
      return;
    }
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch((err) => {
        setError('Failed to play video');
        console.error('Play error:', err);
      });
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Empty state
  if (!videoSrc) {
    return (
      <div className="video-player-container empty-state">
        <div className="empty-message">
          <p>No video selected</p>
          <p className="subtext">Import a video to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="video-player-container">
      {isLoading && (
        <div className="loading-indicator">
          Loading video...
        </div>
      )}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <video
        ref={videoRef}
        src={videoSrc}
        className="video-element"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onError={handleError}
      />
      
      <div className="player-controls">
        <button 
          className="play-pause-btn"
          onClick={handlePlayPause}
          disabled={isLoading}
          aria-label={isPlaying ? 'Pause video' : 'Play video'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        
        <div className="time-display">
          <span>{formatTime(currentTime)}</span>
          <span className="separator">/</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      
      {selectedClip && (
        <div className="video-info">
          <p><strong>{selectedClip.name}</strong></p>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;

