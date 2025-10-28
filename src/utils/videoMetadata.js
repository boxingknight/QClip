// src/utils/videoMetadata.js
import { logger } from './logger';

/**
 * Extract video metadata using FFprobe
 * Provides robust error handling and fallback values
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

    const processedMetadata = {
      duration: metadata.duration || 0,
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
