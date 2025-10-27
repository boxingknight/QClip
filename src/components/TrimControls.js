import React, { useState } from 'react';
import '../styles/TrimControls.css';

const TrimControls = ({
  currentTime,
  duration,
  inPoint,
  outPoint,
  onSetInPoint,
  onSetOutPoint,
  onResetTrim,
  onApplyTrim,
  isRendering = false,
  renderProgress = 0
}) => {
  const [draggingHandle, setDraggingHandle] = useState(null);
  
  // Calculate trim duration
  const trimDuration = outPoint - inPoint;
  
  // Validation: Check if trim is valid
  const isValid = inPoint < outPoint && inPoint >= 0 && outPoint <= duration;

  // Format time helper
  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Calculate slider positions (0-100%)
  const inPointPercent = duration > 0 ? (inPoint / duration) * 100 : 0;
  const outPointPercent = duration > 0 ? (outPoint / duration) * 100 : 100;

  const handleSliderStart = (handle) => {
    setDraggingHandle(handle);
  };

  const handleSliderMove = (e) => {
    if (!draggingHandle) return;
    
    const slider = e.currentTarget;
    const rect = slider.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const newTime = (percent / 100) * duration;
    
    if (draggingHandle === 'in') {
      onSetInPoint(newTime);
    } else if (draggingHandle === 'out') {
      onSetOutPoint(newTime);
    }
  };

  const handleSetInPoint = () => {
    onSetInPoint(currentTime);
  };

  const handleSetOutPoint = () => {
    onSetOutPoint(currentTime);
  };

  const handleSliderEnd = () => {
    setDraggingHandle(null);
  };

  return (
    <div className="trim-controls">
      <h3 className="trim-controls-title">Trim</h3>
      
      {/* Current Time Display */}
      <div className="trim-time-display">
        <span className="time-label">Time:</span>
        <span className="time">{formatDuration(currentTime)}</span>
        <span className="separator">/</span>
        <span className="duration">{formatDuration(duration)}</span>
      </div>

      {/* Visual Slider */}
      <div className="trim-slider-container">
        <div 
          className="trim-slider-track"
          onMouseMove={handleSliderMove}
          onMouseUp={handleSliderEnd}
          onMouseLeave={handleSliderEnd}
        >
          {/* Background */}
          <div className="slider-background" />
          
          {/* Trimmed region (highlighted) */}
          <div 
            className="slider-trimmed"
            style={{
              left: `${inPointPercent}%`,
              width: `${outPointPercent - inPointPercent}%`
            }}
          />
          
          {/* In Point Handle */}
          <div
            className="slider-handle slider-handle-in"
            style={{ left: `${inPointPercent}%` }}
            onMouseDown={() => handleSliderStart('in')}
          >
            <span className="handle-label">IN</span>
            <span className="handle-time">{formatDuration(inPoint)}</span>
          </div>
          
          {/* Out Point Handle */}
          <div
            className="slider-handle slider-handle-out"
            style={{ left: `${outPointPercent}%` }}
            onMouseDown={() => handleSliderStart('out')}
          >
            <span className="handle-label">OUT</span>
            <span className="handle-time">{formatDuration(outPoint)}</span>
          </div>
        </div>
      </div>

      {/* Trim Info */}
      <div className="trim-info">
        <div className="trim-info-item">
          <label>In:</label>
          <span>{formatDuration(inPoint)}</span>
        </div>
        <div className="trim-info-item">
          <label>Duration:</label>
          <span className={isValid ? '' : 'error'}>{formatDuration(trimDuration)}</span>
        </div>
        <div className="trim-info-item">
          <label>Out:</label>
          <span>{formatDuration(outPoint)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="trim-actions">
        <button
          className="btn-reset"
          onClick={onResetTrim}
          title="Reset trim to full clip"
        >
          Reset
        </button>
        
        <button
          className={`btn-apply ${!isValid || isRendering ? 'disabled' : ''}`}
          onClick={onApplyTrim}
          disabled={!isValid || isRendering}
          title={isRendering ? 'Applying trim...' : 'Apply trim (permanently delete excess footage)'}
        >
          {isRendering ? `Applying... ${Math.round(renderProgress)}%` : 'Apply Trim'}
        </button>
      </div>

      {/* Render Progress Bar */}
      {isRendering && (
        <div className="render-progress">
          <div 
            className="render-progress-bar"
            style={{ width: `${renderProgress}%` }}
          />
          <span className="render-progress-text">
            Trimming clip... {Math.round(renderProgress)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default TrimControls;

