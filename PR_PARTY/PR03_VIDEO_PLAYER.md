# PR#3: Video Player Component

**Estimated Time:** 3-4 hours  
**Complexity:** LOW  
**Dependencies:** PR #1 (Project Setup), PR #2 (File Import)  
**Status:** 📋 PLANNED

---

## Overview

### What We're Building

The Video Player Component is the visual and interactive centerpiece of ClipForge. It enables users to preview imported video clips with synchronized audio playback. This component displays the video content, provides play/pause controls, shows current playback time, and handles video loading states. It's a critical path item that connects imported files to the user's editing workflow.

### Why It Matters

Without a working video player, users cannot:
- Preview their imported clips to decide what to edit
- Navigate through video to find trim points
- Verify that imported videos are working correctly
- See their content in action

The player is central to the editing experience—it's what users will spend most of their time interacting with. A reliable, responsive player builds user confidence in the application.

### Success in One Sentence

"This PR is successful when users can import a video file, see it playing in the preview panel, and control playback with clearly labeled play/pause buttons."

---

## Technical Design

### Architecture Decisions

#### Decision 1: Use Native HTML5 `<video>` Element

**Options Considered:**
1. **HTML5 `<video>` element** - Native browser API, simple integration
2. **Video.js** - Advanced player with plugins and features
3. **Plyr** - Lightweight alternative with consistent UI
4. **React Player** - React wrapper with multiple provider support

**Chosen:** Option 1 - Native HTML5 `<video>` element

**Rationale:**
- Simplest implementation for MVP needs (play/pause is sufficient)
- No additional dependencies or bundle size
- Native audio synchronization and codec support
- Fast development time fits 72-hour constraint
- Can upgrade to advanced players in post-MVP phase

**Trade-offs:**
- ✅ Gain: Zero learning curve, faster development
- ✅ Gain: Smaller bundle size
- ❌ Lose: Advanced features (volume control UI, fullscreen, etc.)
- ❌ Lose: Customizable UI out of box
- **Impact:** MVP only needs basic playback, so this trade-off is acceptable

#### Decision 2: Player State Management Pattern

**Options Considered:**
1. **Controlled component** - Parent (App) controls all player state
2. **Uncontrolled component** - Player manages its own internal state
3. **Hybrid** - Player manages UI state, parent manages business state

**Chosen:** Option 3 - Hybrid pattern

**Rationale:**
- UI state (isPlaying, currentTime) lives in player component
- Business state (selectedClip, clips) lives in App component
- Minimizes prop drilling while maintaining clear data flow
- Follows React best practices for component autonomy

**Trade-offs:**
- ✅ Gain: Better performance (less re-renders from parent)
- ✅ Gain: Component reusability
- ❌ Lose: Slightly more complex state synchronization
- **Impact:** Low - well-established React pattern

#### Decision 3: Video Source URL Format

**Options Considered:**
1. **file:// protocol** - `file:///path/to/video.mp4`
2. **Blob URL** - Read file into memory, create Blob
3. **IPC + Local Server** - Stream video through local server

**Chosen:** Option 1 - file:// protocol

**Rationale:**
- Electron allows file:// access with proper security context
- No need to read large video files into memory
- No additional server infrastructure
- Simplest path for local file access

**Trade-offs:**
- ✅ Gain: No memory overhead for large files
- ✅ Gain: Simple implementation
- ❌ Lose: Security considerations in production (less relevant for MVP)
- **Impact:** None for MVP - file:// is standard in Electron

---

### Data Model

**Video Player State:**
```javascript
{
  // Playback state (managed by VideoPlayer)
  isPlaying: boolean,
  isLoading: boolean,
  currentTime: number,        // seconds
  duration: number,           // seconds
  volume: number,             // 0.0 - 1.0 (MVP: 1.0, no UI)
  
  // Video source (from App)
  videoSrc: string,           // file:// URL
  videoError: string | null   // Error message if load fails
}
```

**Clip Data Structure (from App):**
```javascript
{
  id: string,              // Unique identifier
  name: string,            // Filename
  path: string,            // Absolute file path
  duration: number,        // Video duration in seconds
  inPoint: number,         // Trim start (default: 0)
  outPoint: number         // Trim end (default: duration)
}
```

---

### Component Hierarchy

```
App
└── VideoPlayer
    ├── <video> element (native)
    ├── PlayButton
    ├── TimeDisplay (current / total)
    └── LoadingIndicator (conditional)
```

---

## Implementation Details

### File Structure

