# PR#4: FFmpeg Integration & Export

**Estimated Time:** 4 hours  
**Complexity:** HIGH  
**Priority:** CRITICAL - Day 1, Hours 13-16  
**Branch:** `feat/ffmpeg-export`  
**Dependencies:** PR #1 (Project Setup)

---

## Overview

### What We're Building
Set up FFmpeg integration with Electron and implement basic MP4 export functionality. This feature enables exporting the current video clip to MP4 format, which is the culmination of the entire editing pipeline.

### Why It Matters
Export functionality is the most critical high-risk item in the MVP. Without working export, the entire editing workflow is useless. This must work by the end of Day 1 to validate that the core pipeline is functional. If export doesn't work by end of Day 1, we must pivot immediately or the MVP deadline becomes impossible.

### Success in One Sentence
"This PR is successful when I can click 'Export' and generate a valid, playable MP4 file from the current video clip."

---

## Technical Design

### Architecture Decisions

#### Decision 1: FFmpeg Integration Approach
**Options Considered:**
1. **Option A:** Use `fluent-ffmpeg` (high-level JavaScript API)
   - Pros: Simple API, well-documented, handles cross-platform binary paths
   - Cons: Limited fine-grained control, additional dependency

2. **Option B:** Use FFmpeg directly via child process
   - Pros: Full control, direct access to all FFmpeg features
   - Cons: Complex command construction, more error-prone

**Chosen:** Option A - `fluent-ffmpeg`

**Rationale:**
- Simpler API reduces development time
- Handles binary path resolution automatically
- Built-in progress reporting
- Less code to maintain and debug
- Well-tested library used by thousands of projects

**Trade-offs:**
- ✅ Gain: Simpler code, faster development
- ⚠️ Lose: Slightly less control over encoding parameters (acceptable for MVP)

#### Decision 2: FFmpeg Binary Distribution
**Options Considered:**
1. **Option A:** Bundle static binaries with app (`ffmpeg-static`, `ffprobe-static`)
   - Pros: Reliable, cross-platform, no external dependencies
   - Cons: Increases app size (~30MB each binary)

2. **Option B:** Require user to install FFmpeg system-wide
   - Pros: Smaller app size
   - Cons: Poor user experience, complex installation

**Chosen:** Option A - Static binaries

**Rationale:**
- Better user experience (works out of box)
- Reliable in packaged app (no PATH issues)
- Worth the file size for MVP
- Can optimize later by stripping unused features

**Trade-offs:**
- ✅ Gain: Better UX, more reliable
- ⚠️ Lose: Larger app bundle (~60MB total for binaries)

#### Decision 3: Export Process Location
**Options Considered:**
1. **Option A:** Run FFmpeg in main process
   - Pros: Full Node.js access, file system permissions, proper IPC
   - Cons: Blocks main process during export (unless using web workers, complex)

2. **Option B:** Run FFmpeg in renderer process
   - Pros: UI responsiveness
   - Cons: Context isolation limits, IPC complexity, memory usage

**Chosen:** Option A - Main process

**Rationale:**
- Main process has full Node.js file system access
- Cleaner IPC communication
- Can use async callbacks for progress updates
- Electron best practice for heavy operations

**Trade-offs:**
- ✅ Gain: Simpler architecture, full file access
- ⚠️ Lose: Need proper async handling to avoid blocking

#### Decision 4: Progress Reporting
**Options Considered:**
1. **Option A:** IPC events for progress updates
   - Pros: Real-time feedback, good UX
   - Cons: Some complexity in wiring up events

2. **Option B:** Blocking export, no progress
   - Pros: Simpler implementation
   - Cons: Bad UX, user doesn't know if it's working

**Chosen:** Option A - IPC progress events

**Rationale:**
- Better user experience (know export is progressing)
- Standard Electron pattern
- Worth the extra complexity

**Trade-offs:**
- ✅ Gain: Better UX, professional feel
- ⚠️ Lose: Slightly more complex IPC setup

