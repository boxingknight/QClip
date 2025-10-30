# PR#32: Picture-in-Picture Recording - Quick Start

---

## TL;DR (30 seconds)

**What:** Picture-in-picture recording that composites screen and webcam into a single video file. Webcam appears as a smaller overlay in one of four corners during screen recording.

**Why:** Essential for tutorial creators, educators, and content creators who need to show themselves while demonstrating screen content. This completes the recording suite with the most requested feature.

**Time:** 8-10 hours estimated

**Complexity:** HIGH

**Status:** 📋 PLANNED

---

## Decision Framework (2 minutes)

### Should You Build This?

**Green Lights (Build it!):**
- ✅ PR#17 (Screen Recording) complete
- ✅ PR#18 (Webcam Recording) complete
- ✅ Have 8-10 hours available
- ✅ Need multi-source recording capability
- ✅ Canvas CaptureStream API supported in Electron

**Red Lights (Skip/defer it!):**
- ❌ PR#17 or PR#18 not complete (blocking dependencies)
- ❌ Time-constrained (< 8 hours available)
- ❌ Canvas performance concerns on target hardware
- ❌ Not a priority for current milestone

**Decision Aid:** If screen and webcam recording work, PIP is the natural next step. Most professional recording software has PIP mode, so this is expected functionality.

---

## Prerequisites (5 minutes)

### Required
- [x] PR#17 (Screen Recording) deployed and working
- [x] PR#18 (Webcam Recording) deployed and working
- [x] RecordingContext infrastructure in place
- [x] SourcePicker and DeviceSelector components available
- [x] Canvas CaptureStream API supported (Chrome/Electron)

### Setup Commands
```bash
# No new dependencies needed - using native Web APIs
npm start

# Verify Canvas CaptureStream support
# Should be available in Electron (Chrome-based)
```

---

## Getting Started (First Hour)

### Step 1: Read Documentation (45 minutes)
- [ ] Read this quick start (10 min)
- [ ] Read main specification: `PR32_PICTURE_IN_PICTURE_RECORDING.md` (35 min)
- [ ] Note any questions or concerns

### Step 2: Set Up Environment (15 minutes)
- [ ] Verify PR#17 and PR#18 are working
- [ ] Test screen recording works
- [ ] Test webcam recording works
- [ ] Create git branch: `feature/pr32-picture-in-picture-recording`
- [ ] Open relevant files in editor:
  - `src/context/RecordingContext.js`
  - `src/components/recording/RecordingControls.js`

### Step 3: Start Phase 1
- [ ] Open implementation checklist
- [ ] Begin Phase 1: Canvas Compositing Foundation
- [ ] First task: Create PIP utilities (pipUtils.js)
- [ ] Commit when task complete

---

## Daily Progress Template

### Day 1 Goals (4-5 hours)
- [ ] Phase 1: Canvas Compositing Foundation (2-3h)
  - [ ] PIP utilities created
  - [ ] Canvas compositing hook implemented
  - [ ] Basic two-stream compositing working
- [ ] Phase 2: Start PIP Recording Implementation (2h)
  - [ ] RecordingContext extended with PIP state
  - [ ] startPIPRecording function started

**Checkpoint:** Canvas successfully composites two video streams ✅

### Day 2 Goals (4-5 hours)
- [ ] Phase 2: Complete PIP Recording Implementation (1-2h)
  - [ ] startPIPRecording function complete
  - [ ] stopPIPRecording cleanup working
- [ ] Phase 3: Audio Mixing (1-2h)
  - [ ] Audio utilities created
  - [ ] Audio source selection working
- [ ] Phase 4: UI Components (2-3h)
  - [ ] PIPSettings component created
  - [ ] PIPPreview component created
  - [ ] PIPRecordingControls component created

**Checkpoint:** Complete PIP recording workflow working ✅

### Day 3 Goals (1 hour)
- [ ] Phase 5: Integration & Polish (1h)
  - [ ] RecordingControls integration
  - [ ] Error handling
  - [ ] Performance optimization
  - [ ] Final testing

**Checkpoint:** Feature complete and tested ✅

---

## Common Issues & Solutions

### Issue 1: Canvas Stream Not Capturing
**Symptoms:** Canvas stream has no video track or recording fails  
**Cause:** Canvas size not set before captureStream() called  
**Solution:** 
```javascript
// Set canvas size BEFORE calling captureStream
canvas.width = screenVideo.videoWidth;
canvas.height = screenVideo.videoHeight;
// Wait for metadata first
const stream = canvas.captureStream(30);
```

### Issue 2: PIP Position Incorrect
**Symptoms:** Webcam overlay appears in wrong corner  
**Cause:** Position calculation or rendering order issue  
**Solution:** Verify calculatePIPPosition function returns correct coordinates for all 4 corners. Check canvas drawing order (screen first, then webcam overlay).

