// src/utils/videoMetadata.js
import { logger } from './logger';

/**
 * Get video duration using HTML5 video element as fallback
 * This is used when FFprobe fails to read duration (common with WebM files)
 */
const getDurationFromVideoElement = (filePath) => {
  return new Promise((resolve) => {
    console.log('[VIDEO_ELEMENT_FALLBACK] Starting duration extraction', { filePath });
    
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true; // Mute to allow autoplay policies
    video.playsInline = true;
    
    // Convert file path to file:// URL for Electron
    // Electron requires file:/// (three slashes) for absolute paths
    let videoSrc;
    if (filePath.startsWith('file://')) {
      videoSrc = filePath;
    } else {
      // Ensure we have the proper file:/// format with three slashes
      // On macOS/Linux: /Users/... becomes file:///Users/...
      // On Windows: C:\... becomes file:///C:/...
      const normalizedPath = filePath.replace(/\\/g, '/'); // Normalize Windows paths
      videoSrc = `file://${normalizedPath}`;
    }
    
    console.log('[VIDEO_ELEMENT_FALLBACK] Setting video source', { filePath, videoSrc });
    video.src = videoSrc;
    
    logger.debug('Video element fallback: loading metadata', { filePath, videoSrc });
    
    let resolved = false;
    const cleanup = () => {
      if (!resolved) {
        resolved = true;
        video.remove();
        if (timeout) clearTimeout(timeout);
      }
    };
    
    const timeout = setTimeout(() => {
      console.warn('[VIDEO_ELEMENT_FALLBACK] ⏱️ Timeout after 10 seconds', { filePath });
      cleanup();
      logger.warn('Video element timeout reading duration', { filePath });
      resolve(0);
    }, 10000); // Increased to 10 seconds for slow WebM files
    
    // 🎯 CRITICAL FIX: Handle durationchange event - WebM files may report Infinity initially
    // This event fires when the duration becomes available (after parsing)
    const handleDurationChange = () => {
      if (resolved) return; // Already resolved
      
      const duration = video.duration || 0;
      
      console.log('[VIDEO_ELEMENT_FALLBACK] durationchange event', {
        filePath,
        rawDuration: video.duration,
        duration,
        isFinite: isFinite(duration),
        isValid: duration > 0 && !isNaN(duration) && isFinite(duration),
        resolved
      });
      
      // If we have a valid duration now, resolve
      if (duration > 0 && !isNaN(duration) && isFinite(duration)) {
        console.log('[VIDEO_ELEMENT_FALLBACK] ✅ SUCCESS: Got valid duration from durationchange', { filePath, duration });
        cleanup();
        logger.info('Got duration from video element (durationchange)', { filePath, duration });
        resolve(duration);
      }
    };
    
    video.addEventListener('loadedmetadata', () => {
      let duration = video.duration || 0;
      
      console.log('[VIDEO_ELEMENT_FALLBACK] loadedmetadata event fired', {
        filePath,
        rawDuration: video.duration,
        duration,
        isFinite: isFinite(duration),
        isNaN: isNaN(duration),
        isValid: duration > 0 && !isNaN(duration) && isFinite(duration)
      });
      
      // Check if duration is valid
      if (duration > 0 && !isNaN(duration) && isFinite(duration)) {
        console.log('[VIDEO_ELEMENT_FALLBACK] ✅ SUCCESS: Got valid duration from loadedmetadata', { filePath, duration });
        cleanup();
        logger.info('Got duration from video element', { filePath, duration });
        resolve(duration);
        return;
      }
      
      // 🎯 CRITICAL: If duration is Infinity, try multiple methods to get actual duration
      // This is a known WebM issue - duration isn't available until file is fully parsed
      if (!isFinite(duration) || duration === Infinity) {
        console.log('[VIDEO_ELEMENT_FALLBACK] ⚠️ Duration is Infinity, attempting multiple methods to get duration', { filePath });
        
        // Method 1: Try seeking to end to force duration calculation
        try {
          video.currentTime = 1e10; // Seek to very large time
        } catch (e) {
          console.warn('[VIDEO_ELEMENT_FALLBACK] Seek failed:', e);
        }
        
        // Method 2: Wait for seek to complete and check duration
        const checkAfterSeek = () => {
          duration = video.duration || 0;
          
          console.log('[VIDEO_ELEMENT_FALLBACK] After seek attempt', {
            filePath,
            rawDuration: video.duration,
            duration,
            isFinite: isFinite(duration),
            currentTime: video.currentTime,
            networkState: video.networkState,
            readyState: video.readyState
          });
          
          if (duration > 0 && !isNaN(duration) && isFinite(duration)) {
            console.log('[VIDEO_ELEMENT_FALLBACK] ✅ SUCCESS: Got duration after seek', { filePath, duration });
            cleanup();
            logger.info('Got duration from video element (after seek)', { filePath, duration });
            resolve(duration);
            return true;
          }
          return false;
        };
        
        // Check immediately and after delays
        if (!checkAfterSeek()) {
          setTimeout(() => {
            if (!checkAfterSeek()) {
              // Still Infinity - wait for durationchange event (already set up)
              console.log('[VIDEO_ELEMENT_FALLBACK] Still Infinity, waiting for durationchange event', { filePath });
              // Don't cleanup yet - durationchange handler will resolve
            }
          }, 100);
          
          // Also try after longer delay - WebM parsing can be slow
          setTimeout(() => {
            if (!resolved && !checkAfterSeek()) {
              console.warn('[VIDEO_ELEMENT_FALLBACK] Still Infinity after delays, waiting for durationchange', { filePath });
            }
          }, 500);
        }
        
        return; // Don't cleanup yet, wait for durationchange or timeout
      }
      
      // If we got here with invalid duration (0, NaN, etc), give up
      console.error('[VIDEO_ELEMENT_FALLBACK] ❌ FAILED: Invalid duration from loadedmetadata', { 
        filePath, 
        duration,
        rawDuration: video.duration
      });
      cleanup();
      logger.warn('Invalid duration from video element', { filePath, duration });
      resolve(0);
    });
    
    // Listen for durationchange - this fires when duration becomes available
    video.addEventListener('durationchange', handleDurationChange);
    
    video.addEventListener('error', (e) => {
      cleanup();
      
      const errorDetails = {
        code: video.error?.code,
        message: video.error?.message,
        networkState: video.networkState,
        readyState: video.readyState,
        src: video.src,
        currentSrc: video.currentSrc
      };
      
      console.error('[VIDEO_ELEMENT_FALLBACK] ❌ ERROR event fired', {
        filePath,
        error: e,
        videoError: errorDetails
      });
      
      logger.warn('Video element error reading duration', { filePath, error: e, errorDetails });
      resolve(0);
    });
    
    // Also listen for loadstart to confirm loading began
    video.addEventListener('loadstart', () => {
      console.log('[VIDEO_ELEMENT_FALLBACK] loadstart event fired', { filePath, src: video.src });
    });
    
    // Listen for stalled/abort events
    video.addEventListener('stalled', () => {
      console.warn('[VIDEO_ELEMENT_FALLBACK] stalled event', { filePath });
    });
    
    video.addEventListener('abort', () => {
      console.warn('[VIDEO_ELEMENT_FALLBACK] abort event', { filePath });
    });
    
    // Start loading metadata
    video.load();
  });
};

