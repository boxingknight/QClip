import React, { useRef, useState, useEffect } from 'react';
import { usePlayback } from '../context/PlaybackContext';
import { logger } from '../utils/logger';
import '../styles/VideoPlayer.css';

const VideoPlayer = ({ videoSrc, onTimeUpdate, selectedClip }) => {
  const videoRef = useRef(null);
  const { registerVideo, updatePlaybackState, isPlaying: playbackIsPlaying } = usePlayback();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Register video element with playback context
  // Re-register whenever the video source changes to ensure proper connection
  useEffect(() => {
    if (videoRef.current) {
      console.log('[VideoPlayer] Registering video element', { videoSrc, hasElement: !!videoRef.current });
      registerVideo(videoRef.current, selectedClip); // Pass selectedClip for coordinate conversion
    }
  }, [registerVideo, videoSrc, selectedClip]);

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
      updatePlaybackState({ isPlaying: false, currentTime: 0, duration: 0 });
      return;
    }
    
    // Update video source
    setIsLoading(true);
    setError(null);
    video.src = effectiveSrc;
    video.load();
    logger.debug('Loading video', { 
      src: effectiveSrc,
      clipTrimIn: selectedClip?.trimIn,
      clipTrimOut: selectedClip?.trimOut,
      clipDuration: selectedClip?.duration
    });

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
    if (video) {
      setDuration(video.duration);
      setIsLoading(false);
      setError(null);
      logger.debug('Video metadata loaded', { 
        videoPath: effectiveSrc,
        duration: video.duration 
      });
      
      // 🎯 CRITICAL: Seek to trimIn point if clip is trimmed
      // This ensures playback starts from the visible portion on the timeline
      const trimIn = selectedClip?.trimIn || 0;
      if (trimIn > 0) {
        console.log('[VideoPlayer] Seeking to trimIn:', trimIn, 'Video duration:', video.duration);
        video.currentTime = trimIn;
        setCurrentTime(trimIn);
        console.log('[VideoPlayer] After seek - video.currentTime:', video.currentTime);
      } else {
        console.log('[VideoPlayer] No trimIn, setting currentTime to 0');
        setCurrentTime(0);
      }
      
      // Update playback context with duration
      updatePlaybackState({ duration: video.duration });
      
      // 🎯 CRITICAL FIX: Reset timeline playhead to 0 when video loads
      // This prevents scrubber from appearing in empty space
      // The video will play from trimIn, but timeline shows 0 as starting point
      onTimeUpdate?.({
        currentTime: 0, // Always start timeline at 0, regardless of trimIn
        duration: video.duration
      });
    }
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
    
    const trimIn = selectedClip?.trimIn || 0;
    const trimOut = selectedClip?.trimOut || video.duration;
    
    console.log('[VideoPlayer] handlePlayPause:', {
      isPlaying,
      videoCurrentTime: video.currentTime,
      trimIn,
      trimOut,
      videoDuration: video.duration,
      selectedClipName: selectedClip?.name
    });
    
    if (isPlaying) {
      video.pause();
      logger.debug('Video paused');
    } else {
      // 🎯 CRITICAL: If at trimOut, seek back to trimIn before playing
      // This allows replay of the trimmed section
      
      if (video.currentTime >= trimOut - trimIn - 0.1) { // Within 0.1s of end
        console.log('[VideoPlayer] At end, seeking back to trimIn:', trimIn);
        video.currentTime = 0; // Seek to start of trimmed clip (relative time)
        setCurrentTime(0);
      }
      
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
            
            // 🎯 CRITICAL: Convert video time to timeline time
            // Video time is relative to trimIn, timeline time is absolute
            const trimIn = selectedClip?.trimIn || 0;
            const timelineTime = trimIn + current;
            
            console.log('[VideoPlayer] onTimeUpdate:', {
              videoCurrentTime: current,
              trimIn,
              timelineTime,
              selectedClipName: selectedClip?.name
            });
            
            // 🎯 CRITICAL: Stop playback at trimOut point
            // This ensures only the visible timeline portion plays
            const trimOut = selectedClip?.trimOut || video.duration;
            if (current >= trimOut - trimIn) {
              console.log('[VideoPlayer] Reached trimOut, pausing:', { 
                videoTime: current, 
                trimOut, 
                trimIn,
                timelineTime 
              });
              video.pause();
              video.currentTime = trimOut - trimIn; // Snap to exact end point
              setIsPlaying(false);
              updatePlaybackState({ isPlaying: false, currentTime: timelineTime });
              onTimeUpdate?.({
                currentTime: timelineTime, // Send timeline time, not video time
                duration: duration
              });
              return;
            }
            
            setCurrentTime(current);
            updatePlaybackState({ currentTime: timelineTime }); // Send timeline time
            onTimeUpdate?.({
              currentTime: timelineTime, // Send timeline time, not video time
              duration: duration
            });
          }
        }}
        onPlay={() => {
          setIsPlaying(true);
          updatePlaybackState({ isPlaying: true });
        }}
        onPause={() => {
          setIsPlaying(false);
          updatePlaybackState({ isPlaying: false });
        }}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(duration);
          updatePlaybackState({ isPlaying: false, currentTime: duration });
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
        <span>{formatTime((selectedClip?.trimOut || duration) - (selectedClip?.trimIn || 0))}</span>
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

