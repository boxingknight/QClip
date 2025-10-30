/**
 * File Size Estimator
 * Calculates estimated file size based on video duration and export settings
 */

/**
 * Parse bitrate string to numeric value (in kbps)
 * @param {string} bitrateString - Bitrate string (e.g., "5000k", "5M")
 * @returns {number} Bitrate in kbps
 */
function parseBitrate(bitrateString) {
  if (!bitrateString) return 0;
  
  const match = bitrateString.toString().match(/(\d+)([kmKM]?)/i);
  if (!match) return 0;
  
  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  
  switch (unit) {
    case 'k':
      return value;
    case 'm':
      return value * 1000;
    default:
      return value;
  }
}

/**
 * Format file size to human-readable string
 * @param {number} bytes - File size in bytes
 * @returns {Object} {size: number, unit: string}
 */
function formatFileSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return {
    size: Math.round(size * 100) / 100,
    unit: units[unitIndex]
  };
}

/**
 * Estimate file size for video export
 * @param {number} duration - Video duration in seconds
 * @param {Object} settings - Export settings
 * @returns {Object} {size: number, unit: string}
 */
export function estimateFileSize(duration, settings) {
  if (!duration || duration <= 0) {
    return { size: 0, unit: 'MB' };
  }
  
  // Get bitrates from settings (support both old and new structure)
  const videoBitrate = settings.advanced?.bitrate || settings.videoBitrate || '5000k';
  const audioBitrate = settings.audioBitrate || '128k';
  
  // Parse bitrates (convert to bps)
  const videoBitrateBps = parseBitrate(videoBitrate) * 1000; // Convert kbps to bps
  const audioBitrateBps = parseBitrate(audioBitrate) * 1000; // Convert kbps to bps
  const totalBitrateBps = videoBitrateBps + audioBitrateBps;
  
  // Calculate total bytes: bitrate (bits/sec) * duration (sec) / 8 (bits to bytes)
  const totalBytes = (totalBitrateBps * duration) / 8;
  
  // Format to human-readable
  return formatFileSize(totalBytes);
}

/**
 * Estimate file size with conservative adjustment
 * Adds 10% buffer for overhead (container, metadata, etc.)
 * @param {number} duration - Video duration in seconds
 * @param {Object} settings - Export settings
 * @returns {Object} {size: number, unit: string}
 */
export function estimateFileSizeWithOverhead(duration, settings) {
  const baseEstimate = estimateFileSize(duration, settings);
  const bytes = convertToBytes(baseEstimate.size, baseEstimate.unit);
  const withOverhead = bytes * 1.1; // Add 10% overhead
  return formatFileSize(withOverhead);
}

/**
 * Convert file size to bytes
 * @param {number} size - File size value
 * @param {string} unit - Unit (B, KB, MB, GB, TB)
 * @returns {number} Size in bytes
 */
function convertToBytes(size, unit) {
  const multipliers = {
    'B': 1,
    'KB': 1024,
    'MB': 1024 * 1024,
    'GB': 1024 * 1024 * 1024,
    'TB': 1024 * 1024 * 1024 * 1024
  };
  
  return size * (multipliers[unit] || 1);
}
