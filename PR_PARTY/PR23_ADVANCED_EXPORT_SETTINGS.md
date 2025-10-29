# PR#23: Advanced Export Settings

**Estimated Time:** 4-6 hours  
**Complexity:** MEDIUM  
**Dependencies:** PR #11 (State Management Refactor), PR #12 (UI Component Library), PR #13 (Professional Timeline), PR #14 (Drag & Drop), PR #15 (Split & Delete), PR #16 (Undo/Redo)

---

## Overview

### What We're Building
Advanced export settings that give users professional control over video output quality, resolution, format, and encoding options. This transforms ClipForge from a basic "export MP4" tool into a professional video editor with customizable export capabilities.

### Why It Matters
Professional video editors need control over output quality and format. Current ClipForge only exports basic MP4 with default settings. Advanced export settings enable:
- Quality control for different use cases (web, broadcast, archival)
- Resolution selection (4K, 1080p, 720p, custom)
- Format options (MP4, MOV, WebM)
- Encoding presets (fast, balanced, high quality)
- Bitrate control for file size optimization
- Audio quality settings

### Success in One Sentence
"This PR is successful when users can customize video export quality, resolution, format, and encoding settings with professional presets and real-time file size estimates."

---

## Technical Design

### Architecture Decisions

#### Decision 1: Export Settings UI Location
**Options Considered:**
1. Modal dialog - Full-screen settings with preview
2. Sidebar panel - Always visible, compact
3. Expandable section in ExportPanel - Integrated workflow

**Chosen:** Modal dialog with expandable sections

**Rationale:**
- Modal provides space for comprehensive settings
- Expandable sections prevent overwhelming UI
- Can show real-time preview and file size estimates
- Matches professional video editor patterns (Premiere, Final Cut)

**Trade-offs:**
- Gain: Professional UX, comprehensive settings
- Lose: One extra click to access settings

#### Decision 2: Settings Storage Strategy
**Options Considered:**
1. Local state only - Reset on app restart
2. localStorage persistence - Remember user preferences
3. Project-level settings - Save with project file

**Chosen:** localStorage persistence with project-level override

**Rationale:**
- Users expect settings to persist between sessions
- Project-level settings allow different presets per project
- localStorage is simple and reliable
- Can upgrade to project files later

**Trade-offs:**
- Gain: User convenience, project flexibility
- Lose: Slightly more complex state management

#### Decision 3: FFmpeg Integration Approach
**Options Considered:**
1. Dynamic command building - Build FFmpeg commands from settings
2. Preset system - Pre-defined FFmpeg command templates
3. Hybrid approach - Presets + custom overrides

**Chosen:** Hybrid approach with presets + custom overrides

**Rationale:**
- Presets provide safe, tested configurations
- Custom overrides allow power users to fine-tune
- Easier to maintain and debug than pure dynamic building
- Can validate settings against FFmpeg capabilities

**Trade-offs:**
- Gain: Flexibility, maintainability, safety
- Lose: More complex preset management

### Data Model

**New Export Settings State:**
```javascript
// In ProjectContext or new ExportContext
const exportSettings = {
  // Basic Settings
  format: 'mp4', // 'mp4', 'mov', 'webm'
  resolution: '1080p', // '4k', '1080p', '720p', '480p', 'custom'
  customWidth: 1920,
  customHeight: 1080,
  
  // Quality Settings
  quality: 'balanced', // 'fast', 'balanced', 'high', 'custom'
  videoBitrate: '5000k', // Custom bitrate
  audioBitrate: '128k',
  
  // Encoding Settings
  videoCodec: 'libx264', // 'libx264', 'libx265', 'libvpx'
  audioCodec: 'aac', // 'aac', 'mp3', 'libvorbis'
  preset: 'medium', // FFmpeg preset
  
  // Advanced Settings
  framerate: 'source', // 'source', '24', '25', '30', '60'
  customFramerate: 30,
  pixelFormat: 'yuv420p',
  
  // File Settings
  filename: 'exported_video',
  includeTimestamp: true,
  
  // UI State
  showAdvanced: false,
  lastUsed: Date.now()
};
```

**Preset Definitions:**
```javascript
const exportPresets = {
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

### API Design

**New Functions:**
```javascript
/**
 * Get current export settings with defaults
 * @returns {Object} Current export settings
 */
