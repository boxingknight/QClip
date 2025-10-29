# PR#17: Screen Recording Setup - Implementation Checklist

**Use this as your daily todo list.** Check off items as you complete them.

---

## Pre-Implementation Setup (15 minutes)

- [ ] Read main planning document (~45 min)
- [ ] Prerequisites verified
  - [ ] PR #11 (State Management Refactor) complete
  - [ ] PR #12 (UI Component Library) complete
  - [ ] PR #13 (Professional Timeline) complete
  - [ ] RecordingContext placeholder exists
- [ ] Dependencies installed (none new for this PR)
- [ ] Environment configured
  - [ ] Test Electron desktopCapturer API access
  - [ ] Test MediaRecorder API support
  - [ ] Verify screen permissions on macOS
- [ ] Git branch created
  ```bash
  git checkout -b feature/pr17-screen-recording
  ```

---

## Phase 1: Electron API Setup (1.5 hours)

### 1.1: Main Process Screen Source Handler (30 minutes)

#### Create IPC Handler
- [ ] Open `main.js`
- [ ] Add `desktopCapturer` import from 'electron'
- [ ] Add `get-screen-sources` IPC handler
  ```javascript
  ipcMain.handle('get-screen-sources', async () => {
    const sources = await desktopCapturer.getSources({
      types: ['window', 'screen'],
      thumbnailSize: { width: 150, height: 150 }
    });
    
    return sources.map(source => ({
      id: source.id,
      name: source.name,
      displayId: source.display_id || '',
      thumbnail: source.thumbnail.toDataURL()
    }));
  });
  ```

#### Test Handler
- [ ] Test case 1: Get sources successfully
  - Expected: Array of sources with thumbnails
  - Actual: [Record result]
- [ ] Test case 2: Handle permission denied
  - Expected: Error thrown with helpful message
  - Actual: [Record result]

**Checkpoint:** IPC handler working ✓

**Commit:** `feat(main): add get-screen-sources IPC handler`

---

### 1.2: Preload API Exposure (15 minutes)

#### Add Preload APIs
- [ ] Open `preload.js`
- [ ] Add `getScreenSources` API
  ```javascript
  getScreenSources: () => ipcRenderer.invoke('get-screen-sources'),
  requestScreenPermission: () => ipcRenderer.invoke('request-screen-permission')
  ```

#### Test Preload APIs
- [ ] Test case 1: API exposed in window.electronAPI
  - Expected: getScreenSources function exists
  - Actual: [Record result]
- [ ] Test case 2: API returns sources
  - Expected: Promise resolves with source array
  - Actual: [Record result]

**Checkpoint:** Preload APIs working ✓

**Commit:** `feat(preload): expose screen sources API`

---

### 1.3: Permission Handling (30 minutes)

#### Add Permission Handler
- [ ] Open `main.js`
- [ ] Add permission request handler
  ```javascript
  ipcMain.handle('request-screen-permission', async () => {
    // macOS requires screen recording permission
    // Electron handles this automatically on first use
    return true;
  });
  ```

#### Test Permissions
- [ ] Test case 1: First-time permission request
  - Expected: macOS permission dialog appears
  - Actual: [Record result]
- [ ] Test case 2: Permission already granted
  - Expected: Sources returned immediately
  - Actual: [Record result]
- [ ] Test case 3: Permission denied
  - Expected: Error message with instructions
  - Actual: [Record result]

**Checkpoint:** Permission handling working ✓

**Commit:** `feat(main): add screen recording permission handling`

---

## Phase 2: RecordingContext Implementation (2 hours)

### 2.1: State Structure Setup (30 minutes)

#### Create State Variables
- [ ] Open `src/context/RecordingContext.js`
- [ ] Replace placeholder with full state structure
  ```javascript
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingSource, setRecordingSource] = useState(null);
  const [mediaStream, setMediaStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [recordingSettings, setRecordingSettings] = useState({
    includeAudio: true,
    videoCodec: 'vp9',
    audioCodec: 'opus',
    frameRate: 30,
    videoQuality: 'high'
  });
  const [savedRecordings, setSavedRecordings] = useState([]);
  const [error, setError] = useState(null);
  ```