/**
 * Extract video metadata using FFprobe
 * Provides robust error handling and fallback values
 * Falls back to HTML5 video element if FFprobe returns duration: 0
 */
export const extractVideoMetadata = async (filePath) => {
  if (!window.electronAPI) {
    logger.warn('Electron API not available for metadata extraction');
    return getDefaultMetadata(filePath);
  }

  try {
    logger.info('Extracting video metadata', { filePath });
    
    const metadata = await window.electronAPI.getVideoMetadata(filePath);
    
    if (!metadata) {
      logger.warn('No metadata returned from FFprobe');
      return getDefaultMetadata(filePath);
    }

    let duration = metadata.duration || 0;
    
    // 🎯 CRITICAL FIX: If FFprobe returned duration: 0 or invalid, try HTML5 video element as fallback
    // This fixes WebM files where FFprobe fails to read duration correctly
    // Also check for suspicious values (very small like 0.001 or very large)
    const isValidDuration = duration > 0 && isFinite(duration) && !isNaN(duration);
    
    console.log('[METADATA] Checking duration validity:', {
      filePath,
      ffprobeDuration: duration,
      isValidDuration,
      willTriggerFallback: !isValidDuration || duration === 0
    });
    
    if (!isValidDuration || duration === 0) {
      console.warn('[METADATA] ⚠️ FFprobe returned invalid duration, trying HTML5 video element fallback', { 
        filePath, 
        ffprobeDuration: duration,
        isValid: isValidDuration
      });
      logger.warn('FFprobe returned invalid duration, trying HTML5 video element fallback', { 
        filePath, 
        ffprobeDuration: duration,
        isValid: isValidDuration
      });
      
      try {
        const videoDuration = await getDurationFromVideoElement(filePath);
        console.log('[METADATA] Video element fallback result:', {
          filePath,
          videoDuration,
          isFinite: isFinite(videoDuration),
          isValid: videoDuration > 0 && isFinite(videoDuration)
        });
        
        if (videoDuration > 0 && isFinite(videoDuration)) {
          duration = videoDuration;
          console.log('[METADATA] ✅ SUCCESS: Using duration from video element fallback', { filePath, duration });
          logger.info('✅ Using duration from video element fallback', { filePath, duration });
        } else {
          console.error('[METADATA] ❌ FAILED: Video element fallback returned invalid duration', { 
            filePath,
            ffprobeDuration: duration,
            videoElementDuration: videoDuration
          });
          logger.warn('❌ Both FFprobe and video element failed to get duration', { 
            filePath,
            ffprobeDuration: duration,
            videoElementDuration: videoDuration
          });
        }
      } catch (fallbackError) {
        console.error('[METADATA] ❌ ERROR in video element fallback:', fallbackError);
        logger.error('Video element fallback threw error', fallbackError, { filePath });
      }
    } else {
      console.log('[METADATA] ✅ FFprobe duration is valid, using it', { filePath, duration });
      logger.debug('FFprobe duration is valid, using it', { filePath, duration });
    }

    const processedMetadata = {
      duration: duration,
      width: metadata.width || 0,
      height: metadata.height || 0,
      fps: metadata.fps || 30,
      codec: metadata.codec || 'unknown',
      hasAudio: metadata.hasAudio || false,
      fileSize: metadata.fileSize || 0,
      thumbnailUrl: metadata.thumbnailUrl || null
    };

    logger.info('Metadata extracted successfully', processedMetadata);
    return processedMetadata;

  } catch (error) {
    logger.error('Failed to extract video metadata', error, { filePath });
    
    // 🎯 CRITICAL FIX: Even if FFprobe fails completely, try video element
    logger.info('Trying video element fallback after FFprobe error', { filePath });
    const videoDuration = await getDurationFromVideoElement(filePath);
    
    if (videoDuration > 0) {
      logger.info('Got duration from video element after FFprobe error', { filePath, duration: videoDuration });
      return {
        duration: videoDuration,
        width: 0,
        height: 0,
        fps: 30,
        codec: 'unknown',
        hasAudio: true,
        fileSize: 0,
        thumbnailUrl: null,
        error: 'FFprobe failed, used video element fallback'
      };
    }
    
    return getDefaultMetadata(filePath);
  }
};

/**
 * Get default metadata when extraction fails
 * Provides sensible fallbacks to prevent UI errors
 */
const getDefaultMetadata = (filePath) => {
  const fileName = filePath.split('/').pop() || 'Unknown';
  
  return {
    duration: 0, // Will be updated when video loads
    width: 1920, // Default HD resolution
    height: 1080,
    fps: 30,
    codec: 'unknown',
    hasAudio: true, // Assume audio until proven otherwise
    fileSize: 0, // Will be updated if available
    thumbnailUrl: null,
    error: 'Metadata extraction failed'
  };
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  if (!bytes || isNaN(bytes)) return 'Unknown';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format duration for display
 */
export const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format resolution for display
 */
export const formatResolution = (width, height) => {
  if (!width || !height || width === 0 || height === 0) {
    return 'Unknown';
  }
  return `${width}×${height}`;
};