export function getExportSettings() {
  // Load from localStorage or return defaults
}

/**
 * Update export settings
 * @param {Object} settings - New settings to apply
 * @param {boolean} persist - Whether to save to localStorage
 */
export function updateExportSettings(settings, persist = true) {
  // Update state and optionally persist
}

/**
 * Get FFmpeg command for current settings
 * @param {string} inputPath - Input video path
 * @param {string} outputPath - Output video path
 * @param {Object} settings - Export settings
 * @returns {string} FFmpeg command string
 */
export function buildFFmpegCommand(inputPath, outputPath, settings) {
  // Build FFmpeg command from settings
}

/**
 * Estimate file size for export
 * @param {number} duration - Video duration in seconds
 * @param {Object} settings - Export settings
 * @returns {Object} Size estimate {size: number, unit: string}
 */
export function estimateFileSize(duration, settings) {
  // Calculate estimated file size
}

/**
 * Validate export settings
 * @param {Object} settings - Settings to validate
 * @returns {Object} Validation result {valid: boolean, errors: string[]}
 */
export function validateExportSettings(settings) {
  // Validate settings against FFmpeg capabilities
}
```

### Component Hierarchy
```
ExportPanel/
├── ExportSettingsModal (new)
│   ├── BasicSettings
│   │   ├── FormatSelector
│   │   ├── ResolutionSelector
│   │   └── QualitySelector
│   ├── AdvancedSettings (collapsible)
│   │   ├── VideoSettings
│   │   ├── AudioSettings
│   │   └── EncodingSettings
│   ├── PresetSelector
│   ├── FileSizeEstimator
│   └── ActionButtons
└── ExportButton (enhanced)
    └── SettingsIcon
```

---

## Implementation Details

### File Structure
**New Files:**
```
src/
├── components/
│   └── export/
│       ├── ExportSettingsModal.js (~300 lines)
│       ├── ExportSettingsModal.css (~200 lines)
│       ├── BasicSettings.js (~150 lines)
│       ├── AdvancedSettings.js (~200 lines)
│       ├── PresetSelector.js (~100 lines)
│       └── FileSizeEstimator.js (~80 lines)
├── context/
│   └── ExportContext.js (~200 lines)
├── utils/
│   ├── exportSettings.js (~150 lines)
│   ├── ffmpegPresets.js (~100 lines)
│   └── fileSizeEstimator.js (~80 lines)
└── hooks/
    └── useExportSettings.js (~100 lines)