#### Test State Initialization
- [ ] Test case 1: All state initialized correctly
  - Expected: Default values set
  - Actual: [Record result]

**Checkpoint:** State structure complete ✓

**Commit:** `feat(recording): implement RecordingContext state structure`

---

### 2.2: Get Available Sources Action (20 minutes)

#### Implement getAvailableSources
- [ ] Add `getAvailableSources` function
  ```javascript
  const getAvailableSources = async () => {
    try {
      setError(null);
      const sources = await window.electronAPI.getScreenSources();
      
      return sources.map(source => ({
        id: source.id,
        name: source.name,
        displayId: source.displayId || '',
        thumbnail: source.thumbnail
      }));
    } catch (error) {
      logger.error('Failed to get screen sources', error);
      setError('Unable to access screen sources. Please check permissions.');
      throw error;
    }
  };
  ```

#### Test getAvailableSources
- [ ] Test case 1: Sources returned successfully
  - Expected: Array of source objects
  - Actual: [Record result]
- [ ] Test case 2: Error handling
  - Expected: Error state set, function throws
  - Actual: [Record result]

**Checkpoint:** getAvailableSources working ✓

**Commit:** `feat(recording): implement getAvailableSources action`

---

### 2.3: Start Recording Action (45 minutes)

#### Implement Start Recording
- [ ] Add `startRecording` function
  - [ ] Get media stream with getUserMedia
  - [ ] Setup MediaRecorder with options
  - [ ] Setup data available handler
  - [ ] Setup stop handler
  - [ ] Setup error handler
  - [ ] Start MediaRecorder
  - [ ] Update state
  - [ ] Start duration timer

#### Test Start Recording
- [ ] Test case 1: Recording starts successfully
  - Expected: isRecording true, mediaRecorder active
  - Actual: [Record result]
- [ ] Test case 2: Chunks collected
  - Expected: recordedChunks array populated
  - Actual: [Record result]
- [ ] Test case 3: Duration timer updates
  - Expected: recordingDuration increments
  - Actual: [Record result]
- [ ] Test case 4: Error handling
  - Expected: Error state set on failure
  - Actual: [Record result]

**Checkpoint:** startRecording working ✓

**Commit:** `feat(recording): implement startRecording action`

---

### 2.4: Stop Recording Action (30 minutes)

#### Implement Stop Recording
- [ ] Add `stopRecording` function
  - [ ] Stop MediaRecorder
  - [ ] Wait for onstop event
  - [ ] Collect all chunks
  - [ ] Create Blob from chunks
  - [ ] Stop all tracks
  - [ ] Clear interval
  - [ ] Reset state
  - [ ] Return blob

#### Test Stop Recording
- [ ] Test case 1: Recording stops successfully
  - Expected: isRecording false, blob returned
  - Actual: [Record result]
- [ ] Test case 2: All chunks collected
  - Expected: Blob size > 0
  - Actual: [Record result]
- [ ] Test case 3: Stream stopped
  - Expected: All tracks stopped
  - Actual: [Record result]

**Checkpoint:** stopRecording working ✓

**Commit:** `feat(recording): implement stopRecording action`

---

### 2.5: Save Recording Action (25 minutes)

#### Implement Save Recording
- [ ] Add `saveRecording` function
  - [ ] Show save dialog
  - [ ] Write file via IPC
  - [ ] Get video metadata
  - [ ] Create recording file object
  - [ ] Add to savedRecordings
  - [ ] Return recording file

#### Add IPC Handler for File Save
- [ ] Add `save-recording-file` handler in main.js
  ```javascript
  ipcMain.handle('save-recording-file', async (event, blob, filePath) => {
    const fs = require('fs').promises;
    const buffer = Buffer.from(await blob.arrayBuffer());
    await fs.writeFile(filePath, buffer);
    return filePath;
  });
  ```