### Data Model

**No new collections** - Using existing clip data structure:

```javascript
// Existing clip structure from PR #2
{
  id: string,        // Unique identifier
  name: string,      // File name
  path: string,      // Full file path
  duration: number   // Video duration in seconds
}

// New export state (added to App.js)
{
  isExporting: boolean,    // Export in progress flag
  exportProgress: number,  // 0-100 percentage
  exportStatus: string,    // Current status message
  exportError: string | null  // Error message if failed
}
```

**Export Configuration:**
```javascript
// Parameters passed to export function
{
  inputPath: string,    // Source video path
  outputPath: string,   // Destination path
  startTime: number,    // Trim start (seconds, for PR #6)
  duration: number,     // Trim duration (for PR #6)
}
```

### API Design

**New IPC Handlers (main.js):**
```javascript
/**
 * Handle video export request from renderer
 * @param {Object} exportData - {inputPath, outputPath, trimData}
 * @returns {Promise<Object>} {success, outputPath, error}
 */
ipcMain.handle('export-video', async (event, exportData) => {
  // Main process export logic
});

/**
 * Listen for export progress updates
 * @param {Object} progress - {percent, timemark}
 */
ipcMain.on('export-progress', (event, progress) => {
  // Send progress to renderer
  event.sender.send('export-progress-update', progress);
});
```

**Preload API (preload.js):**
```javascript
/**
 * Initiate video export
 * @param {string} inputPath - Source video path
 * @param {string} outputPath - Destination path
 * @param {Object} trimData - {startTime, duration}
 * @returns {Promise<{success, outputPath, error}>}
 */
window.electronAPI.exportVideo(inputPath, outputPath, trimData);

/**
 * Subscribe to export progress updates
 * @param {Function} callback - Progress callback
 * @returns {Function} Unsubscribe function
 */
window.electronAPI.onExportProgress(callback);
```

**Export Processing Module (electron/ffmpeg/videoProcessing.js):**
```javascript
/**
 * Export video using FFmpeg
 * @param {string} inputPath - Source video file
 * @param {string} outputPath - Destination file
 * @param {Object} options - {startTime, duration, onProgress}
 * @returns {Promise<string>} Output file path
 */
async function exportVideo(inputPath, outputPath, options = {}) {
  // FFmpeg processing logic
}

/**
 * Get video metadata (duration, resolution, etc.)
 * @param {string} videoPath - Path to video file
 * @returns {Promise<Object>} Metadata object
 */
async function getVideoMetadata(videoPath) {
  // ffprobe logic
}
```

### Component Hierarchy
```
App.js
├── ExportPanel.js
│   ├── Export button (triggers IPC)
│   ├── Progress indicator
│   └── Status messages
└── VideoPlayer.js
    └── (provides current video for export)
```

---

## Implementation Details

### File Structure
**New Files:**
```
electron/
└── ffmpeg/
    └── videoProcessing.js           (~150 lines)
        - FFmpeg command construction
        - Progress event handling
        - Error handling

src/
└── components/
    ├── ExportPanel.js              (~200 lines)
    │   - Export button
    │   - Progress display
    │   - Status messages
    └── styles/
        └── ExportPanel.css          (~80 lines)

public/
└── icon.png                         (app icon)
```

**Modified Files:**
- `main.js` (+80 lines) - IPC handlers for export
- `preload.js` (+30 lines) - Export API exposure
- `src/App.js` (+50 lines) - Export state management
- `package.json` (+5 lines) - FFmpeg dependencies

### Key Implementation Steps

#### Phase 1: FFmpeg Setup (1 hour)

**Step 1.1: Install Dependencies**
```bash
npm install fluent-ffmpeg ffmpeg-static ffprobe-static
```

**Step 1.2: Create Video Processing Module**
```javascript
// electron/ffmpeg/videoProcessing.js

const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const ffprobePath = require('ffprobe-static').path;

// Configure FFmpeg paths
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

/**
 * Export video to MP4
 */
async function exportVideo(inputPath, outputPath, options = {}) {
  return new Promise((resolve, reject) => {
    const { startTime, duration, onProgress } = options;
    
    let command = ffmpeg(inputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .outputOptions(['-preset fast', '-crf 23']);

    // Apply trim if specified
    if (startTime && startTime > 0) {
      command = command.setStartTime(startTime);
    }
    
    if (duration && duration > 0) {
      command = command.setDuration(duration);
    }

    command
      .on('progress', (progress) => {
        if (onProgress) {
          onProgress({
            percent: progress.percent || 0,
            timemark: progress.timemark || ''
          });
        }
      })
      .on('end', () => {
        resolve(outputPath);
      })
      .on('error', (err) => {
        reject(new Error(`FFmpeg error: ${err.message}`));
      })
      .save(outputPath);
  });
}

module.exports = { exportVideo };
```

**Step 1.3: Test FFmpeg Setup**
```javascript
// Simple test to verify FFmpeg works
const { exportVideo } = require('./electron/ffmpeg/videoProcessing');

exportVideo('test.mp4', 'output.mp4')
  .then(() => console.log('Export successful'))
  .catch(err => console.error('Export failed:', err));
```

**Checkpoint:** FFmpeg configured and basic export works

---

#### Phase 2: IPC Integration (1 hour)

**Step 2.1: Add IPC Handler in Main Process**

```javascript
// main.js additions

const { exportVideo } = require('./electron/ffmpeg/videoProcessing');
const { dialog } = require('electron');

// Handle export request from renderer
ipcMain.handle('export-video', async (event, { inputPath, outputPath, trimData }) => {
  try {
    await exportVideo(inputPath, outputPath, {
      startTime: trimData?.startTime || 0,
      duration: trimData?.duration,
      onProgress: (progress) => {
        // Send progress to renderer
        event.sender.send('export-progress-update', progress);
      }
    });
    
    return { success: true, outputPath };
  } catch (error) {
    console.error('Export error:', error);
    return { success: false, error: error.message };
  }
});

// Handle save dialog for export file
ipcMain.handle('show-save-dialog', async () => {
  const result = await dialog.showSaveDialog({
    filters: [{ name: 'Video', extensions: ['mp4'] }],
    defaultPath: 'export.mp4'
  });
  
  if (result.canceled) {
    return { canceled: true };
  }
  
  return { filePath: result.filePath };
});
```

**Step 2.2: Expose API in Preload**

```javascript
// preload.js additions

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // ... existing APIs ...
  
  exportVideo: (inputPath, outputPath, trimData) => 
    ipcRenderer.invoke('export-video', { inputPath, outputPath, trimData }),
  
  showSaveDialog: () => 
    ipcRenderer.invoke('show-save-dialog'),
  
  onExportProgress: (callback) => {
    const handler = (event, progress) => callback(progress);
    ipcRenderer.on('export-progress-update', handler);
    
    // Return unsubscribe function
    return () => ipcRenderer.removeListener('export-progress-update', handler);
  }
});
```

**Checkpoint:** IPC communication working, can trigger export from renderer

---

#### Phase 3: Export UI Component (1 hour)

**Step 3.1: Create ExportPanel Component**

```javascript
// src/components/ExportPanel.js

import React, { useState, useEffect } from 'react';
import './styles/ExportPanel.css';

const ExportPanel = ({ currentClip }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Subscribe to progress updates
    const unsubscribe = window.electronAPI.onExportProgress((progressData) => {
      setProgress(Math.round(progressData.percent));
      setStatus(`Exporting... ${progressData.percent}%`);
    });

    return () => unsubscribe();
  }, []);

  const handleExport = async () => {
    if (!currentClip) {
      setError('No clip selected');
      return;
    }

    try {
      setIsExporting(true);
      setError(null);
      setStatus('Preparing export...');

      // Show save dialog
      const dialogResult = await window.electronAPI.showSaveDialog();
      
      if (dialogResult.canceled) {
        setIsExporting(false);
        setStatus('');
        return;
      }

      setStatus('Exporting video...');
      const result = await window.electronAPI.exportVideo(
        currentClip.path,
        dialogResult.filePath,
        {} // No trim data yet (PR #6)
      );

      if (result.success) {
        setStatus(`✅ Exported to ${result.outputPath}`);
        setProgress(100);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message);
      setStatus('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="export-panel">
      <h3>Export</h3>
      
      {error && (
        <div className="export-error">{error}</div>
      )}
      
      {status && (
        <div className="export-status">{status}</div>
      )}
      
      {progress > 0 && progress < 100 && (
        <div className="export-progress">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
      )}
      
      <button 
        className="export-button"
        onClick={handleExport}
        disabled={!currentClip || isExporting}
      >
        {isExporting ? 'Exporting...' : 'Export Video'}
      </button>
    </div>
  );
};

export default ExportPanel;
```

**Step 3.2: Add Styling**

```css
/* src/styles/ExportPanel.css */

.export-panel {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.export-button {
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.export-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.export-button:hover:not(:disabled) {
  background: #0056b3;
}

.export-status {
  margin: 10px 0;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
}

.export-error {
  margin: 10px 0;
  padding: 8px;
  background: #f8d7da;
  color: #721c24;
  border-radius: 4px;
}

.export-progress {
  width: 100%;
  height: 20px;
  background: #e9ecef;
  border-radius: 10px;
  margin: 10px 0;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: #28a745;
  transition: width 0.3s ease;
}
```

**Checkpoint:** Export UI component renders and triggers export

---

#### Phase 4: Integration & Testing (1 hour)

**Step 4.1: Integrate ExportPanel into App**

```javascript
// src/App.js

import ExportPanel from './components/ExportPanel';

function App() {
  const [clips, setClips] = useState([]);
  const [currentClip, setCurrentClip] = useState(null);
  // ... existing state ...

  return (
    <div className="app">
      {/* ... existing components ... */}
      
      <ExportPanel currentClip={currentClip} />
    </div>
  );
}
```

**Step 4.2: Add Export State to App**

```javascript
// src/App.js

const [exportState, setExportState] = useState({
  isExporting: false,
  progress: 0,
  status: '',
  error: null
});

// Pass down export state handlers if needed
```

**Step 4.3: Test Export End-to-End**

Test cases:
1. ✅ Import MP4 file
2. ✅ Click Export button
3. ✅ Choose save location
4. ✅ Verify export starts
5. ✅ Watch progress bar update
6. ✅ Wait for export to complete
7. ✅ Verify output MP4 file exists
8. ✅ Open exported file in VLC/QuickTime
9. ✅ Verify video plays correctly
10. ✅ Verify audio is included

**Checkpoint:** Full export workflow works

---

### Code Examples

**Example 1: Basic Export Flow**

```javascript
// User clicks "Export" button
// → ExportPanel.handleExport() called
// → Show save dialog
// → Get output path from user
// → Call window.electronAPI.exportVideo()
// → IPC to main process
// → FFmpeg starts processing
// → Progress events sent to renderer
// → Export completes
// → Success message shown
```

**Example 2: Error Handling**

```javascript
// If export fails
// → FFmpeg throws error
// → Caught in try/catch
// → Error sent to renderer via IPC
// → Display error message to user
// → Clear export state
```

**Example 3: Progress Updates**

```javascript
// During export
// → FFmpeg emits 'progress' event
// → Main process receives it
// → Sends IPC message to renderer
// → Renderer updates progress bar
// → User sees: "Exporting... 45%"
```

---

## Testing Strategy

### Test Categories

**Unit Tests:**
- `exportVideo()` function with various options
- Error handling for invalid file paths
- Progress callback functionality

