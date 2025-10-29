# PR#23: Implementation Checklist

**Use this as your daily todo list.** Check off items as you complete them.

---

## Pre-Implementation Setup (15 minutes)

- [ ] Read main planning document (~45 min)
- [ ] Prerequisites verified
  - [ ] PR #11 (State Management Refactor) complete
  - [ ] PR #12 (UI Component Library) complete
  - [ ] PR #13 (Professional Timeline) complete
  - [ ] PR #14 (Drag & Drop) complete
  - [ ] PR #15 (Split & Delete) complete
  - [ ] PR #16 (Undo/Redo) complete
- [ ] Dependencies installed
  ```bash
  # No new dependencies needed
  ```
- [ ] Environment configured
  ```bash
  # Verify FFmpeg is working
  npm run test-export
  ```
- [ ] Git branch created
  ```bash
  git checkout -b feature/pr23-advanced-export-settings
  ```

---

## Phase 1: Export Settings Foundation (1.5 hours)

### 1.1: Create Export Settings Context (30 minutes)

#### Create ExportContext
- [ ] Create `src/context/ExportContext.js`
  ```javascript
  import React, { createContext, useContext, useReducer } from 'react';
  
  const ExportContext = createContext();
  
  const exportSettingsReducer = (state, action) => {
    switch (action.type) {
      case 'UPDATE_SETTINGS':
        return { ...state, ...action.payload };
      case 'LOAD_PRESET':
        return { ...state, ...action.preset };
      case 'RESET_TO_DEFAULTS':
        return getDefaultSettings();
      default:
        return state;
    }
  };
  
  export const ExportProvider = ({ children }) => {
    const [settings, dispatch] = useReducer(exportSettingsReducer, getDefaultSettings());
    
    const updateSettings = (newSettings) => {
      dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
      localStorage.setItem('exportSettings', JSON.stringify(settings));
    };
    
    const loadPreset = (presetName) => {
      const preset = exportPresets[presetName];
      dispatch({ type: 'LOAD_PRESET', preset });
    };
    
    return (
      <ExportContext.Provider value={{
        settings,
        updateSettings,
        loadPreset,
        resetToDefaults: () => dispatch({ type: 'RESET_TO_DEFAULTS' })
      }}>
        {children}
      </ExportContext.Provider>
    );
  };
  
  export const useExportSettings = () => {
    const context = useContext(ExportContext);
    if (!context) {
      throw new Error('useExportSettings must be used within ExportProvider');
    }
    return context;
  };
  ```

#### Add Default Settings
- [ ] Create `src/utils/exportSettings.js`
  ```javascript
  export const getDefaultSettings = () => ({
    // Basic Settings
    format: 'mp4',
    resolution: '1080p',
    customWidth: 1920,
    customHeight: 1080,
    
    // Quality Settings
    quality: 'balanced',
    videoBitrate: '5000k',
    audioBitrate: '128k',
    
    // Encoding Settings
    videoCodec: 'libx264',
    audioCodec: 'aac',
    preset: 'medium',
    
    // Advanced Settings
    framerate: 'source',
    customFramerate: 30,
    pixelFormat: 'yuv420p',
    
    // File Settings
    filename: 'exported_video',
    includeTimestamp: true,
    
    // UI State
    showAdvanced: false,
    lastUsed: Date.now()
  });
  
  export const exportPresets = {
    web: {
      name: 'Web (Fast)',
      format: 'mp4',
      resolution: '1080p',
      quality: 'fast',
      videoBitrate: '2000k',
      audioBitrate: '128k',
      videoCodec: 'libx264',
      audioCodec: 'aac',
      preset: 'fast'
    },
    broadcast: {
      name: 'Broadcast (High Quality)',
      format: 'mov',
      resolution: '1080p',
      quality: 'high',
      videoBitrate: '50000k',
      audioBitrate: '320k',
      videoCodec: 'libx264',
      audioCodec: 'aac',
      preset: 'slow'
    },
    archival: {
      name: 'Archival (Maximum Quality)',
      format: 'mov',
      resolution: '4k',
      quality: 'high',
      videoBitrate: '100000k',
      audioBitrate: '320k',
      videoCodec: 'libx265',
      audioCodec: 'aac',
      preset: 'veryslow'
    }
  };
  ```

#### Test Context
- [ ] Test context creation
  - [ ] ExportProvider renders without errors
  - [ ] useExportSettings hook works
  - [ ] Default settings loaded correctly