**New Files:**
```
src/
├── components/
│   ├── VideoPlayer.js (~180 lines)     # Main player component
│   └── styles/
│       └── VideoPlayer.css (~80 lines)  # Player styling
```

**Modified Files:**
- `src/App.js` (+30/-10 lines) - Add player integration
- `preload.js` (+10/-0 lines) - File path conversion (if needed)

---

### Key Implementation Steps

#### Phase 1: Component Foundation (45 minutes)

**Step 1: Create VideoPlayer Component Structure**
```javascript
// src/components/VideoPlayer.js
import React, { useRef, useState, useEffect } from 'react';
import './styles/VideoPlayer.css';

const VideoPlayer = ({ videoSrc, onTimeUpdate }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Component implementation
};
```

**Step 2: Render Video Element**
```javascript
return (
  <div className="video-player-container">
    {isLoading && <div className="loading-indicator">Loading...</div>}
    {error && <div className="error-message">{error}</div>}
    <video
      ref={videoRef}
      src={videoSrc}
      className="video-element"
      onLoadedMetadata={handleLoadedMetadata}
      onTimeUpdate={handleTimeUpdate}
      onPlay={handlePlay}
      onPause={handlePause}
      onEnded={handleEnded}
      onError={handleError}
    />
    <div className="player-controls">
      {/* Controls go here */}
    </div>
  </div>
);
```

**Step 3: Implement Event Handlers**
```javascript
const handleLoadedMetadata = () => {
  const video = videoRef.current;
  setDuration(video.duration);
  setIsLoading(false);
};

const handleTimeUpdate = () => {
  const video = videoRef.current;
  setCurrentTime(video.currentTime);
  onTimeUpdate?.(video.currentTime);
};

const handlePlay = () => setIsPlaying(true);
const handlePause = () => setIsPlaying(false);
const handleEnded = () => setIsPlaying(false);

const handleError = (e) => {
  setError('Failed to load video');
  setIsLoading(false);
  console.error('Video error:', e);
};
```

---

#### Phase 2: Playback Controls (45 minutes)

**Step 4: Implement Play/Pause Toggle**
```javascript
const handlePlayPause = () => {
  const video = videoRef.current;
  
  if (!video || !videoSrc) {
    setError('No video loaded');
    return;
  }
  
  if (isPlaying) {
    video.pause();
  } else {
    video.play().catch((err) => {
      setError('Failed to play video');
      console.error('Play error:', err);
    });
  }
};
```

**Step 5: Create Control Buttons**
```javascript
// In render
<div className="player-controls">
  <button 
    className="play-pause-btn"
    onClick={handlePlayPause}
    disabled={!videoSrc || isLoading}
    aria-label={isPlaying ? 'Pause video' : 'Play video'}
  >
    {isPlaying ? '⏸' : '▶'}
  </button>
  
  <div className="time-display">
    <span>{formatTime(currentTime)}</span>
    <span className="separator">/</span>
    <span>{formatTime(duration)}</span>
  </div>
</div>
```

**Step 6: Create Time Formatting Utility**
```javascript
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '00:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};
```

---

#### Phase 3: Integration & State Management (45 minutes)

**Step 7: Connect to App Component**
```javascript
// In App.js
const [selectedClip, setSelectedClip] = useState(null);
const [currentVideoTime, setCurrentVideoTime] = useState(0);

const handleVideoTimeUpdate = (time) => {
  setCurrentVideoTime(time);
};

// Pass to VideoPlayer
<VideoPlayer 
  videoSrc={selectedClip?.path ? `file://${selectedClip.path}` : null}
  onTimeUpdate={handleVideoTimeUpdate}
/>
```

**Step 8: Handle Video Source Changes**
```javascript
// In VideoPlayer.js
useEffect(() => {
  if (!videoSrc) {
    // Reset player state
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setError(null);
    if (videoRef.current) {
      videoRef.current.src = '';
    }
    return;
  }
  
  // Update video source
  const video = videoRef.current;
  if (video) {
    setIsLoading(true);
    video.src = videoSrc;
    video.load();
  }
}, [videoSrc]);
```

---

#### Phase 4: Styling & UX (45 minutes)

**Step 9: Create CSS Styling**
```css
/* src/styles/VideoPlayer.css */
.video-player-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: var(--color-bg);
}

.video-element {
  max-width: 100%;
  max-height: 60vh;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
}

.player-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
  padding: 12px 24px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
}

