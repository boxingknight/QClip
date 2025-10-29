# PR#18: Webcam Recording - Quick Start

---

## TL;DR (30 seconds)

**What:** Webcam recording functionality that captures video from user's camera with audio, provides real-time preview, and saves recordings directly to Media Library.

**Why:** Essential for content creators, educators, and professionals who need to record themselves for tutorials, presentations, or content creation.

**Time:** 6 hours estimated

**Complexity:** HIGH

**Status:** 📋 PLANNED

---

## Decision Framework (2 minutes)

### Should You Build This?

**Green Lights (Build it!):**
- ✅ You have 6+ hours available for implementation
- ✅ PR#17 (Screen Recording Setup) is complete
- ✅ You want comprehensive recording capabilities
- ✅ You're comfortable with WebRTC APIs
- ✅ You understand this builds on existing recording infrastructure

**Red Lights (Skip/defer it!):**
- ❌ Time-constrained (<6 hours available)
- ❌ PR#17 not complete (missing foundation)
- ❌ Not interested in webcam recording features
- ❌ Prefer to focus on other V2 features first
- ❌ WebRTC APIs seem too complex

**Decision Aid:** This is a high-value feature that completes the recording suite alongside screen recording. Only proceed if you're committed to the full implementation and have the necessary time.

---

## Prerequisites (5 minutes)

### Required
- [ ] PR#11 complete (State Management Refactor)
- [ ] PR#12 complete (UI Component Library)
- [ ] PR#13 complete (Professional Timeline)
- [ ] PR#17 complete (Screen Recording Setup)
- [ ] HTTPS or localhost environment (required for getUserMedia API)
- [ ] Webcam device available for testing

### Setup Commands
```bash
# 1. Verify dependencies
npm list electron react

# 2. Start development server
npm start

# 3. Create feature branch
git checkout -b feature/pr18-webcam-recording

# 4. Verify HTTPS/localhost
# Make sure you're running on https://localhost:3000 or similar
```

---

## Getting Started (First Hour)

### Step 1: Read Documentation (45 minutes)
- [ ] Read main specification (30 min)
- [ ] Review implementation checklist (15 min)
- [ ] Note any questions or concerns

### Step 2: Set Up Environment (15 minutes)
- [ ] Verify HTTPS/localhost setup
- [ ] Test webcam access in browser
- [ ] Open relevant files in editor

### Step 3: Start Phase 1
- [ ] Open implementation checklist
- [ ] Begin first task (Device Enumeration)
- [ ] Commit when task complete

---

## Daily Progress Template

### Day 1 Goals (3 hours)
- [ ] Task 1: Device Enumeration (1.5h)
  - Create webcamUtils.js
  - Implement getWebcamDevices()
  - Test with multiple cameras
- [ ] Task 2: Preview System (1.5h)
  - Create WebcamPreview component
  - Add error handling
  - Test preview functionality

**Checkpoint:** Users can see webcam preview and select devices

### Day 2 Goals (3 hours)
- [ ] Task 3: Recording Implementation (2h)
  - Extend RecordingContext
  - Implement startWebcamRecording()
  - Test recording functionality
- [ ] Task 4: Integration & Polish (1h)
  - Integrate with main app
  - Add error handling
  - Test complete workflow

**Checkpoint:** Complete webcam recording workflow working

---

## Common Issues & Solutions

### Issue 1: getUserMedia Permission Denied
**Symptoms:** Error message "Camera permission denied"  
**Cause:** Browser security requires HTTPS or localhost for camera access  
**Solution:** 
```bash
# Make sure you're running on HTTPS or localhost
npm start
# Should open https://localhost:3000 or similar
```

### Issue 2: No Cameras Found
**Symptoms:** "No cameras found" message  
**Cause:** No webcam devices available or permission not granted  
**Solution:**
- Check if webcam is connected
- Grant camera permission in browser
- Try refreshing the page

### Issue 3: Preview Not Showing
**Symptoms:** Black preview window  
**Cause:** Video stream not properly attached to video element  
**Solution:**
```javascript
// Make sure video element has proper attributes
<video
  ref={videoRef}
  autoPlay
  muted
  playsInline
  srcObject={stream}
/>
```

