/**
 * File validation and utility functions
 */

/**
 * Validate file is supported video format
 * @param {File} file - File object from input
 * @returns {boolean} true if valid video format
 */
export function isValidVideoFile(file) {
  const validExtensions = ['.mp4', '.mov', '.webm'];
  const fileName = file.name || '';
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  return validExtensions.includes(extension);
}

/**
 * Check if file is too large
 * @param {File} file - File object
 * @param {number} maxSizeMB - Maximum size in MB (default 2048)
 * @returns {boolean} true if file is acceptable size
 */
export function isFileSizeValid(file, maxSizeMB = 2048) {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxBytes;
}

/**
 * Validate file and return error message if invalid
 * @param {File} file - File object
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateFile(file) {
  if (!isValidVideoFile(file)) {
    return { 
      valid: false, 
      error: 'Unsupported format. Please use MP4, MOV, or WebM files.' 
    };
  }
  
  if (!isFileSizeValid(file, 2048)) {
    return { 
      valid: false, 
      error: 'File is too large. Maximum size is 2GB.' 
    };
  }
  
  return { valid: true, error: null };
}

/**
 * Generate unique ID for clip
 * @returns {string} Unique identifier
 */
export function generateClipId() {
  return `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