**Checkpoint:** Export settings context working ✓

**Commit:** `feat(export): create ExportContext with settings management`

---

### 1.2: Add Settings to ProjectContext (15 minutes)

#### Integrate with ProjectContext
- [ ] Modify `src/context/ProjectContext.js`
  ```javascript
  // Add export settings to project state
  const [exportSettings, setExportSettings] = useState(getDefaultSettings());
  
  // Add to context value
  const value = {
    // ... existing values
    exportSettings,
    setExportSettings,
    updateExportSettings: (newSettings) => {
      setExportSettings(prev => ({ ...prev, ...newSettings }));
      localStorage.setItem('exportSettings', JSON.stringify(newSettings));
    }
  };
  ```

#### Test Integration
- [ ] Test settings persistence
  - [ ] Settings save to localStorage
  - [ ] Settings load on app restart
  - [ ] Settings update correctly

**Checkpoint:** Settings integrated with project context ✓

**Commit:** `feat(export): integrate export settings with ProjectContext`

---

### 1.3: Create Settings Utilities (15 minutes)

#### File Size Estimation
- [ ] Create `src/utils/fileSizeEstimator.js`
  ```javascript
  export function estimateFileSize(duration, settings) {
    const videoBitrate = parseBitrate(settings.videoBitrate);
    const audioBitrate = parseBitrate(settings.audioBitrate);
    const totalBitrate = videoBitrate + audioBitrate;
    
    const bytesPerSecond = totalBitrate / 8;
    const totalBytes = bytesPerSecond * duration;
    
    return formatFileSize(totalBytes);
  }
  
  function parseBitrate(bitrateString) {
    const match = bitrateString.match(/(\d+)([km]?)/i);
    if (!match) return 0;
    
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    
    switch (unit) {
      case 'k': return value * 1000;
      case 'm': return value * 1000000;
      default: return value;
    }
  }
  
  function formatFileSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return {
      size: Math.round(size * 100) / 100,
      unit: units[unitIndex]
    };
  }
  ```

#### Settings Validation
- [ ] Add validation functions to `src/utils/exportSettings.js`
  ```javascript
  export function validateExportSettings(settings) {
    const errors = [];
    
    // Validate resolution
    if (settings.resolution === 'custom') {
      if (settings.customWidth < 1 || settings.customHeight < 1) {
        errors.push('Custom resolution must have positive dimensions');
      }
      if (settings.customWidth > 7680 || settings.customHeight > 4320) {
        errors.push('Resolution too high (max 8K)');
      }
    }
    
    // Validate bitrates
    if (parseBitrate(settings.videoBitrate) < 100) {
      errors.push('Video bitrate too low (min 100k)');
    }
    if (parseBitrate(settings.audioBitrate) < 64) {
      errors.push('Audio bitrate too low (min 64k)');
    }
    
    // Validate framerate
    if (settings.framerate !== 'source' && settings.customFramerate < 1) {
      errors.push('Framerate must be positive');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  ```

#### Test Utilities
- [ ] Test file size estimation
  - [ ] Test with different bitrates
  - [ ] Test with different durations
  - [ ] Test format conversion
- [ ] Test settings validation
  - [ ] Test valid settings
  - [ ] Test invalid settings
  - [ ] Test edge cases

**Checkpoint:** Settings utilities working ✓

**Commit:** `feat(export): add file size estimation and settings validation`

---

## Phase 2: UI Components (2 hours)

### 2.1: Create Export Settings Modal (45 minutes)

