# PR#3: Video Player - Quick Start

**Estimated Time:** 3-4 hours  
**Complexity:** LOW  
**Status:** 📋 PLANNED

---

## TL;DR (30 seconds)

**What:** Build a video player component that displays imported video files with play/pause controls and time display.

**Why:** Users need to preview their imported clips to decide what to edit. The player is the central interaction point.

**Time:** 3-4 hours

**Complexity:** LOW - Uses standard HTML5 video element

---

## Decision Framework (2 minutes)

### Should You Build This Feature?

**Green Lights (Build it!):**
- ✅ PR #1 (Project Setup) is complete - Electron + React working
- ✅ PR #2 (File Import) is complete - Can import video files
- ✅ You have 3-4 hours available
- ✅ You're comfortable with React hooks (useState, useRef, useEffect)

**Red Lights (Not right now):**
- ❌ PR #2 not complete yet (can't test without imported video)
- ❌ Less than 2 hours available (not enough time for quality implementation)
- ❌ Not familiar with HTML5 video API

**Decision Aid:** If PR #2 is complete and you have the time, start immediately. This is a critical path feature that enables all later editing functionality.

---

## Prerequisites (5 minutes)

### Required
- ✅ PR #1 complete (Electron + React app running)
- ✅ PR #2 complete (File import working, can import MP4 files)
- ✅ Video file for testing (MP4 with H.264 codec, has audio)

### Nice to Have
- Video.js or video.js documentation for reference (not required, using native HTML5)
- Sample videos of different durations (<1s to >30min)

### Setup Verification
```bash
# Verify you're on the right branch
git branch
# Should be on: feat/video-player

# Or create it:
git checkout -b feat/video-player

# Verify dependencies installed
npm list react electron fluent-ffmpeg
# All should show versions

# Verify app runs
npm start
# Should open Electron window with "Hello ClipForge"
```

---

## Getting Started (First Hour)

### Step 1: Review Documentation (15 minutes)