**Integration Tests:**
- IPC communication between renderer and main
- Save dialog flow
- FFmpeg binary resolution

**End-to-End Tests:**
- Full export workflow from UI click to file creation
- Verify exported file is valid MP4
- Verify audio sync in exported video

**Error Handling Tests:**
- Invalid input file
- Disk space error
- Permission errors
- FFmpeg binary missing

### Edge Cases

**Large Files:**
- Test with 500MB+ videos
- Verify memory usage acceptable
- Check export time reasonable

**Different Codecs:**
- MP4 with H.264
- MOV with QuickTime codec
- Various audio codecs

**Export Failures:**
- Corrupted input file
- Invalid trim range (will test in PR #6)
- Disk full scenario

---

## Success Criteria

**Feature is complete when:**
- ✅ Can export video to MP4
- ✅ Save dialog appears
- ✅ Progress bar shows during export
- ✅ Exported file is valid and playable
- ✅ Audio is included in export
- ✅ Export handles errors gracefully
- ✅ UI provides feedback throughout process

**Performance Targets:**
- Export completes in reasonable time (<2x video duration)
- No memory leaks during export
- App remains responsive during export

**Quality Gates:**
- Zero critical bugs in export flow
- Error messages are user-friendly
- No console errors during normal export

---

## Risk Assessment

### Risk 1: FFmpeg Binary Path Issues
**Likelihood:** HIGH  
**Impact:** HIGH  
**Mitigation:** Use `ffmpeg-static` to handle path resolution, test in packaged app early  
**Status:** 🟡 MEDIUM - Mitigation strategy in place

### Risk 2: Export Blocking UI
**Likelihood:** MEDIUM  
**Impact:** MEDIUM  
**Mitigation:** Use async callbacks, show loading state, test with long videos  
**Status:** 🟢 LOW - Async pattern implemented

### Risk 3: Invalid Output Files
**Likelihood:** LOW  
**Impact:** HIGH  
**Mitigation:** Test with various input formats, validate output files, handle errors  
**Status:** 🟢 LOW - Comprehensive error handling planned

### Risk 4: Memory Issues with Large Videos
**Likelihood:** MEDIUM  
**Impact:** MEDIUM  
**Mitigation:** Monitor memory usage, test with large files, add memory limits if needed  
**Status:** 🟡 MEDIUM - Will monitor during testing

---

## Open Questions

**None at this time** - Decisions made in planning

---

## Timeline

**Total Estimate:** 4 hours

| Phase | Task | Time | Status |
|-------|------|------|--------|
| 1 | FFmpeg Setup | 1h | ⏳ |
| 2 | IPC Integration | 1h | ⏳ |
| 3 | Export UI | 1h | ⏳ |
| 4 | Integration & Testing | 1h | ⏳ |

**Checkpoint After Each Phase:**
- Phase 1: FFmpeg configured, basic export works
- Phase 2: IPC communication established
- Phase 3: Export UI renders and triggers export
- Phase 4: Full workflow tested and working

---

## Dependencies

**Requires:**
- ✅ PR #1 complete (Electron setup, IPC foundation)
- ✅ File import working (PR #2) to have clips to export
- ✅ Video player working (PR #3) to preview clips

**Blocks:**
- PR #6 (Trim Controls) - needs export to apply trim settings
- PR #9 (Packaging) - needs export working in packaged app

---

## References

- **fluent-ffmpeg docs:** https://github.com/fluent-ffmpeg/node-fluent-ffmpeg
- **FFmpeg encoding guide:** https://trac.ffmpeg.org/wiki/Encode/H.264
- **Electron IPC docs:** https://www.electronjs.org/docs/latest/api/ipc-main
- **Related implementation:** Similar export features in video editors (DaVinci Resolve, Premiere Pro)

---

**Document Status:** ✅ PLANNING COMPLETE  
**Ready to Implement:** YES

