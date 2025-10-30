/**
 * Export Settings Utilities
 * Provides default settings, presets, and validation for video export
 */

/**
 * Get default export settings
 * @returns {Object} Default export settings object
 */
export const getDefaultSettings = () => ({
  // Basic Settings
  format: 'mp4',
  resolution: '1080p',
  customWidth: 1920,
  customHeight: 1080,
  
  // Quality Settings
  quality: 'balanced',
  videoBitrate: '5000k',
  audioBitrate: '128k',
  
  // Advanced Settings
  advanced: {
    codec: 'h264',
    bitrate: '5000k',
    preset: 'medium',
    profile: 'main',
    twoPass: false,
    crf: false,
    crfValue: 23
  },
  
  // File Settings
  filename: 'exported_video',
  includeTimestamp: true,
  
  // UI State
  showAdvanced: false,
  lastUsed: Date.now()
});

/**
 * Export presets for common use cases
 */
export const exportPresets = {
  web: {
    name: 'Web (Fast)',
    format: 'mp4',
    resolution: '1080p',
    quality: 'fast',
    videoBitrate: '2000k',
    audioBitrate: '128k',
    advanced: {
      codec: 'h264',
      bitrate: '2000k',
      preset: 'fast',
      profile: 'main',
      twoPass: false,
      crf: false,
      crfValue: 23
    }
  },
  broadcast: {
    name: 'Broadcast (High Quality)',
    format: 'mov',
    resolution: '1080p',
    quality: 'high',
    videoBitrate: '50000k',
    audioBitrate: '320k',
    advanced: {
      codec: 'h264',
      bitrate: '50000k',
      preset: 'slow',
      profile: 'high',
      twoPass: true,
      crf: false,
      crfValue: 18
    }
  },
  archival: {
    name: 'Archival (Maximum Quality)',
    format: 'mov',
    resolution: '4k',
    quality: 'high',
    videoBitrate: '100000k',
    audioBitrate: '320k',
    advanced: {
      codec: 'h265',
      bitrate: '100000k',
      preset: 'veryslow',
      profile: 'main',
      twoPass: true,
      crf: false,
      crfValue: 15
    }
  }
};

/**
 * Parse bitrate string to numeric value
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
 * Validate export settings
 * @param {Object} settings - Settings to validate
 * @returns {Object} Validation result {valid: boolean, errors: string[]}
 */
export function validateExportSettings(settings) {
  const errors = [];
  
  // Validate resolution
  if (settings.resolution === 'custom') {
    if (!settings.customWidth || !settings.customHeight) {
      errors.push('Custom resolution must have width and height');
    } else {
      if (settings.customWidth < 1 || settings.customHeight < 1) {
        errors.push('Custom resolution must have positive dimensions');
      }
      if (settings.customWidth > 7680 || settings.customHeight > 4320) {
        errors.push('Resolution too high (max 8K: 7680×4320)');
      }
      if (settings.customWidth % 2 !== 0 || settings.customHeight % 2 !== 0) {
        errors.push('Resolution dimensions must be even numbers');
      }
    }
  }
  
  // Validate bitrates
  const videoBitrate = parseBitrate(settings.videoBitrate);
  const audioBitrate = parseBitrate(settings.audioBitrate);
  
  if (videoBitrate < 100) {
    errors.push('Video bitrate too low (min 100k)');
  }
  if (videoBitrate > 100000) {
    errors.push('Video bitrate too high (max 100M)');
  }
  if (audioBitrate < 64) {
    errors.push('Audio bitrate too low (min 64k)');
  }
  if (audioBitrate > 320) {
    errors.push('Audio bitrate too high (max 320k)');
  }
  
  // Validate framerate
  if (settings.framerate !== 'source') {
    if (!settings.customFramerate || settings.customFramerate < 1) {
      errors.push('Framerate must be positive');
    } else if (settings.customFramerate > 120) {
      errors.push('Framerate too high (max 120 fps)');
    }
  }
  
  // Validate codec combinations
  if (settings.format === 'webm') {
    if (settings.videoCodec !== 'libvpx' && settings.videoCodec !== 'libvpx-vp9') {
      errors.push('WebM format requires VP8 or VP9 video codec');
    }
    if (settings.audioCodec !== 'libvorbis') {
      errors.push('WebM format requires Vorbis audio codec');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Load settings from localStorage
 * @returns {Object} Settings object or null if not found
 */
export function loadSettingsFromStorage() {
  try {
    const stored = localStorage.getItem('exportSettings');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure all fields exist
      return { ...getDefaultSettings(), ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load export settings from localStorage:', error);
  }
  return null;
}

/**
 * Save settings to localStorage
 * @param {Object} settings - Settings to save
 */
export function saveSettingsToStorage(settings) {
  try {
    localStorage.setItem('exportSettings', JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save export settings to localStorage:', error);
  }
}