1. **Read this quick start guide** (you're doing it! ✅)
2. **Skim main specification** (`PR03_VIDEO_PLAYER.md`) - Focus on:
   - Architecture decisions (why HTML5 video element)
   - Data model (what state we're managing)
   - Component structure (how it's organized)
3. **Open implementation checklist** (`PR03_IMPLEMENTATION_CHECKLIST.md`) - This is your step-by-step guide

### Step 2: Review Existing Code (10 minutes)

1. **Check App.js structure:**
   ```bash
   # Open for reference
   code src/App.js
   ```
   - Note how components are imported
   - See how state is managed
   - Understand component layout

2. **Check if video source is already being set:**
   - Look for `selectedClip` state
   - See how clips are stored after import

### Step 3: Plan Your Approach (5 minutes)

Based on the implementation checklist:

**Phase 1 (45 min):** Component foundation
- Create VideoPlayer.js file
- Add state variables
- Add event handler stubs
- Implement empty state

**Phase 2 (45 min):** Video element & integration  
- Render video element
- Handle source changes

**Phase 3 (45 min):** Playback controls
- Implement play/pause
- Add time display

**Phase 4 (45 min):** Styling
- Create CSS
- Make it look good

**Phase 5 (30 min):** Integration
- Connect to App
- Final testing

### Step 4: Start Building! (30 minutes)

**Begin with Phase 1 from checklist:**
1. Create `src/components/VideoPlayer.js`
2. Add imports and basic structure
3. Add state variables
4. Implement empty state

**Goal:** Empty state displays in App when no video is selected

---

## Daily Progress Template

### Hour 1 Goals (Getting Started)
- [x] Review documentation
- [x] Verify prerequisites
- [x] Create branch
- [ ] Complete Phase 1 (Component foundation)
- [ ] Commit: "feat(video-player): add component structure"

**Checkpoint:** Empty state displays correctly

---

### Hour 2 Goals (Core Functionality)
- [ ] Complete Phase 2 (Video element)
- [ ] Complete Phase 3 (Playback controls)
- [ ] Test play/pause works
- [ ] Commit: "feat(video-player): add playback controls"

**Checkpoint:** Can play/pause imported video

---

### Hour 3 Goals (Polish & Integration)
- [ ] Complete Phase 4 (Styling)
- [ ] Complete Phase 5 (Integration)
- [ ] Test all functionality
- [ ] Commit: "feat(video-player): integrate with App"

**Checkpoint:** Video player fully integrated and styled

---

### Hour 4 Goals (Testing & Edge Cases)
- [ ] Test with different video files
- [ ] Test edge cases (corrupted video, missing file)
- [ ] Check for memory leaks
- [ ] Fix any bugs
- [ ] Final commit with testing

**Checkpoint:** Feature complete and tested ✅

---

## Common Issues & Solutions

### Issue 1: Video Won't Load

**Symptoms:** Video element shows but no picture appears

**Causes:**
- File path incorrect
- Codec not supported
- File permissions issue

**Solution:**
```javascript
// Verify path format for Electron
const videoSrc = `file://${clip.path}`;

// Or if already including file://
const videoSrc = clip.path; // Assuming path includes file://
```

**Debug Steps:**
1. Log `videoSrc` to console
2. Check if path exists: `console.log(fs.existsSync(clip.path))`
3. Try playing the file outside the app (VLC)
4. Verify codec is H.264

---

### Issue 2: Play Button Doesn't Work

**Symptoms:** Clicking play button does nothing, no error

**Causes:**
- Video not loaded yet (still loading)
- Missing error handler
- Play() promise not caught

**Solution:**
```javascript
const handlePlayPause = () => {
  const video = videoRef.current;
  
  if (!video || !videoSrc) return; // Early return if no video
  
  if (isPlaying) {
    video.pause();
  } else {
    video.play()
      .catch((err) => {
        console.error('Play error:', err);
        setError('Failed to play video');
      });
  }
};
```

**Debug Steps:**
1. Check `isLoading` state
2. Check if video element exists: `console.log(videoRef.current)`
3. Check error handler is firing
4. Try calling `video.play()` directly in console

---

### Issue 3: Audio Not Playing

**Symptoms:** Video plays but no sound

**Causes:**
- Video muted by default
- Audio codec issue
- System audio disabled

**Solution:**
```javascript
// Ensure video is not muted
<video
  ref={videoRef}
  muted={false}  // Explicitly set to false
  // ...
/>
```

**Debug Steps:**
1. Check system volume is up
2. Try playing file in external player (VLC)
3. Check video has audio track (ffprobe)
4. Add mute/unmute button for testing

---

### Issue 4: Memory Leak When Switching Videos

**Symptoms:** App slows down after switching between multiple videos

**Causes:**
- Video element not cleaned up
- Event listeners not removed
- Video source not cleared

**Solution:**
```javascript
useEffect(() => {
  // Cleanup function
  return () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.src = '';
      video.load();
    }
  };
}, [videoSrc]);
```

**Debug Steps:**
1. Use Chrome DevTools Memory profiler
2. Switch between 10 videos
3. Take heap snapshot
4. Look for growing memory

---

### Issue 5: Time Display Shows NaN

**Symptoms:** Time display shows "NaN:NaN"

**Causes:**
- `currentTime` or `duration` is undefined
- Calculation error in formatTime

**Solution:**
```javascript
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '00:00';  // Guard clause
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};
```

**Debug Steps:**
1. Log `currentTime` and `duration` to console
2. Check if values are numbers
3. Check if video metadata loaded

---

## Quick Reference

### Key Files You'll Create
- `src/components/VideoPlayer.js` - Main component (~180 lines)
- `src/styles/VideoPlayer.css` - Styling (~80 lines)

### Key Functions
- `VideoPlayer(videoSrc, onTimeUpdate)` - Main component
- `handlePlayPause()` - Play/pause toggle
- `handleTimeUpdate()` - Update current time
- `formatTime(seconds)` - Format to MM:SS
- `useEffect()` - Handle video source changes

### Key State Variables
- `isPlaying` - Whether video is playing
- `currentTime` - Current playback time
- `duration` - Total video duration
- `isLoading` - Video is loading
- `error` - Error message
- `videoRef` - Reference to video element

### Key Concepts
- **HTML5 Video Element** - Native browser video player
- **file:// Protocol** - How Electron accesses local files
- **useRef Hook** - Access DOM element directly
- **Controlled vs Uncontrolled** - Hybrid pattern for this component
- **Video Events** - loadedmetadata, timeupdate, play, pause, ended, error

### Useful Commands
```bash
# Start development
npm start

