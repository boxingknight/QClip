# PR#32 Implementation Kickoff - Current State Review

**Date:** [Current Date]  
**Branch:** `feature/pr32-picture-in-picture-recording` ✅  
**Status:** Ready to implement

---

## ✅ Prerequisites Verification

### Required PRs Complete
- [x] **PR#17: Screen Recording** - ✅ COMPLETE
  - Screen source detection via `getAvailableSources()`
  - Screen stream acquisition via `getUserMedia` with desktopCapturer
  - MediaRecorder integration working
  - SourcePicker component available

- [x] **PR#18: Webcam Recording** - ✅ COMPLETE  
  - Webcam device enumeration via `getWebcamDevices()`
  - Webcam stream acquisition via `getUserMedia`
  - DeviceSelector component available
  - WebcamRecordingControls component available

- [x] **PR#23: Advanced Export Settings** - ✅ COMPLETE
  - Recent completion, export system stable

### Existing Components We Can Reuse

#### RecordingContext (`src/context/RecordingContext.js`)
- ✅ Complete recording state management
- ✅ `startRecording()` for screen recording
- ✅ `startWebcamRecording()` for webcam recording
- ✅ `stopRecording()` for stopping
- ✅ `saveRecording()` for saving to Media Library
- ✅ Stream management (MediaStream, MediaRecorder)
- ✅ Chunk collection and blob creation
- ✅ Duration tracking
- ✅ Error handling

**What We Need to Add:**
- PIP-specific state (recordingMode, pipSettings, dual streams)
- `startPIPRecording()` function
- Canvas compositing integration

#### SourcePicker (`src/components/recording/SourcePicker.js`)
- ✅ Modal-based screen source selection
- ✅ Thumbnail display
- ✅ Source name and type display
- ✅ Reusable for PIP (screen selection)

#### DeviceSelector (`src/components/recording/DeviceSelector.js`)
- ✅ Webcam device dropdown
- ✅ Device enumeration
- ✅ Auto-select first device
- ✅ Reusable for PIP (webcam selection)

#### RecordingControls (`src/components/recording/RecordingControls.js`)
- ✅ Mode selector (currently screen/webcam)
- ✅ Integration with RecordingContext
- ✅ Error display
- ✅ Recording indicators

**What We Need to Add:**
- "Picture-in-Picture" mode button
- PIPRecordingControls integration

#### WebcamRecordingControls (`src/components/recording/WebcamRecordingControls.js`)
- ✅ Complete webcam recording workflow
- ✅ Preview integration
- ✅ Settings management

**Pattern to Follow:** Similar structure for PIPRecordingControls

#### RecordingButton & RecordingIndicator
- ✅ Reusable button component
- ✅ Recording status display
- ✅ Duration display

---

## Current Architecture Review

### Recording Flow (Existing)

**Screen Recording:**
```
User clicks "Start Recording"
  → SourcePicker modal (select screen/window)
  → getAvailableSources()
  → getUserMedia({ desktopCapturer: sourceId })
  → MediaRecorder(stream)
  → Chunks collected
  → stopRecording()
  → Blob created
  → saveRecording(blob)
  → Media Library
```

**Webcam Recording:**
```
User clicks "Start Recording"
  → DeviceSelector (select webcam)
  → getUserMedia({ deviceId })
  → MediaRecorder(stream)
  → Chunks collected
  → stopRecording()
  → Blob created
  → saveRecording(blob)
  → Media Library
```

### PIP Recording Flow (To Build)

```
User selects "Picture-in-Picture" mode
  → SourcePicker (select screen) + DeviceSelector (select webcam)
  → getUserMedia(screen) + getUserMedia(webcam) simultaneously
  → Create hidden canvas
  → Create video elements for both streams
  → Rendering loop: drawImage(screen) → drawImage(webcam at PIP position)
  → canvas.captureStream(30)
  → Add audio track (based on selection)
  → MediaRecorder(canvasStream)
  → Chunks collected
  → stopRecording()
  → Blob created
  → saveRecording(blob)
  → Media Library
```

---

## What We Need to Build

### 1. New Files to Create

#### `src/hooks/useCanvasCompositing.js` (~350 lines)
- Canvas creation and stream capture
- Video element setup for both streams
- RequestAnimationFrame rendering loop
- PIP position and size calculations
- Cleanup on unmount

#### `src/utils/pipUtils.js` (~150 lines)
- `calculatePIPPosition()` - Calculate overlay coordinates for 4 corners
- `calculatePIPDimensions()` - Calculate PIP width/height from percentage

#### `src/utils/audioUtils.js` (~180 lines)
- `mixAudioTracks()` - Mix two audio tracks using AudioContext
- `selectAudioSource()` - Select audio based on user choice

#### `src/components/recording/PIPRecordingControls.js` (~300 lines)
- Main PIP recording UI
- Integrates SourcePicker + DeviceSelector
- PIPSettings component
- PIPPreview component
- Start/stop recording buttons

#### `src/components/recording/PIPSettings.js` (~200 lines)
- Position dropdown (4 corners)
- Size presets (Small/Medium/Large) + slider
- Audio source dropdown

#### `src/components/recording/PIPPreview.js` (~250 lines)
- Real-time composited preview
- Uses canvas compositing hook
- Shows recording indicator overlay

#### CSS Files
- `PIPRecordingControls.css`
- `PIPSettings.css`
- `PIPPreview.css`

### 2. Files to Modify

#### `src/context/RecordingContext.js` (+450/-50 lines)
**Add:**
- `recordingMode` state: 'screen' | 'webcam' | 'pip'
- `pipSettings` state: { position, size, audioSource }
- `screenStream`, `webcamStream` state
- `compositeCanvas`, `canvasStream` state
- `renderingLoop` ref
- `startPIPRecording()` function
- Extend `stopRecording()` for PIP cleanup