### Issue 3: Audio Not Working
**Symptoms:** Recorded video has no audio  
**Cause:** Audio track not added to canvas stream  
**Solution:**
```javascript
// After creating canvas stream
const audioTrack = await selectAudioSource(audioSource, screenStream, webcamStream);
if (audioTrack) {
  canvasStream.addTrack(audioTrack);
}
```

### Issue 4: Performance Issues
**Symptoms:** Low frame rate, high CPU usage  
**Cause:** Rendering loop not throttled properly  
**Solution:** 
- Use frame timing to throttle to 30fps
- Use `willReadFrequently: false` on canvas context
- Check both video streams are optimal resolution (not higher than needed)

### Issue 5: Preview Not Updating
**Symptoms:** PIP preview doesn't reflect settings changes  
**Cause:** Canvas compositing hook not re-running when settings change  
**Solution:** Ensure pipSettings are in useEffect dependencies, or use separate preview canvas.

---

## Quick Reference

### Key Files
- `src/hooks/useCanvasCompositing.js` - Canvas compositing logic
- `src/utils/pipUtils.js` - PIP position/size calculations
- `src/utils/audioUtils.js` - Audio mixing utilities
- `src/components/recording/PIPRecordingControls.js` - Main PIP UI
- `src/components/recording/PIPSettings.js` - Settings panel
- `src/components/recording/PIPPreview.js` - Preview component
- `src/context/RecordingContext.js` - Extended with PIP support

### Key Functions
- `startPIPRecording()` - Start PIP recording (RecordingContext)
- `stopPIPRecording()` - Stop PIP recording (RecordingContext)
- `useCanvasCompositing()` - Canvas compositing hook
- `calculatePIPPosition()` - Calculate overlay position
- `selectAudioSource()` - Select/mix audio tracks

### Key Concepts
- **Canvas Compositing:** Draw both streams to hidden canvas, record canvas stream
- **PIP Position:** Four corners (top-left, top-right, bottom-left, bottom-right)
- **PIP Size:** Percentage of screen width (15%-50%)
- **Audio Mixing:** Combine screen and webcam audio using AudioContext

### Useful Commands
```bash
# Start development
npm start

# Run tests (if test suite exists)
npm test

# Build for production
npm run build
```

---

## Success Metrics

**You'll know it's working when:**
- [ ] Can select screen source and webcam device
- [ ] Preview shows composited view (screen + webcam overlay)
- [ ] PIP appears in correct corner
- [ ] Can change PIP position and see preview update
- [ ] Can change PIP size and see preview update
- [ ] Can start recording and see recording indicator
- [ ] Can stop recording and save file
- [ ] Saved video shows both screen and webcam composited
- [ ] Audio from selected source works in recorded video
- [ ] Performance is acceptable (30fps maintained)

**Performance Targets:**
- Canvas rendering: 30fps maintained
- Recording start: < 3 seconds
- Memory usage: < 800MB during recording
- File size: ~3-4MB per minute

---

## Help & Support

### Stuck?
1. Check main planning doc for technical details
2. Review PR#17 and PR#18 for stream handling patterns
3. Check Canvas CaptureStream API docs
4. Review implementation checklist step-by-step

### Want to Skip a Feature?
- **Audio Mixing:** Can start with single audio source (webcam mic), add mixing later
- **Preview:** Can skip preview initially, add in Phase 4
- **Size Presets:** Can start with just slider, add presets later

### Running Out of Time?
**Priority Order:**
1. Canvas compositing foundation (Phase 1) - CRITICAL
2. Basic PIP recording (Phase 2) - CRITICAL
3. UI components (Phase 4) - HIGH
4. Audio mixing (Phase 3) - MEDIUM (can simplify to single source)
5. Polish (Phase 5) - LOW

---

## Motivation

**You've got this!** 💪

ClipForge already has professional screen recording (PR#17) and webcam recording (PR#18). Picture-in-picture is the natural next step that completes the recording suite. The canvas compositing approach is proven and works well in Electron environments. Once you get the canvas rendering loop working, the rest falls into place.

This feature will enable users to create professional tutorial videos, presentations, and content with themselves visible while demonstrating screen content - exactly what they expect from professional recording software.

---

## Next Steps

**When ready:**
1. Run prerequisites check (5 min)
2. Read main spec (45 min)
3. Start Phase 1 from checklist (2-3 hours)
4. Commit early and often

**Status:** Ready to build! 🚀

---

## Feature Comparison

### Before (PR#17 + PR#18)
- ✅ Screen recording only
- ✅ Webcam recording only
- ❌ Cannot record both simultaneously
- ❌ Must record separately and combine manually

### After (PR#32)
- ✅ Screen recording only
- ✅ Webcam recording only
- ✅ **PIP recording (both simultaneously)**
- ✅ **Single composited video file**
- ✅ **Real-time preview of composite**

---

**Remember:** Start with canvas compositing foundation - once that works, everything else builds on it!

