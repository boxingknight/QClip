// webcamUtils.js - Webcam device enumeration utilities
// PR#18: Webcam Recording

/**
 * Get list of available webcam devices
 * @returns {Promise<Array>} Array of webcam devices with id, label, and capabilities
 */
export async function getWebcamDevices() {
  try {
    // Request permission first (required to get device labels)
    await navigator.mediaDevices.getUserMedia({ video: true });
    
    // Get all devices
    const devices = await navigator.mediaDevices.enumerateDevices();
    
    // Filter for video input devices
    const webcamDevices = devices
      .filter(device => device.kind === 'videoinput')
      .map(device => ({
        id: device.deviceId,
        label: device.label || `Camera ${device.deviceId.slice(0, 8)}`,
      }));
    
    return webcamDevices;
  } catch (error) {
    console.error('Failed to get webcam devices:', error);
    
    // Handle permission denied gracefully
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      throw new Error('Camera permission denied. Please allow camera access in your browser settings.');
    }
    
    // Handle no devices
    if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      throw new Error('No cameras found. Please connect a camera and try again.');
    }
    
    throw error;
  }
}

/**
 * Get device capabilities (optional - for future use)
 * @param {string} deviceId - Webcam device ID
 * @returns {Promise<object>} Device capabilities
 */
export async function getDeviceCapabilities(deviceId) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId }
    });
    
    const track = stream.getVideoTracks()[0];
    const capabilities = track.getCapabilities ? track.getCapabilities() : {};
    
    // Stop the stream immediately (we only needed it to get capabilities)
    stream.getTracks().forEach(track => track.stop());
    
    return capabilities;
  } catch (error) {
    console.error('Failed to get device capabilities:', error);
    return {};
  }
}

/**
 * Check if getUserMedia is supported
 * @returns {boolean} Whether getUserMedia is available
 */
export function isWebcamSupported() {
  return !!(
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia
  );
}

/**
 * Check if running in secure context (HTTPS or localhost)
 * @returns {boolean} Whether we're in a secure context
 */
export function isSecureContext() {
  return window.isSecureContext;
}

