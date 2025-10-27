/**
 * Format seconds to MM:SS
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted time string (e.g., "1:05" for 65 seconds)
 */
export function formatDuration(seconds) {
  if (!seconds || isNaN(seconds) || seconds < 0) {
    return '0:00';
  }
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Parse MM:SS format to seconds
 * @param {string} timeString - Time string in MM:SS format
 * @returns {number} Time in seconds
 */
export function parseDuration(timeString) {
  const parts = timeString.split(':');
  if (parts.length !== 2) return 0;
  
  const mins = parseInt(parts[0], 10);
  const secs = parseInt(parts[1], 10);
  
  return (mins * 60) + secs;
}

