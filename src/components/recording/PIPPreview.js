// PIPPreview.js - Picture-in-Picture preview component
// PR#32: Picture-in-Picture Recording

import React from 'react';
import { useCanvasCompositing } from '../../hooks/useCanvasCompositing';
import './PIPPreview.css';

const PIPPreview = ({ 
  screenStream, 
  webcamStream, 
  pipSettings, 
  isRecording = false 
}) => {
  const { canvasRef, canvasStream, error } = useCanvasCompositing(
    screenStream,
    webcamStream,
    pipSettings
  );
  
  if (error) {
    return (
      <div className="pip-preview-error">
        <div className="error-icon">⚠️</div>
        <p className="error-message">Preview error: {error}</p>
      </div>
    );
  }
  
  if (!screenStream || !webcamStream) {
    return (
      <div className="pip-preview-placeholder">
        <div className="placeholder-icon">📺</div>
        <p className="placeholder-text">Select screen source and webcam to preview</p>
      </div>
    );
  }
  
  return (
    <div className="pip-preview">
      <canvas
        ref={canvasRef}
        className="pip-preview__canvas"
      />
      {isRecording && (
        <div className="pip-preview__recording-overlay">
          <div className="recording-dot"></div>
          <span>Recording</span>
        </div>
      )}
    </div>
  );
};

export default PIPPreview;

