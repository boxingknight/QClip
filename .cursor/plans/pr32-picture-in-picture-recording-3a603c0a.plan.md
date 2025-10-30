<!-- 3a603c0a-fd68-49fb-bd5a-09c00d85312f 553324e8-71c4-4c91-92b9-a290b6f5ec5d -->
# PR#32: Picture-in-Picture Recording

**Estimated Time:** 8-10 hours

**Complexity:** HIGH

**Dependencies:** PR #17 (Screen Recording), PR #18 (Webcam Recording)

---

## Overview

### What We're Building

Picture-in-picture recording functionality that simultaneously captures both screen content and webcam video, compositing them into a single video file. The webcam appears as a smaller overlay window positioned in one of the corners of the screen recording. This enables users to create tutorial videos, presentations, or content where they appear while demonstrating screen content.

### Why It Matters

Picture-in-picture recording is essential for:

- **Tutorial creators**: Show themselves while demonstrating software
- **Educators**: Record lessons with instructor visible
- **Presentations**: Add personal presence to screen recordings
- **Content creators**: Combine screen capture with face cam

Combined with existing screen recording (PR#17) and webcam recording (PR#18), this completes the recording suite with the most requested feature: simultaneous multi-source capture.

### Success in One Sentence

"This PR is successful when users can select both a screen source and webcam, preview the composited view, start recording, and have both sources composited into a single video file with the webcam positioned as a picture-in-picture overlay."

---

## Technical Design

### Architecture Decisions

#### Decision 1: Compositing Approach

**Options Considered:**

1. **Canvas-based compositing** - Draw both streams to canvas, record canvas stream
2. **MediaRecorder with multiple tracks** - Combine video tracks directly (limited positioning control)
3. **FFmpeg post-processing** - Record separately, combine with FFmpeg (not real-time, two-step process)

**Chosen:** Canvas-based compositing with `canvas.captureStream()`

**Rationale:**

- Real-time compositing with precise control over positioning and sizing
- Works with existing MediaRecorder infrastructure
- User sees exactly what will be recorded (preview matches output)
- Single-step recording (no post-processing required)
- Supports flexible PIP positioning and sizing

**Trade-offs:**

- Gain: Real-time compositing, precise control, preview matches output
- Lose: Additional CPU/GPU overhead from canvas rendering at 30fps

#### Decision 2: Canvas Rendering Strategy

**Options Considered:**

1. **Single hidden canvas** - Composited canvas, record its stream
2. **Multiple canvases** - Separate canvases per source (more complex state)
3. **Video elements to canvas** - Draw video elements to canvas in loop

**Chosen:** Single hidden canvas with video elements drawing loop

**Rationale:**

- Simple single canvas to manage
- Clear rendering pipeline: video elements → canvas → MediaRecorder
- RequestAnimationFrame loop for smooth 30fps rendering
- Hidden canvas avoids UI complexity

**Implementation Pattern:**

```javascript
// Create canvas and get stream
const canvas = document.createElement('canvas');
canvas.width = screenWidth;
canvas.height = screenHeight;
const canvasStream = canvas.captureStream(30); // 30fps

// In rendering loop:
ctx.drawImage(screenVideo, 0, 0, screenWidth, screenHeight);
ctx.drawImage(webcamVideo, pipX, pipY, pipWidth, pipHeight);

// Record canvas stream
const mediaRecorder = new MediaRecorder(canvasStream, {...});
```

#### Decision 3: Audio Handling

**Options Considered:**

1. **Screen audio only** - System sounds, no microphone
2. **Webcam audio only** - Microphone, no system sounds
3. **Combined audio** - Mix both audio tracks together
4. **User-selectable** - Let user choose audio source

**Chosen:** User-selectable audio (default: webcam microphone)

**Rationale:**

- Different use cases need different audio:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Tutorial: Need both system audio + voice
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Presentation: Often just voice
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - Demo: May need just system audio
- Flexible approach supports all scenarios
- Can default to most common case (webcam mic)

**Technical Implementation:**

- Use `AudioContext.createMediaStreamDestination()` to mix tracks
- Combine screen audio track + webcam audio track
- Add to canvas stream as audio track

#### Decision 4: PIP Position & Size

**Options Considered:**

1. **Fixed corner (bottom-right)** - Simple, but no user control
2. **All four corners** - Professional, common in recording software
3. **Free positioning** - Maximum flexibility, but complex UI

**Chosen:** Four corner positions (user-selectable), configurable size

**Rationale:**

- Matches professional recording software (OBS, Zoom, etc.)
- Covers 99% of use cases (all corners available)
- Simple UI (dropdown for position, slider for size)
- Configurable size (small/medium/large presets, or custom %)

**Position Options:**

- Top-left
- Top-right (default)
- Bottom-left
- Bottom-right

**Size Options:**

- Small: 15% of screen width
- Medium: 25% of screen width (default)
- Large: 35% of screen width
- Custom: Slider for percentage (10%-50%)

---

## Data Model

### RecordingContext Extensions

**New State:**

```javascript
{
  // PIP-specific state
  recordingMode: 'screen' | 'webcam' | 'pip', // NEW
  pipSettings: {
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
    size: number, // Percentage of screen width (15-50%)
    corner: string // Computed from position
  },
  screenStream: MediaStream | null, // Screen recording stream
  webcamStream: MediaStream | null, // Webcam recording stream
  compositeCanvas: HTMLCanvasElement | null, // Canvas for compositing
  canvasStream: MediaStream | null, // Stream from canvas
  renderingLoop: number | null // RequestAnimationFrame ID
}
```

### API Design

**New Functions:**

```javascript
/**
 * Start picture-in-picture recording
 * @param {string} screenSourceId - Screen source ID from desktopCapturer
 * @param {string} webcamDeviceId - Webcam device ID
 * @param {object} pipSettings - PIP position and size settings
 * @param {object} options - Recording options (audio, quality, etc.)
 * @returns {Promise<boolean>} Success status
 */
async function startPIPRecording(screenSourceId, webcamDeviceId, pipSettings, options)

/**
 * Stop PIP recording and return composited video blob
 * @returns {Promise<Blob>} Composited video blob
 */
async function stopPIPRecording()

/**
 * Get composited preview stream for UI preview
 * @returns {MediaStream} Preview stream showing composited view
 */
function getPIPPreviewStream()
```

---

## Implementation Details

### File Structure

**New Files:**

```
src/
├── components/recording/
│   ├── PIPRecordingControls.js (~250 lines) - Main PIP recording UI
│   ├── PIPRecordingControls.css (~150 lines) - Styles
│   ├── PIPPreview.js (~200 lines) - Preview window showing composited view
│   ├── PIPPreview.css (~100 lines) - Preview styles
│   └── PIPSettings.js (~150 lines) - PIP position/size configuration
│       └── PIPSettings.css (~80 lines) - Settings styles
├── hooks/
│   └── useCanvasCompositing.js (~300 lines) - Canvas compositing logic
└── utils/
    └── audioUtils.js (~120 lines) - Audio track mixing utilities
```

**Modified Files:**

- `src/context/RecordingContext.js` (+400/-50 lines) - PIP recording support
- `src/components/recording/RecordingControls.js` (+80/-20 lines) - Add PIP mode option
- `src/components/App.js` (+30/-10 lines) - PIP controls integration

---

## Implementation Phases

### Phase 1: Canvas Compositing Foundation (2-3 hours)

**1.1: Create Canvas Compositing Hook**

- Create `useCanvasCompositing.js` hook
- Implement canvas creation and stream capture
- Implement rendering loop with `requestAnimationFrame`
- Test with static images before video streams

**1.2: Basic Two-Stream Compositing**

- Get screen stream (existing `getUserMedia` with desktopCapturer)
- Get webcam stream (existing `getUserMedia`)
- Create video elements for both streams
- Draw both streams to canvas (screen full-size, webcam smaller in corner)
- Verify canvas output matches expected composite

**1.3: Canvas Stream Capture**

- Use `canvas.captureStream(30)` to get canvas stream
- Verify stream has video track
- Test canvas stream properties (resolution, framerate)

**Checkpoint:** Canvas successfully composites two video streams and captures as MediaStream ✅

---

### Phase 2: PIP Recording Implementation (3-4 hours)

**2.1: Extend RecordingContext**

- Add `recordingMode` state ('screen' | 'webcam' | 'pip')
- Add `pipSettings` state (position, size)
- Add `screenStream` and `webcamStream` state
- Add `compositeCanvas` and `canvasStream` state

**2.2: Implement startPIPRecording()**

- Get screen source via source picker
- Get webcam device via device selector
- Get both MediaStreams simultaneously
- Create hidden canvas with screen resolution
- Create video elements for both streams
- Start rendering loop
- Capture canvas stream
- Setup MediaRecorder with canvas stream
- Handle audio track mixing (screen + webcam audio)

**2.3: Implement stopPIPRecording()**

- Stop rendering loop (cancel requestAnimationFrame)
- Stop MediaRecorder (reuse existing stop logic)
- Stop both MediaStream tracks
- Clean up canvas and video elements
- Return composited blob

**2.4: Error Handling**

- Handle permission denials (screen OR webcam)
- Handle device disconnection during recording
- Handle canvas rendering errors
- Provide clear error messages

**Checkpoint:** Can record PIP video from start to stop with proper cleanup ✅

---

### Phase 3: Audio Mixing (1-2 hours)

**3.1: Create Audio Utilities**

- Create `audioUtils.js` with mixing functions
- Implement `mixAudioTracks()` function
- Use `AudioContext.createMediaStreamDestination()`
- Combine screen audio track + webcam audio track

**3.2: Integrate Audio Mixing**

- Extract audio tracks from both streams
- Mix audio tracks using utility function
- Add mixed audio to canvas stream
- Handle cases where one stream has no audio

**3.3: Audio Source Selection**

- Add UI for audio source selection
- Options: Screen audio, Webcam audio, Both, None
- Apply selected audio source to canvas stream

**Checkpoint:** Audio properly mixed from both sources ✅

---

### Phase 4: UI Components (2-3 hours)

**4.1: PIP Recording Controls Component**

- Create `PIPRecordingControls.js`
- Add screen source picker (reuse SourcePicker)
- Add webcam device selector (reuse DeviceSelector)
- Add PIP settings panel (position, size)
- Add preview toggle
- Add start/stop recording buttons
- Integrate with RecordingContext

**4.2: PIP Preview Component**

- Create `PIPPreview.js` component
- Show real-time composited preview
- Use same canvas (or separate preview canvas)
- Show recording indicator overlay
- Responsive preview sizing

**4.3: PIP Settings Component**

- Create `PIPSettings.js` component
- Position selector (4 corners dropdown)
- Size selector (slider or preset buttons)
- Live preview of settings changes
- Persist settings to context

**4.4: RecordingControls Integration**

- Add "Picture-in-Picture" mode option to RecordingControls
- Update mode selector: Screen | Webcam | PIP
- Show appropriate controls based on mode
- Update recording indicator to show PIP mode

**Checkpoint:** Complete UI for PIP recording with preview ✅

---

### Phase 5: Integration & Polish (1 hour)

**5.1: Media Library Integration**

- Save PIP recordings same way as other recordings
- Extract metadata properly (composited video dimensions)
- Thumbnail generation (first frame of composite)
- File naming: `pip-recording-[timestamp].webm`

**5.2: Error States & Edge Cases**

- Handle one permission denied (screen OR webcam)
- Handle device disconnection mid-recording
- Handle canvas rendering failures
- Graceful degradation (fall back to screen-only if webcam fails)

**5.3: Performance Optimization**

- Throttle rendering loop if needed (30fps target)
- Use `willReadFrequently: false` on canvas context
- Optimize canvas size (match screen resolution, not larger)
- Monitor memory usage during recording

**5.4: Testing & Validation**

- Test all 4 corner positions
- Test different size presets
- Test audio mixing (both sources, one source, no audio)
- Test long recordings (10+ minutes) for stability
- Test with different screen resolutions
- Test with different webcam resolutions

**Checkpoint:** PIP recording fully functional with all edge cases handled ✅

---

## Code Examples

### Example 1: Canvas Compositing Setup

```javascript
// useCanvasCompositing.js
export function useCanvasCompositing(screenStream, webcamStream, pipSettings) {
  const canvasRef = useRef(null);
  const screenVideoRef = useRef(null);
  const webcamVideoRef = useRef(null);
  const animationFrameRef = useRef(null);
  const canvasStreamRef = useRef(null);

  useEffect(() => {
    if (!screenStream || !webcamStream || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    
    // Create video elements
    const screenVideo = document.createElement('video');
    const webcamVideo = document.createElement('video');
    screenVideo.srcObject = screenStream;
    webcamVideo.srcObject = webcamStream;
    screenVideo.autoplay = true;
    webcamVideo.autoplay = true;
    
    screenVideo.play();
    webcamVideo.play();

    // Wait for video metadata
    Promise.all([
      new Promise(resolve => screenVideo.onloadedmetadata = resolve),
      new Promise(resolve => webcamVideo.onloadedmetadata = resolve)
    ]).then(() => {
      // Set canvas size to screen resolution
      canvas.width = screenVideo.videoWidth;
      canvas.height = screenVideo.videoHeight;

      // Calculate PIP dimensions and position
      const pipWidth = (canvas.width * pipSettings.size) / 100;
      const pipHeight = (pipWidth * webcamVideo.videoHeight) / webcamVideo.videoWidth;
      const { x, y } = calculatePIPPosition(pipSettings.position, canvas.width, canvas.height, pipWidth, pipHeight);

      // Rendering loop
      const render = () => {
        // Draw screen (full size)
        ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);
        
        // Draw webcam (PIP overlay)
        ctx.drawImage(webcamVideo, x, y, pipWidth, pipHeight);
        
        animationFrameRef.current = requestAnimationFrame(render);
      };

      render();

      // Get canvas stream
      canvasStreamRef.current = canvas.captureStream(30);
    });

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      screenVideo.srcObject = null;
      webcamVideo.srcObject = null;
    };
  }, [screenStream, webcamStream, pipSettings]);

  return { canvasRef, canvasStream: canvasStreamRef.current };
}
```

### Example 2: PIP Position Calculation

```javascript
// utils/pipUtils.js
export function calculatePIPPosition(position, canvasWidth, canvasHeight, pipWidth, pipHeight) {
  const padding = 20; // 20px padding from edges
  
  switch (position) {
    case 'top-left':
      return { x: padding, y: padding };
    case 'top-right':
      return { x: canvasWidth - pipWidth - padding, y: padding };
    case 'bottom-left':
      return { x: padding, y: canvasHeight - pipHeight - padding };
    case 'bottom-right':
      return { 
        x: canvasWidth - pipWidth - padding, 
        y: canvasHeight - pipHeight - padding 
      };
    default:
      return { x: padding, y: padding };
  }
}
```

### Example 3: Audio Mixing

```javascript
// utils/audioUtils.js
export async function mixAudioTracks(track1, track2) {
  const audioContext = new AudioContext();
  const destination = audioContext.createMediaStreamDestination();
  
  const source1 = audioContext.createMediaStreamSource(
    new MediaStream([track1])
  );
  const source2 = audioContext.createMediaStreamSource(
    new MediaStream([track2])
  );
  
  source1.connect(destination);
  source2.connect(destination);
  
  return destination.stream.getAudioTracks()[0];
}
```

---

## Testing Strategy

### Unit Tests

**Canvas Compositing:**

- Test PIP position calculation for all 4 corners
- Test PIP size calculation (various percentages)
- Test canvas resolution matching screen resolution
- Test rendering loop start/stop

**Audio Mixing:**

- Test mixing two audio tracks
- Test mixing with one track missing
- Test mixing with no audio tracks

### Integration Tests

**Recording Flow:**

1. Select screen source → Get screen stream ✅
2. Select webcam device → Get webcam stream ✅
3. Configure PIP settings → Canvas updates ✅
4. Start recording → MediaRecorder starts ✅
5. Record for 30 seconds → Chunks collected ✅
6. Stop recording → Blob created ✅
7. Save recording → File saved to Media Library ✅

**Edge Cases:**

- Screen permission denied → Show error, allow webcam-only fallback
- Webcam permission denied → Show error, allow screen-only fallback
- Device disconnection → Handle gracefully, stop recording
- Canvas rendering error → Fallback to error state
- Very long recording (30+ min) → Memory/stability check

### Manual Testing

**UI Testing:**

- Screen source picker shows available sources
- Webcam device selector shows available devices
- PIP preview shows live composite
- Position dropdown updates preview
- Size slider updates preview
- Start/stop buttons work correctly
- Recording indicator shows during recording

**Visual Testing:**

- PIP appears in correct corner
- PIP size matches settings
- Both streams visible in preview
- Composite matches saved video
- Audio from both sources audible

---

## Success Criteria

**Feature is complete when:**

- [ ] Can select both screen source and webcam device
- [ ] Can preview composited view before recording
- [ ] Can configure PIP position (4 corners)
- [ ] Can configure PIP size (15%-50% of screen width)
- [ ] Can record composited video (screen + webcam)
- [ ] Audio from both sources properly mixed (or user-selected)
- [ ] Recorded video shows both sources correctly composited
- [ ] Recording saves to Media Library
- [ ] All edge cases handled gracefully
- [ ] Performance acceptable (30fps during recording)

**Performance Targets:**

- Canvas rendering: 30fps maintained
- Recording start: < 3 seconds
- Memory usage: < 800MB during recording
- File size: ~3-4MB per minute (composited WebM)

**Quality Gates:**

- Zero critical bugs
- All permissions handled correctly
- Graceful error messages
- Preview matches output
- Audio mixing works correctly

---

## Risk Assessment

### Risk 1: Canvas Performance

**Likelihood:** MEDIUM

**Impact:** HIGH

**Mitigation:**

- Use `willReadFrequently: false` on canvas context
- Throttle to 30fps (not 60fps)
- Match canvas resolution to screen (don't upscale)
- Test with high-resolution screens early

### Risk 2: Audio Mixing Complexity

**Likelihood:** HIGH

**Impact:** MEDIUM

**Mitigation:**

- Start with single audio source (webcam mic)
- Add mixing as Phase 3 enhancement
- Test audio mixing early with simple case
- Fall back gracefully if mixing fails

### Risk 3: Permission Handling

**Likelihood:** MEDIUM

**Impact:** MEDIUM

**Mitigation:**

- Handle screen permission denial gracefully
- Handle webcam permission denial gracefully
- Allow fallback to screen-only or webcam-only
- Clear error messages for denied permissions

### Risk 4: Device Disconnection

**Likelihood:** LOW

**Impact:** HIGH

**Mitigation:**

- Monitor stream track `ended` events
- Stop recording if either stream disconnects
- Show clear error message
- Save partial recording if possible

---

## Timeline

**Total Estimate:** 8-10 hours

| Phase | Task | Time | Status |

|-------|------|------|--------|

| 1 | Canvas Compositing Foundation | 2-3h | ⏳ |

| 2 | PIP Recording Implementation | 3-4h | ⏳ |

| 3 | Audio Mixing | 1-2h | ⏳ |

| 4 | UI Components | 2-3h | ⏳ |

| 5 | Integration & Polish | 1h | ⏳ |

---

## Dependencies

**Requires:**

- [ ] PR#17 (Screen Recording) - Screen source detection
- [ ] PR#18 (Webcam Recording) - Webcam device enumeration
- [ ] Existing RecordingContext infrastructure
- [ ] SourcePicker and DeviceSelector components

**Blocks:**

- Future PRs that depend on multi-source recording
- Advanced recording features (audio mixing presets, etc.)

---

## Open Questions

1. **Audio Mixing Timing:** Should audio mixing be in Phase 2 or Phase 3?

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - **Decision:** Phase 3 - Start with single audio source for MVP, add mixing as enhancement

2. **Preview Canvas:** Should preview use same canvas as recording or separate?

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - **Decision:** Can share same canvas initially, separate if performance issues

3. **PIP Size Limits:** What's minimum/maximum practical size?

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                - **Decision:** 10%-50% of screen width (minimum 200px, maximum 50%)

---

## References

- PR#17: Screen Recording Setup - Screen source detection patterns
- PR#18: Webcam Recording - Webcam device enumeration patterns
- Canvas Capture Stream API: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/captureStream
- MediaRecorder API: https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder