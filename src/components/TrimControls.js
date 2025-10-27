import React from 'react';
import '../styles/TrimControls.css';

const TrimControls = ({
  currentTime,
  duration,
  inPoint,
  outPoint,
  onSetInPoint,
  onSetOutPoint,
  onResetTrim
}) => {
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

  return (
    <div className="trim-controls">
      <h3 className="trim-controls-title">Trim Controls</h3>
      
      {/* Current Time Display */}
      <div className="trim-time-display">
        <span className="label">Current Time:</span>
        <span className="time">{formatDuration(currentTime)}</span>
        <span className="separator">/</span>
        <span className="duration">{formatDuration(duration)}</span>
      </div>

      {/* Trim Points */}
      <div className="trim-points">
        {/* In Point */}
        <div className="trim-point">
          <label>In Point:</label>
          <span className="time-value">{formatDuration(inPoint)}</span>
          <button
            className="btn-set"
            onClick={onSetInPoint}
            disabled={currentTime >= outPoint || currentTime < 0}
            title="Set trim start to current position"
          >
            Set In
          </button>
        </div>

        {/* Out Point */}
        <div className="trim-point">
          <label>Out Point:</label>
          <span className="time-value">{formatDuration(outPoint)}</span>
          <button
            className="btn-set"
            onClick={onSetOutPoint}
            disabled={currentTime <= inPoint || currentTime > duration}
            title="Set trim end to current position"
          >
            Set Out
          </button>
        </div>
      </div>

      {/* Trim Duration */}
      <div className="trim-duration">
        <label>Trim Duration:</label>
        <span className={isValid ? 'duration-value' : 'duration-value error'}>
          {formatDuration(trimDuration)}
        </span>
      </div>

      {/* Error Message */}
      {!isValid && (
        <div className="trim-error">
          ⚠️ In point must be before out point
        </div>
      )}

      {/* Reset Button */}
      <button
        className="btn-reset"
        onClick={onResetTrim}
        title="Reset trim to full clip"
      >
        Reset Trim
      </button>
    </div>
  );
};

export default TrimControls;

