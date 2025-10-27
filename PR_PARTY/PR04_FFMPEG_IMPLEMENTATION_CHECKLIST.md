# PR#4: Implementation Checklist

**Use this as your daily todo list.** Check off items as you complete them.

---

## Pre-Implementation Setup (15 minutes)

- [ ] Read main planning document `PR04_FFMPEG_EXPORT.md` (~30 min)
- [ ] Prerequisites verified:
  - [ ] PR #1 (Project Setup) complete
  - [ ] PR #2 (File Import) working (for testing)
  - [ ] PR #3 (Video Player) working (for testing)
- [ ] Git branch created
  ```bash
  git checkout -b feat/ffmpeg-export
  ```
- [ ] Terminal opened for npm commands
- [ ] Code editor ready

---

## Phase 1: FFmpeg Setup (1 hour)

### 1.1: Install Dependencies (5 minutes)

#### Add FFmpeg Packages
- [ ] Install fluent-ffmpeg
  ```bash
  npm install fluent-ffmpeg
  ```
- [ ] Install ffmpeg-static (static binaries)
  ```bash
  npm install ffmpeg-static
  ```
- [ ] Install ffprobe-static (static binaries)
  ```bash
  npm install ffprobe-static
  ```
- [ ] Verify installation in `package.json`
  ```json
  "dependencies": {
    "fluent-ffmpeg": "^2.1.2",
    "ffmpeg-static": "^5.2.0",
    "ffprobe-static": "^3.1.0"
  }
  ```

**Checkpoint:** Dependencies installed ✓

---

### 1.2: Create Video Processing Module (30 minutes)

#### Create Directory Structure
- [ ] Create `electron/ffmpeg/` directory
  ```bash
  mkdir -p electron/ffmpeg
  ```

#### Create videoProcessing.js
- [ ] Create `electron/ffmpeg/videoProcessing.js`
- [ ] Add FFmpeg imports
  ```javascript
  const ffmpeg = require('fluent-ffmpeg');
  const ffmpegPath = require('ffmpeg-static');
  const ffprobePath = require('ffprobe-static').path;
  ```
- [ ] Configure FFmpeg paths
  ```javascript
  ffmpeg.setFfmpegPath(ffmpegPath);
  ffmpeg.setFfprobePath(ffprobePath);
  ```
- [ ] Create exportVideo function signature
  ```javascript
  async function exportVideo(inputPath, outputPath, options = {}) {
    return new Promise((resolve, reject) => {
      // Implementation
    });
  }
  ```
- [ ] Implement progress callback handling
  ```javascript
  const { startTime, duration, onProgress } = options;
  
  let command = ffmpeg(inputPath)
    .videoCodec('libx264')
    .audioCodec('aac')
    .outputOptions(['-preset fast', '-crf 23']);
  ```
- [ ] Implement trim support
  ```javascript
  if (startTime && startTime > 0) {
    command = command.setStartTime(startTime);
  }
  
  if (duration && duration > 0) {
    command = command.setDuration(duration);
  }
  ```
- [ ] Implement progress event handler
  ```javascript
  command.on('progress', (progress) => {
    if (onProgress) {
      onProgress({
        percent: progress.percent || 0,
        timemark: progress.timemark || ''
      });
    }
  });
  ```
- [ ] Implement success handler
  ```javascript
  command.on('end', () => {
    resolve(outputPath);
  });
  ```
- [ ] Implement error handler
  ```javascript
  command.on('error', (err) => {
    reject(new Error(`FFmpeg error: ${err.message}`));
  });
  ```
- [ ] Call save() to start export
  ```javascript
  command.save(outputPath);
  ```
- [ ] Export function
  ```javascript
  module.exports = { exportVideo };
  ```

**Files Created:**
- `electron/ffmpeg/videoProcessing.js` (~150 lines)

**Commit:** `feat(export): add FFmpeg video processing module`

---

### 1.3: Test FFmpeg Setup (25 minutes)

#### Create Test Script
- [ ] Create simple test script or add to existing test
- [ ] Test basic export without any video (should fail gracefully)
  ```javascript
  const { exportVideo } = require('./electron/ffmpeg/videoProcessing');
  
  exportVideo('nonexistent.mp4', 'output.mp4')
    .then(() => console.log('Unexpected success'))
    .catch(err => console.log('Expected error:', err.message));
  ```
- [ ] Test with actual video file (if available)
  ```javascript
  exportVideo('test.mp4', 'output.mp4')
    .then(() => console.log('Export successful'))
    .catch(err => console.error('Export failed:', err));
  ```
