# PR#2: File Import System - Quick Start

**Estimated Time:** 4 hours  
**Complexity:** MEDIUM  
**Dependencies:** PR #1 - Project Setup

---

## TL;DR (30 seconds)

**What:** Implement drag-and-drop and file picker import for video files (MP4/MOV) into ClipForge.

**Why:** File import is the foundation of the video editing workflow - users need to bring their video content into the app before they can edit it.

**Time:** 4 hours estimated

**Complexity:** MEDIUM (requires IPC communication, state management, and file validation)

**Status:** 📋 PLANNED

---

## Decision Framework (2 minutes)

### Should You Build This Feature?

**Green Lights (Build it!):**
- ✅ PR #1 is complete (Electron + React setup working)
- ✅ You have 4 hours available
- ✅ Basic IPC system is configured
- ✅ You understand React state management

**Red Lights (Skip/defer it!):**
- ❌ PR #1 not complete (can't import without app running)
- ❌ Less than 3 hours available (need buffer for testing)
- ❌ IPC system not configured yet
- ❌ Not comfortable with file handling

**Decision Aid:** If PR #1 is complete and you have 4+ hours, this is a **MUST BUILD** feature - it's on the critical path for the MVP.

---

## Prerequisites (5 minutes)

### Required
- [ ] PR #1 deployed and working
  - Electron app launches successfully
  - React components render
  - `npm start` works without errors
- [ ] Dependencies installed
  - React, React-DOM
  - Electron (main process setup)
  - IPC system configured
- [ ] Configuration: IPC API configured in preload.js
- [ ] Knowledge: Basic React hooks (useState), file handling, Electron IPC

### Setup Commands
```bash
# 1. Verify PR #1 complete
cd /path/to/clipforge
npm start
# Should see "Hello ClipForge" in Electron window

# 2. Create branch for PR #2
git checkout -b feat/file-import

# 3. Ready to implement!
```

---

## Getting Started (First Hour)

### Step 1: Read Documentation (45 minutes)
- [ ] Read this quick start (10 min) ✓
- [ ] Read main specification: `PR02_FILE_IMPORT.md` (25 min)
- [ ] Note key decisions:
  - Dual import method (drag-drop + file picker)
  - File validation before processing
  - State management in App.js
- [ ] Note questions or concerns

### Step 2: Set Up Environment (15 minutes)
- [ ] Open import branch in IDE
- [ ] Open relevant files:
  - `src/App.js` (will modify)
  - `src/components/` (will create ImportPanel)
  - `src/utils/` (will create fileHelpers)
  - `preload.js` (will modify)
  - `main.js` (will modify)
- [ ] Prepare test video files
  - Valid: MP4 and MOV files
  - Invalid: AVI file for error testing
  - Large: File >1GB for edge case testing

### Step 3: Start Phase 1
- [ ] Open implementation checklist
- [ ] Begin Phase 1: File Validation Utilities
- [ ] Create `src/utils/fileHelpers.js`
- [ ] Commit when Phase 1 complete

---

## Daily Progress Template

### Day 1 Goals (4 hours)

**Hours 5-6:** File Validation & ImportPanel Structure
- [ ] Create fileHelpers.js (30 min)
- [ ] Create ImportPanel.js structure (30 min)
- [ ] Implement drag-drop handlers (30 min)
- [ ] Implement file picker (30 min)

**Checkpoint:** Can drag files and click browse button

**Hours 7-8:** IPC Integration & App State
- [ ] Setup IPC in preload.js and main.js (30 min)
- [ ] Add clips state to App.js (30 min)
- [ ] Connect ImportPanel to App state (30 min)
- [ ] Test import flow (30 min)

**Checkpoint:** Files import successfully and appear in UI

---

## Common Issues & Solutions

### Issue 1: "window.electronAPI is undefined"
**Symptoms:** Console error when accessing electronAPI  
**Cause:** Preload script not loaded or contextBridge not set up  
**Solution:**
```javascript
// In main.js, ensure preload is configured
new BrowserWindow({
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    contextIsolation: true
  }
});

// In preload.js, ensure contextBridge is used
contextBridge.exposeInMainWorld('electronAPI', { ... });
```

### Issue 2: "File path is not absolute"
**Symptoms:** Files don't load after import  
**Cause:** Using relative path instead of absolute path  
**Solution:**
```javascript
// In main.js
ipcMain.handle('get-file-absolute-path', async (event, filePath) => {
  return path.resolve(filePath); // Makes path absolute
});
```