#### Create Modal Component
- [ ] Create `src/components/export/ExportSettingsModal.js`
  ```javascript
  import React, { useState } from 'react';
  import { useProject } from '../../context/ProjectContext';
  import { useUI } from '../../context/UIContext';
  import BasicSettings from './BasicSettings';
  import AdvancedSettings from './AdvancedSettings';
  import PresetSelector from './PresetSelector';
  import FileSizeEstimator from './FileSizeEstimator';
  import './ExportSettingsModal.css';
  
  const ExportSettingsModal = ({ isOpen, onClose, onApply }) => {
    const { exportSettings, updateExportSettings } = useProject();
    const { closeModal } = useUI();
    const [localSettings, setLocalSettings] = useState(exportSettings);
    const [showAdvanced, setShowAdvanced] = useState(false);
    
    const handleSave = () => {
      updateExportSettings(localSettings);
      onApply(localSettings);
      closeModal();
    };
    
    const handleCancel = () => {
      setLocalSettings(exportSettings);
      closeModal();
    };
    
    if (!isOpen) return null;
    
    return (
      <div className="export-settings-modal-overlay">
        <div className="export-settings-modal">
          <div className="modal-header">
            <h2>Export Settings</h2>
            <button className="close-button" onClick={handleCancel}>×</button>
          </div>
          
          <div className="modal-content">
            <PresetSelector 
              settings={localSettings}
              onSelect={(preset) => setLocalSettings(prev => ({ ...prev, ...preset }))}
            />
            
            <BasicSettings 
              settings={localSettings}
              onChange={setLocalSettings}
            />
            
            <div className="advanced-toggle">
              <button 
                className="toggle-button"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? '▼' : '▶'} Advanced Settings
              </button>
            </div>
            
            {showAdvanced && (
              <AdvancedSettings 
                settings={localSettings}
                onChange={setLocalSettings}
              />
            )}
            
            <FileSizeEstimator settings={localSettings} />
          </div>
          
          <div className="modal-footer">
            <button className="btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleSave}>
              Apply Settings
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default ExportSettingsModal;
  ```

#### Create Modal Styles
- [ ] Create `src/components/export/ExportSettingsModal.css`
  ```css
  .export-settings-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .export-settings-modal {
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: var(--shadow-lg);
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-lg);
    border-bottom: 1px solid var(--color-border);
  }
  
  .modal-content {
    padding: var(--space-lg);
  }
  
  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-md);
    padding: var(--space-lg);
    border-top: 1px solid var(--color-border);
  }
  
  .advanced-toggle {
    margin: var(--space-lg) 0;
  }
  
  .toggle-button {
    background: none;
    border: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    font-size: 14px;
    padding: var(--space-sm);
  }
  
  .toggle-button:hover {
    color: var(--color-text-primary);
  }
  ```

#### Test Modal
- [ ] Test modal opening/closing
- [ ] Test settings display
- [ ] Test responsive design

**Checkpoint:** Export settings modal working ✓

**Commit:** `feat(export): create ExportSettingsModal component`

---

### 2.2: Create Basic Settings Component (30 minutes)

#### Create BasicSettings Component
- [ ] Create `src/components/export/BasicSettings.js`
  ```javascript
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
                onChange={(e) => handleChange('customWidth', parseInt(e.target.value))}
                min="1"
                max="7680"
              />
            </div>
            <div className="setting-group">
              <label>Height</label>
              <input 
                type="number"
                value={settings.customHeight}
                onChange={(e) => handleChange('customHeight', parseInt(e.target.value))}
                min="1"
                max="4320"
              />
            </div>
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
  ```

#### Create BasicSettings Styles
- [ ] Create `src/components/export/BasicSettings.css`
  ```css
  .basic-settings {
    margin-bottom: var(--space-lg);
  }
  
  .basic-settings h3 {
    margin-bottom: var(--space-md);
    color: var(--color-text-primary);
  }
  
  .setting-group {
    margin-bottom: var(--space-md);
  }
  
  .setting-group label {
    display: block;
    margin-bottom: var(--space-xs);
    color: var(--color-text-secondary);
    font-size: 14px;
  }
  
  .setting-group select,
  .setting-group input {
    width: 100%;
    padding: var(--space-sm);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-surface);
    color: var(--color-text-primary);
    font-size: 14px;
  }
  
  .setting-group select:focus,
  .setting-group input:focus {
    outline: none;
    border-color: var(--color-primary);
  }
  
  .custom-resolution,
  .custom-quality {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-md);
    margin-top: var(--space-sm);
    padding: var(--space-md);
    background: var(--color-surface-hover);
    border-radius: var(--radius-sm);
  }
  ```

#### Test Basic Settings
- [ ] Test format selection
- [ ] Test resolution selection
- [ ] Test custom resolution inputs
- [ ] Test quality selection
- [ ] Test custom quality inputs

**Checkpoint:** Basic settings component working ✓

**Commit:** `feat(export): create BasicSettings component`

---

### 2.3: Create Preset Selector (30 minutes)

