import React, { useRef, useState, useEffect } from 'react';
import { usePlayback } from '../context/PlaybackContext';
import { logger } from '../utils/logger';
import '../styles/VideoPlayer.css';

const VideoPlayer = ({ videoSrc, onTimeUpdate, selectedClip, allClips = [], onClipEnd, playhead }) => {
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
    if (video && selectedClip) {
      setDuration(video.duration);
      setIsLoading(false);
      setError(null);
      logger.debug('Video metadata loaded', { 
        videoPath: effectiveSrc,
        duration: video.duration 
      });
      
      // 🎯 CRITICAL FIX: Calculate video time from absolute timeline playhead position
      // Timeline playhead is absolute (e.g., 5.0 seconds from timeline start)
      // Video time = (playhead - clip.startTime) + trimIn
      // This ensures we seek to the correct position even after splits
      const clipStartTime = selectedClip.startTime || 0;
      const trimIn = selectedClip.trimIn || 0;
      const relativeTimeInClip = playhead !== undefined ? Math.max(0, playhead - clipStartTime) : 0;
      const videoTime = trimIn + relativeTimeInClip;
      
      // Clamp to video duration
      const clampedVideoTime = Math.min(videoTime, video.duration);
      
      console.log('[VideoPlayer] Seeking to video position:', {
        playhead,
        clipStartTime,
        relativeTimeInClip,
        trimIn,
        videoTime,
        clampedVideoTime,
        videoDuration: video.duration
      });
      
      video.currentTime = clampedVideoTime;
      setCurrentTime(clampedVideoTime);
      
      // Update playback context with duration
      updatePlaybackState({ duration: video.duration });
      
      // Don't send time update on load - this causes feedback loop
      // The video will naturally send time updates as it plays
      // onTimeUpdate?.({
      //   currentTime: playhead !== undefined ? playhead : clipStartTime,
      //   duration: video.duration
      // });
      
      // 🎯 CRITICAL: Auto-play if playback was active (for continuous playback)
      if (playbackIsPlaying) {
        console.log('[VideoPlayer] Auto-playing next clip (playback was active)');
        video.play().catch((err) => {
          logger.error('Auto-play error', err, { force: true });
          setError('Failed to auto-play next clip');
        });
      }
    } else if (video) {
      // No clip selected - just load metadata
      setDuration(video.duration);
      setIsLoading(false);
      setError(null);
      video.currentTime = 0;
      setCurrentTime(0);
      updatePlaybackState({ duration: video.duration });
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
  }, [videoSrc, selectedClip?.trimmedPath, selectedClip?.id]);

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
          if (video && selectedClip) {
            const current = video.currentTime;
            
            // 🎯 CRITICAL: Convert video time to absolute timeline time
            // We seeked to: videoTime = trimIn + (playhead - clipStartTime)
            // So: current = trimIn + (playhead - clipStartTime)
            // Therefore: timelineTime = clipStartTime + (current - trimIn)
            const clipStartTime = selectedClip.startTime || 0;
            const trimIn = selectedClip.trimIn || 0;
            const timelineTime = clipStartTime + (current - trimIn);
            
            console.log('[VideoPlayer] onTimeUpdate:', {
              videoCurrentTime: current,
              clipStartTime,
              trimIn,
              timelineTime,
              selectedClipName: selectedClip?.name
            });
            
            // ✅ For continuous playback: Timeline manager will handle clip switching
            // No need to stop at trimOut - just send timeline time
            
            setCurrentTime(current);
            updatePlaybackState({ currentTime: timelineTime });
            onTimeUpdate?.({
              currentTime: timelineTime, // Send absolute timeline time
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
          console.log('🎬 [VideoPlayer] Clip ended:', selectedClip?.name);
          
          // 🎯 CRITICAL: Check if there's a next clip to continue playback
          if (selectedClip && allClips.length > 0 && onClipEnd) {
            // Find all clips on the same track, sorted by start time
            const trackClips = allClips
              .filter(clip => clip.trackId === selectedClip.trackId)
              .sort((a, b) => a.startTime - b.startTime);
            
            // Find the current clip's index
            const currentIndex = trackClips.findIndex(clip => clip.id === selectedClip.id);
            
            // Check if there's a next clip
            if (currentIndex !== -1 && currentIndex < trackClips.length - 1) {
              const nextClip = trackClips[currentIndex + 1];
              console.log('🎬 [VideoPlayer] Continuing to next clip:', nextClip.name, 'at', nextClip.startTime);
              
              // Notify parent to advance playhead to next clip's start time
              // This will trigger the timeline playback manager to switch clips
              // The timeline manager will detect playhead moved and switch to next clip
              onClipEnd(nextClip.startTime);
              return; // Don't stop playing - continuous playback will continue!
            }
          }
          
          // No next clip - stop playback
          console.log('🎬 [VideoPlayer] No next clip - stopping playback');
          setIsPlaying(false);
          const finalTime = selectedClip ? (selectedClip.startTime + selectedClip.duration) : duration;
          setCurrentTime(finalTime);
          updatePlaybackState({ isPlaying: false, currentTime: finalTime });
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

