# PR#2: File Import System

**Estimated Time:** 4 hours  
**Complexity:** MEDIUM  
**Dependencies:** PR #1 - Project Setup  
**Branch:** `feat/file-import`  
**Priority:** CRITICAL - Day 1, Hours 5-8

---

## Overview

### What We're Building
A comprehensive file import system for ClipForge that allows users to import video files (MP4/MOV) into the application via drag-and-drop or file picker dialog. The system will validate file formats, handle multiple file imports, display imported files in the UI, and manage clip state in the application.

### Why It Matters
File import is the foundation of the video editing workflow. Without the ability to import video files, users cannot proceed with editing. This feature enables users to bring their existing video content into ClipForge to begin the editing process. A smooth, reliable import experience builds user confidence and sets the tone for the entire application.

### Success in One Sentence
This PR is successful when users can import MP4/MOV video files into ClipForge via drag-and-drop or file picker, see their imported files displayed in the UI, and the imported clip data is ready for playback and editing.

---

## Technical Design

### Architecture Decisions

#### Decision 1: Import Method Pattern
**Options Considered:**
1. **Drag-and-drop only** - Simple, modern, but some users prefer file picker
2. **File picker only** - Traditional, reliable, but less intuitive
3. **Both methods** - Maximum usability, accommodates all users

**Chosen:** Option 3 - Both drag-and-drop AND file picker

**Rationale:**
- Drag-and-drop is intuitive and quick for tech-savvy users
- File picker provides familiar, reliable alternative
- Low implementation overhead for both methods
- Better user experience coverage

**Trade-offs:**
- Gain: Maximum usability
- Lose: Additional code to maintain (negligible)

#### Decision 2: File Validation Strategy
**Options Considered:**
1. **Extension-based only** - Fast, simple, but can be spoofed
2. **Magic number check** - More reliable, but requires reading file headers
3. **Extension + size check** - Balanced approach

**Chosen:** Option 2 - Extension check with validation + size limits

**Rationale:**
- Fast validation without reading entire file
- Extension check is sufficient for MVP
- Size limits prevent memory issues
- Full file validation can be done during playback

**Trade-offs:**
- Gain: Fast import process
- Note: Will fail gracefully if file is corrupted (detected during playback)

#### Decision 3: State Management Pattern
**Options Considered:**
1. **LocalStorage** - Persistent across sessions, but unnecessary for MVP
2. **In-memory state only** - Simple, sufficient for MVP
3. **Redux** - Overkill for single array of clips

**Chosen:** Option 2 - React useState in App.js

**Rationale:**
- Simplest approach for MVP
- Single source of truth
- Easy to lift state and pass down
- No external dependencies

**Trade-offs:**
- Gain: Simple, lightweight
- Trade-off: State resets on app restart (acceptable for MVP)

### Data Model

**Clip Object Structure:**
```javascript
{
  id: string,              // Unique identifier (e.g., timestamp-based)
  name: string,            // File name (e.g., "my-video.mp4")
  path: string,           // Absolute file path
  duration: number,        // Video duration in seconds (extracted later)
  inPoint: 0,             // Trim start point (default: 0)
  outPoint: number,       // Trim end point (default: duration)
  fileSize: number        // File size in bytes
}
```

**Import State Structure:**
```javascript
// In App.js
const [clips, setClips] = useState([]);            // Array of clip objects
const [importStatus, setImportStatus] = useState({   // Import operation status
  loading: false,
  error: null,
  lastImported: null
});
```

### Component Structure

**ImportPanel Component:**
- **Props:**
  - `onImport`: (clips: Clip[]) => void - Callback when files imported
  - `isImporting`: boolean - Loading state
  
- **Local State:**
  - `isDragOver`: boolean - Visual feedback for drag
  - `error`: string | null - Error message

**File Flow:**
```
User Action (drag-drop OR file picker)
  ↓
ImportPanel Component
  ↓
File Validation (fileHelpers.js)
  ↓
IPC to Main Process (get file path)
  ↓
Add to App State (setClips)
  ↓
Update UI (Timeline, ImportPanel)
```