#### Test Save Recording
- [ ] Test case 1: File saved successfully
  - Expected: File exists at path, valid video
  - Actual: [Record result]
- [ ] Test case 2: Added to savedRecordings
  - Expected: Recording in savedRecordings array
  - Actual: [Record result]
- [ ] Test case 3: Error handling
  - Expected: Error on save failure
  - Actual: [Record result]

**Checkpoint:** saveRecording working ✓

**Commit:** `feat(recording): implement saveRecording action`

---

### 2.6: Context Value Export (10 minutes)

#### Export Context Value
- [ ] Create context value object
  ```javascript
  const value = {
    // State
    isRecording,
    isPaused,
    recordingSource,
    recordedChunks,
    recordingDuration,
    recordingSettings,
    savedRecordings,
    error,
    
    // Actions
    getAvailableSources,
    startRecording,
    stopRecording,
    saveRecording,
    cancelRecording,
    
    // Utilities
    formatDuration: (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
  };
  ```

#### Test Context Provider
- [ ] Test case 1: Context value accessible
  - Expected: useRecording hook returns value
  - Actual: [Record result]

**Checkpoint:** RecordingContext complete ✓

**Commit:** `feat(recording): complete RecordingContext implementation`

---

## Phase 3: UI Components (2 hours)

### 3.1: RecordingControls Component (45 minutes)

#### Create Component File
- [ ] Create `src/components/recording/RecordingControls.js`
- [ ] Import dependencies
  ```javascript
  import React, { useState } from 'react';
  import { useRecording } from '../../context/RecordingContext';
  import { useUI } from '../../context/UIContext';
  import RecordingButton from './RecordingButton';
  import RecordingIndicator from './RecordingIndicator';
  import SourcePicker from './SourcePicker';
  import './RecordingControls.css';
  ```

#### Implement Component Logic
- [ ] Add state management
- [ ] Add `handleStartRecording` function
- [ ] Add `handleStopRecording` function
- [ ] Add error display
- [ ] Add conditional rendering (recording vs. stopped)

#### Create Component Styling
- [ ] Create `src/components/recording/RecordingControls.css`
- [ ] Add layout styles
- [ ] Add button styles
- [ ] Add error message styles

#### Test Component
- [ ] Test case 1: Component renders
  - Expected: Controls visible
  - Actual: [Record result]
- [ ] Test case 2: Start recording works
  - Expected: Recording begins on click
  - Actual: [Record result]

**Checkpoint:** RecordingControls complete ✓

**Commit:** `feat(recording): create RecordingControls component`

---

### 3.2: SourcePicker Component (40 minutes)

#### Create Component File
- [ ] Create `src/components/recording/SourcePicker.js`
- [ ] Import dependencies (Modal, useRecording)

#### Implement Source Selection UI
- [ ] Add source list rendering
- [ ] Add thumbnail display
- [ ] Add source selection handler
- [ ] Add recording options (includeAudio, quality)
- [ ] Add "Remember choice" checkbox
- [ ] Add close/cancel handlers

#### Create Component Styling
- [ ] Create `src/components/recording/SourcePicker.css`
- [ ] Add modal layout
- [ ] Add source grid/list styles
- [ ] Add thumbnail styles
- [ ] Add option form styles

#### Test Component
- [ ] Test case 1: Sources displayed
  - Expected: Source list with thumbnails
  - Actual: [Record result]
- [ ] Test case 2: Selection works
  - Expected: Selected source returned
  - Actual: [Record result]

**Checkpoint:** SourcePicker complete ✓

**Commit:** `feat(recording): create SourcePicker component`

---

### 3.3: RecordingIndicator Component (25 minutes)

#### Create Component File
- [ ] Create `src/components/recording/RecordingIndicator.js`
- [ ] Import dependencies