#### Create PresetSelector Component
- [ ] Create `src/components/export/PresetSelector.js`
  ```javascript
  import React from 'react';
  import { exportPresets } from '../../utils/exportSettings';
  import './PresetSelector.css';
  
  const PresetSelector = ({ settings, onSelect }) => {
    const handlePresetSelect = (presetKey) => {
      const preset = exportPresets[presetKey];
      onSelect(preset);
    };
    
    return (
      <div className="preset-selector">
        <h3>Export Presets</h3>
        <div className="preset-grid">
          {Object.entries(exportPresets).map(([key, preset]) => (
            <div 
              key={key}
              className="preset-card"
              onClick={() => handlePresetSelect(key)}
            >
              <div className="preset-name">{preset.name}</div>
              <div className="preset-details">
                <div>{preset.resolution} • {preset.format.toUpperCase()}</div>
                <div>{preset.videoBitrate} video • {preset.audioBitrate} audio</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default PresetSelector;
  ```

#### Create PresetSelector Styles
- [ ] Create `src/components/export/PresetSelector.css`
  ```css
  .preset-selector {
    margin-bottom: var(--space-lg);
  }
  
  .preset-selector h3 {
    margin-bottom: var(--space-md);
    color: var(--color-text-primary);
  }
  
  .preset-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-md);
  }
  
  .preset-card {
    padding: var(--space-md);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    cursor: pointer;
    transition: all var(--transition-fast);
  }
  
  .preset-card:hover {
    border-color: var(--color-primary);
    background: var(--color-surface-hover);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  
  .preset-name {
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: var(--space-xs);
  }
  
  .preset-details {
    font-size: 12px;
    color: var(--color-text-secondary);
    line-height: 1.4;
  }
  ```

#### Test Preset Selector
- [ ] Test preset selection
- [ ] Test preset display
- [ ] Test hover effects

**Checkpoint:** Preset selector working ✓

**Commit:** `feat(export): create PresetSelector component`

---

### 2.4: Create File Size Estimator (15 minutes)

#### Create FileSizeEstimator Component
- [ ] Create `src/components/export/FileSizeEstimator.js`
  ```javascript
  import React, { useEffect, useState } from 'react';
  import { estimateFileSize } from '../../utils/fileSizeEstimator';
  import { useProject } from '../../context/ProjectContext';
  import './FileSizeEstimator.css';
  
  const FileSizeEstimator = ({ settings }) => {
    const { selectedClip } = useProject();
    const [fileSize, setFileSize] = useState(null);
    
    useEffect(() => {
      if (selectedClip && selectedClip.duration) {
        const estimate = estimateFileSize(selectedClip.duration, settings);
        setFileSize(estimate);
      }
    }, [selectedClip, settings]);
    
    if (!fileSize) return null;
    
    return (
      <div className="file-size-estimator">
        <h4>Estimated File Size</h4>
        <div className="file-size-display">
          <span className="file-size-value">{fileSize.size}</span>
          <span className="file-size-unit">{fileSize.unit}</span>
        </div>
        <div className="file-size-note">
          Based on {selectedClip?.duration?.toFixed(1)}s video
        </div>
      </div>
    );
  };
  
  export default FileSizeEstimator;
  ```

#### Create FileSizeEstimator Styles
- [ ] Create `src/components/export/FileSizeEstimator.css`
  ```css
  .file-size-estimator {
    margin-top: var(--space-lg);
    padding: var(--space-md);
    background: var(--color-surface-hover);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
  }
  
  .file-size-estimator h4 {
    margin-bottom: var(--space-sm);
    color: var(--color-text-primary);
    font-size: 14px;
  }
  
  .file-size-display {
    display: flex;
    align-items: baseline;
    gap: var(--space-xs);
    margin-bottom: var(--space-xs);
  }
  
  .file-size-value {
    font-size: 24px;
    font-weight: 600;
    color: var(--color-primary);
  }
  
  .file-size-unit {
    font-size: 14px;
    color: var(--color-text-secondary);
  }
  
  .file-size-note {
    font-size: 12px;
    color: var(--color-text-secondary);
  }
  ```

#### Test File Size Estimator
- [ ] Test with different settings
- [ ] Test with different video durations
- [ ] Test real-time updates

**Checkpoint:** File size estimator working ✓

**Commit:** `feat(export): create FileSizeEstimator component`

---

## Phase 3: Advanced Settings (1.5 hours)

### 3.1: Create Advanced Settings Component (45 minutes)

