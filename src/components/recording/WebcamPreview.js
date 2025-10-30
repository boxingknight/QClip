// WebcamPreview.js - Webcam preview component
// PR#18: Webcam Recording

import React, { useRef, useEffect, useState } from 'react';
import './WebcamPreview.css';

const WebcamPreview = ({ 
  deviceId, 
  isRecording, 
  onStreamReady, 
  onStreamError,
  className = '',
  settings = {}
}) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!deviceId) {
      cleanup();
      return;
    }

    setupPreview();

    return cleanup;
  }, [deviceId, settings.resolution, settings.framerate]);

  const setupPreview = async () => {
    try {
      setError(null);
      
      // Parse resolution from settings
      const resolution = settings.resolution || '1280x720';
      const [width, height] = resolution.split('x').map(Number);
      const framerate = settings.framerate || 30;
      
      const constraints = {
        video: { 
          deviceId: { exact: deviceId },
          width: { ideal: width },
          height: { ideal: height },
          frameRate: { ideal: framerate }
        },
        audio: false // Preview doesn't need audio
      };

      const previewStream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = previewStream;
        setStream(previewStream);
        onStreamReady?.(previewStream);
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      onStreamError?.(err);
      console.error('Failed to setup webcam preview:', err);
    }
  };

  const cleanup = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const getErrorMessage = (error) => {
    switch (error.name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        return 'Camera permission denied. Please allow camera access.';
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        return 'No camera found. Please connect a camera.';
      case 'NotReadableError':
      case 'TrackStartError':
        return 'Camera is being used by another application.';
      case 'OverconstrainedError':
        return 'Camera does not support the requested settings.';
      case 'SecurityError':
        return 'Camera access blocked. Please use HTTPS or localhost.';
      default:
        return `Failed to access camera: ${error.message || 'Unknown error'}`;
    }
  };

  if (error) {
    return (
      <div className={`webcam-preview-error ${className}`}>
        <div className="error-icon">📷</div>
        <div className="error-message">{error}</div>
        <button onClick={setupPreview} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`webcam-preview ${className}`}>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className={`preview-video ${isRecording ? 'recording' : ''}`}
      />
      {isRecording && (
        <div className="recording-indicator">
          <div className="recording-dot"></div>
          <span>Recording...</span>
        </div>
      )}
      {!stream && (
        <div className="preview-loading">
          <div className="loading-spinner"></div>
          <span>Loading camera...</span>
        </div>
      )}
    </div>
  );
};

export default WebcamPreview;