#### Implement Indicator Display
- [ ] Add recording status display
- [ ] Add duration display
- [ ] Add source name display
- [ ] Add animated recording dot
- [ ] Add file size estimation

#### Create Component Styling
- [ ] Create `src/components/recording/RecordingIndicator.css`
- [ ] Add indicator styles
- [ ] Add animation for recording dot
- [ ] Add duration display styles

#### Test Component
- [ ] Test case 1: Indicator shows during recording
  - Expected: Visual indicator visible
  - Actual: [Record result]
- [ ] Test case 2: Duration updates
  - Expected: Time increments correctly
  - Actual: [Record result]

**Checkpoint:** RecordingIndicator complete ✓

**Commit:** `feat(recording): create RecordingIndicator component`

---

### 3.4: Toolbar Integration (25 minutes)

#### Add Recording Button to Toolbar
- [ ] Open `src/components/ui/Toolbar.js`
- [ ] Add recording actions group
- [ ] Add RecordingControls integration
- [ ] Add recording button icon

#### Test Toolbar Integration
- [ ] Test case 1: Button appears in toolbar
  - Expected: Recording button visible
  - Actual: [Record result]
- [ ] Test case 2: Button opens controls
  - Expected: RecordingControls appear
  - Actual: [Record result]

**Checkpoint:** Toolbar integration complete ✓

**Commit:** `feat(recording): integrate recording controls in toolbar`

---

### 3.5: Window Title Badge (5 minutes)

#### Add Recording Badge
- [ ] Open `src/App.js`
- [ ] Add useEffect to update window title
  ```javascript
  useEffect(() => {
    if (isRecording) {
      document.title = '● Recording - ClipForge';
    } else {
      document.title = 'ClipForge';
    }
  }, [isRecording]);
  ```

#### Test Badge
- [ ] Test case 1: Title updates during recording
  - Expected: "● Recording" in title
  - Actual: [Record result]

**Checkpoint:** Window title badge complete ✓

**Commit:** `feat(recording): add recording indicator to window title`

---

## Phase 4: Integration & Testing (1 hour)

### 4.1: App Integration (20 minutes)

#### Add RecordingProvider
- [ ] Open `src/App.js`
- [ ] Import RecordingProvider
- [ ] Wrap app with RecordingProvider
- [ ] Add RecordingControls to layout

#### Test Integration
- [ ] Test case 1: RecordingProvider working
  - Expected: No context errors
  - Actual: [Record result]
- [ ] Test case 2: RecordingControls accessible
  - Expected: Controls visible in app
  - Actual: [Record result]

**Checkpoint:** App integration complete ✓

**Commit:** `feat(recording): integrate RecordingProvider in App`

---

### 4.2: Media Library Integration (20 minutes)

#### Auto-Add Recorded Videos
- [ ] Open `src/components/MediaLibrary.js`
- [ ] Import useRecording hook
- [ ] Listen for new savedRecordings
- [ ] Add recorded videos to media library
- [ ] Display recording metadata

#### Test Media Library Integration
- [ ] Test case 1: Recorded video appears
  - Expected: Video in Media Library after save
  - Actual: [Record result]
- [ ] Test case 2: Video playable
  - Expected: Can play recorded video
  - Actual: [Record result]

**Checkpoint:** Media Library integration complete ✓

**Commit:** `feat(recording): auto-add recorded videos to Media Library`

---

### 4.3: End-to-End Testing (15 minutes)

#### Test Complete Workflow
- [ ] Test case 1: Full recording workflow
  - Steps:
    1. Click "Start Recording"
    2. Select screen source
    3. Recording starts
    4. Stop recording
    5. Save video
    6. Video appears in Media Library
  - Expected: All steps work
  - Actual: [Record result]

#### Test Error Cases
- [ ] Test case 2: Permission denied
  - Expected: Error message with instructions
  - Actual: [Record result]
- [ ] Test case 3: Source unavailable
  - Expected: Error message, can retry
  - Actual: [Record result]
