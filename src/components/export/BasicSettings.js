// src/components/export/BasicSettings.js
import React from 'react';
import './BasicSettings.css';

const BasicSettings = ({ settings, onChange }) => {
  const handleChange = (field, value) => {
    onChange(prev => ({ ...prev, [field]: value }));
  };
  
  return (
    <div className="basic-settings">
      <h3>Basic Settings</h3>
      
      <div className="setting-group">
        <label>Format</label>
        <select 
          value={settings.format}
          onChange={(e) => handleChange('format', e.target.value)}
        >
          <option value="mp4">MP4</option>
          <option value="mov">MOV</option>
          <option value="webm">WebM</option>
        </select>
      </div>
      
      <div className="setting-group">
        <label>Resolution</label>
        <select 
          value={settings.resolution}
          onChange={(e) => handleChange('resolution', e.target.value)}
        >
          <option value="4k">4K (3840×2160)</option>
          <option value="1080p">1080p (1920×1080)</option>
          <option value="720p">720p (1280×720)</option>
          <option value="480p">480p (854×480)</option>
          <option value="custom">Custom</option>
        </select>
      </div>
      
      {settings.resolution === 'custom' && (
        <div className="custom-resolution">
          <div className="setting-group">
            <label>Width</label>
            <input 
              type="number"
              value={settings.customWidth}
              onChange={(e) => handleChange('customWidth', parseInt(e.target.value) || 1920)}
              min="1"
              max="7680"
            />
          </div>
          <div className="setting-group">
            <label>Height</label>
            <input 
              type="number"
              value={settings.customHeight}
              onChange={(e) => handleChange('customHeight', parseInt(e.target.value) || 1080)}
              min="1"
              max="4320"
            />
          </div>
        </div>
      )}
      
      <div className="setting-group">
        <label>Frame Rate</label>
        <select 
          value={settings.framerate}
          onChange={(e) => handleChange('framerate', e.target.value)}
        >
          <option value="source">Source (Keep Original)</option>
          <option value="custom">Custom</option>
        </select>
      </div>
      
      {settings.framerate === 'custom' && (
        <div className="setting-group">
          <label>Custom Frame Rate</label>
          <select 
            value={settings.customFramerate}
            onChange={(e) => handleChange('customFramerate', parseInt(e.target.value))}
          >
            <option value={24}>24 fps (Cinema)</option>
            <option value={30}>30 fps (Standard)</option>
            <option value={60}>60 fps (Smooth)</option>
            <option value={120}>120 fps (High Speed)</option>
          </select>
        </div>
      )}
      
      <div className="setting-group">
        <label>Quality</label>
        <select 
          value={settings.quality}
          onChange={(e) => handleChange('quality', e.target.value)}
        >
          <option value="fast">Fast (Lower Quality)</option>
          <option value="balanced">Balanced</option>
          <option value="high">High Quality</option>
          <option value="custom">Custom</option>
        </select>
      </div>
      
      {settings.quality === 'custom' && (
        <div className="custom-quality">
          <div className="setting-group">
            <label>Video Bitrate</label>
            <input 
              type="text"
              value={settings.videoBitrate}
              onChange={(e) => handleChange('videoBitrate', e.target.value)}
              placeholder="e.g., 5000k"
            />
          </div>
          <div className="setting-group">
            <label>Audio Bitrate</label>
            <input 
              type="text"
              value={settings.audioBitrate}
              onChange={(e) => handleChange('audioBitrate', e.target.value)}
              placeholder="e.g., 128k"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BasicSettings;
