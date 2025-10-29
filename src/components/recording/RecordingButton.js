import React from 'react';
import './RecordingButton.css';

const RecordingButton = ({ 
  onClick, 
  label, 
  icon, 
  variant = 'primary', 
  loading = false, 
  disabled = false 
}) => {
  return (
    <button
      className={`recording-button recording-button--${variant} ${loading ? 'recording-button--loading' : ''}`}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={label}
    >
      {loading ? (
        <div className="recording-button__spinner" />
      ) : (
        <span className="recording-button__icon">{icon}</span>
      )}
      <span className="recording-button__label">{label}</span>
    </button>
  );
};

export default RecordingButton;