### Issue 4: Recording Not Starting
**Symptoms:** MediaRecorder fails to start  
**Cause:** Unsupported codec or invalid stream  
**Solution:**
```javascript
// Check for supported MIME types
const supportedTypes = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm'
];

const mimeType = supportedTypes.find(type => 
  MediaRecorder.isTypeSupported(type)
);
```

### Issue 5: Audio Not Recording
**Symptoms:** Video records but no audio  
**Cause:** Audio track not included in MediaStream  
**Solution:**
```javascript
// Make sure to request audio in getUserMedia
const stream = await navigator.mediaDevices.getUserMedia({
  video: { deviceId },
  audio: true // This is required for audio
});
```

---

## Quick Reference

### Key Files
- `src/utils/webcamUtils.js` - Device enumeration utilities
- `src/context/RecordingContext.js` - Webcam recording state management
- `src/components/recording/WebcamPreview.js` - Preview component
- `src/components/recording/WebcamRecordingControls.js` - Main controls
- `src/hooks/useWebcamRecording.js` - Recording logic hook

### Key Functions
- `getWebcamDevices()` - Get list of available cameras
- `startWebcamRecording(deviceId, settings)` - Start recording
- `stopWebcamRecording()` - Stop and save recording
- `getWebcamPreview(deviceId)` - Get preview stream

### Key Concepts
- **MediaDevices API:** Browser API for accessing camera/microphone
- **MediaRecorder API:** Browser API for recording media streams
- **WebRTC:** Real-time communication APIs for web
- **getUserMedia:** Method to access user's media devices

### Useful Commands
```bash
# Start development
npm start

# Build for production
npm run build

# Test webcam access
# Open browser console and run:
navigator.mediaDevices.getUserMedia({video: true})
  .then(stream => console.log('Camera access granted'))
  .catch(err => console.log('Camera access denied:', err))
```

---

## Success Metrics

**You'll know it's working when:**
- [ ] Camera selection dropdown shows available devices
- [ ] Preview window shows live webcam feed
- [ ] Recording button starts/stops recording
- [ ] Recorded video appears in Media Library
- [ ] Recording includes both video and audio
- [ ] Error messages are helpful and actionable

**Performance Targets:**
- Recording startup: < 2 seconds
- Preview latency: < 100ms
- Memory usage: < 200MB during recording
- File size: Reasonable for duration

---

## Help & Support

### Stuck?
1. Check main planning doc for detailed architecture
2. Review PR#17 (Screen Recording) for similar patterns
3. Check browser console for WebRTC errors
4. Verify HTTPS/localhost requirement

### Want to Skip a Feature?
- **Skip preview window:** Use simple video element (saves 1 hour)
- **Skip device selection:** Auto-select first camera (saves 30 min)
- **Skip settings:** Use default 720p, 30fps (saves 30 min)

### Running Out of Time?
**Priority order:**
1. Basic recording (device selection + recording) - 3 hours
2. Preview window - 1.5 hours
3. Settings panel - 1 hour
4. Error handling - 30 minutes

---

## Motivation

**You've got this!** 💪

This PR completes ClipForge's recording capabilities, making it a comprehensive capture-and-edit solution. Combined with screen recording (PR#17), users can now record any type of content they need. The WebRTC APIs are well-documented and the implementation builds on the solid foundation from PR#17.

**Key Benefits:**
- Complete recording suite (screen + webcam)
- Professional content creation capabilities
- Real-time preview for proper framing
- Seamless integration with existing workflow

---

## Next Steps

**When ready:**
1. Run prerequisites (5 min)
2. Read main spec (45 min)
3. Start Phase 1 from checklist
4. Commit early and often

**Status:** Ready to build! 🚀

---

## Related PRs

- **PR#17:** Screen Recording Setup (foundation)
- **PR#19:** Audio Mixing & Controls (enhancement)
- **PR#20:** Text Overlays (can add text to webcam recordings)

---

## Technical Notes

### Browser Compatibility
- **Chrome/Edge:** Full support
- **Firefox:** Full support
- **Safari:** Limited support (may need fallbacks)

### Security Requirements
- **HTTPS required** for production
- **Localhost allowed** for development
- **User permission required** for camera access

### Performance Considerations
- **Preview stream:** Lower quality for performance
- **Recording stream:** Higher quality for output
- **Memory management:** Clean up streams properly
- **File size:** WebM format is efficient

---

**Remember:** This is a high-value feature that significantly enhances ClipForge's capabilities. Take your time to implement it properly! 🎥
