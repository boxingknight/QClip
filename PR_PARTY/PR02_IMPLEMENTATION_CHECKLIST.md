# PR#2: Implementation Checklist

**Use this as your daily todo list.** Check off items as you complete them.

**Branch:** `feat/file-import`  
**Estimated Time:** 4 hours  
**Dependencies:** PR #1 complete

---

## Pre-Implementation Setup (15 minutes)

- [ ] Read main planning document (~45 min)
  - Review: PR02_FILE_IMPORT.md
  - Understand file import architecture
  - Review IPC communication pattern
  - Note key decisions and risks

- [ ] Prerequisites verified
  - [ ] Electron app launches successfully
  - [ ] React components rendering
  - [ ] IPC system configured in preload.js
  - [ ] main.js has ipcMain handlers

- [ ] Git branch created
  ```bash
  git checkout -b feat/file-import
  ```

- [ ] Test PR #1 completed
  ```bash
  # Verify app starts
  npm start
  ```

**Checkpoint:** Ready to start implementation ✓

---

## Phase 1: File Validation Utilities (30 minutes)

### 1.1: Create fileHelpers.js File (5 minutes)

- [ ] Create `src/utils/fileHelpers.js`
- [ ] Add file imports at top:
  ```javascript
  import path from 'path';
  ```

### 1.2: Implement isValidVideoFile() (10 minutes)

- [ ] Create function to check file extension
  ```javascript
  export function isValidVideoFile(file) {
    const validExtensions = ['.mp4', '.mov'];
    const extension = path.extname(file.name).toLowerCase();
    return validExtensions.includes(extension);
  }
  ```

- [ ] Test with valid extensions
  - Expected: true for .mp4
  - Expected: true for .mov
- [ ] Test with invalid extensions
  - Expected: false for .avi
  - Expected: false for .txt

**Checkpoint:** File validation function working ✓

**Commit:** `feat(file): add isValidVideoFile() function`

### 1.3: Implement isFileSizeValid() (10 minutes)

- [ ] Create function to check file size
  ```javascript
  export function isFileSizeValid(file, maxSizeMB = 2048) {
    const maxBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxBytes;
  }
  ```

- [ ] Test with valid file sizes
  - Expected: true for 1MB file
  - Expected: true for 1024MB file
- [ ] Test with invalid file sizes
  - Expected: false for 3000MB file

**Checkpoint:** Size validation working ✓

**Commit:** `feat(file): add isFileSizeValid() function`

### 1.4: Implement validateFile() (5 minutes)

- [ ] Create comprehensive validation function
  ```javascript
  export function validateFile(file) {
    if (!isValidVideoFile(file)) {
      return { valid: false, error: 'Unsupported format...' };
    }
    
    if (!isFileSizeValid(file, 2048)) {
      return { valid: false, error: 'File is too large...' };
    }
    
    return { valid: true, error: null };
  }
  ```

- [ ] Test with valid file
  - Expected: { valid: true, error: null }
- [ ] Test with invalid format
  - Expected: { valid: false, error: '...' }
- [ ] Test with too large file
  - Expected: { valid: false, error: '...' }

**Checkpoint:** Validation function complete ✓

**Commit:** `feat(file): add validateFile() function`

---

## Phase 2: ImportPanel Component (90 minutes)

### 2.1: Create Component File (5 minutes)

- [ ] Create `src/components/ImportPanel.js`
- [ ] Create `src/components/ImportPanel.css`
- [ ] Add basic React imports:
  ```javascript
  import React, { useState, useRef } from 'react';
  import './ImportPanel.css';
  import { validateFile, generateClipId } from '../utils/fileHelpers';
  ```

### 2.2: Create Component Structure (10 minutes)

- [ ] Create functional component
  ```javascript
  const ImportPanel = ({ onImport, isImporting }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    return (
      <div className="import-panel">
        {/* Component content */}
      </div>
    );
  };

  export default ImportPanel;
  ```

**Checkpoint:** Component structure created ✓

### 2.3: Implement Drag-and-Drop Handlers (20 minutes)

- [ ] Implement handleDragOver
  ```javascript
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  ```

- [ ] Implement handleDragLeave
  ```javascript
  const handleDragLeave = () => {
    setIsDragOver(false);
  };
  ```

- [ ] Implement handleDrop
  ```javascript
  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  };
  ```

- [ ] Test drag-over visual feedback
  - Expected: Border changes color when dragging over
- [ ] Test drop functionality
  - Expected: Files processed when dropped

**Checkpoint:** Drag-and-drop working ✓

**Commit:** `feat(import): add drag-and-drop handlers`

### 2.4: Implement File Picker (15 minutes)

- [ ] Create hidden file input
  ```javascript
  <input
    type="file"
    multiple
    accept="video/*,.mp4,.mov"
    onChange={handleFilePicker}
    style={{ display: 'none' }}
    ref={fileInputRef}
  />
  ```