# Check for console errors (important!)
# Open DevTools in Electron (Cmd+Option+I)

# Test with a video file
# Import MP4 file through ImportPanel

# Debug video issues
console.log(videoRef.current);  // Check video element
console.log(videoSrc);           // Check path
```

---

## Success Metrics

### You'll Know It's Working When:

**Functionality:**
- ✅ Clicking play button starts video playback
- ✅ Clicking pause button stops video
- ✅ Current time displays (e.g., "01:23")
- ✅ Duration displays (e.g., "05:45")
- ✅ Time updates during playback
- ✅ Empty state shows when no video

**Integration:**
- ✅ Importing video loads it in player
- ✅ Switching videos works smoothly
- ✅ Audio plays synchronized with video

**Quality:**
- ✅ No console errors
- ✅ Video plays smoothly (no stuttering)
- ✅ Loading indicator shows
- ✅ Error message shows on invalid video
- ✅ No memory leaks

---

## Testing Checklist

### Basic Functionality Tests
1. **Import video** → Video appears in player
2. **Click play** → Video starts playing
3. **Click pause** → Video stops
4. **Watch until end** → Video stops automatically
5. **Check time** → Display updates correctly

### Edge Case Tests
1. **No video imported** → Shows empty state
2. **Invalid video** → Shows error message
3. **Very short video** (<1s) → Displays and plays
4. **Very long video** (>30min) → Works correctly
5. **Rapid switching** → No crashes or memory leaks

### Performance Tests
1. **Switch between 10 videos** → No performance degradation
2. **Play for 10 minutes** → Memory stays stable
3. **Console check** → No errors or warnings

---

## Help & Support

### Stuck?

1. **Review main spec** for detailed technical information
2. **Check implementation checklist** for step-by-step guide
3. **Review common issues** section above
4. **Check Electron docs** for file:// protocol issues
5. **Use React DevTools** to inspect component state

### Want to Skip Something?

**Can Skip (but not recommended):**
- Loading indicator (just use empty state)
- Error messages (just let video element fail)

**Must Have:**
- Video element rendering
- Play/pause controls
- Basic time display

### Running Out of Time?

**MVP Essentials (2 hours):**
1. Render video element ✅
2. Play button works ✅
3. Pause button works ✅
4. Basic time display ✅

**Remove These:**
- Loading indicator
- Error messages (minimal)
- Empty state (simplified)
- Advanced styling

**Focus:** Just get play/pause working with a video element

---

## Motivation

**You've got this!** 💪

Video playback is a core feature that makes the application feel real and functional. Once you have a working player, you can:
- Preview imported videos
- Navigate to find edit points
- Verify your videos work
- Build confidence in the app

The HTML5 video element makes this surprisingly straightforward. You're not building a complex player from scratch—you're orchestrating a proven browser API with React.

**Start with:** Create the component file, add the video element, wire up a play button. You'll have a working player in under an hour.

---

## Next Steps

**When Ready:**
1. Read implementation checklist
2. Create VideoPlayer.js file
3. Add basic video element
4. Implement play button
5. Test with imported video

**After This PR:**
- PR #4: FFmpeg Export (can now test export with working player)
- PR #5: Timeline (will need player integration)
- PR #6: Trim Controls (needs player current time)

**Status:** Ready to build! 🚀


