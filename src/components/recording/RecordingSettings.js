// RecordingSettings.js - Recording settings component
// PR#18: Webcam Recording

import React, { useState, useEffect } from 'react';
import './RecordingSettings.css';

const RecordingSettings = ({ 
  settings, 
  onSettingsChange, 
  disabled = false 
}) => {
  const [localSettings, setLocalSettings] = useState({
    resolution: settings?.resolution || '1280x720',
    framerate: settings?.framerate || 30,
    audio: settings?.audio !== false
  });

  useEffect(() => {
    if (settings) {
      setLocalSettings({
        resolution: settings.resolution || '1280x720',
        framerate: settings.framerate || 30,
        audio: settings.audio !== false
      });
    }
  }, [settings]);

  const handleSettingChange = (key, value) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const resolutionOptions = [
    { value: '640x480', label: '480p (640×480)' },
    { value: '1280x720', label: '720p (1280×720)' },
    { value: '1920x1080', label: '1080p (1920×1080)' }
  ];

  const framerateOptions = [
    { value: 15, label: '15 fps' },
    { value: 24, label: '24 fps' },
    { value: 30, label: '30 fps' },
    { value: 60, label: '60 fps' }
  ];

  return (
    <div className="recording-settings">
      <h3>Recording Settings</h3>
      
      <div className="setting-group">
        <label htmlFor="resolution">Resolution:</label>
        <select
          id="resolution"
          value={localSettings.resolution}
          onChange={(e) => handleSettingChange('resolution', e.target.value)}
          disabled={disabled}
          className="setting-select"
        >
          {resolutionOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="setting-group">
        <label htmlFor="framerate">Frame Rate:</label>
        <select
          id="framerate"
          value={localSettings.framerate}
          onChange={(e) => handleSettingChange('framerate', parseInt(e.target.value))}
          disabled={disabled}
          className="setting-select"
        >
          {framerateOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="setting-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={localSettings.audio}
            onChange={(e) => handleSettingChange('audio', e.target.checked)}
            disabled={disabled}
            className="checkbox-input"
          />
          <span>Include Audio</span>
        </label>
      </div>
    </div>
  );
};

export default RecordingSettings;

