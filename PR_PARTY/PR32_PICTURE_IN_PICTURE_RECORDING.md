# PR#32: Picture-in-Picture Recording

**Estimated Time:** 8-10 hours  
**Complexity:** HIGH  
**Dependencies:** PR #17 (Screen Recording Setup), PR #18 (Webcam Recording)

---

## Overview

### What We're Building
Picture-in-picture recording functionality that simultaneously captures both screen content and webcam video, compositing them into a single video file. The webcam appears as a smaller overlay window positioned in one of four corners of the screen recording. This enables users to create tutorial videos, presentations, or content where they appear while demonstrating screen content.

### Why It Matters
Picture-in-picture recording is essential for:
- **Tutorial creators**: Show themselves while demonstrating software
- **Educators**: Record lessons with instructor visible
- **Presentations**: Add personal presence to screen recordings
- **Content creators**: Combine screen capture with face cam

Combined with existing screen recording (PR#17) and webcam recording (PR#18), this completes the recording suite with the most requested feature: simultaneous multi-source capture into a single composited video file.

### Success in One Sentence
"This PR is successful when users can select both a screen source and webcam, preview the composited view, configure PIP position and size, start recording, and have both sources composited into a single video file with the webcam positioned as a picture-in-picture overlay."

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
- Works with existing MediaRecorder infrastructure (consistent with PR#17 and PR#18)
- User sees exactly what will be recorded (preview matches output)
- Single-step recording (no post-processing required)
- Supports flexible PIP positioning (four corners) and sizing (15%-50%)

**Trade-offs:**
- Gain: Real-time compositing, precise control, preview matches output, single-step process
- Lose: Additional CPU/GPU overhead from canvas rendering at 30fps (acceptable trade-off)

#### Decision 2: Canvas Rendering Strategy
**Options Considered:**
1. **Single hidden canvas** - Composited canvas, record its stream
2. **Multiple canvases** - Separate canvases per source (more complex state)
3. **Video elements to canvas** - Draw video elements to canvas in loop

**Chosen:** Single hidden canvas with video elements drawing loop

**Rationale:**
- Simple single canvas to manage (less state complexity)
- Clear rendering pipeline: video elements → canvas → MediaRecorder
- RequestAnimationFrame loop for smooth 30fps rendering
- Hidden canvas avoids UI complexity
- Matches existing codebase patterns

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
- Most users will use webcam microphone anyway (primary use case)

**Technical Implementation:**
- Use `AudioContext.createMediaStreamDestination()` to mix tracks
- Combine screen audio track + webcam audio track when "Both" selected
- Add mixed/selected audio to canvas stream as audio track
- Handle cases where one stream has no audio gracefully

#### Decision 4: PIP Position & Size
**Options Considered:**
1. **Fixed corner (bottom-right)** - Simple, but no user control
2. **All four corners** - Professional, common in recording software
3. **Free positioning** - Maximum flexibility, but complex UI

**Chosen:** Four corner positions (user-selectable), configurable size (no free-hand positioning)

**Rationale:**
- Matches professional recording software (OBS, Zoom, Teams, etc.)
- Covers 99% of use cases (all corners available)
- Simple UI (dropdown for position, slider/presets for size)
- Configurable size with presets (small/medium/large) and custom percentage
- No free-hand positioning keeps UI clean and avoids complexity

**Position Options:**
- Top-left
- Top-right (default - most common)
- Bottom-left
- Bottom-right

**Size Options:**
- Small: 15% of screen width
- Medium: 25% of screen width (default)
- Large: 35% of screen width
- Custom: Slider for percentage (10%-50% range)

---

## Data Model

### RecordingContext Extensions

**New State:**
```javascript
{
  // Recording mode (extend existing)
  recordingMode: 'screen' | 'webcam' | 'pip', // NEW
  
  // PIP-specific state
  pipSettings: {
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
    size: number, // Percentage of screen width (15-50%)
    audioSource: 'screen' | 'webcam' | 'both' | 'none' // Audio selection
  },
  
  // Dual stream state
  screenStream: MediaStream | null, // Screen recording stream
  webcamStream: MediaStream | null, // Webcam recording stream
  
  // Canvas compositing state
  compositeCanvas: HTMLCanvasElement | null, // Canvas for compositing
  canvasStream: MediaStream | null, // Stream from canvas
  renderingLoop: number | null, // RequestAnimationFrame ID
  
  // Video elements for compositing
  screenVideoElement: HTMLVideoElement | null,
  webcamVideoElement: HTMLVideoElement | null
}
```

**Schema Changes:**
```javascript
// Before
{
  recordingType: 'screen' | 'webcam',
  mediaStream: MediaStream | null
}

// After
{
  recordingMode: 'screen' | 'webcam' | 'pip', // NEW
  recordingType: 'screen' | 'webcam' | 'pip', // Keep for compatibility
  pipSettings: { position, size, audioSource }, // NEW
  screenStream: MediaStream | null, // NEW
  webcamStream: MediaStream | null, // NEW
  canvasStream: MediaStream | null, // NEW
  mediaStream: MediaStream | null // Keep for compatibility, points to canvasStream in PIP mode
}
```

### API Design

**New Functions:**
```javascript
/**
 * Start picture-in-picture recording
 * @param {string} screenSourceId - Screen source ID from desktopCapturer
 * @param {string} webcamDeviceId - Webcam device ID
 * @param {object} pipSettings - PIP position, size, and audio settings
 * @param {object} options - Recording options (quality, frameRate, etc.)
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

/**
 * Calculate PIP position coordinates based on corner and size
 * @param {string} position - Corner position ('top-left', 'top-right', etc.)
 * @param {number} canvasWidth - Full canvas width
 * @param {number} canvasHeight - Full canvas height
 * @param {number} pipWidth - PIP overlay width
 * @param {number} pipHeight - PIP overlay height
 * @returns {{x: number, y: number}} PIP position coordinates
 */
function calculatePIPPosition(position, canvasWidth, canvasHeight, pipWidth, pipHeight)

/**
 * Mix audio tracks from multiple sources
 * @param {MediaStreamTrack} track1 - First audio track
 * @param {MediaStreamTrack} track2 - Second audio track (optional)
 * @returns {Promise<MediaStreamTrack>} Mixed audio track
 */
async function mixAudioTracks(track1, track2)
```

---

## Implementation Details

### File Structure

**New Files:**
```
src/
├── components/recording/
│   ├── PIPRecordingControls.js (~300 lines) - Main PIP recording UI
│   ├── PIPRecordingControls.css (~180 lines) - Styles
│   ├── PIPPreview.js (~250 lines) - Preview window showing composited view
│   ├── PIPPreview.css (~120 lines) - Preview styles
│   └── PIPSettings.js (~200 lines) - PIP position/size/audio configuration
│       └── PIPSettings.css (~100 lines) - Settings styles
├── hooks/
│   └── useCanvasCompositing.js (~350 lines) - Canvas compositing logic
└── utils/
    ├── pipUtils.js (~150 lines) - PIP position/size calculations
    └── audioUtils.js (~180 lines) - Audio track mixing utilities
```

**Modified Files:**
- `src/context/RecordingContext.js` (+450/-50 lines) - PIP recording support, dual streams, canvas compositing
- `src/components/recording/RecordingControls.js` (+100/-25 lines) - Add PIP mode option, integrate PIP controls
- `src/components/App.js` (+40/-15 lines) - PIP controls integration
- `src/components/recording/index.js` (+5/-0 lines) - Export new PIP components

### Key Implementation Steps

#### Phase 1: Canvas Compositing Foundation (2-3 hours)
1. Create useCanvasCompositing hook
2. Implement canvas creation and stream capture
3. Implement rendering loop with requestAnimationFrame
4. Test with static images before video streams
5. Implement basic two-stream compositing (screen + webcam)

#### Phase 2: PIP Recording Implementation (3-4 hours)
1. Extend RecordingContext with PIP state
2. Implement startPIPRecording() function
3. Implement stopPIPRecording() function
4. Handle dual stream management
5. Integrate canvas stream with MediaRecorder

#### Phase 3: Audio Mixing (1-2 hours)
1. Create audio utilities for mixing
2. Implement audio source selection
3. Integrate audio mixing into canvas stream
4. Handle edge cases (missing audio tracks)

#### Phase 4: UI Components (2-3 hours)
1. Create PIPRecordingControls component
2. Create PIPPreview component
3. Create PIPSettings component
4. Integrate with RecordingControls
5. Add preview functionality

#### Phase 5: Integration & Polish (1 hour)
1. Media Library integration
2. Error handling and edge cases
3. Performance optimization
4. Testing and validation

### Code Examples

**Example 1: Canvas Compositing Hook**
```javascript
// hooks/useCanvasCompositing.js
import { useEffect, useRef, useState } from 'react';

export function useCanvasCompositing(screenStream, webcamStream, pipSettings) {
  const canvasRef = useRef(null);
  const screenVideoRef = useRef(null);
  const webcamVideoRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [canvasStream, setCanvasStream] = useState(null);

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
    screenVideo.muted = true; // Prevent audio feedback
    webcamVideo.muted = true;
    
    screenVideoRef.current = screenVideo;
    webcamVideoRef.current = webcamVideo;

    // Wait for video metadata
    Promise.all([
      new Promise(resolve => {
        screenVideo.onloadedmetadata = () => resolve();
        screenVideo.play();
      }),
      new Promise(resolve => {
        webcamVideo.onloadedmetadata = () => resolve();
        webcamVideo.play();
      })
    ]).then(() => {
      // Set canvas size to screen resolution
      canvas.width = screenVideo.videoWidth;
      canvas.height = screenVideo.videoHeight;

      // Calculate PIP dimensions and position
      const pipWidth = Math.floor((canvas.width * pipSettings.size) / 100);
      const aspectRatio = webcamVideo.videoHeight / webcamVideo.videoWidth;
      const pipHeight = Math.floor(pipWidth * aspectRatio);
      
      const { x, y } = calculatePIPPosition(
        pipSettings.position,
        canvas.width,
        canvas.height,
        pipWidth,
        pipHeight
      );

      // Rendering loop at 30fps
      let lastFrameTime = 0;
      const targetFPS = 30;
      const frameInterval = 1000 / targetFPS;

      const render = (currentTime) => {
        // Throttle to 30fps
        if (currentTime - lastFrameTime >= frameInterval) {
          // Draw screen (full size)
          ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);
          
          // Draw webcam (PIP overlay)
          ctx.drawImage(webcamVideo, x, y, pipWidth, pipHeight);
          
          lastFrameTime = currentTime;
        }
        
        animationFrameRef.current = requestAnimationFrame(render);
      };

      render(performance.now());

      // Get canvas stream
      const stream = canvas.captureStream(30);
      setCanvasStream(stream);
    });

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (screenVideo) {
        screenVideo.srcObject = null;
      }
      if (webcamVideo) {
        webcamVideo.srcObject = null;
      }
    };
  }, [screenStream, webcamStream, pipSettings]);

  return { canvasRef, canvasStream };
}
```

**Example 2: PIP Position Calculation**
```javascript
// utils/pipUtils.js
/**
 * Calculate PIP position coordinates based on corner and size
 */
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

/**
 * Calculate PIP dimensions from size percentage
 */
export function calculatePIPDimensions(sizePercent, screenWidth, webcamAspectRatio) {
  const pipWidth = Math.floor((screenWidth * sizePercent) / 100);
  const pipHeight = Math.floor(pipWidth * webcamAspectRatio);
  return { width: pipWidth, height: pipHeight };
}
```

**Example 3: Audio Mixing**
```javascript
// utils/audioUtils.js
/**
 * Mix audio tracks from multiple sources
 */
export async function mixAudioTracks(track1, track2) {
  const audioContext = new AudioContext();
  const destination = audioContext.createMediaStreamDestination();
  
  // Create sources from tracks
  const source1 = audioContext.createMediaStreamSource(
    new MediaStream([track1])
  );
  
  if (track2) {
    const source2 = audioContext.createMediaStreamSource(
      new MediaStream([track2])
    );
    source2.connect(destination);
  }
  
  source1.connect(destination);
  
  return destination.stream.getAudioTracks()[0];
}

/**
 * Select audio source based on user preference
 */
export function selectAudioSource(audioSource, screenStream, webcamStream) {
  const screenAudioTracks = screenStream?.getAudioTracks() || [];
  const webcamAudioTracks = webcamStream?.getAudioTracks() || [];
  
  switch (audioSource) {
    case 'screen':
      return screenAudioTracks[0] || null;
    case 'webcam':
      return webcamAudioTracks[0] || null;
    case 'both':
      if (screenAudioTracks[0] && webcamAudioTracks[0]) {
        return mixAudioTracks(screenAudioTracks[0], webcamAudioTracks[0]);
      } else if (screenAudioTracks[0]) {
        return screenAudioTracks[0];
      } else if (webcamAudioTracks[0]) {
        return webcamAudioTracks[0];
      }
      return null;
    case 'none':
      return null;
    default:
      return webcamAudioTracks[0] || null; // Default to webcam
  }
}
```

**Example 4: Start PIP Recording**
```javascript
// RecordingContext.js - startPIPRecording function
const startPIPRecording = useCallback(async (screenSourceId, webcamDeviceId, pipSettings, options = {}) => {
  try {
    setError(null);
    logger.info('Starting PIP recording', { screenSourceId, webcamDeviceId, pipSettings });
    
    // Get screen stream
    const screenStream = await navigator.mediaDevices.getUserMedia({
      audio: false, // Screen audio handled separately
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: screenSourceId
        }
      }
    });
    
    // Get webcam stream
    const webcamStream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: { exact: webcamDeviceId },
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 }
      },
      audio: true // Webcam microphone
    });
    
    setScreenStream(screenStream);
    setWebcamStream(webcamStream);
    
    // Setup canvas compositing (using hook or direct implementation)
    const { canvas, canvasStream } = setupCanvasCompositing(
      screenStream,
      webcamStream,
      pipSettings
    );
    
    setCompositeCanvas(canvas);
    setCanvasStream(canvasStream);
    
    // Add audio track to canvas stream based on selection
    const audioTrack = await selectAudioSource(
      pipSettings.audioSource,
      screenStream,
      webcamStream
    );
    
    if (audioTrack) {
      canvasStream.addTrack(audioTrack);
    }
    
    // Setup MediaRecorder with canvas stream
    const mimeType = 'video/webm;codecs=vp9,opus';
    const mediaRecorder = new MediaRecorder(canvasStream, {
      mimeType,
      videoBitsPerSecond: options.quality === 'high' ? 8000000 : 4000000
    });
    
    // Chunk collection (same as existing recording)
    const chunks = [];
    // ... (chunk handling logic from existing startRecording)
    
    mediaRecorder.start(1000);
    setMediaRecorder(mediaRecorder);
    setIsRecording(true);
    setRecordingMode('pip');
    setRecordingType('pip');
    setStartTime(Date.now());
    
    // Start duration timer
    const timer = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
    window.recordingTimer = timer;
    
    logger.info('PIP recording started successfully');
    return true;
  } catch (error) {
    logger.error('Failed to start PIP recording', error);
    setError(`Failed to start PIP recording: ${error.message}`);
    return false;
  }
}, []);
```

---

## Testing Strategy

### Test Categories

**Unit Tests:**
- PIP position calculation for all 4 corners
- PIP size calculation (various percentages)
- Canvas resolution matching screen resolution
- Audio source selection logic
- Audio mixing functionality

**Integration Tests:**
1. Complete PIP recording workflow:
   - Select screen source → Get screen stream ✅
   - Select webcam device → Get webcam stream ✅
   - Configure PIP settings → Canvas updates ✅
   - Start recording → MediaRecorder starts ✅
   - Record for 30 seconds → Chunks collected ✅
   - Stop recording → Blob created ✅
   - Save recording → File saved to Media Library ✅

2. Preview functionality:
   - Preview shows composited view ✅
   - Preview updates when settings change ✅
   - Preview matches recorded output ✅

**Edge Cases:**
- Screen permission denied → Show error, allow webcam-only fallback
- Webcam permission denied → Show error, allow screen-only fallback
- Device disconnection → Handle gracefully, stop recording
- Canvas rendering error → Fallback to error state
- Very long recording (30+ min) → Memory/stability check
- Audio track missing → Continue recording without audio
- Different aspect ratios → PIP scales correctly

---

## Success Criteria

**Feature is complete when:**
- [ ] Can select both screen source and webcam device
- [ ] Can preview composited view before recording
- [ ] Can configure PIP position (4 corners via dropdown)
- [ ] Can configure PIP size (15%-50% via slider/presets)
- [ ] Can select audio source (screen/webcam/both/none)
- [ ] Can record composited video (screen + webcam)
- [ ] Audio from selected source properly recorded
- [ ] Recorded video shows both sources correctly composited
- [ ] PIP appears in correct corner with correct size
- [ ] Recording saves to Media Library
- [ ] All edge cases handled gracefully
- [ ] Performance acceptable (30fps during recording)
- [ ] Preview matches recorded output

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
- All corner positions work
- All size presets work

---

## Risk Assessment

### Risk 1: Canvas Performance
**Likelihood:** MEDIUM  
**Impact:** HIGH  
**Mitigation:** 
- Use `willReadFrequently: false` on canvas context
- Throttle to 30fps (not 60fps) using frame timing
- Match canvas resolution to screen (don't upscale)
- Test with high-resolution screens early
- Monitor CPU/GPU usage during development

### Risk 2: Audio Mixing Complexity
**Likelihood:** MEDIUM  
**Impact:** MEDIUM  
**Mitigation:**
- Start with single audio source (webcam mic) in Phase 3
- Add mixing as enhancement after core functionality works
- Test audio mixing early with simple case
- Fall back gracefully if mixing fails (use single source)
- Clear error messages if audio issues occur

### Risk 3: Permission Handling
**Likelihood:** MEDIUM  
**Impact:** MEDIUM  
**Mitigation:**
- Handle screen permission denial gracefully
- Handle webcam permission denial gracefully
- Allow fallback to screen-only or webcam-only recording
- Clear error messages for denied permissions
- Guide users to system preferences for permission setup

### Risk 4: Device Disconnection
**Likelihood:** LOW  
**Impact:** HIGH  
**Mitigation:**
- Monitor stream track `ended` events
- Stop recording if either stream disconnects
- Show clear error message
- Save partial recording if possible
- Clean up resources properly on disconnect

### Risk 5: Synchronization Issues
**Likelihood:** LOW  
**Impact:** MEDIUM  
**Mitigation:**
- Use same frame timing for both video sources
- Wait for both video metadata before starting canvas capture
- Use requestAnimationFrame for consistent timing
- Test with different frame rates on sources

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
- [x] PR#17 (Screen Recording Setup) - Screen source detection patterns
- [x] PR#18 (Webcam Recording) - Webcam device enumeration patterns
- [x] Existing RecordingContext infrastructure
- [x] SourcePicker and DeviceSelector components
- [x] MediaRecorder API support
- [x] Canvas CaptureStream API support

**Blocks:**
- Future PRs that depend on multi-source recording
- Advanced recording features (audio mixing presets, custom PIP shapes, etc.)

---

## Open Questions

1. **Audio Mixing Timing:** Should audio mixing be in Phase 2 or Phase 3?
   - **Decision:** Phase 3 - Start with single audio source for MVP, add mixing as enhancement

2. **Preview Canvas:** Should preview use same canvas as recording or separate?
   - **Decision:** Can share same canvas initially, separate if performance issues occur

3. **PIP Size Limits:** What's minimum/maximum practical size?
   - **Decision:** 10%-50% of screen width (minimum enforced by UI, maximum prevents PIP from dominating)

4. **Default Settings:** What should be the default PIP position and size?
   - **Decision:** Top-right corner, 25% size (Medium preset) - most common in professional software

---

## References

- **PR#17:** Screen Recording Setup - Screen source detection patterns, MediaRecorder setup
- **PR#18:** Webcam Recording - Webcam device enumeration patterns, stream management
- **Canvas Capture Stream API:** https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/captureStream
- **MediaRecorder API:** https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
- **AudioContext API:** https://developer.mozilla.org/en-US/docs/Web/API/AudioContext

---

## Component Hierarchy

```
RecordingContext/
├── RecordingControls (extended)
│   ├── Mode Selector (Screen | Webcam | Picture-in-Picture) ← NEW
│   └── PIPRecordingControls (when mode = 'pip') ← NEW
│       ├── SourcePicker (screen selection) - REUSE
│       ├── DeviceSelector (webcam selection) - REUSE
│       ├── PIPSettings ← NEW
│       │   ├── Position Selector (dropdown)
│       │   ├── Size Selector (slider + presets)
│       │   └── Audio Source Selector (dropdown)
│       ├── PIPPreview ← NEW
│       │   └── Composited Canvas Preview
│       └── RecordingButtons
└── RecordingIndicator (extended for PIP mode)
```

---

## Technical Notes

### Canvas CaptureStream Compatibility
- Supported in Chrome/Electron (required)
- Frame rate: Can specify target FPS (30fps recommended)
- Stream includes video track automatically
- Audio track must be added separately if needed

### Performance Considerations
- Canvas rendering at 30fps: ~33ms per frame budget
- Drawing two video sources: ~5-10ms per frame (acceptable)
- Memory: Two video streams + canvas = ~200-300MB additional
- CPU: Canvas compositing adds ~10-15% CPU usage

### Audio Mixing Notes
- AudioContext mixing adds minimal overhead (~1-2ms)
- Mixed audio track can be added directly to canvas stream
- If one track missing, fall back to single track
- If both missing, canvas stream has no audio (acceptable)

### File Size Estimation
- Screen recording: ~2MB/min (VP9 codec)
- Webcam recording: ~1MB/min (VP9 codec)
- PIP composite: ~3-4MB/min (composited, slightly larger than sum)

---

**Status:** 📋 PLANNED  
**Next Step:** Review implementation checklist and begin Phase 1