### Issue 3: "Drag event doesn't trigger"
**Symptoms:** Nothing happens when dragging files  
**Cause:** preventDefault() not called on dragOver  
**Solution:**
```javascript
const handleDragOver = (e) => {
  e.preventDefault(); // CRITICAL: Must prevent default
  e.stopPropagation();
  setIsDragOver(true);
};
```

### Issue 4: "Multiple files not importing"
**Symptoms:** Only one file imports from selection  
**Cause:** Input onChange not processing all files  
**Solution:**
```javascript
const handleFilePicker = async (e) => {
  const files = Array.from(e.target.files); // Convert to array
  await processFiles(files);
  
  // Reset input for same file re-upload
  e.target.value = '';
};
```

---

## Quick Reference

### Key Files
- `src/components/ImportPanel.js` - Import UI component with drag-drop
- `src/utils/fileHelpers.js` - File validation and utility functions
- `src/App.js` - Clips state and import handlers
- `preload.js` - IPC API bridge
- `main.js` - File dialog and IPC handlers

### Key Functions
- `validateFile(file)` - Validates file format and size, returns error if invalid
- `processFiles(files)` - Processes array of files, validates each, creates clip objects
- `handleImport(clips)` - Adds imported clips to app state
- `window.electronAPI.openFileDialog()` - Opens file picker dialog
- `window.electronAPI.getFileAbsolutePath(path)` - Converts to absolute path

### Key Concepts
- **Drag-and-drop API:** native HTML5 events (dragOver, dragLeave, drop)
- **File validation:** Check extension (.mp4, .mov) and size (<2GB)
- **IPC communication:** Renderer (React) ↔ Preload ↔ Main (Node.js)
- **State lifting:** ImportPanel validates files, App.js manages clips array
- **Non-destructive import:** Store file paths, not video data

### Useful Commands
```bash
# Start app
npm start

# Check for console errors
# Open DevTools (Cmd+Option+I on Mac)

# Test drag-drop
# Drag MP4 file from Finder onto app window

# Test file picker
# Click "Browse Files" button

# Debug IPC
console.log('Selected files:', filePaths);
```

---

## Success Metrics

**You'll know it's working when:**
- [ ] Can drag MP4 file onto app → File imports successfully
- [ ] Can click "Browse Files" → Dialog opens → File imports
- [ ] Can drag MOV file → File imports successfully
- [ ] Can drag multiple files → All valid files import
- [ ] Drag .avi file → Error message appears
- [ ] Imported files appear in UI
- [ ] No console errors
- [ ] No crashes on invalid files

**Performance Targets:**
- Import completes in <1 second
- UI updates immediately
- No lag with large files
- Memory stays stable with multiple imports

---

## Help & Support

### Stuck?
1. Check main spec: `PR02_FILE_IMPORT.md` for detailed architecture
2. Review checklist: `PR02_IMPLEMENTATION_CHECKLIST.md` for step-by-step tasks
3. Test IPC communication:
   ```javascript
   console.log(window.electronAPI);
   // Should log object with openFileDialog, getFileAbsolutePath
   ```
4. Verify file validation:
   ```javascript
   const file = new File(['test'], 'test.mp4');
   console.log(isValidVideoFile(file)); // Should be true
   ```

### Want to Skip a Feature?
**Can Skip:**
- Multiple file imports (single file is enough for MVP)
- Advanced error handling (basic errors are sufficient)
- File metadata extraction (can be done during playback)

**Impact:** Saves ~30 minutes, minimal functionality loss

### Running Out of Time?
**Prioritize:**
1. File picker import (more reliable than drag-drop)
2. Basic validation (extension check only)
3. Single file import (skip multiple files)

**Can cut:** Drag-and-drop (file picker is enough), advanced error messages

---

## Motivation

**You've got this!** 💪

You're building the gateway to video editing - once users can import files, they're ready to start creating. This is a foundational feature that enables all future editing capabilities. The implementation is straightforward: validate files, process them, store in state. You've built similar import features before (or similar concepts in other apps), so you have the experience to succeed.

The app will feel real once users can bring their content into it. That moment of "it works!" is just hours away!

---

## Next Steps

**When ready:**
1. Read checklist (PR02_IMPLEMENTATION_CHECKLIST.md) - 5 min
2. Start Phase 1: File Validation Utilities - 30 min
3. Start Phase 2: ImportPanel Component - 90 min
4. Continue through phases in order

**Status:** Ready to build! 🚀

---

**Quick Links:**
- Main Spec: `PR02_FILE_IMPORT.md`
- Checklist: `PR02_IMPLEMENTATION_CHECKLIST.md`
- Testing: `PR02_TESTING_GUIDE.md`
- Summary: `PR02_PLANNING_SUMMARY.md`

