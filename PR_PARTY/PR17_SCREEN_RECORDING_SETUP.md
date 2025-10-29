# PR#17: Screen Recording Setup

**Estimated Time:** 6 hours  
**Complexity:** HIGH  
**Dependencies:** PR #11 (State Management Refactor), PR #12 (UI Component Library), PR #13 (Professional Timeline)

---

## Overview

### What We're Building
Implement screen recording functionality using Electron's `desktopCapturer` API and the Web `MediaRecorder` API. Users can record their screen, optionally with system audio, and save recorded videos directly to the Media Library. This transforms ClipForge from a video editor into a complete capture-and-edit solution.

### Why It Matters
Screen recording is a key differentiator for ClipForge V2, enabling users to:
- **Capture content directly** - No need to use external recording tools
- **Seamless workflow** - Record → Edit → Export in one application
- **Professional feature** - Matches capabilities of OBS, QuickTime, and other recording tools
- **Foundation for advanced features** - Webcam recording, multi-source recording (PR#18, PR#19)

### Success in One Sentence
"This PR is successful when users can start screen recording, see a visual indicator, stop recording, and have the recorded video automatically appear in the Media Library."

---

## Technical Design

### Architecture Decisions

#### Decision 1: Recording API Choice
**Options Considered:**
1. **Electron desktopCapturer + MediaRecorder** - Native APIs, good browser support, async/await friendly
2. **FFmpeg screen capture** - More control, cross-platform, requires additional configuration
3. **Third-party library (recordrtc)** - Feature-rich, additional dependency, potential licensing issues

**Chosen:** Electron desktopCapturer + MediaRecorder

**Rationale:**
- Native Electron API provides screen source selection
- MediaRecorder is standard Web API with broad support
- Async/await pattern fits our codebase style
- No additional dependencies
- Good performance and reliability

**Trade-offs:**
- Gain: Standard APIs, no dependencies, good performance
- Lose: Limited codec options (depends on browser), potential browser-specific differences

#### Decision 2: Recording Format Strategy
**Options Considered:**
1. **Record directly to MP4** - Requires MediaRecorder codec support, complex
2. **Record to WebM, convert to MP4** - More reliable, consistent browser support, two-step process
3. **Record to multiple formats** - Overkill, complex state management

**Chosen:** Record to WebM, convert to MP4 (if needed)

**Rationale:**
- WebM has excellent browser support for MediaRecorder
- Can convert to MP4 using FFmpeg during save
- Reliable across different Electron versions
- Users can choose to keep WebM or convert

**Trade-offs:**
- Gain: Reliable recording, consistent format
- Lose: Conversion step if MP4 required

#### Decision 3: State Management Approach
**Options Considered:**
1. **RecordingContext** - Consistent with existing architecture (PR#11)
2. **Local component state** - Simpler, but harder to share with Media Library
3. **ProjectContext** - Mixing concerns, recording is distinct from projects

**Chosen:** RecordingContext with Media Library integration

**Rationale:**
- RecordingContext established in PR#11 structure (currently placeholder)
- Clear separation of concerns (recording vs. editing)
- Easy integration with MediaLibraryContext
- Follows established patterns

**Trade-offs:**
- Gain: Clear separation, consistent architecture, easy integration
- Lose: Additional context provider

#### Decision 4: Recording Source Selection
**Options Considered:**
1. **Screen + Audio automatically** - Simple, no user choice
2. **Source picker dialog** - Professional, user control, more complex
3. **Settings-based selection** - Persistent, but hidden from users

**Chosen:** Source picker dialog (with "Remember choice" option)

**Rationale:**
- Professional recording tools (OBS, QuickTime) offer source selection
- Users may want different sources (entire screen, specific window, application audio only)
- Better UX with choice
- "Remember choice" provides convenience for repeated use

**Trade-offs:**
- Gain: Professional UX, user control, flexibility
- Lose: Slightly more complex implementation

#### Decision 5: Recording Indicator
**Options Considered:**
1. **In-app indicator only** - Simple, but easy to miss if window minimized
2. **System tray icon** - Always visible, cross-platform complexity
3. **Floating recording badge** - Professional, visible during recording, needs window management

**Chosen:** In-app indicator + recording badge in window title

**Rationale:**
- In-app indicator shows recording state clearly
- Window title badge ensures visibility even when app is in background
- Simple to implement
- Professional appearance

**Trade-offs:**
- Gain: Clear feedback, visible state, simple implementation
- Lose: No system tray (can add later if needed)

---

## Data Model

### RecordingContext State Structure

```javascript
{
  isRecording: boolean,              // Active recording status
  isPaused: boolean,                 // Paused state (not implemented in PR#17)
  recordingSource: {
    id: string,                       // Source ID from desktopCapturer
    name: string,                     // Human-readable name
    displayId: string,                // Display identifier
    thumbnail: string                 // Thumbnail data URL
  } | null,
  mediaStream: MediaStream | null,    // Active recording stream
  mediaRecorder: MediaRecorder | null, // MediaRecorder instance
  recordedChunks: Blob[],            // Accumulated video chunks
  recordingDuration: number,        // Elapsed recording time (seconds)
  startTime: number | null,          // Recording start timestamp
  recordingSettings: {
    includeAudio: boolean,            // System audio capture
    videoCodec: string,               // Video codec preference
    audioCodec: string,               // Audio codec preference
    frameRate: number,                // Recording frame rate
    videoQuality: string              // Quality preset (high/medium/low)
  },
  savedRecordings: RecordingFile[],   // History of saved recordings
  error: string | null                // Recording error message
}
```

### Recording File Structure

```javascript
{
  id: string,                         // Unique recording ID
  name: string,                       // File name
  path: string,                      // File system path
  duration: number,                  // Recording duration (seconds)
  size: number,                      // File size (bytes)
  format: 'webm' | 'mp4',            // Recording format
  timestamp: number,                 // Recording timestamp
  source: {
    id: string,
    name: string
  },
  thumbnail: string | null           // Thumbnail path or data URL
}
```

---

## API Design

### RecordingContext API

```javascript
/**
 * RecordingContext - Manages screen recording state and operations
 */
const RecordingContext = {
  // State
  isRecording: boolean,
  isPaused: boolean,
  recordingSource: SourceInfo | null,
  recordedChunks: Blob[],
  recordingDuration: number,
  recordingSettings: RecordingSettings,
  savedRecordings: RecordingFile[],
  error: string | null,

  // Actions
  getAvailableSources: () => Promise<SourceInfo[]>,
  startRecording: (sourceId: string, options?: RecordingOptions) => Promise<void>,
  stopRecording: () => Promise<Blob>,
  pauseRecording: () => void,         // Future: PR#18
  resumeRecording: () => void,        // Future: PR#18
  cancelRecording: () => void,
  saveRecording: (blob: Blob, filename?: string) => Promise<RecordingFile>,
  openSourcePicker: () => Promise<SourceInfo | null>,
  
  // Utilities
  formatDuration: (seconds: number) => string,
  getRecordingSize: (blob: Blob) => number,
  validateRecordingSettings: (settings: RecordingSettings) => ValidationResult
};
```

### Electron IPC APIs

**main.js Handlers:**
```javascript
// Get available screen sources
ipcMain.handle('get-screen-sources', async () => {
  // Returns array of { id, name, thumbnail }
});

// Request screen share permissions
ipcMain.handle('request-screen-permission', async () => {
  // Returns boolean indicating permission granted
});
```

**preload.js Exposed APIs:**
```javascript
window.electronAPI = {
  getScreenSources: () => ipcRenderer.invoke('get-screen-sources'),
  requestScreenPermission: () => ipcRenderer.invoke('request-screen-permission')
};
```

---

## Component Hierarchy

```
RecordingProvider (Context)
├── RecordingControls (New Component)
│   ├── SourcePicker (Modal)
│   │   ├── SourceList
│   │   │   └── SourceItem (with thumbnail)
│   │   └── RecordingOptions
│   │       ├── IncludeAudio toggle
│   │       ├── Quality selector
│   │       └── RememberChoice checkbox
│   ├── RecordingButton
│   │   └── RecordingIndicator (animated)
│   ├── StopButton
│   └── RecordingStatus (duration, file size)
└── MediaLibrary (Integration)
    └── RecordedVideoItem (auto-added after save)
```

---

## Implementation Details

### File Structure
**New Files:**
```
src/
├── context/
│   └── RecordingContext.js (~400 lines) - Full recording state management
├── components/
│   └── recording/
│       ├── RecordingControls.js (~250 lines) - Main recording UI
│       ├── RecordingControls.css (~150 lines) - Recording controls styling
│       ├── SourcePicker.js (~200 lines) - Source selection modal
│       ├── SourcePicker.css (~100 lines) - Source picker styling
│       ├── RecordingIndicator.js (~80 lines) - Recording status indicator
│       └── RecordingIndicator.css (~50 lines) - Indicator animations
└── utils/
    └── recordingHelpers.js (~150 lines) - Recording utilities

electron/
└── recording/
    └── screenCapture.js (~200 lines) - Desktop capturer integration
```

**Modified Files:**
- `main.js` (+80 lines) - IPC handlers for screen sources
- `preload.js` (+20 lines) - Expose recording APIs
- `src/context/RecordingContext.js` (+350/-30 lines) - Implement full context
- `src/components/MediaLibrary.js` (+50 lines) - Auto-add recorded videos
- `src/App.js` (+30 lines) - RecordingProvider integration

### Key Implementation Steps

#### Phase 1: Electron API Setup (1.5 hours)
1. Implement `get-screen-sources` IPC handler in main.js
2. Add `getScreenSources` API in preload.js
3. Test desktopCapturer API access
4. Handle permission requests

#### Phase 2: RecordingContext Implementation (2 hours)
1. Implement RecordingContext with state management
2. Add `getAvailableSources` action
3. Add `startRecording` action with MediaRecorder setup
4. Add `stopRecording` action with blob collection
5. Add `saveRecording` action with file write
6. Add duration tracking with setInterval

#### Phase 3: UI Components (2 hours)
1. Create RecordingControls component
2. Create SourcePicker modal
3. Create RecordingIndicator component
4. Add recording button to Toolbar
5. Integrate with UIContext for modals

#### Phase 4: Integration & Testing (1 hour)
1. Integrate RecordingProvider in App.js
2. Connect recorded videos to Media Library
3. Test recording workflow end-to-end
4. Handle error cases (permission denied, source unavailable)
5. Add window title badge during recording

#### Phase 5: Polish & Edge Cases (0.5 hours)
1. Add loading states
2. Add error messages
3. Add recording duration display
4. Add file size estimation
5. Test with different screen sources

### Code Examples

**Example 1: Get Available Sources**
```javascript
// RecordingContext.js
const getAvailableSources = async () => {
  try {
    setError(null);
    const sources = await window.electronAPI.getScreenSources();
    
    return sources.map(source => ({
      id: source.id,
      name: source.name,
      displayId: source.display_id || '',
      thumbnail: source.thumbnail.toDataURL()
    }));
  } catch (error) {
    logger.error('Failed to get screen sources', error);
    setError('Unable to access screen sources. Please check permissions.');
    throw error;
  }
};
```

**Example 2: Start Recording**
```javascript
// RecordingContext.js
const startRecording = async (sourceId, options = {}) => {
  try {
    setError(null);
    
    // Get media stream
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: options.includeAudio 
        ? { mandatory: { chromeMediaSource: 'desktop' } }
        : false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: sourceId
        }
      }
    });
    
    // Setup MediaRecorder
    const mimeType = 'video/webm;codecs=vp9';
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: options.quality === 'high' ? 8000000 : 4000000
    });
    
    const chunks = [];
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      setRecordedChunks([blob]);
      stream.getTracks().forEach(track => track.stop());
    };
    
    mediaRecorder.onerror = (event) => {
      logger.error('MediaRecorder error', event);
      setError('Recording error occurred');
    };
    
    // Start recording
    mediaRecorder.start(1000); // Collect chunks every second
    setMediaRecorder(mediaRecorder);
    setMediaStream(stream);
    setIsRecording(true);
    setStartTime(Date.now());
    setRecordingSource(sources.find(s => s.id === sourceId));
    
    // Start duration timer
    const timer = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
    
    return timer;
  } catch (error) {
    logger.error('Failed to start recording', error);
    setError(`Failed to start recording: ${error.message}`);
    throw error;
  }
};
```

**Example 3: Stop and Save Recording**
```javascript
// RecordingContext.js
const stopRecording = async () => {
  return new Promise((resolve, reject) => {
    if (!mediaRecorder || !isRecording) {
      reject(new Error('No active recording'));
      return;
    }
    
    const handleStop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      setIsRecording(false);
      setMediaRecorder(null);
      setMediaStream(null);
      clearInterval(durationTimer);
      resolve(blob);
    };
    
    if (mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
    
    // Wait for onstop event (handled in startRecording setup)
    setTimeout(() => {
      if (recordedChunks.length > 0) {
        handleStop();
      } else {
        reject(new Error('No recording data collected'));
      }
    }, 500);
  });
};

const saveRecording = async (blob, filename) => {
  try {
    // Get save location
    const savePath = await window.electronAPI.showSaveDialog({
      defaultPath: filename || `recording-${Date.now()}.webm`,
      filters: [
        { name: 'WebM Video', extensions: ['webm'] },
        { name: 'MP4 Video', extensions: ['mp4'] }
      ]
    });
    
    if (!savePath.canceled && savePath.filePath) {
      // Write file via IPC (renderer can't write directly)
      await window.electronAPI.saveRecordingFile(blob, savePath.filePath);
      
      // Add to Media Library
      const metadata = await window.electronAPI.getVideoMetadata(savePath.filePath);
      const recordingFile = {
        id: generateId(),
        name: path.basename(savePath.filePath),
        path: savePath.filePath,
        duration: metadata.duration,
        size: blob.size,
        format: savePath.filePath.endsWith('.mp4') ? 'mp4' : 'webm',
        timestamp: Date.now(),
        source: recordingSource,
        thumbnail: metadata.thumbnailUrl
      };
      
      // Add to saved recordings
      setSavedRecordings(prev => [...prev, recordingFile]);
      
      // Add to Media Library context
      // (This will be integrated with MediaLibraryContext)
      
      return recordingFile;
    }
  } catch (error) {
    logger.error('Failed to save recording', error);
    setError(`Failed to save recording: ${error.message}`);
    throw error;
  }
};
```

**Example 4: RecordingControls Component**
```javascript
// src/components/recording/RecordingControls.js
import React, { useState } from 'react';
import { useRecording } from '../../context/RecordingContext';
import { useUI } from '../../context/UIContext';
import RecordingButton from './RecordingButton';
import SourcePicker from './SourcePicker';
import RecordingIndicator from './RecordingIndicator';
import './RecordingControls.css';

const RecordingControls = () => {
  const {
    isRecording,
    recordingDuration,
    recordingSource,
    getAvailableSources,
    startRecording,
    stopRecording,
    saveRecording,
    error
  } = useRecording();
  
  const { showModal, hideModal } = useUI();
  const [showSourcePicker, setShowSourcePicker] = useState(false);
  
  const handleStartRecording = async () => {
    try {
      // Show source picker if no source selected
      if (!recordingSource) {
        const sources = await getAvailableSources();
        const selectedSource = await new Promise((resolve) => {
          showModal('source-picker', {
            sources,
            onSelect: resolve,
            onCancel: () => resolve(null)
          });
        });
        
        if (!selectedSource) return;
        setShowSourcePicker(false);
      }
      
      await startRecording(recordingSource.id, {
        includeAudio: true,
        quality: 'high'
      });
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };
  
  const handleStopRecording = async () => {
    try {
      const blob = await stopRecording();
      await saveRecording(blob);
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };
  
  return (
    <div className="recording-controls">
      {error && (
        <div className="recording-error">{error}</div>
      )}
      
      {!isRecording ? (
        <RecordingButton
          onClick={handleStartRecording}
          label="Start Recording"
          icon="●"
        />
      ) : (
        <>
          <RecordingIndicator
            duration={recordingDuration}
            source={recordingSource}
          />
          <RecordingButton
            onClick={handleStopRecording}
            label="Stop Recording"
            icon="■"
            variant="danger"
          />
        </>
      )}
    </div>
  );
};

export default RecordingControls;
```

---

## Testing Strategy

### Test Categories

**Unit Tests:**
- RecordingContext: getAvailableSources, startRecording, stopRecording, saveRecording
- Recording utilities: formatDuration, getRecordingSize
- Source picker: source selection, options persistence

**Integration Tests:**
- Record screen → Stop → Save → Appears in Media Library
- Permission denied → Error message displayed
- Source unavailable → Error handling
- Recording stopped during save → Graceful handling

**Edge Cases:**
- No screen sources available
- Permission denied by user
- MediaRecorder not supported
- Disk space full during save
- App closed during recording
- Multiple recording attempts

**Performance Tests:**
- Recording start time < 2 seconds
- Frame rate maintains target (30fps)
- Memory usage during recording < 500MB
- File size reasonable (< 50MB per minute at high quality)

---

## Success Criteria

**Feature is complete when:**
- [ ] Users can see available screen sources
- [ ] Users can start screen recording with source selection
- [ ] Recording indicator shows active recording state
- [ ] Recording duration displays in real-time
- [ ] Users can stop recording
- [ ] Recorded video saves to chosen location
- [ ] Recorded video appears in Media Library
- [ ] Recorded video can be played and edited
- [ ] Error handling works for permission denied cases
- [ ] All tests pass
- [ ] Performance targets met
- [ ] Documentation complete

**Performance Targets:**
- Recording start time: < 2 seconds
- Frame rate: 30fps maintained
- Memory usage: < 500MB during recording
- File size: < 50MB per minute (high quality)

**Quality Gates:**
- Zero critical bugs
- Test coverage > 80%
- No console errors during normal operation
- Graceful error handling for all failure modes

---

## Risk Assessment

### Risk 1: Permission Denied
**Likelihood:** HIGH  
**Impact:** MEDIUM  
**Mitigation:** 
- Clear permission request UI
- Helpful error messages with instructions
- Fallback to file picker if screen capture unavailable
**Status:** 🟡 Needs testing

### Risk 2: MediaRecorder Codec Support
**Likelihood:** MEDIUM  
**Impact:** HIGH  
**Mitigation:**
- Feature detection before recording
- Fallback codecs (vp8, h264)
- Conversion to MP4 post-recording if needed
**Status:** 🟡 Needs testing

### Risk 3: Performance Issues
**Likelihood:** MEDIUM  
**Impact:** MEDIUM  
**Mitigation:**
- Optimize MediaRecorder settings
- Monitor memory usage
- Add performance metrics
- Warn users about system resources
**Status:** 🟡 Needs monitoring

### Risk 4: File Format Compatibility
**Likelihood:** LOW  
**Impact:** MEDIUM  
**Mitigation:**
- Save as WebM (widely supported)
- Offer MP4 conversion option
- Test playback in common players
**Status:** 🟢 Low risk

### Risk 5: Recording State Loss
**Likelihood:** LOW  
**Impact:** HIGH  
**Mitigation:**
- Auto-save chunks during recording
- Warn before closing during recording
- Resume capability (future: PR#18)
**Status:** 🟡 Needs warning implementation

---

## Open Questions

1. **Should we offer MP4 conversion immediately or as separate step?**
   - Option A: Convert automatically (slower, but seamless)
   - Option B: Save as WebM, offer conversion later (faster, user choice)
   - **Decision needed by:** Phase 4

2. **How to handle multiple displays?**
   - Option A: Record all displays combined
   - Option B: Record single display (selected)
   - Option C: Record specific window
   - **Decision needed by:** Phase 2

3. **Should recording continue when app is minimized?**
   - Option A: Yes (background recording)
   - Option B: No (pause when minimized)
   - **Decision needed by:** Phase 3

---

## Timeline

**Total Estimate:** 6 hours

| Phase | Task | Time | Status |
|-------|------|------|--------|
| 1 | Electron API Setup | 1.5h | ⏳ |
| 2 | RecordingContext Implementation | 2h | ⏳ |
| 3 | UI Components | 2h | ⏳ |
| 4 | Integration & Testing | 1h | ⏳ |
| 5 | Polish & Edge Cases | 0.5h | ⏳ |

---

## Dependencies

**Requires:**
- [ ] PR #11 complete (State Management Refactor)
- [ ] PR #12 complete (UI Component Library)
- [ ] PR #13 complete (Professional Timeline)
- [ ] RecordingContext placeholder exists (created in PR#11)

**Blocks:**
- PR #18 (Webcam Recording) - Depends on recording infrastructure
- PR #19 (Audio Mixing) - Depends on recording audio handling

---

## References

- [Electron desktopCapturer API](https://www.electronjs.org/docs/latest/api/desktop-capturer)
- [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- Related PR: PR #14 (Drag & Drop) - Similar UI integration patterns
- Related PR: PR #18 (Webcam Recording) - Will reuse recording infrastructure

