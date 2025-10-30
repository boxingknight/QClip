import React from 'react';
import './AdvancedSettings.css';

const AdvancedSettings = ({ settings, onChange, isVisible }) => {
  if (!isVisible) return null;

  const handleChange = (field, value) => {
    onChange(prev => ({
      ...prev,
      advanced: {
        ...prev.advanced,
        [field]: value
      }
    }));
  };

  const handleCodecChange = (codec) => {
    const updates = { codec };
    
    // Set default bitrate based on codec
    if (codec === 'h264') {
      updates.bitrate = settings.advanced.bitrate || '5000k';
    } else if (codec === 'h265') {
      updates.bitrate = settings.advanced.bitrate || '3000k';
    } else if (codec === 'vp9') {
      updates.bitrate = settings.advanced.bitrate || '2000k';
    }
    
    onChange(prev => ({
      ...prev,
      advanced: {
        ...prev.advanced,
        ...updates
      }
    }));
  };

  const bitrateOptions = [
    { value: '1000k', label: '1 Mbps (Low)' },
    { value: '2000k', label: '2 Mbps (Medium)' },
    { value: '5000k', label: '5 Mbps (High)' },
    { value: '8000k', label: '8 Mbps (Very High)' },
    { value: '15000k', label: '15 Mbps (Ultra)' },
    { value: 'custom', label: 'Custom...' }
  ];

  const codecOptions = [
    { value: 'h264', label: 'H.264 (Compatible)' },
    { value: 'h265', label: 'H.265 (Efficient)' },
    { value: 'vp9', label: 'VP9 (Web Optimized)' }
  ];

  const presetOptions = [
    { value: 'ultrafast', label: 'Ultrafast (Fastest)' },
    { value: 'fast', label: 'Fast' },
    { value: 'medium', label: 'Medium (Balanced)' },
    { value: 'slow', label: 'Slow (Better Quality)' },
    { value: 'veryslow', label: 'Very Slow (Best Quality)' }
  ];

  const profileOptions = {
    h264: [
      { value: 'baseline', label: 'Baseline (Compatible)' },
      { value: 'main', label: 'Main (Standard)' },
      { value: 'high', label: 'High (Best Quality)' }
    ],
    h265: [
      { value: 'main', label: 'Main (Standard)' },
      { value: 'main10', label: 'Main 10 (10-bit)' }
    ],
    vp9: [
      { value: '0', label: 'Profile 0 (8-bit)' },
      { value: '1', label: 'Profile 1 (8-bit)' },
      { value: '2', label: 'Profile 2 (10-bit)' }
    ]
  };

  const currentCodec = settings.advanced?.codec || 'h264';
  const currentBitrate = settings.advanced?.bitrate || '5000k';
  const isCustomBitrate = !bitrateOptions.find(opt => opt.value === currentBitrate);

  return (
    <div className="advanced-settings">
      <h4>Advanced Settings</h4>
      
      {/* Video Codec */}
      <div className="setting-group">
        <label htmlFor="codec-select">Video Codec</label>
        <select
          id="codec-select"
          value={currentCodec}
          onChange={(e) => handleCodecChange(e.target.value)}
          className="setting-select"
        >
          {codecOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="setting-description">
          {currentCodec === 'h264' && 'Best compatibility, larger file sizes'}
          {currentCodec === 'h265' && 'Better compression, requires modern devices'}
          {currentCodec === 'vp9' && 'Web optimized, good for streaming'}
        </div>
      </div>

      {/* Video Bitrate */}
      <div className="setting-group">
        <label htmlFor="bitrate-select">Video Bitrate</label>
        <div className="bitrate-controls">
          <select
            id="bitrate-select"
            value={isCustomBitrate ? 'custom' : currentBitrate}
            onChange={(e) => {
              if (e.target.value === 'custom') {
                handleChange('bitrate', '5000k');
              } else {
                handleChange('bitrate', e.target.value);
              }
            }}
            className="setting-select"
          >
            {bitrateOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {isCustomBitrate && (
            <input
              type="text"
              value={currentBitrate}
              onChange={(e) => handleChange('bitrate', e.target.value)}
              placeholder="e.g., 5000k"
              className="custom-bitrate-input"
            />
          )}
        </div>
        <div className="setting-description">
          Higher bitrate = better quality but larger files
        </div>
      </div>

      {/* Encoding Preset */}
      <div className="setting-group">
        <label htmlFor="preset-select">Encoding Preset</label>
        <select
          id="preset-select"
          value={settings.advanced?.preset || 'medium'}
          onChange={(e) => handleChange('preset', e.target.value)}
          className="setting-select"
        >
          {presetOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="setting-description">
          Slower presets produce better quality but take longer to encode
        </div>
      </div>

      {/* Profile */}
      <div className="setting-group">
        <label htmlFor="profile-select">Profile</label>
        <select
          id="profile-select"
          value={settings.advanced?.profile || 'main'}
          onChange={(e) => handleChange('profile', e.target.value)}
          className="setting-select"
        >
          {profileOptions[currentCodec]?.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="setting-description">
          Codec-specific encoding profile
        </div>
      </div>

      {/* Additional Options */}
      <div className="setting-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.advanced?.twoPass || false}
            onChange={(e) => handleChange('twoPass', e.target.checked)}
            className="setting-checkbox"
          />
          <span className="checkbox-text">Two-pass encoding</span>
        </label>
        <div className="setting-description">
          Better quality but takes twice as long
        </div>
      </div>

      <div className="setting-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.advanced?.crf || false}
            onChange={(e) => handleChange('crf', e.target.checked)}
            className="setting-checkbox"
          />
          <span className="checkbox-text">Use CRF (Constant Rate Factor)</span>
        </label>
        <div className="setting-description">
          Variable bitrate for consistent quality
        </div>
      </div>

      {settings.advanced?.crf && (
        <div className="setting-group">
          <label htmlFor="crf-value">CRF Value</label>
          <input
            id="crf-value"
            type="range"
            min="0"
            max="51"
            value={settings.advanced?.crfValue || 23}
            onChange={(e) => handleChange('crfValue', parseInt(e.target.value))}
            className="setting-range"
          />
          <div className="range-value">{settings.advanced?.crfValue || 23}</div>
          <div className="setting-description">
            Lower = better quality, higher = smaller file (0-51)
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSettings;