#### Create AdvancedSettings Component
- [ ] Create `src/components/export/AdvancedSettings.js`
  ```javascript
  import React from 'react';
  import './AdvancedSettings.css';
  
  const AdvancedSettings = ({ settings, onChange }) => {
    const handleChange = (field, value) => {
      onChange(prev => ({ ...prev, [field]: value }));
    };
    
    return (
      <div className="advanced-settings">
        <h3>Advanced Settings</h3>
        
        <div className="settings-grid">
          <div className="setting-group">
            <label>Video Codec</label>
            <select 
              value={settings.videoCodec}
              onChange={(e) => handleChange('videoCodec', e.target.value)}
            >
              <option value="libx264">H.264 (libx264)</option>
              <option value="libx265">H.265 (libx265)</option>
              <option value="libvpx">VP8 (libvpx)</option>
              <option value="libvpx-vp9">VP9 (libvpx-vp9)</option>
            </select>
          </div>
          
          <div className="setting-group">
            <label>Audio Codec</label>
            <select 
              value={settings.audioCodec}
              onChange={(e) => handleChange('audioCodec', e.target.value)}
            >
              <option value="aac">AAC</option>
              <option value="mp3">MP3</option>
              <option value="libvorbis">Vorbis</option>
            </select>
          </div>
          
          <div className="setting-group">
            <label>Encoding Preset</label>
            <select 
              value={settings.preset}
              onChange={(e) => handleChange('preset', e.target.value)}
            >
              <option value="ultrafast">Ultrafast</option>
              <option value="superfast">Superfast</option>
              <option value="veryfast">Veryfast</option>
              <option value="faster">Faster</option>
              <option value="fast">Fast</option>
              <option value="medium">Medium</option>
              <option value="slow">Slow</option>
              <option value="slower">Slower</option>
              <option value="veryslow">Veryslow</option>
            </select>
          </div>
          
          <div className="setting-group">
            <label>Framerate</label>
            <select 
              value={settings.framerate}
              onChange={(e) => handleChange('framerate', e.target.value)}
            >
              <option value="source">Source (Keep Original)</option>
              <option value="24">24 fps</option>
              <option value="25">25 fps</option>
              <option value="30">30 fps</option>
              <option value="60">60 fps</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          
          {settings.framerate === 'custom' && (
            <div className="setting-group">
              <label>Custom Framerate</label>
              <input 
                type="number"
                value={settings.customFramerate}
                onChange={(e) => handleChange('customFramerate', parseInt(e.target.value))}
                min="1"
                max="120"
                step="0.1"
              />
            </div>
          )}
          
          <div className="setting-group">
            <label>Pixel Format</label>
            <select 
              value={settings.pixelFormat}
              onChange={(e) => handleChange('pixelFormat', e.target.value)}
            >
              <option value="yuv420p">YUV 4:2:0 (yuv420p)</option>
              <option value="yuv422p">YUV 4:2:2 (yuv422p)</option>
              <option value="yuv444p">YUV 4:4:4 (yuv444p)</option>
              <option value="rgb24">RGB 24-bit (rgb24)</option>
            </select>
          </div>
        </div>
        
        <div className="file-settings">
          <h4>File Settings</h4>
          <div className="setting-group">
            <label>Filename</label>
            <input 
              type="text"
              value={settings.filename}
              onChange={(e) => handleChange('filename', e.target.value)}
              placeholder="exported_video"
            />
          </div>
          <div className="setting-group">
            <label>
              <input 
                type="checkbox"
                checked={settings.includeTimestamp}
                onChange={(e) => handleChange('includeTimestamp', e.target.checked)}
              />
              Include timestamp in filename
            </label>
          </div>
        </div>
      </div>
    );
  };
  
  export default AdvancedSettings;
  ```

#### Create AdvancedSettings Styles
- [ ] Create `src/components/export/AdvancedSettings.css`
  ```css
  .advanced-settings {
    margin-bottom: var(--space-lg);
  }
  
  .advanced-settings h3 {
    margin-bottom: var(--space-md);
    color: var(--color-text-primary);
  }
  
  .settings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-md);
    margin-bottom: var(--space-lg);
  }
  
  .file-settings {
    padding: var(--space-md);
    background: var(--color-surface-hover);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
  }
  
  .file-settings h4 {
    margin-bottom: var(--space-md);
    color: var(--color-text-primary);
    font-size: 14px;
  }
  
  .setting-group {
    margin-bottom: var(--space-md);
  }
  
  .setting-group label {
    display: block;
    margin-bottom: var(--space-xs);
    color: var(--color-text-secondary);
    font-size: 14px;
  }
  
  .setting-group select,
  .setting-group input[type="text"],
  .setting-group input[type="number"] {
    width: 100%;
    padding: var(--space-sm);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-surface);
    color: var(--color-text-primary);
    font-size: 14px;
  }
  
  .setting-group input[type="checkbox"] {
    margin-right: var(--space-xs);
  }
  
  .setting-group select:focus,
  .setting-group input:focus {
    outline: none;
    border-color: var(--color-primary);
  }
  ```