- [ ] Verify FFmpeg binaries load correctly
- [ ] Check console for FFmpeg path resolution
  ```javascript
  console.log('FFmpeg path:', ffmpegPath);
  console.log('FFprobe path:', ffprobePath);
  ```

**Checkpoint:** FFmpeg module created and basic export tested ✓

**Commit:** `test(export): verify FFmpeg module works`

---

## Phase 2: IPC Integration (1 hour)

### 2.1: Add IPC Handler in Main Process (30 minutes)

#### Open main.js
- [ ] Locate `main.js` file

#### Import Video Processing
- [ ] Add import at top of file
  ```javascript
  const { exportVideo } = require('./electron/ffmpeg/videoProcessing');
  const { dialog } = require('electron');
  ```

#### Add Export Video Handler
- [ ] Add export handler after other IPC handlers
  ```javascript
  ipcMain.handle('export-video', async (event, { inputPath, outputPath, trimData }) => {
    try {
      await exportVideo(inputPath, outputPath, {
        startTime: trimData?.startTime || 0,
        duration: trimData?.duration,
        onProgress: (progress) => {
          event.sender.send('export-progress-update', progress);
        }
      });
      
      return { success: true, outputPath };
    } catch (error) {
      console.error('Export error:', error);
      return { success: false, error: error.message };
    }
  });
  ```

