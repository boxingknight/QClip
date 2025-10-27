/**
 * Logger utility for structured logging
 * Provides different log levels with conditional output
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const DEBUG_MODE = process.env.NODE_ENV === 'development';

/**
 * Structured logger with different log levels
 */
export const logger = {
  /**
   * Log an error
   * @param {string} message - Error message
   * @param {Error} error - Error object
   * @param {Object} data - Additional context data
   */
  error: (message, error = null, data = {}) => {
    if (DEBUG_MODE || data.force) {
      console.error(`[ERROR] ${message}`, error || '', data);
    }
  },

  /**
   * Log a warning
   * @param {string} message - Warning message
   * @param {Object} data - Additional context data
   */
  warn: (message, data = {}) => {
    if (DEBUG_MODE || data.force) {
      console.warn(`[WARN] ${message}`, data);
    }
  },

  /**
   * Log an info message
   * @param {string} message - Info message
   * @param {Object} data - Additional context data
   */
  info: (message, data = {}) => {
    if (DEBUG_MODE || data.force) {
      console.info(`[INFO] ${message}`, data);
    }
  },

  /**
   * Log debug information
   * @param {string} message - Debug message
   * @param {Object} data - Additional context data
   */
  debug: (message, data = {}) => {
    if (DEBUG_MODE || data.force) {
      console.debug(`[DEBUG] ${message}`, data);
    }
  },

  /**
   * Check if debug mode is enabled
   * @returns {boolean}
   */
  isDebugMode: () => DEBUG_MODE
};