#### Test Advanced Settings
- [ ] Test codec selection
- [ ] Test preset selection
- [ ] Test framerate options
- [ ] Test pixel format selection
- [ ] Test file settings

**Checkpoint:** Advanced settings component working ✓

**Commit:** `feat(export): create AdvancedSettings component`

---

### 3.2: Integrate Modal with ExportPanel (30 minutes)

#### Update ExportPanel
- [ ] Modify `src/components/ExportPanel.js`
  ```javascript
  import React, { useState } from 'react';
  import { useProject } from '../context/ProjectContext';
  import { useUI } from '../context/UIContext';
  import ExportSettingsModal from './export/ExportSettingsModal';
  import './ExportPanel.css';
  
  const ExportPanel = () => {
    const { selectedClip, exportSettings } = useProject();
    const { showModal } = useUI();
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    
    const handleExport = async () => {
      if (!selectedClip) return;
      
      setIsExporting(true);
      setExportProgress(0);
      
      try {
        const result = await window.electronAPI.exportVideo({
          inputPath: selectedClip.path,
          outputPath: await window.electronAPI.showSaveDialog({
            defaultPath: `${exportSettings.filename}.${exportSettings.format}`,
            filters: [
              { name: 'Video Files', extensions: [exportSettings.format] }
            ]
          }),
          settings: exportSettings
        });
        
        if (result.success) {
          // Show success message
        } else {
          // Show error message
        }
      } catch (error) {
        // Handle error
      } finally {
        setIsExporting(false);
        setExportProgress(0);
      }
    };
    
    const handleOpenSettings = () => {
      showModal('exportSettings');
    };
    
    return (
      <div className="export-panel">
        <div className="export-header">
          <h3>Export Video</h3>
          <button 
            className="settings-button"
            onClick={handleOpenSettings}
            title="Export Settings"
          >
            ⚙️
          </button>
        </div>
        
        {selectedClip ? (
          <div className="export-content">
            <div className="clip-info">
              <div className="clip-name">{selectedClip.name}</div>
              <div className="clip-duration">
                {formatTime(selectedClip.duration)}
              </div>
            </div>
            
            <div className="export-settings-summary">
              <div className="setting-item">
                <span>Format:</span>
                <span>{exportSettings.format.toUpperCase()}</span>
              </div>
              <div className="setting-item">
                <span>Resolution:</span>
                <span>{exportSettings.resolution}</span>
              </div>
              <div className="setting-item">
                <span>Quality:</span>
                <span>{exportSettings.quality}</span>
              </div>
            </div>
            
            <button 
              className="export-button"
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? `Exporting... ${exportProgress}%` : 'Export Video'}
            </button>
            
            {isExporting && (
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="no-clip-message">
            Select a clip to export
          </div>
        )}
        
        <ExportSettingsModal 
          isOpen={false} // Controlled by UIContext
          onClose={() => {}} // Handled by UIContext
          onApply={(settings) => {
            // Settings already updated in context
          }}
        />
      </div>
    );
  };
  
  export default ExportPanel;
  ```

#### Test Integration
- [ ] Test settings button opens modal
- [ ] Test settings summary display
- [ ] Test export with custom settings

**Checkpoint:** Modal integrated with ExportPanel ✓

**Commit:** `feat(export): integrate ExportSettingsModal with ExportPanel`

---

## Phase 4: FFmpeg Integration (1 hour)

### 4.1: Enhance Video Processing (30 minutes)

