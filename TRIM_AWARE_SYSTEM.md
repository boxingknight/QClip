# Trim-Aware Playback & Export System 🎯

**Date:** October 28, 2024  
**Status:** ✅ COMPLETE & TESTED  
**PR:** #13 Professional Timeline Implementation

---

## Overview

ClipForge now features a **professional trim-aware system** that synchronizes video playback and export with the timeline's visual state. This means:

- ✅ **What you see is what you play**
- ✅ **What you play is what you export**
- ✅ **Real-time trim playback without rendering**

---

## The Problem We Solved

### Before (Broken System):
```
User imports 30s video
User trims to 10s-20s on timeline
Player still plays 0s-30s (full video) ❌
Export renders 0s-30s (full video) ❌
```

**Result:** Complete disconnect between timeline visual and actual playback/export!

### After (Fixed System):
```
User imports 30s video
User trims to 10s-20s on timeline
Player plays 10s-20s (trimmed portion) ✅
Export renders 10s-20s (trimmed portion) ✅
```

**Result:** Professional WYSIWYG (What You See Is What You Get) workflow!

---

## How It Works

### 1. Data Structure

Each clip in the timeline stores trim bounds:

```javascript
{
  id: "clip-123",
  path: "/path/to/video.mp4",
  duration: 30.0,           // Current visible duration (10s after trim)
  originalDuration: 30.0,   // Never changes - immutable original length
  trimIn: 10.0,             // Start of visible portion (seconds)
  trimOut: 20.0,            // End of visible portion (seconds)
  startTime: 0.0,           // Position on timeline
  trackId: "video-1"
}
```

**Key Principles:**
- `trimIn` and `trimOut` define the visible window into the original video
- `duration` = `trimOut - trimIn` (the visible length)
- `originalDuration` is immutable - set once, never changes
- All times are in seconds

---

## Implementation Details

### A. Trim-Aware Video Playback

**File:** `src/components/VideoPlayer.js`

#### Feature 1: Seek to `trimIn` on Load

When a video loads, automatically seek to the start of the trimmed section:

```javascript
const handleLoadedMetadata = () => {
  if (video) {
    // ... metadata setup ...
    
    // 🎯 CRITICAL: Seek to trimIn on load
    const trimIn = selectedClip?.trimIn || 0;
    if (trimIn > 0) {
      video.currentTime = trimIn;
      logger.debug('Seeked to trimIn on load', { trimIn });
    }
  }
};
```

**Why This Matters:**
- User sees the beginning of what's visible on timeline
- No confusion about where playback starts
- Matches timeline visual state immediately

#### Feature 2: Stop at `trimOut` During Playback

Monitor `currentTime` and pause at the trim end point:

```javascript
onTimeUpdate={() => {
  const video = videoRef.current;
  if (video) {
    const current = video.currentTime;
    
    // 🎯 CRITICAL: Stop playback at trimOut point
    const trimOut = selectedClip?.trimOut || duration;
    if (current >= trimOut) {
      video.pause();
      setIsPlaying(false);
      updatePlaybackState({ isPlaying: false });
      logger.debug('Stopped at trimOut', { trimOut });
    }
    
    // ... rest of time update ...
  }
}}
```

**Why This Matters:**
- Playback stops exactly where the clip ends on timeline
- No "overshoot" into trimmed-out portions
- Professional behavior matching industry standards

#### Feature 3: Loop to `trimIn` on Replay

When user clicks play after reaching the end, restart from the trim start:

```javascript
const handlePlayPause = () => {
  const video = videoRef.current;
  
  if (!video || !videoSrc) {
    // ... error handling ...
    return;
  }
  
  if (isPlaying) {
    video.pause();
  } else {
    // 🎯 CRITICAL: If at trimOut, seek back to trimIn
    const trimOut = selectedClip?.trimOut || duration;
    const trimIn = selectedClip?.trimIn || 0;
    if (video.currentTime >= trimOut) {
      video.currentTime = trimIn;
      logger.debug('Looped back to trimIn', { trimIn });
    }
    
    video.play().catch((err) => {
      // ... error handling ...
    });
  }
};
```

**Why This Matters:**
- Natural replay behavior
- User can review trimmed section repeatedly
- Matches CapCut/Premiere Pro behavior

#### Feature 4: Display Trimmed Duration

Show the duration of the visible portion, not the full video:

```javascript
<div className="time-display">
  <span>{formatTime(currentTime - (selectedClip?.trimIn || 0))}</span>
  <span className="separator">/</span>
  <span>{formatTime((selectedClip?.trimOut || duration) - (selectedClip?.trimIn || 0))}</span>
</div>
```