#### Add Save Dialog Handler
- [ ] Add save dialog handler
  ```javascript
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

**Files Modified:**
- `main.js` (+40 lines)

**Commit:** `feat(export): add IPC handlers for export video`

---

### 2.2: Expose API in Preload (20 minutes)

#### Open preload.js
- [ ] Locate `preload.js` file
- [ ] Find existing `contextBridge.exposeInMainWorld` call

#### Add Export Methods
- [ ] Add exportVideo method
  ```javascript
  exportVideo: (inputPath, outputPath, trimData) => 
    ipcRenderer.invoke('export-video', { inputPath, outputPath, trimData }),
  ```

- [ ] Add showSaveDialog method
  ```javascript
  showSaveDialog: () => 
    ipcRenderer.invoke('show-save-dialog'),
  ```

- [ ] Add onExportProgress method
  ```javascript
  onExportProgress: (callback) => {
    const handler = (event, progress) => callback(progress);
    ipcRenderer.on('export-progress-update', handler);
    
    // Return unsubscribe function
    return () => ipcRenderer.removeListener('export-progress-update', handler);
  }
  ```

**Files Modified:**
- `preload.js` (+25 lines)

**Commit:** `feat(export): expose export API in preload`

---

### 2.3: Test IPC Communication (10 minutes)

#### Quick Test
- [ ] Start dev server
  ```bash
  npm start
  ```
- [ ] Open browser console in Electron
- [ ] Test if API exists
  ```javascript
  console.log(window.electronAPI.exportVideo);
  console.log(window.electronAPI.showSaveDialog);
  ```
- [ ] Test save dialog (if UI component ready)
  - Should open file save dialog
  - Should return file path or canceled flag

**Checkpoint:** IPC communication established ✓

**Commit:** `test(export): verify IPC communication`

---

## Phase 3: Export UI Component (1 hour)

### 3.1: Create ExportPanel Component (40 minutes)

#### Create Component File
- [ ] Create `src/components/ExportPanel.js`

#### Add Imports
- [ ] Import React hooks
  ```javascript
  import React, { useState, useEffect } from 'react';
  import './styles/ExportPanel.css';
  ```

#### Create Component Function
- [ ] Create component with props
  ```javascript
  const ExportPanel = ({ currentClip }) => {
    // State and logic
  };
  ```

#### Add State
- [ ] Add isExporting state
  ```javascript
  const [isExporting, setIsExporting] = useState(false);
  ```
- [ ] Add progress state
  ```javascript
  const [progress, setProgress] = useState(0);
  ```
- [ ] Add status state
  ```javascript
  const [status, setStatus] = useState('');
  ```
- [ ] Add error state
  ```javascript
  const [error, setError] = useState(null);
  ```

#### Add Progress Listener
- [ ] Add useEffect for progress updates
  ```javascript
  useEffect(() => {
    const unsubscribe = window.electronAPI.onExportProgress((progressData) => {
      setProgress(Math.round(progressData.percent));
      setStatus(`Exporting... ${progressData.percent}%`);
    });

    return () => unsubscribe();
  }, []);
  ```

#### Add Export Handler
- [ ] Create handleExport function
  ```javascript
  const handleExport = async () => {
    if (!currentClip) {
      setError('No clip selected');
      return;
    }
    // Implementation...
  };
  ```
- [ ] Add validation check for currentClip
- [ ] Add try/catch block
- [ ] Set loading state (isExporting = true)
- [ ] Call showSaveDialog
- [ ] Check if user canceled
- [ ] Call exportVideo with progress tracking
- [ ] Handle success case
- [ ] Handle error case
- [ ] Clear loading state in finally

#### Add Render
- [ ] Return JSX
  ```javascript
  return (
    <div className="export-panel">
      {/* Export UI */}
    </div>
  );
  ```
- [ ] Add panel title
  ```javascript
  <h3>Export</h3>
  ```
- [ ] Add error display (conditional)
  ```javascript
  {error && <div className="export-error">{error}</div>}
  ```
- [ ] Add status display (conditional)
  ```javascript
  {status && <div className="export-status">{status}</div>}
  ```
- [ ] Add progress bar (conditional)
  ```javascript
  {progress > 0 && progress < 100 && (
    <div className="export-progress">
      <div className="progress-bar" style={{ width: `${progress}%` }}></div>
    </div>
  )}
  ```
- [ ] Add export button
  ```javascript
  <button 
    className="export-button"
    onClick={handleExport}
    disabled={!currentClip || isExporting}
  >
    {isExporting ? 'Exporting...' : 'Export Video'}
  </button>
  ```
- [ ] Export component
  ```javascript
  export default ExportPanel;
  ```

**Files Created:**
- `src/components/ExportPanel.js` (~150 lines)

**Commit:** `feat(export): create ExportPanel component`

---

### 3.2: Add Styling (20 minutes)

#### Create CSS File
- [ ] Create `src/styles/ExportPanel.css`

#### Style Export Panel
- [ ] Add panel container style
  ```css
  .export-panel {
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
  }
  ```

#### Style Export Button
- [ ] Add button styles
  ```css
  .export-button {
    padding: 12px 24px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
  }
  ```
- [ ] Add disabled state
  ```css
  .export-button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  ```
- [ ] Add hover state
  ```css
  .export-button:hover:not(:disabled) {
    background: #0056b3;
  }
  ```

#### Style Status and Error Messages
- [ ] Add status style
  ```css
  .export-status {
    margin: 10px 0;
    padding: 8px;
    background: #f8f9fa;
    border-radius: 4px;
  }
  ```
- [ ] Add error style
  ```css
  .export-error {
    margin: 10px 0;
    padding: 8px;
    background: #f8d7da;
    color: #721c24;
    border-radius: 4px;
  }
  ```

#### Style Progress Bar
- [ ] Add progress container
  ```css
  .export-progress {
    width: 100%;
    height: 20px;
    background: #e9ecef;
    border-radius: 10px;
    margin: 10px 0;
    overflow: hidden;
  }
  ```
- [ ] Add progress bar fill
  ```css
  .progress-bar {
    height: 100%;
    background: #28a745;
    transition: width 0.3s ease;
  }
  ```

**Files Created:**
- `src/styles/ExportPanel.css` (~80 lines)

**Commit:** `style(export): add ExportPanel styles`

**Checkpoint:** Export UI component complete ✓

---

## Phase 4: Integration & Testing (1 hour)

### 4.1: Integrate ExportPanel into App (15 minutes)

#### Open App.js
- [ ] Locate `src/App.js`

#### Add Import
- [ ] Import ExportPanel
  ```javascript
  import ExportPanel from './components/ExportPanel';
  ```

#### Add to JSX
- [ ] Add ExportPanel to render
  ```javascript
  <ExportPanel currentClip={currentClip} />
  ```
- [ ] Position appropriately in layout (typically right panel or bottom)

#### Add Export State (Optional)
- [ ] Add exportState if managing globally
  ```javascript
  const [exportState, setExportState] = useState({
    isExporting: false,
    progress: 0,
    status: '',
    error: null
  });
  ```

**Files Modified:**
- `src/App.js` (+20 lines)

**Commit:** `feat(export): integrate ExportPanel into App`

---

### 4.2: Manual Testing (30 minutes)

#### Test Basic Export Flow
- [ ] Start app: `npm start`
- [ ] Import a test MP4 file
- [ ] Verify clip appears in timeline
- [ ] Click "Export Video" button
- [ ] Save dialog should appear
- [ ] Choose output location (e.g., Desktop)
- [ ] Click Save
- [ ] Watch for progress updates
- [ ] Wait for export to complete
- [ ] Verify success message appears
- [ ] Check output file exists in chosen location

#### Test Export Features
- [ ] Click Export button while no clip selected
  - Should be disabled or show error
- [ ] Export should show progress bar
- [ ] Status text should update during export
- [ ] Export should show success message
- [ ] Output file should exist

#### Test Error Handling
- [ ] Try exporting with invalid video (if possible)
- [ ] Try canceling save dialog
- [ ] Verify graceful error messages

#### Verify Exported Video
- [ ] Open exported MP4 in VLC or QuickTime
- [ ] Verify video plays correctly
- [ ] Verify audio is included
- [ ] Verify duration matches input
- [ ] Check video quality is reasonable

#### Test with Different Videos
- [ ] Test with short video (<10 seconds)
- [ ] Test with longer video (1-2 minutes)
- [ ] Test with various resolutions (if available)

**Checkpoint:** Export works end-to-end ✓

**Commit:** `test(export): verify full export workflow`

---

### 4.3: Final Verification (15 minutes)

#### Check Console
- [ ] No errors in console during export
- [ ] Progress events logged correctly
- [ ] Success message appears

#### Check File Size
- [ ] Exported file size is reasonable
- [ ] Should be similar to input file size

#### Performance Check
- [ ] Export completes in reasonable time
- [ ] Target: <2x video duration

#### Memory Check
- [ ] No obvious memory leaks
- [ ] Memory usage stable during export
- [ ] Can export multiple times without issues

#### Cross-Check with PR Checklist
- [ ] Export button triggers FFmpeg ✓
- [ ] Save dialog appears ✓
- [ ] Exported MP4 file is created ✓
- [ ] Exported video plays correctly ✓
- [ ] Audio is included in export ✓
- [ ] Errors are handled gracefully ✓

**Commit:** `test(export): final verification complete`

**Checkpoint:** All testing complete ✓

---

## Post-Implementation Cleanup

### Update Documentation
- [ ] Update README.md with export functionality
- [ ] Add export to feature list
- [ ] Document export location requirement

### Code Review
- [ ] Review all created files
- [ ] Check for unused imports
- [ ] Verify error handling is comprehensive
- [ ] Ensure all console.log removed or commented

### Final Commits
- [ ] All commits pushed
  ```bash
  git push origin feat/ffmpeg-export
  ```
- [ ] Create PR to main branch (when ready)
- [ ] Update activeContext.md with completion status

---

## PR Checklist (Final Verification)

### Functional Requirements
- [ ] Export button triggers FFmpeg processing
- [ ] Save dialog appears when export clicked
- [ ] User can choose output location
- [ ] Progress bar updates during export
- [ ] Status messages show current state
- [ ] Exported MP4 file is created
- [ ] Exported video plays correctly in VLC/QuickTime
- [ ] Audio is included in exported file

### Error Handling
- [ ] Errors are caught and handled
- [ ] User-friendly error messages displayed
- [ ] Console logs errors for debugging
- [ ] Export can be retried after error

### Performance
- [ ] Export completes in reasonable time
- [ ] No memory leaks detected
- [ ] App remains responsive during export
- [ ] Progress updates are smooth

### Code Quality
- [ ] No console errors
- [ ] Clean code structure
- [ ] Proper error handling
- [ ] Comments added where needed
- [ ] All files committed with clear messages

### Documentation
- [ ] Code is self-explanatory
- [ ] Key functions commented
- [ ] README updated (if needed)
- [ ] Known limitations documented

---

## Issues & Solutions Log

### Issue #1: [Title]
**Problem:** [Description]  
**Solution:** [How you fixed it]  
**Time Lost:** [X minutes]  
**Prevention:** [How to avoid in future]

---

## Time Tracking

| Phase | Estimated | Actual | Notes |
|-------|-----------|--------|-------|
| Phase 1: FFmpeg Setup | 1h | ___h | |
| Phase 2: IPC Integration | 1h | ___h | |
| Phase 3: Export UI | 1h | ___h | |
| Phase 4: Integration & Testing | 1h | ___h | |
| **Total** | **4h** | **___h** | |

---

## Next Steps After This PR

**Immediate:**
- Verify export works with trimmed videos (PR #6)
- Test export in packaged app (PR #9)

**Future:**
- Add trim functionality (PR #6)
- Test with multiple clips
- Optimize export performance (if needed)

---

**PR Status:** ⏳ IN PROGRESS / ✅ COMPLETE