- [ ] Test case 4: Save cancelled
  - Expected: Recording available but not saved
  - Actual: [Record result]

**Checkpoint:** End-to-end testing complete ✓

**Commit:** `test(recording): complete end-to-end workflow testing`

---

### 4.4: Performance Testing (5 minutes)

#### Test Performance Metrics
- [ ] Test case 1: Recording start time
  - Expected: < 2 seconds
  - Actual: [Record result]
- [ ] Test case 2: Memory usage
  - Expected: < 500MB during recording
  - Actual: [Record result]
- [ ] Test case 3: Frame rate
  - Expected: ~30fps maintained
  - Actual: [Record result]

**Checkpoint:** Performance testing complete ✓

**Commit:** `test(recording): performance metrics verified`

---

## Phase 5: Polish & Edge Cases (30 minutes)

### 5.1: Loading States (10 minutes)

#### Add Loading Indicators
- [ ] Add loading state for source fetching
- [ ] Add loading state for recording start
- [ ] Add loading state for file save
- [ ] Add spinner animations

#### Test Loading States
- [ ] Test case 1: Loading indicators visible
  - Expected: Spinners show during operations
  - Actual: [Record result]

**Checkpoint:** Loading states complete ✓

**Commit:** `feat(recording): add loading states`

---

### 5.2: Error Messages (10 minutes)

#### Improve Error Messages
- [ ] Add permission denied message with instructions
- [ ] Add source unavailable message
- [ ] Add save error messages
- [ ] Add MediaRecorder error messages

#### Test Error Messages
- [ ] Test case 1: Helpful error messages
  - Expected: Clear, actionable messages
  - Actual: [Record result]

**Checkpoint:** Error messages complete ✓

**Commit:** `feat(recording): improve error messages`

---

### 5.3: Edge Cases (10 minutes)

#### Handle Edge Cases
- [ ] Add warning before app close during recording
- [ ] Add handling for no sources available
- [ ] Add handling for MediaRecorder not supported
- [ ] Add handling for disk space full

#### Test Edge Cases
- [ ] Test case 1: All edge cases handled
  - Expected: Graceful handling
  - Actual: [Record result]

**Checkpoint:** Edge cases handled ✓

**Commit:** `feat(recording): handle edge cases`

---

## Testing Checklist

### Unit Tests
- [ ] RecordingContext: getAvailableSources
- [ ] RecordingContext: startRecording
- [ ] RecordingContext: stopRecording
- [ ] RecordingContext: saveRecording
- [ ] Recording utilities: formatDuration
- [ ] Recording utilities: getRecordingSize

### Integration Tests
- [ ] Record screen → Stop → Save → Media Library
- [ ] Permission denied → Error message
- [ ] Source unavailable → Error handling
- [ ] Recording stopped during save → Graceful handling

### Manual Tests
- [ ] Happy path works (start → record → stop → save)
- [ ] Error handling works (permission denied, etc.)
- [ ] Performance acceptable (start time, memory, FPS)
- [ ] UI responsive and professional
- [ ] Recorded videos playable and editable

### Performance Tests
- [ ] Recording start time: < 2 seconds ✓
- [ ] Frame rate: ~30fps maintained ✓
- [ ] Memory usage: < 500MB during recording ✓
- [ ] File size: < 50MB per minute (high quality) ✓

---

## Deployment Phase (15 minutes)

### Pre-Deploy Checklist
- [ ] All tests passing
- [ ] No console errors
- [ ] Build successful locally
- [ ] Recorded videos playable
- [ ] Performance targets met

### Final Verification
- [ ] Test in packaged app
- [ ] Verify permissions work in production
- [ ] Test screen recording in packaged app
- [ ] Verify files save correctly

---

## Completion Checklist

- [ ] All phases complete
- [ ] All tests passing
- [ ] Performance targets met
- [ ] No critical bugs
- [ ] Documentation complete
- [ ] Code committed
- [ ] Ready for PR merge

**Status:** ⏳ IN PROGRESS

