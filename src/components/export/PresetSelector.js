// src/components/export/PresetSelector.js
import React from 'react';
import { exportPresets } from '../../utils/exportSettings';
import './PresetSelector.css';

const PresetSelector = ({ settings, onSelect }) => {
  const handlePresetSelect = (presetKey) => {
    const preset = exportPresets[presetKey];
    if (preset) {
      onSelect(preset);
    }
  };

  return (
    <div className="preset-selector">
      <h3>Export Presets</h3>
      <div className="preset-grid">
        {Object.entries(exportPresets).map(([key, preset]) => {
          // Check if current settings match this preset
          const isActive = 
            settings.format === preset.format &&
            settings.resolution === preset.resolution &&
            settings.quality === preset.quality &&
            settings.videoBitrate === preset.videoBitrate;
          
          return (
            <div 
              key={key}
              className={`preset-card ${isActive ? 'active' : ''}`}
              onClick={() => handlePresetSelect(key)}
            >
              <div className="preset-name">{preset.name}</div>
              <div className="preset-details">
                <div>{preset.resolution} • {preset.format.toUpperCase()}</div>
                <div>{preset.videoBitrate} video • {preset.audioBitrate} audio</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PresetSelector;