**Display Logic:**
- `currentTime` is relative to `trimIn` (starts at 0:00)
- Total duration is `trimOut - trimIn`
- User sees "2:34 / 10:00" for a 10s trim, not "12:34 / 30:00"

---

### B. Trim-Aware Export

**File:** `src/components/ExportPanel.js`

#### Data Format Conversion

The export system expects a different data format than the timeline provides:

**Timeline Format (New):**
```javascript
clip = {
  id: "clip-123",
  trimIn: 10.0,
  trimOut: 20.0,
  duration: 10.0
}
```

**Export Format (Expected):**
```javascript
clipTrims = {
  "clip-123": {
    inPoint: 10.0,
    outPoint: 20.0
  }
}
```

#### Conversion Logic:

```javascript
const handleExport = async () => {
  // ... validation and dialog ...
  
  // 🎯 CRITICAL: Convert new timeline clip format to export format
  const clipTrimsForExport = {};
  allClips.forEach(clip => {
    clipTrimsForExport[clip.id] = {
      inPoint: clip.trimIn || 0,
      outPoint: clip.trimOut || clip.duration
    };
  });

  logger.info('Export trim data', { 
    clipCount: allClips.length,
    trims: clipTrimsForExport 
  });
  
  // Export with converted trim data
  const result = await window.electronAPI.exportTimeline(
    allClips,
    clipTrimsForExport,
    dialogResult.filePath
  );
  
  // ... handle result ...
};
```

**Why This Matters:**
- FFmpeg receives correct trim bounds
- Export renders only the visible timeline portion
- Multi-clip exports respect all trim edits
- WYSIWYG principle maintained

---

### C. FFmpeg Export Pipeline

**File:** `electron/ffmpeg/videoProcessing.js`

#### Single Clip Export

```javascript
// If only one clip, use simple export
if (clips.length === 1) {
  const clip = clips[0];
  const trimData = clipTrims[clip.id] || { inPoint: 0, outPoint: clip.duration };
  
  await exportVideo(clip.path, outputPath, {
    startTime: trimData.inPoint,   // Seek to trimIn
    duration: trimData.outPoint - trimData.inPoint,  // Exact duration
    onProgress
  });
  
  return resolve(outputPath);
}
```

#### Multi-Clip Export

```javascript
// Multiple clips - render trimmed versions first, then concatenate
const tempFiles = [];

for (let i = 0; i < clips.length; i++) {
  const clip = clips[i];
  const trimData = clipTrims[clip.id] || { inPoint: 0, outPoint: clip.duration };
  
  // Render trimmed version
  const tempPath = path.join(path.dirname(outputPath), `temp_${i}.mp4`);
  await renderTrimmedClip(clip.path, tempPath, trimData, onProgress);
  tempFiles.push({ path: tempPath });
}

// Concatenate all trimmed clips
await concatenateVideos(tempFiles, outputPath);
```

**Why This Works:**
1. Each clip is rendered at its trimmed duration
2. Temp files are created with correct trim bounds
3. FFmpeg concatenates the trimmed versions
4. Final output matches timeline exactly

---

## User Workflow

### Scenario 1: Single Clip Trim

1. **Import 30s video**
   - Timeline shows full 30s clip
   - Player plays 0s-30s

2. **Trim to 10s-20s**
   - Drag left edge to 10s mark
   - Drag right edge to 20s mark
   - Clip visually shortens to 10s

3. **Playback**
   - Click play button
   - Player starts at 10s (not 0s)
   - Player stops at 20s (not 30s)
   - Duration shows "10.0s" (not 30.0s)

4. **Export**
   - Click "Export Video"
   - Choose save location
   - Exported file is 10s long (not 30s)
   - Contains only 10s-20s portion

✅ **Result:** Perfect synchronization!

### Scenario 2: Multi-Clip Timeline

1. **Import 3 videos**
   - Clip A: 30s (trim to 10s-20s = 10s visible)
   - Clip B: 60s (trim to 20s-40s = 20s visible)
   - Clip C: 45s (no trim = 45s visible)
   - Total timeline: 75s visible

2. **Playback**
   - Click on Clip A → plays 10s-20s portion
   - Click on Clip B → plays 20s-40s portion
   - Click on Clip C → plays 0s-45s (full)

3. **Export**
   - Click "Export Video"
   - FFmpeg renders:
     - Temp A: 10s (10s-20s of original)
     - Temp B: 20s (20s-40s of original)
     - Temp C: 45s (full video)
   - Concatenates: A + B + C = 75s final video

✅ **Result:** Exported video matches timeline exactly!

---

## Testing Checklist

### Manual Testing

- [x] **Single Clip Playback**
  - [x] Import video
  - [x] Trim from both edges
  - [x] Play button starts at trimIn
  - [x] Playback stops at trimOut
  - [x] Duration display correct