```

**Modified Files:**
- `src/components/ExportPanel.js` (+50/-10 lines) - Add settings modal trigger
- `src/context/ProjectContext.js` (+30/-5 lines) - Add export settings state
- `electron/ffmpeg/videoProcessing.js` (+100/-20 lines) - Enhanced export with settings

### Key Implementation Steps

#### Phase 1: Export Settings Foundation (1.5 hours)
1. Create ExportContext with settings state
2. Implement localStorage persistence
3. Create basic settings management functions
4. Add settings to ProjectContext

#### Phase 2: UI Components (2 hours)
1. Create ExportSettingsModal component
2. Implement BasicSettings (format, resolution, quality)
3. Add PresetSelector with predefined options
4. Create FileSizeEstimator component

#### Phase 3: Advanced Settings (1.5 hours)
1. Implement AdvancedSettings collapsible section
2. Add video/audio bitrate controls
3. Add codec selection
4. Add framerate and pixel format options

#### Phase 4: FFmpeg Integration (1 hour)
1. Enhance videoProcessing.js with settings support
2. Implement preset-based command building
3. Add settings validation
4. Update export progress tracking

### Code Examples

**Example 1: Export Settings Context**
```javascript
// src/context/ExportContext.js
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
    // Persist to localStorage
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
```

**Example 2: FFmpeg Command Building**
```javascript
// src/utils/exportSettings.js
export function buildFFmpegCommand(inputPath, outputPath, settings) {
  const command = ffmpeg(inputPath);
  
  // Apply trim if specified
  if (settings.trimStart > 0) {
    command.seekInput(settings.trimStart);
  }
  if (settings.trimEnd > 0) {
    command.duration(settings.trimEnd - settings.trimStart);
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
```

**Example 3: File Size Estimation**
```javascript
// src/utils/fileSizeEstimator.js
export function estimateFileSize(duration, settings) {
  const videoBitrate = parseBitrate(settings.videoBitrate);
  const audioBitrate = parseBitrate(settings.audioBitrate);
  const totalBitrate = videoBitrate + audioBitrate;
  
  // Convert to bytes per second
  const bytesPerSecond = totalBitrate / 8;
  
  // Calculate total size
  const totalBytes = bytesPerSecond * duration;
  
  // Convert to human readable format
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

---

## Testing Strategy

### Test Categories

**Unit Tests:**
- Export settings validation functions
- FFmpeg command building logic
- File size estimation calculations
- Preset loading and application

**Integration Tests:**
- Settings persistence in localStorage
- Modal opening/closing with settings
- Export with different preset configurations
- Settings validation with invalid inputs

**Edge Cases:**
- Very high bitrate settings
- Unsupported codec combinations
- Custom resolution validation
- Large file size estimates

**Performance Tests:**
- Modal opening time < 200ms
- Settings update response < 50ms
- File size calculation < 10ms

---

## Success Criteria

**Feature is complete when:**
- [ ] Export settings modal opens from ExportPanel
- [ ] Basic settings (format, resolution, quality) work
- [ ] Advanced settings (bitrate, codec) are functional
- [ ] Preset system loads and applies correctly
- [ ] File size estimation is accurate (±10%)
- [ ] Settings persist between app sessions
- [ ] FFmpeg commands use custom settings
- [ ] All settings validate correctly
- [ ] UI is responsive and professional
- [ ] Export works with all preset configurations

**Performance Targets:**
- Modal open time: < 200ms
- Settings update: < 50ms
- File size calculation: < 10ms
- Export with custom settings: < 2x video duration

**Quality Gates:**
- Zero critical bugs
- All presets produce valid exports
- Settings validation prevents invalid configurations
- UI matches professional video editor standards

---

## Risk Assessment

### Risk 1: FFmpeg Command Complexity
**Likelihood:** MEDIUM  
**Impact:** HIGH  
**Mitigation:** Use preset system with tested configurations, validate commands before execution  
**Status:** 🟡

### Risk 2: Settings State Management
**Likelihood:** LOW  
**Impact:** MEDIUM  
**Mitigation:** Use proven Context API pattern, comprehensive testing  
**Status:** 🟢

### Risk 3: File Size Estimation Accuracy
**Likelihood:** MEDIUM  
**Impact:** LOW  
**Mitigation:** Use conservative estimates, test with various video types  
**Status:** 🟡

### Risk 4: UI Complexity
**Likelihood:** LOW  
**Impact:** MEDIUM  
**Mitigation:** Use expandable sections, clear labeling, progressive disclosure  
**Status:** 🟢

---

## Open Questions

1. **Question 1:** Should we support custom FFmpeg filters?
   - Option A: Yes, add advanced filter UI
   - Option B: No, keep it simple for MVP
   - Decision needed by: Phase 2

2. **Question 2:** How many presets should we include?
   - Option A: 3-4 essential presets
   - Option B: 8-10 comprehensive presets
   - Decision needed by: Phase 1

---

## Timeline

**Total Estimate:** 4-6 hours

| Phase | Task | Time | Status |
|-------|------|------|--------|
| 1 | Export Settings Foundation | 1.5h | ⏳ |
| 2 | UI Components | 2h | ⏳ |
| 3 | Advanced Settings | 1.5h | ⏳ |
| 4 | FFmpeg Integration | 1h | ⏳ |

---

## Dependencies

**Requires:**
- [ ] PR #11 complete (State Management Refactor)
- [ ] PR #12 complete (UI Component Library)
- [ ] PR #13 complete (Professional Timeline)
- [ ] PR #14 complete (Drag & Drop)
- [ ] PR #15 complete (Split & Delete)
- [ ] PR #16 complete (Undo/Redo)

**Blocks:**
- PR #24 (Export Presets) - waiting on this
- PR #25 (Cloud Upload Integration) - waiting on this

---

## References

- Related PR: [#24] Export Presets
- FFmpeg documentation: [link]
- Professional video editor UX patterns: [link]
- File size estimation algorithms: [link]
