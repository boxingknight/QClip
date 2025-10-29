import React, { useRef, useState, useEffect } from 'react';
import { usePlayback } from '../context/PlaybackContext';
import { logger } from '../utils/logger';
import '../styles/VideoPlayer.css';

const VideoPlayer = ({ videoSrc, onTimeUpdate, selectedClip, allClips = [], onClipEnd, playhead, trimData }) => {
  const videoRef = useRef(null);
  const { registerVideo, updatePlaybackState, isPlaying: playbackIsPlaying } = usePlayback();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Register video element with playback context
  // Re-register whenever the video source or trim data changes to ensure proper connection
  useEffect(() => {
    if (videoRef.current && selectedClip) {
      // Merge current trim data into clip for PlaybackContext
      // Validate video duration before using it
      let videoDuration = videoRef.current.duration || 0;
      if (!isFinite(videoDuration) || isNaN(videoDuration) || videoDuration <= 0) {
        videoDuration = selectedClip.originalDuration || selectedClip.duration || 0;
      }
      
      const clipWithTrim = {
        ...selectedClip,
        trimIn: trimData?.inPoint ?? selectedClip.trimIn ?? 0,
        trimOut: trimData?.outPoint ?? selectedClip.trimOut ?? videoDuration
      };
      console.log('[VideoPlayer] Registering video element with current trim', { 
        videoSrc, 
        trimIn: clipWithTrim.trimIn,
        trimOut: clipWithTrim.trimOut
      });
      registerVideo(videoRef.current, clipWithTrim); // Pass clip with current trim data
    }
  }, [registerVideo, videoSrc, selectedClip?.id, trimData]);

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
      // 🎯 CRITICAL: Validate video duration - check for Infinity/NaN
      let videoFullDuration = video.duration || 0;
      if (!isFinite(videoFullDuration) || isNaN(videoFullDuration) || videoFullDuration <= 0) {
        // Invalid duration - use clip's original duration or fallback
        videoFullDuration = selectedClip.originalDuration || selectedClip.duration || 0;
        console.warn('[VideoPlayer] Invalid video duration, using clip duration:', {
          videoDuration: video.duration,
          fallbackDuration: videoFullDuration
        });
      }
      
      // 🎯 CRITICAL FIX: If clip duration is wrong (0 or invalid), update it from video element
      // This fixes WebM files where FFprobe returns duration: 0 but video element has correct duration
      // BUT: Only update if video duration is valid and finite
      if (videoFullDuration > 0 && isFinite(videoFullDuration) && (!selectedClip.duration || selectedClip.duration === 0 || Math.abs(selectedClip.duration - videoFullDuration) > 1)) {
        console.log('[VideoPlayer] Updating clip duration from video element:', {
          clipId: selectedClip.id,
          oldDuration: selectedClip.duration,
          newDuration: videoFullDuration
        });
        // Notify parent to update clip duration
        onTimeUpdate?.({
          currentTime: selectedClip.startTime || 0,
          duration: videoFullDuration,
          updateClipDuration: true // Flag to indicate this is a duration update
        });
      }
      
      // Get trim data from prop (current trim) or clip (default)
      // If trimOut is 0 or invalid, use video duration as fallback
      const trimIn = trimData?.inPoint ?? selectedClip.trimIn ?? 0;
      let trimOut = trimData?.outPoint ?? selectedClip.trimOut;
      
      // 🎯 CRITICAL: If trimOut is 0 or invalid, use video duration
      // This fixes cases where FFprobe returned 0 duration and trimOut was set to 0
      // BUT: Only use video duration if it's valid and finite
      if (!trimOut || trimOut === 0) {
        if (videoFullDuration > 0 && isFinite(videoFullDuration)) {
          trimOut = videoFullDuration;
        } else {
          // Invalid video duration - use clip's original duration
          trimOut = selectedClip.originalDuration || selectedClip.duration || 0;
        }
      } else if (isFinite(videoFullDuration) && trimOut > videoFullDuration) {
        trimOut = videoFullDuration;
      }
      
      // Calculate trimmed duration (visible portion)
      const trimmedDuration = Math.max(0, trimOut - trimIn);
      
      // Set duration to trimmed duration, not full video duration
      setDuration(trimmedDuration);
      setIsLoading(false);
      setError(null);
      logger.debug('Video metadata loaded', { 
        videoPath: effectiveSrc,
        fullDuration: videoFullDuration,
        clipDuration: selectedClip.duration,
        trimIn,
        trimOut,
        trimmedDuration
      });
      
      // 🎯 CRITICAL FIX: Calculate video time from absolute timeline playhead position
      // Timeline playhead is absolute (e.g., 5.0 seconds from timeline start)
      // Video time = (playhead - clip.startTime) + trimIn
      // This ensures we seek to the correct position even after splits
      const clipStartTime = selectedClip.startTime || 0;
      const relativeTimeInClip = playhead !== undefined ? Math.max(0, playhead - clipStartTime) : 0;
      
      // Calculate video time, clamped to trim bounds
      const videoTime = trimIn + relativeTimeInClip;
      const clampedVideoTime = Math.max(trimIn, Math.min(videoTime, trimOut));
      
      console.log('[VideoPlayer] Seeking to video position:', {
        playhead,
        clipStartTime,
        relativeTimeInClip,
        trimIn,
        trimOut,
        videoTime,
        clampedVideoTime,
        videoFullDuration: video.duration,
        trimmedDuration
      });
      
      video.currentTime = clampedVideoTime;
      setCurrentTime(clampedVideoTime - trimIn); // Display relative to trim start
      
      // Update playback context with TRIMMED duration
      updatePlaybackState({ duration: trimmedDuration });
      
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
      // Validate duration first
      let videoDuration = video.duration || 0;
      if (!isFinite(videoDuration) || isNaN(videoDuration) || videoDuration <= 0) {
        videoDuration = 0;
      }
      setDuration(videoDuration);
      setIsLoading(false);
      setError(null);
      video.currentTime = 0;
      setCurrentTime(0);
      updatePlaybackState({ duration: videoDuration });
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

  // 🎯 CRITICAL: Respond to playhead changes and seek video (respecting trim bounds)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !selectedClip || playhead === undefined) return;
    
    // Validate video duration first
    let videoDuration = video.duration || 0;
    if (!isFinite(videoDuration) || isNaN(videoDuration) || videoDuration <= 0) {
      videoDuration = selectedClip.originalDuration || selectedClip.duration || 0;
    }
    
    // Get trim data from prop (current trim) or clip (default)
    const trimIn = trimData?.inPoint ?? selectedClip.trimIn ?? 0;
    const trimOut = trimData?.outPoint ?? selectedClip.trimOut ?? videoDuration;
    const clipStartTime = selectedClip.startTime || 0;
    
    // Calculate relative time within clip
    const relativeTimeInClip = Math.max(0, playhead - clipStartTime);
    
    // Calculate video time, clamped to trim bounds
    const videoTime = trimIn + relativeTimeInClip;
    const clampedVideoTime = Math.max(trimIn, Math.min(videoTime, trimOut));
    
    // Only seek if we're not already at the correct position (avoid infinite loops)
    if (Math.abs(video.currentTime - clampedVideoTime) > 0.1) {
      console.log('[VideoPlayer] Playhead changed, seeking to:', {
        playhead,
        clipStartTime,
        relativeTimeInClip,
        trimIn,
        trimOut,
        clampedVideoTime
      });
      
      video.currentTime = clampedVideoTime;
      setCurrentTime(clampedVideoTime - trimIn); // Display relative to trim start
    }
  }, [playhead, selectedClip, trimData]);

  // Note: Event handlers are now in useEffect with proper cleanup
  // Keep inline handlers for video element compatibility

  const handlePlayPause = () => {
    const video = videoRef.current;
    
    if (!video || !videoSrc) {
      logger.warn('Play/pause attempted but no video loaded');
      setError('No video loaded');
      return;
    }
    
    // Get trim data from prop (current trim) or clip (default)
    // Validate video duration first
    let videoDuration = video.duration || 0;
    if (!isFinite(videoDuration) || isNaN(videoDuration) || videoDuration <= 0) {
      videoDuration = selectedClip?.originalDuration || selectedClip?.duration || 0;
    }
    
    const trimIn = trimData?.inPoint ?? selectedClip?.trimIn ?? 0;
    const trimOut = trimData?.outPoint ?? selectedClip?.trimOut ?? videoDuration;
    const trimmedDuration = trimOut - trimIn;
    
    console.log('[VideoPlayer] handlePlayPause:', {
      isPlaying,
      videoCurrentTime: video.currentTime,
      trimIn,
      trimOut,
      trimmedDuration,
      videoFullDuration: video.duration,
      selectedClipName: selectedClip?.name
    });
    
    if (isPlaying) {
      video.pause();
      logger.debug('Video paused');
    } else {
      // 🎯 CRITICAL: Ensure we're within trim bounds before playing
      // If at or past trimOut, seek back to trimIn
      if (video.currentTime >= trimOut || video.currentTime < trimIn) {
        console.log('[VideoPlayer] Out of bounds, seeking to trimIn:', trimIn);
        video.currentTime = trimIn;
        setCurrentTime(0); // Relative to trim start
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
            
            // Get trim data from prop (current trim) or clip (default)
            // Validate video duration first
            let videoDuration = video.duration || 0;
            if (!isFinite(videoDuration) || isNaN(videoDuration) || videoDuration <= 0) {
              videoDuration = selectedClip.originalDuration || selectedClip.duration || 0;
            }
            
            const trimIn = trimData?.inPoint ?? selectedClip.trimIn ?? 0;
            const trimOut = trimData?.outPoint ?? selectedClip.trimOut ?? videoDuration;
            
            // 🎯 CRITICAL: Stop playback if we've reached or passed trimOut
            if (current >= trimOut) {
              video.pause();
              video.currentTime = trimOut; // Clamp to trim end
              setIsPlaying(false);
              updatePlaybackState({ isPlaying: false });
              logger.debug('Stopped at trimOut', { trimOut, current });
              
              // Trigger clip end if we're at the trim boundary
              const clipEndTime = selectedClip.startTime + (trimOut - trimIn);
              onTimeUpdate?.({
                currentTime: clipEndTime,
                duration: trimOut - trimIn
              });
              updatePlaybackState({ currentTime: clipEndTime });
              setCurrentTime(trimOut - trimIn); // Relative to trim start
              return;
            }
            
            // 🎯 CRITICAL: Clamp video time to trim bounds during playback
            // Prevent video from playing outside trimmed region
            if (current < trimIn) {
              video.currentTime = trimIn;
              logger.debug('Clamped to trimIn', { trimIn, current });
            } else if (current > trimOut) {
              video.currentTime = trimOut;
              logger.debug('Clamped to trimOut', { trimOut, current });
            }
            
            // 🎯 CRITICAL: Convert video time to absolute timeline time
            // Video currentTime is in full video space (0 to full duration)
            // Timeline time = clipStartTime + (currentVideoTime - trimIn)
            const clipStartTime = selectedClip.startTime || 0;
            const timelineTime = clipStartTime + (current - trimIn);
            
            // Display time relative to trim start (0 to trimmed duration)
            const relativeTime = current - trimIn;
            
            console.log('[VideoPlayer] onTimeUpdate:', {
              videoCurrentTime: current,
              trimIn,
              trimOut,
              relativeTime,
              clipStartTime,
              timelineTime,
              selectedClipName: selectedClip?.name
            });
            
            setCurrentTime(relativeTime); // Display relative to trim start
            updatePlaybackState({ currentTime: timelineTime });
            onTimeUpdate?.({
              currentTime: timelineTime, // Send absolute timeline time
              duration: trimOut - trimIn // Trimmed duration
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
          const video = videoRef.current;
          console.log('🎬 [VideoPlayer] Clip ended:', selectedClip?.name);
          
          // Validate video duration first
          let videoDuration = video?.duration || 0;
          if (!isFinite(videoDuration) || isNaN(videoDuration) || videoDuration <= 0) {
            videoDuration = selectedClip?.originalDuration || selectedClip?.duration || duration || 0;
          }
          
          // Get trim data to calculate correct end time
          const trimIn = trimData?.inPoint ?? selectedClip?.trimIn ?? 0;
          const trimOut = trimData?.outPoint ?? selectedClip?.trimOut ?? videoDuration;
          const trimmedDuration = trimOut - trimIn;
          
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
          
          // No next clip - stop playback at trimmed end
          console.log('🎬 [VideoPlayer] No next clip - stopping playback at trimmed end');
          setIsPlaying(false);
          const clipEndTime = selectedClip ? (selectedClip.startTime + trimmedDuration) : trimmedDuration;
          setCurrentTime(trimmedDuration); // Relative to trim start
          updatePlaybackState({ isPlaying: false, currentTime: clipEndTime });
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