### IPC Communication Pattern

**Preload Script Exposures:**
```javascript
window.electronAPI = {
  openFileDialog: () => Promise<FilePath[]>,
  getFileMetadata: (path) => Promise<FileMetadata>
}
```

**Main Process Handlers:**
```javascript
ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Video', extensions: ['mp4', 'mov'] }]
  });
  return result.filePaths;
});
```

---

## Implementation Details

### File Structure

**New Files:**
```
src/
├── components/
│   ├── ImportPanel.js          (~200 lines) - Import UI component
│   └── ImportPanel.css         (~100 lines) - Import panel styles
├── utils/
│   └── fileHelpers.js          (~80 lines)  - File validation utilities
```

**Modified Files:**
- `src/App.js` (+120/-10 lines) - Add clips state, import handlers
- `preload.js` (+30/-5 lines) - Add file dialog IPC
- `main.js` (+40/-5 lines) - Add file dialog handler

### Key Implementation Steps

#### Phase 1: File Validation Utilities (30 minutes)
**Create:** `src/utils/fileHelpers.js`

**Functions:**
```javascript
/**
 * Validate file is supported video format
 * @param {File} file - File object from input
 * @returns {boolean} true if valid, false otherwise
 */
export function isValidVideoFile(file) {
  const validExtensions = ['.mp4', '.mov'];
  const extension = path.extname(file.name).toLowerCase();
  return validExtensions.includes(extension);
}

/**
 * Check if file is too large
 * @param {File} file - File object
 * @param {number} maxSizeMB - Maximum size in MB
 * @returns {boolean} true if file is acceptable size
 */
export function isFileSizeValid(file, maxSizeMB = 2048) {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxBytes;
}

/**
 * Validate file and return error message if invalid
 * @param {File} file - File object
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateFile(file) {
  if (!isValidVideoFile(file)) {
    return { valid: false, error: 'Unsupported format. Please use MP4 or MOV files.' };
  }
  
  if (!isFileSizeValid(file, 2048)) {
    return { valid: false, error: 'File is too large. Maximum size is 2GB.' };
  }
  
  return { valid: true, error: null };
}

/**
 * Generate unique ID for clip
 * @returns {string} Unique identifier
 */
export function generateClipId() {
  return `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
```

#### Phase 2: ImportPanel Component (90 minutes)
**Create:** `src/components/ImportPanel.js`

**Component Structure:**
```javascript
import React, { useState } from 'react';
import './ImportPanel.css';
import { validateFile } from '../utils/fileHelpers';

const ImportPanel = ({ onImport, isImporting }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState(null);

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  };

  // File picker handler
  const handleFilePicker = async (e) => {
    const files = Array.from(e.target.files);
    await processFiles(files);
  };

  // Process imported files
  const processFiles = async (files) => {
    const validClips = [];
    
    for (const file of files) {
      const validation = validateFile(file);
      
      if (!validation.valid) {
        setError(validation.error);
        continue;
      }
      
      // Get absolute path from Electron
      const filePath = await window.electronAPI.getFileAbsolutePath(file.path);
      
      const clip = {
        id: generateClipId(),
        name: file.name,
        path: filePath,
        duration: 0, // Will be extracted during playback
        inPoint: 0,
        outPoint: 0,
        fileSize: file.size
      };
      
      validClips.push(clip);
    }
    
    if (validClips.length > 0) {
      onImport(validClips);
      setError(null);
    }
  };

  return (
    <div className="import-panel">
      <div
        className={`drop-zone ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="drop-zone-content">
          <svg className="icon">...</svg>
          <h3>Drag video files here</h3>
          <p>or</p>
          <input
            type="file"
            multiple
            accept="video/*,.mp4,.mov"
            onChange={handleFilePicker}
            style={{ display: 'none' }}
            ref={fileInputRef}
          />
          <button onClick={() => fileInputRef.current?.click()}>
            Browse Files
          </button>
        </div>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {isImporting && (
        <div className="loading">
          Importing files...
        </div>
      )}
    </div>
  );
};

export default ImportPanel;
```

#### Phase 3: IPC Setup (30 minutes)
**Modify:** `preload.js`

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  getFileAbsolutePath: (path) => ipcRenderer.invoke('get-file-absolute-path', path)
});
```

**Modify:** `main.js`

```javascript
const { ipcMain, dialog } = require('electron');
const path = require('path');

ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Video Files', extensions: ['mp4', 'mov'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  
  return result.canceled ? [] : result.filePaths;
});

