// pipUtils.js - Picture-in-Picture position and dimension calculation utilities
// PR#32: Picture-in-Picture Recording

/**
 * Calculate PIP position coordinates based on corner and size
 * @param {string} position - Corner position ('top-left', 'top-right', 'bottom-left', 'bottom-right')
 * @param {number} canvasWidth - Full canvas width
 * @param {number} canvasHeight - Full canvas height
 * @param {number} pipWidth - PIP overlay width
 * @param {number} pipHeight - PIP overlay height
 * @returns {{x: number, y: number}} PIP position coordinates
 */
export function calculatePIPPosition(position, canvasWidth, canvasHeight, pipWidth, pipHeight) {
  const padding = 20; // 20px padding from edges
  
  switch (position) {
    case 'top-left':
      return { x: padding, y: padding };
      
    case 'top-right':
      return { 
        x: canvasWidth - pipWidth - padding, 
        y: padding 
      };
      
    case 'bottom-left':
      return { 
        x: padding, 
        y: canvasHeight - pipHeight - padding 
      };
      
    case 'bottom-right':
      return { 
        x: canvasWidth - pipWidth - padding, 
        y: canvasHeight - pipHeight - padding 
      };
      
    default:
      // Default to top-left if invalid position
      return { x: padding, y: padding };
  }
}

/**
 * Calculate PIP dimensions from size percentage
 * @param {number} sizePercent - Size as percentage of screen width (15-50)
 * @param {number} screenWidth - Screen width
 * @param {number} webcamAspectRatio - Webcam height/width ratio (e.g., 0.5625 for 16:9)
 * @returns {{width: number, height: number}} PIP dimensions
 */
export function calculatePIPDimensions(sizePercent, screenWidth, webcamAspectRatio) {
  // Clamp size percentage between 10% and 50%
  const clampedSize = Math.max(10, Math.min(50, sizePercent));
  
  const pipWidth = Math.floor((screenWidth * clampedSize) / 100);
  const pipHeight = Math.floor(pipWidth * webcamAspectRatio);
  
  return { width: pipWidth, height: pipHeight };
}

/**
 * Get PIP size preset values
 * @returns {object} Object with size presets
 */
export function getPIPSizePresets() {
  return {
    small: 15,
    medium: 25,
    large: 35
  };
}

/**
 * Validate PIP settings
 * @param {object} settings - PIP settings object
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validatePIPSettings(settings) {
  const validPositions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
  const validAudioSources = ['screen', 'webcam', 'both', 'none'];
  
  if (!settings.position || !validPositions.includes(settings.position)) {
    return { valid: false, error: 'Invalid PIP position' };
  }
  
  if (typeof settings.size !== 'number' || settings.size < 10 || settings.size > 50) {
    return { valid: false, error: 'PIP size must be between 10% and 50%' };
  }
  
  if (!settings.audioSource || !validAudioSources.includes(settings.audioSource)) {
    return { valid: false, error: 'Invalid audio source' };
  }
  
  return { valid: true };
}