#### `src/components/recording/RecordingControls.js` (+100/-25 lines)
**Add:**
- "Picture-in-Picture" mode button
- Conditional rendering for PIPRecordingControls
- Update mode selector

#### `src/components/recording/index.js` (+5 lines)
**Add:**
- Export PIP components

---

## Technical Dependencies

### APIs Required (All Available in Electron)
- ✅ `navigator.mediaDevices.getUserMedia()` - For both streams
- ✅ `HTMLCanvasElement.captureStream()` - For canvas recording
- ✅ `MediaRecorder` - For recording composite
- ✅ `AudioContext.createMediaStreamDestination()` - For audio mixing
- ✅ `requestAnimationFrame()` - For rendering loop

### Existing Utilities
- ✅ `logger` - Structured logging
- ✅ `extractVideoMetadata()` - Metadata extraction (from videoMetadata.js)
- ✅ `getWebcamDevices()` - Device enumeration (from webcamUtils.js)

---

## Implementation Phases Summary

### Phase 1: Canvas Compositing Foundation (2-3 hours)
1. Create `pipUtils.js` with position/dimension calculations
2. Create `useCanvasCompositing.js` hook
3. Test with static images, then video streams
4. Verify canvas stream capture works

### Phase 2: PIP Recording Implementation (3-4 hours)
1. Extend RecordingContext with PIP state
2. Implement `startPIPRecording()`
   - Get both streams simultaneously
   - Setup canvas compositing
   - Create MediaRecorder with canvas stream
3. Extend `stopRecording()` for PIP cleanup
4. Test complete recording workflow

### Phase 3: Audio Mixing (1-2 hours)
1. Create `audioUtils.js`
2. Implement audio source selection
3. Integrate into PIP recording
4. Test all audio options

### Phase 4: UI Components (2-3 hours)
1. Create PIPSettings component
2. Create PIPPreview component
3. Create PIPRecordingControls addition
4. Integrate with RecordingControls
5. Test UI workflow

### Phase 5: Integration & Polish (1 hour)
1. Error handling
2. Performance optimization
3. Final testing
4. Documentation updates

---

## Key Implementation Points

### Canvas Compositing Pattern
```javascript
// Create canvas
const canvas = document.createElement('canvas');
canvas.width = screenVideo.videoWidth;
canvas.height = screenVideo.videoHeight;
const ctx = canvas.getContext('2d', { willReadFrequently: false });

// Create video elements
const screenVideo = document.createElement('video');
const webcamVideo = document.createElement('video');
screenVideo.srcObject = screenStream;
webcamVideo.srcObject = webcamStream;
screenVideo.play();
webcamVideo.play();

// Rendering loop (30fps)
const render = () => {
  // Draw screen
  ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);
  
  // Calculate PIP position/size
  const { x, y, width, height } = getPIPLayout(settings);
  
  // Draw webcam overlay
  ctx.drawImage(webcamVideo, x, y, width, height);
  
  requestAnimationFrame(render);
};

// Capture canvas stream
const canvasStream = canvas.captureStream(30);
```

### Audio Mixing Pattern
```javascript
const audioContext = new AudioContext();
const destination = audioContext.createMediaStreamDestination();

const source1 = audioContext.createMediaStreamSource(new MediaStream([track1]));
const source2 = audioContext.createMediaStreamSource(new MediaStream([track2]));

source1.connect(destination);
source2.connect(destination);

const mixedTrack = destination.stream.getAudioTracks()[0];
canvasStream.addTrack(mixedTrack);
```

---

## Testing Checklist (Quick Reference)

### Phase 1 Checkpoints
- [ ] PIP position calculation works for all 4 corners
- [ ] Canvas compositing hook creates stream
- [ ] Rendering loop draws both streams correctly

### Phase 2 Checkpoints
- [ ] Can start PIP recording
- [ ] Can stop PIP recording
- [ ] Blob created successfully
- [ ] Video shows both sources composited

### Phase 3 Checkpoints
- [ ] Audio selection works (webcam/screen/both/none)
- [ ] Audio mixing works when "both" selected
- [ ] Audio plays correctly in recorded video

### Phase 4 Checkpoints
- [ ] UI shows all controls
- [ ] Preview updates when settings change
- [ ] Recording workflow is smooth

### Phase 5 Checkpoints
- [ ] Performance acceptable (30fps)
- [ ] Error handling works
- [ ] Media Library integration works

---

## Risk Mitigation Reminders

### Performance
- Use frame timing to throttle to 30fps
- `willReadFrequently: false` on canvas context
- Match canvas resolution to screen (no upscaling)

真的要混合音频吗？
- Start with single audio source, add mixing as enhancement
- Fallback gracefully if mixing fails

### Permissions
- Handle screen OR webcam permission denial
- Clear error messages
- Allow retry after permission granted

### Device Disconnection
- Monitor stream `ended` events
- Stop recording gracefully
- Save partial recording if possible

---

## Ready to Start! 🚀

**Current Status:**
- ✅ Branch created: `feature/pr32-picture-in-picture-recording`
- ✅ Prerequisites verified
- ✅ Components reviewed
- ✅ Implementation plan clear
- ✅ Technical approach confirmed

**Next Action:** Begin Phase 1 - Create PIP utilities and canvas compositing hook

**First Task:** Create `src/utils/pipUtils.js` with position/dimension calculations

---

**Remember:** 
- Start with canvas compositing foundation
- Test with simple cases first (static images → video streams)
- Follow the implementation checklist step-by-step
- Commit frequently with clear messages

