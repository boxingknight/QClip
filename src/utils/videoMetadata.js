// src/utils/videoMetadata.js
import { logger } from './logger';

/**
 * Get video duration using HTML5 video element as fallback
 * This is used when FFprobe fails to read duration (common with WebM files)
 */
const getDurationFromVideoElement = (filePath) => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
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
    video.src = videoSrc;
    
    logger.debug('Video element fallback: loading metadata', { filePath, videoSrc });
    
    const timeout = setTimeout(() => {
      video.remove();
      logger.warn('Video element timeout reading duration', { filePath });
      resolve(0);
    }, 5000); // 5 second timeout
    
    video.addEventListener('loadedmetadata', () => {
      clearTimeout(timeout);
      const duration = video.duration || 0;
      video.remove();
      
      if (duration > 0 && !isNaN(duration) && isFinite(duration)) {
        logger.info('Got duration from video element', { filePath, duration });
        resolve(duration);
      } else {
        logger.warn('Invalid duration from video element', { filePath, duration });
        resolve(0);
      }
    });
    
    video.addEventListener('error', (e) => {
      clearTimeout(timeout);
      video.remove();
      logger.warn('Video element error reading duration', { filePath, error: e });
      resolve(0);
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
    if (!isValidDuration || duration === 0) {
      logger.warn('FFprobe returned invalid duration, trying HTML5 video element fallback', { 
        filePath, 
        ffprobeDuration: duration,
        isValid: isValidDuration
      });
      const videoDuration = await getDurationFromVideoElement(filePath);
      
      if (videoDuration > 0 && isFinite(videoDuration)) {
        duration = videoDuration;
        logger.info('✅ Using duration from video element fallback', { filePath, duration });
      } else {
        logger.warn('❌ Both FFprobe and video element failed to get duration', { 
          filePath,
          ffprobeDuration: duration,
          videoElementDuration: videoDuration
        });
      }
    } else {
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