.play-pause-btn {
  font-size: 24px;
  padding: 8px 16px;
  cursor: pointer;
  border: none;
  background: transparent;
  color: var(--color-text-primary);
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
}

.play-pause-btn:hover:not(:disabled) {
  background: var(--color-surface-hover);
}

.play-pause-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.time-display {
  font-family: monospace;
  color: var(--color-text-secondary);
}

.loading-indicator,
.error-message {
  padding: 12px;
  border-radius: var(--radius-md);
}
```

**Step 10: Add Empty State**
```javascript
// In VideoPlayer render
if (!videoSrc) {
  return (
    <div className="video-player-container empty-state">
      <div className="empty-message">
        <p>No video selected</p>
        <p className="subtext">Import a video to get started</p>
      </div>
    </div>
  );
}
```

---

### Code Examples

#### Complete VideoPlayer Component Structure
```javascript
import React, { useRef, useState, useEffect } from 'react';
import './styles/VideoPlayer.css';

const VideoPlayer = ({ videoSrc, onTimeUpdate }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle video source changes
  useEffect(() => {
    if (!videoSrc) {
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
      setError(null);
      if (videoRef.current) {
        videoRef.current.src = '';
      }
      return;
    }
    
    const video = videoRef.current;
    if (video) {
      setIsLoading(true);
      video.src = videoSrc;
      video.load();
    }
  }, [videoSrc]);

  // Event handlers
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    setDuration(video.duration);
    setIsLoading(false);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    const current = video.currentTime;
    setCurrentTime(current);
    onTimeUpdate?.(current);
  };

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleEnded = () => setIsPlaying(false);
  
  const handleError = (e) => {
    setError('Failed to load video');
    setIsLoading(false);
    console.error('Video error:', e);
  };

  const handlePlayPause = () => {
    const video = videoRef.current;
    
    if (!video || !videoSrc) {
      setError('No video loaded');
      return;
    }
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch((err) => {
        setError('Failed to play video');
        console.error('Play error:', err);
      });
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (!videoSrc) {
    return (
      <div className="video-player-container empty-state">
        <div className="empty-message">
          <p>No video selected</p>
          <p className="subtext">Import a video to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="video-player-container">
      {isLoading && (
        <div className="loading-indicator">
          Loading video...
        </div>
      )}
      {error && (
        <div className="error-message">{error}</div>
      )}
      
      <video
        ref={videoRef}
        src={videoSrc}
        className="video-element"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onError={handleError}
      />
      
      <div className="player-controls">
        <button 
          className="play-pause-btn"
          onClick={handlePlayPause}
          disabled={!videoSrc || isLoading}
          aria-label={isPlaying ? 'Pause video' : 'Play video'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        
        <div className="time-display">
          <span>{formatTime(currentTime)}</span>
          <span className="separator">/</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
```

---

## Testing Strategy

### Unit Tests

**Component Rendering:**
- ✅ VideoPlayer renders when videoSrc is provided
- ✅ VideoPlayer shows empty state when videoSrc is null
- ✅ Video element has correct src attribute
- ✅ Loading indicator shows while video is loading

**Playback Controls:**
- ✅ Play button changes to pause when playing
- ✅ Pause button changes to play when paused
- ✅ Play button is disabled when no video loaded
- ✅ Current time updates during playback
- ✅ Duration displays correctly after metadata loaded

**Event Handling:**
- ✅ onTimeUpdate callback fires with correct time
- ✅ Error message displays on video load failure
- ✅ Loading state clears after metadata loaded
- ✅ Video resets when new src is set

---

### Integration Tests

**Video Loading:**
1. Import a video file (MP4)
2. Observe loading indicator appears
3. Verify video element displays
4. Verify loading indicator disappears
5. Verify duration is displayed

**Playback Control:**
1. Click play button
2. Verify video starts playing
3. Verify button changes to pause icon
4. Observe current time increasing
5. Click pause button
6. Verify video stops playing
7. Verify button changes to play icon

**Time Display:**
1. Start video playback
2. Verify current time updates in real-time
3. Verify time format is MM:SS
4. Seek to different time (manually if possible)
5. Verify display updates correctly

---

### Edge Cases

**Invalid Video:**
- Test with corrupted video file → Should display error message
- Test with missing file → Should display error
- Test with unsupported format → Should display error

**Very Short Video (<1 second):**
- Test with minimal video → Should display and play correctly

**Very Long Video (>30 minutes):**
- Test with long video → Should maintain performance

**Rapid Source Changes:**
- Switch between videos quickly → Should handle without crashes
- Memory should not leak

**Empty State:**
- No video imported → Should show helpful empty state message

---

### Performance Tests

**Video Loading:**
- Small video (10MB) loads in <2 seconds
- Large video (100MB) loads in <10 seconds

**Playback Performance:**
- Frame rate maintains smooth playback (no stuttering)
- Memory usage stays under 500MB for typical videos
- No memory leaks after 10 video switches

**Time Update Performance:**
- Time display updates at least 10 times per second during playback
- No UI lag or freezing

---

### Browser Compatibility (Electron Specific)

**Test Scenarios:**
- ✅ MP4 with H.264 codec plays correctly
- ✅ MP4 with AAC audio plays correctly
- ✅ MOV files play correctly (if supported)
- ✅ Video with no audio (video-only) plays
- ✅ Video with no video (audio-only) handles gracefully

---

## Success Criteria

### Feature Complete When:

**Functionality:**
- [ ] VideoPlayer component displays imported video
- [ ] Play button starts playback
- [ ] Pause button stops playback
- [ ] Current time updates in real-time
- [ ] Total duration displays correctly
- [ ] Audio plays synchronized with video

**Integration:**
- [ ] Player receives video path from App component
- [ ] Player loads video when clip is selected
- [ ] Current playback time exposed to parent for trim functionality
- [ ] Player resets when new video is selected

**UX:**
- [ ] Loading indicator shows while video loads
- [ ] Error message displays on load failure
- [ ] Empty state shows when no video selected
- [ ] Controls are clearly labeled
- [ ] Button states reflect current playback state

**Quality:**
- [ ] No console errors during normal operation
- [ ] Video plays smoothly without stuttering
- [ ] Player doesn't crash on invalid files
- [ ] Memory doesn't leak when switching videos

---

## Risk Assessment

### Risk 1: Video Codec Incompatibility

**Likelihood:** MEDIUM  
**Impact:** HIGH  
**Mitigation:**
- Use widely compatible codecs (H.264)
- Test with common video formats during development
- Provide helpful error messages for unsupported codecs
- **Status:** 🟡 Have sample videos ready for testing

### Risk 2: File Path Issues in Electron

**Likelihood:** LOW  
**Impact:** MEDIUM  
**Mitigation:**
- Use `file://` protocol with proper path formatting
- Convert absolute paths correctly for platform
- Test on development and production builds
- **Status:** 🟢 Standard Electron pattern

### Risk 3: Memory Leaks from Video Elements

**Likelihood:** MEDIUM  
**Impact:** MEDIUM  
**Mitigation:**
- Properly cleanup video elements on unmount
- Clear video.src before unmounting
- Test with multiple video switches
- Monitor memory usage in dev tools
- **Status:** 🟢 Standard React cleanup pattern

---

## Open Questions

1. **Should we support volume control in MVP?**
   - **Decision:** No - Simple play/pause is sufficient
   - **Rationale:** System volume controls work; adds complexity for minimal benefit

2. **Should we show video metadata (resolution, codec)?**
   - **Decision:** No - Focus on playback functionality
   - **Rationale:** Metadata doesn't improve core editing workflow

3. **Should we implement video scrubbing (drag playhead)?**
   - **Decision:** No - Out of scope for MVP
   - **Rationale:** Makes trim functionality possible without it

---

## Timeline

**Total Estimate:** 3-4 hours

| Phase | Task | Time | Status |
|-------|------|------|--------|
| 1 | Component Foundation | 45 min | ⏳ |
| 2 | Playback Controls | 45 min | ⏳ |
| 3 | Integration | 45 min | ⏳ |
| 4 | Styling & UX | 45 min | ⏳ |
| 5 | Testing & Polish | 30 min | ⏳ |

**Buffer:** 30 minutes for unexpected issues

---

## Dependencies

**Requires:**
- ✅ PR #1 complete (Electron + React setup)
- ✅ PR #2 complete (File import working)

**Blocks:**
- PR #6 (Trim Controls) - Needs current video time from player
- PR #4 (Export) - Can test export with player as reference

---

## References

- **Related PR:** PR #2 (File Import), PR #6 (Trim Controls)
- **Electron Video API:** https://www.electronjs.org/docs/latest/tutorial/security#context-isolation
- **HTML5 Video Events:** https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement
- **React useRef Hook:** https://react.dev/reference/react/useRef

---

**Status:** 📋 READY TO START  
**Next Action:** Wait for PR #2 completion, then begin Phase 1