ipcMain.handle('get-file-absolute-path', async (event, filePath) => {
  return path.resolve(filePath);
});
```

#### Phase 4: App State Integration (45 minutes)
**Modify:** `src/App.js`

```javascript
import React, { useState } from 'react';
import ImportPanel from './components/ImportPanel';
import './App.css';

const App = () => {
  const [clips, setClips] = useState([]);
  const [importStatus, setImportStatus] = useState({
    loading: false,
    error: null,
    lastImported: null
  });

  const handleImport = (newClips) => {
    setImportStatus({ loading: true, error: null, lastImported: null });
    
    // Add to existing clips
    setClips(prev => [...prev, ...newClips]);
    
    // Update status
    setImportStatus({
      loading: false,
      error: null,
      lastImported: newClips.length
    });
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>ClipForge</h1>
      </header>
      
      <main className="app-main">
        <ImportPanel 
          onImport={handleImport}
          isImporting={importStatus.loading}
        />
        
        {/* Other components */}
      </main>
    </div>
  );
};

export default App;
```

#### Phase 5: Styling (45 minutes)
**Create:** `src/components/ImportPanel.css`

```css
.import-panel {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.drop-zone {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 3rem;
  text-align: center;
  background: #f9f9f9;
  transition: all 0.3s ease;
  cursor: pointer;
}

.drop-zone.drag-over {
  border-color: #007bff;
  background: #e7f3ff;
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.drop-zone-content .icon {
  width: 48px;
  height: 48px;
  fill: #666;
}

.drop-zone-content h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #333;
}

.drop-zone-content button {
  padding: 0.75rem 1.5rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
}

.drop-zone-content button:hover {
  background: #0056b3;
}

.error-message {
  margin-top: 1rem;
  padding: 1rem;
  background: #ffe6e6;
  border: 1px solid #ff9999;
  border-radius: 4px;
  color: #cc0000;
}

.loading {
  margin-top: 1rem;
  text-align: center;
  color: #666;
}
```

---

## Testing Strategy

### Unit Tests

**Test 1: File Validation**
- ✅ MP4 file passes validation
- ✅ MOV file passes validation
- ❌ Unsupported extension (AVI) fails validation
- ❌ File too large fails validation

**Test 2: ID Generation**
- ✅ Generated IDs are unique
- ✅ Generated IDs follow expected format

### Integration Tests

**Scenario 1: Drag-and-Drop Import**
1. Prepare sample MP4 file
2. Drag file onto import panel
3. Verify file appears in clips array
4. Verify UI updates

**Scenario 2: File Picker Import**
1. Click "Browse Files" button
2. Select MP4 file from dialog
3. Verify file appears in clips array
4. Verify UI updates

**Scenario 3: Multiple File Import**
1. Drag multiple files (MP4 and MOV)
2. Verify all valid files imported
3. Verify invalid files skipped
4. Verify error message shown

**Scenario 4: Invalid File Import**
1. Drag invalid file (AVI)
2. Verify error message appears
3. Verify file NOT added to clips
4. Verify app doesn't crash

### Edge Cases

- **Empty file upload** - Prevent processing
- **Corrupted file** - Handle gracefully (detect during playback)
- **Very long file names** - UI should handle properly
- **Special characters in filename** - Validate safely
- **Duplicate files** - Allow multiple imports (different IDs)

### Manual Testing Checklist

- [ ] Can drag MP4 file onto app
- [ ] Visual feedback during drag (border highlight)
- [ ] Can use file picker to browse
- [ ] Can import multiple files at once
- [ ] Unsupported format shows error
- [ ] Error message is clear and helpful
- [ ] Imported files appear in UI
- [ ] No crashes on invalid files
- [ ] Large files handled properly
- [ ] Multiple imports work correctly

---

## Success Criteria

**Feature is complete when:**
- [ ] Users can drag MP4/MOV files onto app
- [ ] Users can use file picker to import files
- [ ] Unsupported formats show error message
- [ ] Imported clips are stored in app state
- [ ] Imported files are displayed in UI
- [ ] Multiple file imports work correctly
- [ ] No crashes on invalid files
- [ ] Error handling is user-friendly
- [ ] All tests pass
- [ ] No console errors

**Performance Targets:**
- Import completes in <1 second
- UI updates immediately after import
- No memory leaks with multiple imports

**Quality Gates:**
- Zero critical bugs
- Error messages are helpful
- No console errors
- UI is responsive

---

## Risk Assessment

### Risk 1: File Path Resolution
**Likelihood:** MEDIUM  
**Impact:** HIGH  
**Mitigation:** Use path.resolve() in main process, test with various path formats  
**Status:** 🟢 LOW RISK

### Risk 2: Large File Handling
**Likelihood:** MEDIUM  
**Impact:** MEDIUM  
**Mitigation:** Set file size limits (2GB max), validate before processing  
**Status:** 🟢 LOW RISK

### Risk 3: IPC Communication Issues
**Likelihood:** LOW  
**Impact:** HIGH  
**Mitigation:** Test IPC early, handle errors gracefully  
**Status:** 🟡 MONITOR

### Risk 4: State Management Complexity
**Likelihood:** LOW  
**Impact:** LOW  
**Mitigation:** Keep state structure simple, use React hooks properly  
**Status:** 🟢 LOW RISK

---

## Open Questions

1. **Should we extract video metadata on import?**
   - Option A: Extract duration/metadata on import (slower but informative)
   - Option B: Extract during playback (faster import)
   - Decision needed by: Phase 2 start
   - Recommendation: Option B for MVP (faster import flow)

2. **How should we handle duplicate files?**
   - Option A: Ignore duplicates (same path)
   - Option B: Allow multiple imports (different IDs)
   - Decision needed by: Phase 2 start
   - Recommendation: Option B (more flexible)

---

## Timeline

**Total Estimate:** 4 hours

| Phase | Task | Time | Status |
|-------|------|------|--------|
| 1 | File Validation Utilities | 30 min | ⏳ |
| 2 | ImportPanel Component | 90 min | ⏳ |
| 3 | IPC Setup | 30 min | ⏳ |
| 4 | App State Integration | 45 min | ⏳ |
| 5 | Styling | 45 min | ⏳ |
| 6 | Testing & Bug Fixes | 30 min | ⏳ |

---

## Dependencies

**Requires:**
- PR #1 - Project Setup complete
- Electron main process running
- IPC system configured
- React app structure in place

**Blocks:**
- PR #3 - Video Player (needs clips to play)
- PR #5 - Timeline (needs clips to display)
- PR #6 - Trim Controls (needs clips to trim)

---

## References

- React File Upload: https://react.dev/reference/react-dom/components/input#input
- Electron IPC: https://www.electronjs.org/docs/latest/tutorial/ipc
- File Drag API: https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API

---

## Appendix: Code Examples

### Example: Drag and Drop with Visual Feedback
```javascript
const [isDragOver, setIsDragOver] = useState(false);

const handleDragOver = (e) => {
  e.preventDefault();
  e.stopPropagation();
  setIsDragOver(true);
};

const handleDragLeave = (e) => {
  e.preventDefault();
  e.stopPropagation();
  setIsDragOver(false);
};
```

### Example: File Validation with Error Display
```javascript
const processFiles = async (files) => {
  for (const file of files) {
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error);
      continue;
    }
    // Process valid file...
  }
};
```

### Example: IPC File Dialog
```javascript
const handleFilePicker = async () => {
  const paths = await window.electronAPI.openFileDialog();
  if (paths.length > 0) {
    // Process selected files
  }
};
```