#### Update videoProcessing.js
- [ ] Modify `electron/ffmpeg/videoProcessing.js`
  ```javascript
  const ffmpeg = require('fluent-ffmpeg');
  const path = require('path');
  
  // ... existing code ...
  
  function buildFFmpegCommand(inputPath, outputPath, settings, trimData = null) {
    const command = ffmpeg(inputPath);
    
    // Apply trim if specified
    if (trimData && trimData.inPoint > 0) {
      command.seekInput(trimData.inPoint);
    }
    if (trimData && trimData.outPoint > 0) {
      command.duration(trimData.outPoint - trimData.inPoint);
    }
    
    // Set output format
    command.format(settings.format);
    
    // Set video codec and quality
    command.videoCodec(settings.videoCodec);
    if (settings.videoBitrate) {
      command.addOption(`-b:v ${settings.videoBitrate}`);
    }
    if (settings.preset) {
      command.addOption(`-preset ${settings.preset}`);
    }
    
    // Set audio codec and quality
    command.audioCodec(settings.audioCodec);
    if (settings.audioBitrate) {
      command.addOption(`-b:a ${settings.audioBitrate}`);
    }
    
    // Set resolution
    if (settings.resolution === 'custom') {
      command.size(`${settings.customWidth}x${settings.customHeight}`);
    } else {
      const resolutionMap = {
        '4k': '3840x2160',
        '1080p': '1920x1080',
        '720p': '1280x720',
        '480p': '854x480'
      };
      command.size(resolutionMap[settings.resolution]);
    }
    
    // Set framerate
    if (settings.framerate !== 'source') {
      command.fps(parseInt(settings.framerate));
    }
    
    // Set pixel format
    command.addOption(`-pix_fmt ${settings.pixelFormat}`);
    
    return command.output(outputPath);
  }
  
  async function exportVideoWithSettings(inputPath, outputPath, settings, trimData = null) {
    return new Promise((resolve, reject) => {
      const command = buildFFmpegCommand(inputPath, outputPath, settings, trimData);
      
      command
        .on('start', (cmd) => {
          console.log('FFmpeg command:', cmd);
        })
        .on('progress', (progress) => {
          // Send progress to renderer
          if (global.mainWindow) {
            global.mainWindow.webContents.send('export-progress', {
              percent: progress.percent || 0,
              currentTime: progress.timemark
            });
          }
        })
        .on('end', () => {
          console.log('Export completed successfully');
          resolve({ success: true, outputPath });
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          reject(new Error(`Export failed: ${err.message}`));
        })
        .run();
    });
  }
  
  module.exports = {
    // ... existing exports ...
    exportVideoWithSettings,
    buildFFmpegCommand
  };
  ```

#### Update IPC Handler
- [ ] Modify `main.js`
  ```javascript
  const { exportVideoWithSettings } = require('./electron/ffmpeg/videoProcessing');
  
  ipcMain.handle('export-video', async (event, { inputPath, outputPath, settings, trimData }) => {
    try {
      const result = await exportVideoWithSettings(inputPath, outputPath, settings, trimData);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  ```

#### Test FFmpeg Integration
- [ ] Test with different presets
- [ ] Test with custom settings
- [ ] Test with trim data
- [ ] Test progress tracking

**Checkpoint:** FFmpeg integration working ✓

**Commit:** `feat(export): enhance FFmpeg integration with custom settings`

---

### 4.2: Add Settings Validation (15 minutes)

#### Create Settings Validation
- [ ] Add validation to `src/utils/exportSettings.js`
  ```javascript
  export function validateExportSettings(settings) {
    const errors = [];
    
    // Validate resolution
    if (settings.resolution === 'custom') {
      if (settings.customWidth < 1 || settings.customHeight < 1) {
        errors.push('Custom resolution must have positive dimensions');
      }
      if (settings.customWidth > 7680 || settings.customHeight > 4320) {
        errors.push('Resolution too high (max 8K)');
      }
      if (settings.customWidth % 2 !== 0 || settings.customHeight % 2 !== 0) {
        errors.push('Resolution dimensions must be even numbers');
      }
    }
    
    // Validate bitrates
    const videoBitrate = parseBitrate(settings.videoBitrate);
    const audioBitrate = parseBitrate(settings.audioBitrate);
    
    if (videoBitrate < 100) {
      errors.push('Video bitrate too low (min 100k)');
    }
    if (videoBitrate > 100000) {
      errors.push('Video bitrate too high (max 100M)');
    }
    if (audioBitrate < 64) {
      errors.push('Audio bitrate too low (min 64k)');
    }
    if (audioBitrate > 320) {
      errors.push('Audio bitrate too high (max 320k)');
    }
    
    // Validate framerate
    if (settings.framerate !== 'source' && settings.customFramerate < 1) {
      errors.push('Framerate must be positive');
    }
    if (settings.framerate !== 'source' && settings.customFramerate > 120) {
      errors.push('Framerate too high (max 120 fps)');
    }
    
    // Validate codec combinations
    if (settings.format === 'webm' && settings.videoCodec !== 'libvpx' && settings.videoCodec !== 'libvpx-vp9') {
      errors.push('WebM format requires VP8 or VP9 video codec');
    }
    if (settings.format === 'webm' && settings.audioCodec !== 'libvorbis') {
      errors.push('WebM format requires Vorbis audio codec');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  function parseBitrate(bitrateString) {
    const match = bitrateString.match(/(\d+)([km]?)/i);
    if (!match) return 0;
    
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    
    switch (unit) {
      case 'k': return value;
      case 'm': return value * 1000;
      default: return value;
    }
  }
  ```