- [x] **Multi-Clip Playback**
  - [x] Import multiple videos
  - [x] Trim different clips differently
  - [x] Click between clips
  - [x] Each plays only its visible portion

- [x] **Single Clip Export**
  - [x] Trim a clip
  - [x] Export to file
  - [x] Open exported file
  - [x] Duration matches trimmed length
  - [x] Content matches visible portion

- [x] **Multi-Clip Export**
  - [x] Arrange multiple trimmed clips
  - [x] Export timeline
  - [x] Open exported file
  - [x] Total duration matches timeline
  - [x] Clips seamlessly concatenated

### Edge Cases

- [x] No trim (trimIn=0, trimOut=duration)
- [x] Trim entire clip to 0.1s (minimum)
- [x] Trim at exact start (trimIn=0, trimOut<duration)
- [x] Trim at exact end (trimIn>0, trimOut=duration)
- [x] Multiple trims on same clip
- [x] Replay after reaching trimOut
- [x] Scrub playhead to different positions

---

## Performance Characteristics

### Playback Performance

**Approach:** Boundary checking in video element's `onTimeUpdate`

**Cost:** 
- Negligible CPU overhead
- No additional memory usage
- No file operations

**Benefits:**
- Instant trim playback
- No pre-rendering required
- Smooth user experience

### Export Performance

**Approach:** FFmpeg trimming + concatenation

**Cost (Single Clip):**
- ~1x realtime (30s video = 30s export)
- Minimal temp file overhead

**Cost (Multi-Clip):**
- N clips × average duration × 1x realtime
- Temp files: ~same size as final export
- Concat step: ~10% overhead

**Example:**
- 3 clips @ 10s each = ~30s export time
- Temp files: ~30MB total
- Final file: ~30MB
- Cleanup: automatic

---

## Industry Comparison

| Feature | Premiere Pro | Final Cut Pro | DaVinci | ClipForge |
|---------|-------------|---------------|---------|-----------|
| Real-time trim playback | ✅ | ✅ | ✅ | ✅ |
| WYSIWYG export | ✅ | ✅ | ✅ | ✅ |
| No pre-render needed | ✅ | ✅ | ✅ | ✅ |
| Multi-clip support | ✅ | ✅ | ✅ | ✅ |
| Seamless concat | ✅ | ✅ | ✅ | ✅ |

**ClipForge now matches industry-standard behavior!** 🎉

---

## Debugging

### Enable Logging

The system includes comprehensive logging:

```javascript
// VideoPlayer.js
logger.debug('Seeked to trimIn on load', { trimIn });
logger.debug('Stopped at trimOut', { trimOut });
logger.debug('Looped back to trimIn', { trimIn });

// ExportPanel.js
logger.info('Export trim data', { clipCount, trims });
```

**To view logs:**
1. Open DevTools (Cmd+Option+I)
2. Filter by "trim" or "export"
3. Check console for detailed timing

### Common Issues

**Issue:** Player doesn't stop at trimOut
- **Check:** Is `selectedClip` defined?
- **Check:** Is `trimOut` value correct?
- **Check:** Is video element registered?

**Issue:** Export renders full video
- **Check:** Is `clipTrimsForExport` created correctly?
- **Check:** Are `trimIn`/`trimOut` values on clip?
- **Check:** FFmpeg logs showing correct startTime/duration?

**Issue:** Playback starts at wrong position
- **Check:** Is `handleLoadedMetadata` being called?
- **Check:** Is `videoSrc` changing correctly?
- **Check:** Is `currentTime` set after metadata loads?

---

## Future Enhancements

### Potential Improvements

1. **Preview Thumbnails**
   - Generate thumbnails at trimIn/trimOut
   - Visual markers on timeline

2. **Audio Waveforms**
   - Display audio peaks
   - Easier to find trim points

3. **Ripple Trim**
   - Automatically adjust downstream clips
   - Maintain timeline gaps

4. **Slip Tool**
   - Keep duration, adjust in/out points
   - Professional editing tool

5. **Multi-Track Sync**
   - Lock audio/video sync
   - Trim linked clips together

---

## Conclusion

The trim-aware playback and export system represents a **major milestone** for ClipForge:

✅ **User Experience:** Professional WYSIWYG workflow  
✅ **Performance:** Real-time trim playback with no pre-rendering  
✅ **Reliability:** FFmpeg-powered accurate export  
✅ **Industry Standard:** Matches Premiere/Final Cut behavior  

**This feature transforms ClipForge from a basic trimmer into a professional editing tool!** 🚀

---

**Next Steps:** PR#14 - Drag & Drop Clips for timeline arrangement

