// StatusBar.js - Status bar component with real-time information
// V2 Feature: Professional status bar with progress indicators
// Status: Implemented for PR #12

import React from 'react';
import './StatusBar.css';

const StatusBar = ({ 
  projectInfo = {},
  progress = null,
  status = 'ready',
  className = ''
}) => {
  const {
    name = 'Untitled Project',
    duration = '0:00',
    clips = 0,
    tracks = 1
  } = projectInfo;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'recording':
        return '🔴';
      case 'exporting':
        return '📤';
      case 'processing':
        return '⚙️';
      case 'error':
        return '❌';
      case 'ready':
      default:
        return '✅';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'recording':
        return 'status-dot-error status-dot-pulse';
      case 'exporting':
      case 'processing':
        return 'status-dot-info status-dot-pulse';
      case 'error':
        return 'status-dot-error';
      case 'ready':
      default:
        return 'status-dot-success';
    }
  };

  return (
    <div className={`status-bar ${className}`} role="status" aria-label="Application status">
      <div className="status-left">
        <div className="status-item" aria-label="Project status">
          <div className={`status-dot ${getStatusColor()}`} />
          <span className="status-label">{status}</span>
        </div>
        
        <div className="status-separator" />
        
        <div className="status-item" aria-label="Project name">
          <div className="status-icon">{getStatusIcon()}</div>
          <span className="status-value">{name}</span>
        </div>
        
        <div className="status-separator" />
        
        <div className="status-item" aria-label="Project duration">
          <span className="status-label">Duration:</span>
          <span className="status-value">{formatTime(duration)}</span>
        </div>
        
        <div className="status-separator" />
        
        <div className="status-item" aria-label="Clip count">
          <span className="status-label">Clips:</span>
          <span className="status-value">{clips}</span>
        </div>
        
        <div className="status-separator" />
        
        <div className="status-item" aria-label="Track count">
          <span className="status-label">Tracks:</span>
          <span className="status-value">{tracks}</span>
        </div>
      </div>
      
      <div className="status-right">
        {progress && (
          <>
            <div className="status-progress" aria-label="Progress">
              <div className="status-progress-bar">
                <div 
                  className="status-progress-fill"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <div className="status-progress-text">
                {progress.percentage}%
              </div>
            </div>
            
            <div className="status-separator" />
          </>
        )}
        
        <div className="status-item" aria-label="Current time">
          <span className="status-label">Time:</span>
          <span className="status-time">{formatTime(Date.now() / 1000)}</span>
        </div>
        
        <div className="status-separator" />
        
        <div className="status-item" aria-label="Application version">
          <span className="status-version">v2.0.0</span>
        </div>
      </div>
    </div>
  );
};

// StatusBar with predefined configurations
export const StatusBarPresets = {
  // Default status bar for main application
  main: {
    projectInfo: {
      name: 'Untitled Project',
      duration: 0,
      clips: 0,
      tracks: 1
    },
    status: 'ready'
  },

  // Status bar for recording mode
  recording: {
    projectInfo: {
      name: 'Recording Session',
      duration: 0,
      clips: 0,
      tracks: 1
    },
    status: 'recording'
  },

  // Status bar for export mode
  exporting: {
    projectInfo: {
      name: 'Exporting Project',
      duration: 0,
      clips: 0,
      tracks: 1
    },
    status: 'exporting',
    progress: {
      percentage: 0,
      message: 'Preparing export...'
    }
  }
};

export default StatusBar;

