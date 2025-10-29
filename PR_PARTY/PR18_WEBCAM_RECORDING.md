# PR#18: Webcam Recording

**Estimated Time:** 6 hours  
**Complexity:** HIGH  
**Dependencies:** PR #11 (State Management Refactor), PR #12 (UI Component Library), PR #13 (Professional Timeline), PR #17 (Screen Recording Setup)

---

## Overview

### What We're Building
Webcam recording functionality that allows users to capture video from their webcam with audio, preview the recording in real-time, and save recordings directly to the Media Library. This transforms ClipForge into a complete capture-and-edit solution, enabling users to record themselves for tutorials, presentations, or content creation.

### Why It Matters
Webcam recording is essential for content creators, educators, and professionals who need to record themselves speaking. Combined with screen recording (PR#17), this creates a comprehensive recording suite that covers all common use cases. Users can record themselves explaining concepts, create video tutorials, or capture presentations with their face visible.

### Success in One Sentence
"This PR is successful when users can click 'Record Webcam', see themselves in a preview window, start/stop recording with clear visual feedback, and have the recorded video automatically appear in their Media Library ready for editing."

---

## Technical Design

### Architecture Decisions

#### Decision 1: Webcam Source Selection
**Options Considered:**
1. **Single webcam only** - Simple, but limited if user has multiple cameras
2. **Webcam picker with device enumeration** - More complex, but professional UX
3. **Auto-select first available webcam** - Middle ground, good default behavior

**Chosen:** Webcam picker with device enumeration

**Rationale:**
- Professional video editing software always shows device selection
- Users often have multiple cameras (built-in + external)
- Better UX than guessing which camera to use
- Consistent with screen recording approach (PR#17)

**Trade-offs:**
- Gain: Professional UX, user control, handles multiple devices
- Lose: More complex implementation, additional UI

#### Decision 2: Recording Format
**Options Considered:**
1. **WebM only** - Simple, but limited compatibility
2. **MP4 only** - Better compatibility, but more complex encoding
3. **WebM with optional MP4 conversion** - Best of both worlds

**Chosen:** WebM with optional MP4 conversion

**Rationale:**
- WebM is ideal for web-based recording (MediaRecorder API)
- MP4 conversion ensures compatibility with all editing tools
- Consistent with screen recording approach (PR#17)
- Users can choose based on their needs

**Trade-offs:**
- Gain: Optimal recording performance, broad compatibility
- Lose: Additional conversion step, more storage space

#### Decision 3: Audio Handling
**Options Considered:**
1. **No audio** - Simple, but limited functionality
2. **System audio only** - Good for presentations, but no voice
3. **Microphone audio only** - Good for voice, but no system sounds
4. **Both microphone and system audio** - Most flexible, but complex

**Chosen:** Microphone audio only (with system audio option in future)

**Rationale:**
- Webcam recording is primarily for voice + video
- System audio mixing is complex and can be added later
- Focus on core functionality first
- Microphone audio is essential for webcam content

**Trade-offs:**
- Gain: Simpler implementation, clear use case
- Lose: No system audio capture (can be added in PR#19)

#### Decision 4: Preview Window
**Options Considered:**
1. **No preview** - Simple, but poor UX
2. **Small preview in recording controls** - Good balance
3. **Full-screen preview** - Professional, but takes up space
4. **Resizable preview window** - Most flexible, but complex

**Chosen:** Resizable preview window

**Rationale:**
- Users need to see themselves to frame the shot properly
- Resizable allows different use cases (small for monitoring, large for setup)
- Professional video editing software always shows preview
- Can be minimized when not needed

**Trade-offs:**
- Gain: Professional UX, flexible sizing, better framing
- Lose: More complex window management, additional UI

### Data Model

**New Collections/Tables:**
```
RecordingContext/
├── isRecording: boolean (recording state)
├── recordingDuration: number (current duration in seconds)
├── selectedWebcamId: string (device ID)
├── availableWebcams: array (list of available devices)
├── previewStream: MediaStream (webcam preview)
├── recordingStream: MediaStream (recording stream)
├── mediaRecorder: MediaRecorder (recording instance)
└── recordingSettings: object (resolution, framerate, etc.)
```

**Schema Changes:**
```javascript
// Before
{ recordingType: 'screen' }

// After
{ 
  recordingType: 'screen' | 'webcam',
  webcamDeviceId: string,
  audioEnabled: boolean
}
```

### API Design

**New Functions:**
```javascript
/**
 * Get list of available webcam devices
 * @returns {Promise<Array>} Array of webcam devices with id, label, and capabilities
 */
export async function getWebcamDevices() {
  // Implementation overview
}

/**
 * Start webcam recording with specified device
 * @param {string} deviceId - Webcam device ID
 * @param {object} settings - Recording settings (resolution, framerate, etc.)
 * @returns {Promise<boolean>} Success status
 */
export async function startWebcamRecording(deviceId, settings) {
  // Implementation overview
}

/**
 * Stop webcam recording and save to Media Library
 * @returns {Promise<string>} Path to saved recording
 */
export async function stopWebcamRecording() {
  // Implementation overview
}

/**
 * Get webcam preview stream for setup
 * @param {string} deviceId - Webcam device ID
 * @returns {Promise<MediaStream>} Preview stream
 */
export async function getWebcamPreview(deviceId) {
  // Implementation overview
}
```

### Component Hierarchy
```
RecordingContext/
├── WebcamRecordingControls
│   ├── DeviceSelector
│   ├── RecordingSettings
│   └── RecordingButtons
├── WebcamPreview
│   ├── VideoElement
│   └── RecordingIndicator
└── RecordingIndicator
    ├── DurationDisplay
    └── StopButton
```

---

## Implementation Details

### File Structure
**New Files:**
```
src/
├── context/
│   └── RecordingContext.js (~200 lines) - Webcam recording state
├── components/recording/
│   ├── WebcamRecordingControls.js (~150 lines) - Main controls
│   ├── WebcamPreview.js (~100 lines) - Preview window
│   ├── DeviceSelector.js (~80 lines) - Webcam selection
│   └── RecordingSettings.js (~100 lines) - Settings panel
├── hooks/
│   └── useWebcamRecording.js (~120 lines) - Recording logic
└── utils/
    └── webcamUtils.js (~80 lines) - Device enumeration
```

**Modified Files:**
- `src/context/RecordingContext.js` (+150/-50 lines) - Add webcam support
- `src/components/App.js` (+30/-10 lines) - Webcam recording integration
- `src/components/ui/Toolbar.js` (+20/-5 lines) - Webcam recording button
- `electron/main.js` (+40/-10 lines) - Webcam permission handling

### Key Implementation Steps

#### Phase 1: Device Enumeration (1.5 hours)
1. Create webcamUtils.js for device enumeration
2. Add getWebcamDevices() function
3. Handle permission requests
4. Create DeviceSelector component
5. Test with multiple webcams

#### Phase 2: Preview System (2 hours)
1. Create WebcamPreview component
2. Implement getWebcamPreview() function
3. Add resizable preview window
4. Handle stream cleanup
5. Test preview functionality

#### Phase 3: Recording Implementation (2 hours)
1. Extend RecordingContext for webcam support
2. Implement startWebcamRecording() function
3. Add MediaRecorder configuration
4. Handle audio/video tracks
5. Test recording functionality

#### Phase 4: Integration & Polish (0.5 hours)
1. Integrate with existing UI
2. Add recording indicators
3. Handle errors and edge cases
4. Test complete workflow

### Code Examples

**Example 1: Device Enumeration**
```javascript
// webcamUtils.js
export async function getWebcamDevices() {
  try {
    // Request permission first
    await navigator.mediaDevices.getUserMedia({ video: true });
    
    // Get all devices
    const devices = await navigator.mediaDevices.enumerateDevices();
    
    // Filter for video input devices
    return devices
      .filter(device => device.kind === 'videoinput')
      .map(device => ({
        id: device.deviceId,
        label: device.label || `Camera ${device.deviceId.slice(0, 8)}`,
        capabilities: await getDeviceCapabilities(device.deviceId)
      }));
  } catch (error) {
    console.error('Failed to get webcam devices:', error);
    return [];
  }
}
```

**Example 2: Recording Context**
```javascript
// RecordingContext.js
const RecordingContext = createContext();

export const RecordingProvider = ({ children }) => {
  const [recordingState, setRecordingState] = useState({
    isRecording: false,
    recordingType: null, // 'screen' or 'webcam'
    selectedWebcamId: null,
    availableWebcams: [],
    previewStream: null,
    recordingStream: null,
    mediaRecorder: null,
    recordingDuration: 0
  });

  const startWebcamRecording = async (deviceId, settings) => {
    try {
      // Get webcam stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId, ...settings.video },
        audio: settings.audio
      });

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });

      // Start recording
      mediaRecorder.start();
      
      setRecordingState(prev => ({
        ...prev,
        isRecording: true,
        recordingType: 'webcam',
        selectedWebcamId: deviceId,
        recordingStream: stream,
        mediaRecorder
      }));

      return true;
    } catch (error) {
      console.error('Failed to start webcam recording:', error);
      return false;
    }
  };

  // ... other functions

  return (
    <RecordingContext.Provider value={{
      ...recordingState,
      startWebcamRecording,
      stopWebcamRecording,
      getWebcamDevices
    }}>
      {children}
    </RecordingContext.Provider>
  );
};
```

**Example 3: Preview Component**
```javascript
// WebcamPreview.js
const WebcamPreview = ({ deviceId, isRecording, onStreamReady }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    if (!deviceId) return;

    const setupPreview = async () => {
      try {
        const previewStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId },
          audio: false // Preview doesn't need audio
        });

        if (videoRef.current) {
          videoRef.current.srcObject = previewStream;
          setStream(previewStream);
          onStreamReady?.(previewStream);
        }
      } catch (error) {
        console.error('Failed to setup webcam preview:', error);
      }
    };

    setupPreview();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [deviceId]);

  return (
    <div className="webcam-preview">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className={`preview-video ${isRecording ? 'recording' : ''}`}
      />
      {isRecording && (
        <div className="recording-indicator">
          <div className="recording-dot"></div>
          <span>Recording...</span>
        </div>
      )}
    </div>
  );
};
```

---

## Testing Strategy

### Test Categories

**Unit Tests:**
- getWebcamDevices(): Returns correct device list
- startWebcamRecording(): Creates MediaRecorder correctly
- stopWebcamRecording(): Saves file to Media Library
- Device enumeration: Handles no devices gracefully

**Integration Tests:**
- Complete recording workflow (select device → preview → record → stop → save)
- Multiple webcam switching
- Recording with different settings
- Error handling for permission denied

**Edge Cases:**
- No webcams available
- Permission denied
- Webcam disconnected during recording
- Multiple webcam devices
- Invalid device ID
- Browser compatibility issues

**Performance Tests:**
- Recording startup time < 2 seconds
- Preview latency < 100ms
- Memory usage during recording < 200MB
- Recording quality maintained

---

## Success Criteria

**Feature is complete when:**
- [ ] Users can see list of available webcam devices
- [ ] Users can preview webcam feed before recording
- [ ] Users can start/stop webcam recording with clear feedback
- [ ] Recorded videos appear in Media Library automatically
- [ ] Recording includes both video and audio
- [ ] Preview window is resizable and can be minimized
- [ ] Error handling works for all edge cases
- [ ] All tests pass
- [ ] Performance targets met
- [ ] Documentation complete

**Performance Targets:**
- Recording startup: < 2 seconds
- Preview latency: < 100ms
- Memory usage: < 200MB during recording
- File size: Reasonable for duration (not bloated)

**Quality Gates:**
- Zero critical bugs
- Test coverage > 80%
- No console errors
- Works on macOS and Windows
- Handles permission denied gracefully

---

## Risk Assessment

### Risk 1: Webcam Permission Denied
**Likelihood:** HIGH  
**Impact:** HIGH  
**Mitigation:** Clear permission request UI, helpful error messages, fallback to screen recording  
**Status:** 🟡 MEDIUM

### Risk 2: Multiple Webcam Device Handling
**Likelihood:** MEDIUM  
**Impact:** MEDIUM  
**Mitigation:** Robust device enumeration, clear device selection UI, handle device changes  
**Status:** 🟢 LOW

### Risk 3: Browser Compatibility Issues
**Likelihood:** MEDIUM  
**Impact:** HIGH  
**Mitigation:** Feature detection, fallback codecs, clear error messages  
**Status:** 🟡 MEDIUM

### Risk 4: Performance During Recording
**Likelihood:** MEDIUM  
**Impact:** MEDIUM  
**Mitigation:** Optimize MediaRecorder settings, monitor memory usage, provide quality options  
**Status:** 🟢 LOW

---

## Open Questions

1. **Question 1:** Should we support recording with multiple webcams simultaneously?
   - Option A: Single webcam only (simpler, covers 90% of use cases)
   - Option B: Multiple webcams (complex, but professional feature)
   - Decision needed by: Phase 2

2. **Question 2:** What recording quality presets should we offer?
   - Option A: Single quality (1080p, 30fps)
   - Option B: Multiple presets (720p, 1080p, 4K)
   - Decision needed by: Phase 2

3. **Question 3:** Should preview window be draggable?
   - Option A: Fixed position only
   - Option B: Draggable and resizable
   - Decision needed by: Phase 2

---

## Timeline

**Total Estimate:** 6 hours

| Phase | Task | Time | Status |
|-------|------|------|--------|
| 1 | Device Enumeration | 1.5h | ⏳ |
| 2 | Preview System | 2h | ⏳ |
| 3 | Recording Implementation | 2h | ⏳ |
| 4 | Integration & Polish | 0.5h | ⏳ |

---

## Dependencies

**Requires:**
- [ ] PR#11 complete (State Management Refactor)
- [ ] PR#12 complete (UI Component Library)
- [ ] PR#13 complete (Professional Timeline)
- [ ] PR#17 complete (Screen Recording Setup)

**Blocks:**
- PR#19 (Audio Mixing & Controls) - waiting on webcam audio implementation
- PR#20 (Text Overlays) - waiting on webcam recording for overlay testing

---

## References

- Related PR: [#17] (Screen Recording Setup)
- WebRTC API: [MDN MediaDevices](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices)
- MediaRecorder API: [MDN MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- Similar implementation: [PR#17 Screen Recording](PR17_SCREEN_RECORDING_SETUP.md)