- [ ] Create browse button
  ```javascript
  <button onClick={() => fileInputRef.current?.click()}>
    Browse Files
  </button>
  ```

- [ ] Implement handleFilePicker
  ```javascript
  const handleFilePicker = async (e) => {
    const files = Array.from(e.target.files);
    await processFiles(files);
  };
  ```

- [ ] Test file picker
  - Expected: Dialog opens when button clicked
  - Expected: Files selected from dialog

**Checkpoint:** File picker working ✓

**Commit:** `feat(import): add file picker functionality`

### 2.5: Implement processFiles() (30 minutes)

- [ ] Create function to process files
  ```javascript
  const processFiles = async (files) => {
    const validClips = [];
    
    for (const file of files) {
      const validation = validateFile(file);
      
      if (!validation.valid) {
        setError(validation.error);
        continue;
      }
      
      // Get absolute path
      const filePath = await window.electronAPI.getFileAbsolutePath(file.path);
      
      const clip = {
        id: generateClipId(),
        name: file.name,
        path: filePath,
        duration: 0,
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
  ```

- [ ] Test with valid files
  - Expected: Clips created and passed to onImport
- [ ] Test with invalid files
  - Expected: Error message displayed
  - Expected: Invalid files skipped

**Checkpoint:** File processing working ✓

**Commit:** `feat(import): implement file processing logic`

### 2.6: Add UI Elements (10 minutes)

- [ ] Add drop zone with visual feedback
  ```javascript
  <div
    className={`drop-zone ${isDragOver ? 'drag-over' : ''}`}
    onDragOver={handleDragOver}
    onDragLeave={handleDragLeave}
    onDrop={handleDrop}
  >
    {/* Content */}
  </div>
  ```

- [ ] Add error message display
  ```javascript
  {error && (
    <div className="error-message">{error}</div>
  )}
  ```

- [ ] Add loading indicator
  ```javascript
  {isImporting && (
    <div className="loading">Importing files...</div>
  )}
  ```

**Checkpoint:** UI elements added ✓

**Commit:** `feat(import): add UI feedback elements`

---

## Phase 3: IPC Setup (30 minutes)

### 3.1: Update preload.js (15 minutes)

- [ ] Add IPC exposures to preload.js
  ```javascript
  contextBridge.exposeInMainWorld('electronAPI', {
    openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
    getFileAbsolutePath: (path) => ipcRenderer.invoke('get-file-absolute-path', path),
    // ... existing APIs
  });
  ```

- [ ] Test IPC communication
  - Expected: No console errors
  - Expected: APIs available in window.electronAPI

**Checkpoint:** Preload updated ✓

**Commit:** `feat(ipc): add file dialog API to preload`

### 3.2: Update main.js (15 minutes)

- [ ] Add file dialog handler
  ```javascript
  ipcMain.handle('open-file-dialog', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Video Files', extensions: ['mp4', 'mov'] }
      ]
    });
    return result.canceled ? [] : result.filePaths;
  });
  ```

- [ ] Add absolute path handler
  ```javascript
  ipcMain.handle('get-file-absolute-path', async (event, filePath) => {
    return path.resolve(filePath);
  });
  ```

- [ ] Test file dialog
  - Expected: Dialog opens in Electron
  - Expected: Returns selected file paths

**Checkpoint:** IPC handlers added ✓

**Commit:** `feat(ipc): add file dialog and path resolution`

---

## Phase 4: App State Integration (45 minutes)

### 4.1: Add State to App.js (15 minutes)

- [ ] Import useState
  ```javascript
  import React, { useState } from 'react';
  ```

- [ ] Add clips state
  ```javascript
  const [clips, setClips] = useState([]);
  ```

- [ ] Add import status state
  ```javascript
  const [importStatus, setImportStatus] = useState({
    loading: false,
    error: null,
    lastImported: null
  });
  ```

**Checkpoint:** State added to App ✓

### 4.2: Implement handleImport (20 minutes)

- [ ] Create handleImport function
  ```javascript
  const handleImport = (newClips) => {
    setImportStatus({ loading: true, error: null, lastImported: null });
    
    setClips(prev => [...prev, ...newClips]);
    
    setImportStatus({
      loading: false,
      error: null,
      lastImported: newClips.length
    });
  };
  ```

- [ ] Pass to ImportPanel
  ```javascript
  <ImportPanel 
    onImport={handleImport}
    isImporting={importStatus.loading}
  />
  ```

- [ ] Test state updates
  - Expected: Clips array updates on import
  - Expected: Status updates correctly

**Checkpoint:** Import handler working ✓

**Commit:** `feat(app): add clips state and import handler`

### 4.3: Display Imported Clips (10 minutes)

