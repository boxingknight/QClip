/**
 * Utility for validating trim points
 */

/**
 * Validate trim points are within video bounds
 * @param {number} inPoint - Start time in seconds
 * @param {number} outPoint - End time in seconds
 * @param {number} duration - Video duration in seconds
 * @returns {Object} {valid, error}
 */
export function validateTrimPoints(inPoint, outPoint, duration) {
  // Check in point is non-negative
  if (inPoint < 0) {
    return { 
      valid: false, 
      error: 'In point cannot be negative' 
    };
  }
  
  // Check out point doesn't exceed duration
  if (outPoint > duration) {
    return { 
      valid: false, 
      error: 'Out point exceeds video duration' 
    };
  }
  
  // Check in point is before out point
  if (inPoint >= outPoint) {
    return { 
      valid: false, 
      error: 'Out point must be after in point' 
    };
  }
  
  // Check minimum duration (0.1 seconds)
  if (outPoint - inPoint < 0.1) {
    return { 
      valid: false, 
      error: 'Trim duration must be at least 0.1 seconds' 
    };
  }
  
  // All validations passed
  return { valid: true };
}

/**
 * Validate a single in point against current trim data
 * @param {number} inPoint - Start time in seconds
 * @param {number} outPoint - Current out point
 * @param {number} duration - Video duration in seconds
 * @returns {Object} {valid, error}
 */
export function validateInPoint(inPoint, outPoint, duration) {
  return validateTrimPoints(inPoint, outPoint, duration);
}

/**
 * Validate a single out point against current trim data
 * @param {number} inPoint - Current in point
 * @param {number} outPoint - End time in seconds
 * @param {number} duration - Video duration in seconds
 * @returns {Object} {valid, error}
 */
export function validateOutPoint(inPoint, outPoint, duration) {
  return validateTrimPoints(inPoint, outPoint, duration);
}