#### Add Validation to Modal
- [ ] Update `ExportSettingsModal.js`
  ```javascript
  import { validateExportSettings } from '../../utils/exportSettings';
  
  const ExportSettingsModal = ({ isOpen, onClose, onApply }) => {
    // ... existing code ...
    
    const validation = validateExportSettings(localSettings);
    
    const handleSave = () => {
      if (!validation.valid) {
        // Show validation errors
        return;
      }
      
      updateExportSettings(localSettings);
      onApply(localSettings);
      closeModal();
    };
    
    return (
      <div className="export-settings-modal-overlay">
        {/* ... existing JSX ... */}
        
        {!validation.valid && (
          <div className="validation-errors">
            <h4>Please fix the following errors:</h4>
            <ul>
              {validation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="modal-footer">
          <button className="btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
          <button 
            className="btn-primary" 
            onClick={handleSave}
            disabled={!validation.valid}
          >
            Apply Settings
          </button>
        </div>
      </div>
    );
  };
  ```

#### Test Validation
- [ ] Test valid settings
- [ ] Test invalid settings
- [ ] Test edge cases
- [ ] Test error display

**Checkpoint:** Settings validation working ✓

**Commit:** `feat(export): add comprehensive settings validation`

---

## Testing Phase (1 hour)

### Unit Tests
- [ ] Test export settings context
  - [ ] Test default settings
  - [ ] Test settings update
  - [ ] Test preset loading
- [ ] Test file size estimation
  - [ ] Test with different bitrates
  - [ ] Test with different durations
  - [ ] Test format conversion
- [ ] Test settings validation
  - [ ] Test valid settings
  - [ ] Test invalid settings
  - [ ] Test edge cases

### Integration Tests
- [ ] Test modal opening/closing
- [ ] Test settings persistence
- [ ] Test preset application
- [ ] Test export with custom settings
- [ ] Test file size estimation updates

### Manual Testing
- [ ] Test all preset configurations
- [ ] Test custom settings
- [ ] Test validation error display
- [ ] Test responsive design
- [ ] Test keyboard navigation

### Performance Testing
- [ ] Modal open time < 200ms
- [ ] Settings update < 50ms
- [ ] File size calculation < 10ms
- [ ] Export with custom settings < 2x video duration

---

## Bug Fixing (If needed)

### Bug #1: [Title]
- [ ] Reproduced
- [ ] Root cause identified
- [ ] Fix implemented
- [ ] Tested
- [ ] Documented in bug analysis doc

---

## Documentation Phase (30 minutes)

- [ ] JSDoc comments added to all functions
- [ ] README updated with export settings
- [ ] API reference updated
- [ ] Complete summary written
- [ ] PR_PARTY README updated
- [ ] Memory bank updated

---

## Deployment Phase (30 minutes)

### Pre-Deploy Checklist
- [ ] All tests passing
- [ ] No console errors
- [ ] Build successful locally
- [ ] Export settings working in packaged app

### Deploy to Staging
- [ ] Build: `npm run build`
- [ ] Package: `npm run package`
- [ ] Test packaged app
- [ ] Verify all settings work

### Deploy to Production
- [ ] Deploy to production
- [ ] Verify production works
- [ ] Monitor for errors (24 hours)

---

## Completion Checklist

- [ ] All phases complete
- [ ] All tests passing
- [ ] Performance targets met
- [ ] No critical bugs
- [ ] Documentation complete
- [ ] Deployed to production
- [ ] Complete summary written
- [ ] PR_PARTY README updated
- [ ] Memory bank updated
- [ ] Branch merged
- [ ] Celebration! 🎉