- [ ] Add clip list display (simple for now)
  ```javascript
  {clips.length > 0 && (
    <div className="imported-clips">
      <h3>Imported Clips ({clips.length})</h3>
      <ul>
        {clips.map(clip => (
          <li key={clip.id}>{clip.name}</li>
        ))}
      </ul>
    </div>
  )}
  ```

- [ ] Test display updates
  - Expected: Clips appear after import
  - Expected: Count is correct

**Checkpoint:** Clip display working ✓

**Commit:** `feat(app): display imported clips in UI`

---

## Phase 5: Styling (45 minutes)

### 5.1: Create ImportPanel.css (20 minutes)

- [ ] Add base styles
  ```css
  .import-panel {
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
  }
  ```

- [ ] Style drop zone
  ```css
  .drop-zone {
    border: 2px dashed #ccc;
    border-radius: 8px;
    padding: 3rem;
    text-align: center;
    background: #f9f9f9;
    transition: all 0.3s ease;
  }
  ```

**Checkpoint:** Base styles applied ✓

### 5.2: Add Visual Feedback States (15 minutes)

- [ ] Style drag-over state
  ```css
  .drop-zone.drag-over {
    border-color: #007bff;
    background: #e7f3ff;
  }
  ```

- [ ] Add button styles
  ```css
  button {
    padding: 0.75rem 1.5rem;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  ```

**Checkpoint:** States styled ✓

### 5.3: Add Error and Loading Styles (10 minutes)

- [ ] Style error message
  ```css
  .error-message {
    margin-top: 1rem;
    padding: 1rem;
    background: #ffe6e6;
    border: 1px solid #ff9999;
    color: #cc0000;
  }
  ```

- [ ] Style loading indicator
  ```css
  .loading {
    margin-top: 1rem;
    text-align: center;
    color: #666;
  }
  ```

**Checkpoint:** All styles complete ✓

**Commit:** `feat(styles): add ImportPanel styling`

---

## Testing Phase (30 minutes)

### Unit Tests (15 minutes)

- [ ] Test: isValidVideoFile with .mp4
  - Expected: Returns true
  - Actual: [Record result]
- [ ] Test: isValidVideoFile with .mov
  - Expected: Returns true
  - Actual: [Record result]
- [ ] Test: isValidVideoFile with .avi
  - Expected: Returns false
  - Actual: [Record result]
- [ ] Test: isFileSizeValid with small file
  - Expected: Returns true
  - Actual: [Record result]
- [ ] Test: isFileSizeValid with large file
  - Expected: Returns false
  - Actual: [Record result]

**Checkpoint:** Unit tests passing ✓

### Integration Tests (15 minutes)

- [ ] Test: Drag MP4 onto app
  - Step 1: Drag file over panel
  - Step 2: Drop file
  - Expected: File imported successfully
  - Actual: [Record result]
- [ ] Test: Use file picker
  - Step 1: Click browse button
  - Step 2: Select MP4 file
  - Expected: File imported successfully
  - Actual: [Record result]
- [ ] Test: Import invalid file
  - Step 1: Drag .avi file
  - Expected: Error message shown
  - Actual: [Record result]
- [ ] Test: Import multiple files
  - Step 1: Drag multiple MP4 files
  - Expected: All files imported
  - Actual: [Record result]

**Checkpoint:** Integration tests passing ✓

**Commit:** `test(import): verify import functionality`

---

## Bug Fixing (If needed)

### Bug #1: [Title] (If occurs)
- [ ] Reproduced
- [ ] Root cause identified
- [ ] Fix implemented
- [ ] Tested
- [ ] Documented in bug analysis doc

---

## Documentation Phase (15 minutes)

- [ ] Add JSDoc comments to functions
  ```javascript
  /**
   * Validate file is supported video format
   * @param {File} file - File object from input
   * @returns {boolean} true if valid
   */
  export function isValidVideoFile(file) {
    // ...
  }
  ```
- [ ] Update README with import feature
- [ ] Note any deviations from plan

**Commit:** `docs(import): add JSDoc comments`

---

## Completion Checklist

- [ ] All phases complete
- [ ] All tests passing
- [ ] Can import MP4 files via drag-drop
- [ ] Can import MP4 files via file picker
- [ ] Can import MOV files
- [ ] Unsupported formats show error
- [ ] Multiple file imports work
- [ ] Clips are stored in app state
- [ ] UI feedback is clear
- [ ] No console errors
- [ ] No memory leaks
- [ ] Performance acceptable
- [ ] Documentation complete
- [ ] Code committed with clear messages

**Final Commit:** `feat(import): complete file import system - PR #2`

---

## Expected Outcome

After completing this checklist, you should have:
- ✅ File validation utilities working
- ✅ ImportPanel component functional
- ✅ Drag-and-drop import working
- ✅ File picker import working
- ✅ Clips stored in app state
- ✅ UI displays imported clips
- ✅ Error handling implemented
- ✅ No critical bugs
- ✅ Ready for PR #3 (Video Player)

**Total Time:** ~4 hours estimated


