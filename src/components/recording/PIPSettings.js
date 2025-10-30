// PIPSettings.js - Picture-in-Picture settings component
// PR#32: Picture-in-Picture Recording

import React from 'react';
import { getPIPSizePresets } from '../../utils/pipUtils';
import './PIPSettings.css';

const PIPSettings = ({ settings, onSettingsChange, disabled = false }) => {
  const presets = getPIPSizePresets();
  
  const handlePositionChange = (position) => {
    onSettingsChange({ ...settings, position });
  };
  
  const handleSizeChange = (size) => {
    onSettingsChange({ ...settings, size });
  };
  
  const handleAudioSourceChange = (audioSource) => {
    onSettingsChange({ ...settings, audioSource });
  };
  
  return (
    <div className="pip-settings">
      <h3 className="pip-settings__title">Picture-in-Picture Settings</h3>
      
      {/* Position Selector */}
      <div className="pip-settings__group">
        <label className="pip-settings__label">Position</label>
        <select
          className="pip-settings__select"
          value={settings.position}
          onChange={(e) => handlePositionChange(e.target.value)}
          disabled={disabled}
        >
          <option value="top-left">Top Left</option>
          <option value="top-right">Top Right</option>
          <option value="bottom-left">Bottom Left</option>
          <option value="bottom-right">Bottom Right</option>
        </select>
      </div>
      
      {/* Size Selector */}
      <div className="pip-settings__group">
        <label className="pip-settings__label">Size</label>
        <div className="pip-settings__size-presets">
          <button
            type="button"
            className={`pip-settings__preset-btn ${settings.size === presets.small ? 'active' : ''}`}
            onClick={() => handleSizeChange(presets.small)}
            disabled={disabled}
          >
            Small ({presets.small}%)
          </button>
          <button
            type="button"
            className={`pip-settings__preset-btn ${settings.size === presets.medium ? 'active' : ''}`}
            onClick={() => handleSizeChange(presets.medium)}
            disabled={disabled}
          >
            Medium ({presets.medium}%)
          </button>
          <button
            type="button"
            className={`pip-settings__preset-btn ${settings.size === presets.large ? 'active' : ''}`}
            onClick={() => handleSizeChange(presets.large)}
            disabled={disabled}
          >
            Large ({presets.large}%)
          </button>
        </div>
        <div className="pip-settings__size-slider-group">
          <input
            type="range"
            min="10"
            max="50"
            value={settings.size}
            onChange={(e) => handleSizeChange(Number(e.target.value))}
            disabled={disabled}
            className="pip-settings__slider"
          />
          <span className="pip-settings__size-value">{settings.size}%</span>
        </div>
      </div>
      
      {/* Audio Source Selector */}
      <div className="pip-settings__group">
        <label className="pip-settings__label">Audio Source</label>
        <select
          className="pip-settings__select"
          value={settings.audioSource}
          onChange={(e) => handleAudioSourceChange(e.target.value)}
          disabled={disabled}
        >
          <option value="webcam">Webcam Microphone</option>
          <option value="screen">Screen Audio</option>
          <option value="both">Both (Mixed)</option>
          <option value="none">None</option>
        </select>
      </div>
    </div>
  );
};

export default PIPSettings;

