# PR#8: Error Handling & Bug Fixes - Implementation Checklist

**Use this as your daily todo list.** Check off items as you complete them.

**Estimated Time:** 4 hours  
**Complexity:** MEDIUM  
**Priority:** Important - Day 2/3, Hours 31-34

---

## Pre-Implementation Setup (15 minutes)

#### Verify Dependencies
- [ ] Read main specification (`PR08_ERROR_HANDLING.md`) (~45 min)
- [ ] All previous PRs complete (PRs #1-6)
- [ ] App is currently running (for testing)
- [ ] Git branch created:
  ```bash
  git checkout -b fix/error-handling
  ```

---

## Phase 1: Error Infrastructure (1 hour)

### 1.1: Create Logger Utility (20 minutes)

#### Create File
- [ ] Create `src/utils/logger.js`

#### Implement Logger
- [ ] Add LOG_LEVELS constant
  ```javascript
  const LOG_LEVELS = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 };
  ```

- [ ] Add DEBUG_MODE constant
  ```javascript
  const DEBUG_MODE = process.env.NODE_ENV === 'development';
  ```

- [ ] Implement error method
  ```javascript
  error: (message, error = null, data = {}) => {
    if (DEBUG_MODE || data.force) {
      console.error(`[ERROR] ${message}`, error, data);
    }
  }
  ```

- [ ] Implement warn method
- [ ] Implement info method
- [ ] Implement debug method

- [ ] Export logger object

#### Test Logger
- [ ] Test in development mode (logs visible)
- [ ] Test in production mode (logs hidden)
- [ ] Test with force flag (logs visible)

**Checkpoint:** Logger utility working ✓

**Commit:** `feat(utils): add logger utility for structured logging`

---

### 1.2: Create Error Boundary Component (20 minutes)

#### Create File
- [ ] Create `src/components/ErrorBoundary.js`

#### Implement Component
- [ ] Import React and logger
  ```javascript
  import React from 'react';
  import { logger } from '../utils/logger';
  import ErrorFallback from './ErrorFallback';
  ```

- [ ] Create class component with constructor
  ```javascript
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }
  ```

- [ ] Implement getDerivedStateFromError
- [ ] Implement componentDidCatch
- [ ] Implement handleReset
- [ ] Implement render method with error checking

#### Create Error Fallback File
- [ ] Create `src/components/ErrorFallback.js`
- [ ] Create `src/styles/ErrorFallback.css`

#### Implement Error Fallback
- [ ] Add error icon
- [ ] Add error message
- [ ] Add reload button
- [ ] Add show/hide details toggle
- [ ] Add styles for error display

#### Test Error Boundary
- [ ] Intentionally trigger error in component
- [ ] Verify ErrorFallback renders
- [ ] Click reload button
- [ ] Verify error resets

**Checkpoint:** ErrorBoundary catches errors ✓

**Commit:** `feat(components): add ErrorBoundary and ErrorFallback components`

---

### 1.3: Add Window Error Handlers (10 minutes)

#### Modify main.js
- [ ] Add window error handler in main process
  ```javascript
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', error);
    // Optionally crash app or recover gracefully
  });
  ```

- [ ] Add unhandled rejection handler
  ```javascript
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', reason);
  });
  ```

#### Modify App.js (renderer)
- [ ] Add window error handler in renderer
  ```javascript
  window.addEventListener('error', (event) => {
    logger.error('Global error', event.error);
    // Show error to user via ErrorBoundary
  });
  ```

#### Test Window Handlers
- [ ] Trigger uncaught error
- [ ] Verify logged to console
- [ ] Verify app doesn't completely crash

**Checkpoint:** Window error handlers working ✓

**Commit:** `feat(error-handling): add window error handlers for main and renderer`

---

### 1.4: Integrate ErrorBoundary with App (10 minutes)

#### Modify App.js
- [ ] Import ErrorBoundary
- [ ] Wrap App content with ErrorBoundary
  ```javascript
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
  ```

#### Test Integration
- [ ] App launches normally
- [ ] ErrorBoundary doesn't block normal operation
- [ ] Simulate error - ErrorFallback shows

**Checkpoint:** ErrorBoundary integrated ✓

**Commit:** `feat(App): wrap application with ErrorBoundary`

---

## Phase 2: Video Metadata Extraction (1 hour)

### 2.1: Create Video Metadata Utility (20 minutes)

#### Create File
- [ ] Create `src/utils/videoMetadata.js`

#### Implement Get Video Metadata
- [ ] Create getVideoMetadata function
  ```javascript
  export async function getVideoMetadata(videoPath) {
    try {
      const metadata = await window.electronAPI.getVideoMetadata(videoPath);
      return {
        success: true,
        duration: metadata.duration,
        width: metadata.width,
        height: metadata.height,
        // ... more metadata
      };
    } catch (error) {
      logger.error('Failed to extract video metadata', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  ```

#### Test Metadata Extraction
- [ ] Call with valid video path
- [ ] Verify returns metadata object
- [ ] Call with invalid path
- [ ] Verify returns error object

**Checkpoint:** Metadata utility working ✓

**Commit:** `feat(utils): add video metadata extraction utility`

---

### 2.2: Add IPC Handler for Metadata (20 minutes)

#### Modify preload.js
- [ ] Add getVideoMetadata API
  ```javascript
  getVideoMetadata: (videoPath) => ipcRenderer.invoke('get-video-metadata', videoPath)
  ```

#### Modify main.js
- [ ] Add IPC handler for metadata
  ```javascript
  ipcMain.handle('get-video-metadata', async (event, videoPath) => {
    // Use ffprobe to extract metadata
    return await extractVideoMetadata(videoPath);
  });
  ```

#### Test IPC Handler
- [ ] Call from renderer
- [ ] Verify metadata returned
- [ ] Test with invalid file
- [ ] Verify error handled

**Checkpoint:** IPC handler working ✓

**Commit:** `feat(ipc): add video metadata IPC handler`

---

### 2.3: Integrate Metadata in ImportPanel (20 minutes)

#### Modify ImportPanel.js
- [ ] Import getVideoMetadata
- [ ] Import logger
- [ ] Call getVideoMetadata after file selection
- [ ] Store metadata with clip data
- [ ] Handle metadata extraction failures gracefully

#### Update Clip Structure
- [ ] Add metadata fields to clip object
  ```javascript
  const clip = {
    id,
    name,
    path,
    duration: metadata.duration,
    width: metadata.width,
    height: metadata.height,
    // ... more metadata
  };
  ```

#### Test Integration
- [ ] Import video file
- [ ] Verify metadata extracted
- [ ] Verify stored with clip
- [ ] Test with file that fails extraction
- [ ] Verify import still succeeds with warning

**Checkpoint:** Metadata extraction integrated ✓

**Commit:** `feat(ImportPanel): extract and store video metadata on import`

---

## Phase 3: Enhanced Error Handling (1 hour)

### 3.1: Improve ImportPanel Error Handling (20 minutes)

#### Modify ImportPanel.js
- [ ] Add logger to handleFileImport
- [ ] Add try-catch around import logic
- [ ] Log import start with logger.info
- [ ] Add validation error handling
- [ ] Show specific error messages for:
  - Invalid file extension
  - File too large
  - Permission errors
  - File not found
  - Corrupted file

#### Test Error Handling
- [ ] Test invalid extension → Shows specific error
- [ ] Test large file → Shows size limit error
- [ ] Test corrupted file → Shows corruption error
- [ ] Verify error logged to console

**Checkpoint:** ImportPanel errors handled ✓

**Commit:** `feat(ImportPanel): enhance error handling with user-friendly messages`

---

### 3.2: Improve VideoPlayer Error Handling (20 minutes)

#### Modify VideoPlayer.js
- [ ] Import logger
- [ ] Add error event listener
  ```javascript
  const handleError = (e) => {
    logger.error('Video playback error', e.error, { videoPath: props.clip?.path });
    setError('Failed to play video. The file may be corrupted or unsupported.');
  };
  ```

- [ ] Add loadstart listener for loading state
- [ ] Add loadedmetadata listener to clear error
- [ ] Handle different error types:
  - Unsupported codec
  - Missing file
  - Permission error
  - Corrupted data

#### Test Error Handling
- [ ] Play invalid file → Shows error in player
- [ ] Play missing file → Shows error
- [ ] Play unsupported codec → Shows codec error
- [ ] Verify errors logged to console

**Checkpoint:** VideoPlayer errors handled ✓

**Commit:** `feat(VideoPlayer): enhance error handling with specific error messages`

---

### 3.3: Improve ExportPanel Error Handling (20 minutes)

#### Modify ExportPanel.js
- [ ] Import logger
- [ ] Add export error handling
- [ ] Handle different export errors:
  - FFmpeg crash
  - Insufficient disk space
  - Permission error
  - Invalid input file
- [ ] Add retry logic for failed exports
- [ ] Show retry button after failure

#### Test Error Handling
- [ ] Trigger FFmpeg crash → Shows helpful error
- [ ] Test insufficient disk space → Shows space error
- [ ] Test permission error → Shows permission message
- [ ] Test retry button → Export retries
- [ ] Verify errors logged to console

**Checkpoint:** ExportPanel errors handled ✓

**Commit:** `feat(ExportPanel): enhance error handling with retry logic`

---

## Phase 4: Trim Validation (30 minutes)

### 4.1: Create Trim Validation Utility (15 minutes)

#### Create File
- [ ] Create `src/utils/trimValidation.js`

#### Implement validateTrimPoints
- [ ] Check in point is non-negative
- [ ] Check out point doesn't exceed duration
- [ ] Check in point < out point
- [ ] Check minimum duration (0.1 seconds)
- [ ] Return validation object

#### Test Validation
- [ ] Test with valid trim points
- [ ] Test with invalid points (in >= out)
- [ ] Test with negative in point
- [ ] Test with out point > duration
- [ ] Test with very short duration

**Checkpoint:** Trim validation working ✓

**Commit:** `feat(utils): add trim point validation utility`

---

### 4.2: Integrate Validation in TrimControls (15 minutes)

#### Modify TrimControls.js
- [ ] Import validateTrimPoints
- [ ] Import logger
- [ ] Add validation in handleSetInPoint
- [ ] Add validation in handleSetOutPoint
- [ ] Show validation errors in UI
- [ ] Disable export button on invalid trim

#### Test Validation
- [ ] Set in point after out point → Shows error
- [ ] Set out point before in point → Shows error
- [ ] Set negative in point → Shows error
- [ ] Set very short trim → Shows minimum duration error
- [ ] Verify export disabled with invalid trim

**Checkpoint:** Trim validation integrated ✓

**Commit:** `feat(TrimControls): add trim point validation with error messages`

---

## Phase 5: Memory Management (30 minutes)

### 5.1: Add VideoPlayer Cleanup (20 minutes)

#### Modify VideoPlayer.js
- [ ] Add useEffect for cleanup
  ```javascript
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set up event listeners
    // ...

    return () => {
      // Cleanup
      video.pause();
      video.src = '';
      video.load();
      setLoading(false);
      setError(null);
    };
  }, [props.clip]);
  ```

#### Test Cleanup
- [ ] Import multiple clips
- [ ] Switch between clips
- [ ] Check React DevTools for memory
- [ ] Verify no leaks after 10+ switches
- [ ] Verify video elements cleaned up

**Checkpoint:** VideoPlayer cleanup working ✓

**Commit:** `feat(VideoPlayer): add proper cleanup to prevent memory leaks`

---

### 5.2: Add Logging Throughout App (10 minutes)

#### Add Logging to All Components
- [ ] Import logger in ImportPanel
- [ ] Import logger in VideoPlayer
- [ ] Import logger in Timeline
- [ ] Import logger in TrimControls
- [ ] Import logger in ExportPanel
- [ ] Add logger.info for important actions
- [ ] Add logger.error for all errors

#### Test Logging
- [ ] Perform import → See log in console
- [ ] Play video → See log in console
- [ ] Set trim → See log in console
- [ ] Export video → See log in console
- [ ] Trigger error → See error log

**Checkpoint:** Logging added throughout app ✓

**Commit:** `feat: add structured logging throughout application`

---

## Testing Phase (30 minutes)

### 6.1: Error Boundary Tests

#### Test Error Boundary
- [ ] Trigger error in component
- [ ] Verify ErrorFallback shows
- [ ] Verify error logged to console
- [ ] Click reload button
- [ ] Verify error reset
- [ ] Test with show details toggle

**Status:** ✅ PASS / ❌ FAIL

---

### 6.2: Import Error Tests

#### Test Import Errors
- [ ] Invalid file extension → ❌ Shows helpful error
- [ ] File too large → ❌ Shows size limit error
- [ ] Corrupted video → ❌ Shows corruption error
- [ ] Permission error → ❌ Shows permission message
- [ ] Metadata extraction fails → ❌ Import succeeds with warning

**Status:** ✅ PASS / ❌ FAIL

---

### 6.3: Playback Error Tests

#### Test Playback Errors
- [ ] Unsupported codec → ❌ Shows codec error
- [ ] Missing file → ❌ Shows file not found error
- [ ] Corrupted data → ❌ Shows corruption error
- [ ] Clear video after error → ❌ Error clears

**Status:** ✅ PASS / ❌ FAIL

---

### 6.4: Export Error Tests

#### Test Export Errors
- [ ] FFmpeg crash → ❌ Shows helpful error + retry
- [ ] Insufficient disk space → ❌ Shows space error
- [ ] Permission error → ❌ Shows permission message
- [ ] Click retry button → ❌ Export retries
- [ ] Multiple retries → ❌ Handles gracefully

**Status:** ✅ PASS / ❌ FAIL

---

### 6.5: Trim Validation Tests

#### Test Trim Validation
- [ ] In point after out point → ❌ Shows validation error
- [ ] Negative in point → ❌ Shows bounds error
- [ ] Out point > duration → ❌ Shows duration error
- [ ] Very short trim (<0.1s) → ❌ Shows minimum duration error
- [ ] Valid trim → ❌ No error, export enabled

**Status:** ✅ PASS / ❌ FAIL

---

### 6.6: Memory Leak Tests

#### Test Memory Management
- [ ] Import 10 clips → ❌ Memory stable
- [ ] Switch between clips → ❌ Memory stable
- [ ] Import, play, switch (repeat 10x) → ❌ Memory stable
- [ ] Leave app running 30 min → ❌ Memory stable
- [ ] Check React DevTools profiler → ❌ No leaks

**Status:** ✅ PASS / ❌ FAIL

---

### 6.7: Edge Case Tests

#### Test Edge Cases
- [ ] Very short video (<1s) → ❌ Works
- [ ] Very long video (>1h) → ❌ Works
- [ ] Large file (>500MB) → ❌ Works
- [ ] Small file (<1MB) → ❌ Works
- [ ] Single frame video → ❌ Works
- [ ] Video with no audio → ❌ Works
- [ ] Audio-only file → ❌ Works

**Status:** ✅ PASS / ❌ FAIL

---

### 6.8: Logging Tests

#### Test Logging
- [ ] Perform import → ❌ See [INFO] log
- [ ] Play video → ❌ See [INFO] log
- [ ] Trigger error → ❌ See [ERROR] log
- [ ] Production build → ❌ No logs (unless forced)
- [ ] Debug mode → ❌ All logs visible

**Status:** ✅ PASS / ❌ FAIL

---

## Completion Checklist

### Code Complete
- [ ] All tasks in checklist complete
- [ ] No console errors in development
- [ ] No console errors in production build
- [ ] All error paths tested
- [ ] Memory leaks fixed
- [ ] Code commits ready

### Testing Complete
- [ ] All error boundary tests passing
- [ ] All import error tests passing
- [ ] All playback error tests passing
- [ ] All export error tests passing
- [ ] All trim validation tests passing
- [ ] Memory leak tests passing
- [ ] Edge case tests passing
- [ ] Logging tests passing

### Documentation Ready
- [ ] Comments added to error handling code
- [ ] Logger utility documented
- [ ] ErrorBoundary documented
- [ ] Validation functions documented

### Ready to Merge
- [ ] Branch tested thoroughly
- [ ] All commits descriptive
- [ ] Ready for PR review (self-review for now)

---

## Bug Fixing (If needed)

### Bug Tracking
For each bug found during implementation:
1. Document the bug in PR_PARTY/PR08_BUG_ANALYSIS.md
2. Fix the bug
3. Test the fix
4. Update checklist

---

## Git Workflow

### Commit Strategy
Commit after each phase completion:
- `feat(utils): add logger utility`
- `feat(components): add ErrorBoundary`
- `feat(ipc): add metadata extraction`
- `feat(ImportPanel): enhance error handling`
- `feat(VideoPlayer): enhance error handling`
- `feat(ExportPanel): enhance error handling`
- `feat(utils): add trim validation`
- `feat(TrimControls): add validation`
- `feat(VideoPlayer): add cleanup`
- `feat: add structured logging`

### Final Commits
- `fix(error-handling): complete PR#8 error handling and bug fixes`
- `docs(PR08): add complete summary`

---

**Status:** ✅ All Tasks Complete / 🚧 In Progress / 📋 Not Started

