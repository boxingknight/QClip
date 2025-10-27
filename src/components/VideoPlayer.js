import React, { useRef, useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import '../styles/VideoPlayer.css';

const VideoPlayer = ({ videoSrc, onTimeUpdate, selectedClip }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle video source changes and setup event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Use trimmed path if available, otherwise use original
    const effectiveSrc = selectedClip?.isTrimmed && selectedClip?.trimmedPath
      ? `file://${selectedClip.trimmedPath}`
      : videoSrc;

    if (!effectiveSrc) {
      // Reset player state when no video
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
      setError(null);
      video.src = '';
      return;
    }
    
    // Update video source
    setIsLoading(true);
    setError(null);
    video.src = effectiveSrc;
    video.load();
    logger.debug('Loading video', { src: effectiveSrc });

    // Setup event listeners
    const handleError = (e) => {
      logger.error('Video playback error', e.error || e, { 
        videoPath: effectiveSrc,
        currentSrc: video.currentSrc 
      });
      setError('Failed to play video. The file may be corrupted or unsupported.');
      setIsLoading(false);
    };

    const handleLoadStart = () => {
      logger.debug('Video loading started', { videoPath: effectiveSrc });
      setIsLoading(true);
    };

    const handleLoadedMetadata = () => {
      logger.debug('Video metadata loaded', { 
        videoPath: effectiveSrc,
        duration: video.duration 
      });
      setIsLoading(false);
      setError(null);
    };

    video.addEventListener('error', handleError);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    // Cleanup function
    return () => {
      logger.debug('Cleaning up video player', { videoPath: effectiveSrc });
      
      // Remove event listeners
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      
      // Pause and clear source
      video.pause();
      video.src = '';
      video.load(); // Force unload to release memory
      
      // Clear state
      setIsLoading(false);
      setError(null);
    };
  }, [videoSrc, selectedClip?.trimmedPath]);

  // Note: Event handlers are now in useEffect with proper cleanup
  // Keep inline handlers for video element compatibility

  const handlePlayPause = () => {
    const video = videoRef.current;
    
    if (!video || !videoSrc) {
      logger.warn('Play/pause attempted but no video loaded');
      setError('No video loaded');
      return;
    }
    
    if (isPlaying) {
      video.pause();
      logger.debug('Video paused');
    } else {
      video.play().catch((err) => {
        logger.error('Play error', err, { force: true });
        setError('Failed to play video');
      });
      logger.debug('Video playing');
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
        onTimeUpdate={() => {
          const video = videoRef.current;
          if (video) {
            const current = video.currentTime;
            setCurrentTime(current);
            onTimeUpdate?.({
              currentTime: current,
              duration: duration
            });
          }
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(duration);
        }}
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

