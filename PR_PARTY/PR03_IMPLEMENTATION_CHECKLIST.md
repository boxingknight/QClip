# PR#3: Implementation Checklist

**Feature:** Video Player Component  
**Branch:** `feat/video-player`  
**Estimated Time:** 3-4 hours  
**Priority:** CRITICAL - Day 1, Hours 9-12

---

## Pre-Implementation Setup (5 minutes)

- [ ] **Verify PR #2 is complete**
  - File import working
  - Clips can be imported and stored
  - Ready to connect player to imported clips

- [ ] **Review video player requirements**
  - Read main specification document
  - Understand native HTML5 video element approach
  - Note file:// protocol usage for Electron

- [ ] **Create feature branch**
  ```bash
  git checkout main
  git pull
  git checkout -b feat/video-player
  ```

**Checkpoint:** Ready to start building ⏳

---

## Phase 1: Component Foundation (45 minutes)

### Step 1: Create VideoPlayer Component File (15 minutes)

#### Create Component File
- [ ] Create `src/components/VideoPlayer.js`

#### Add Imports
- [ ] Add React imports
  ```javascript
  import React, { useRef, useState, useEffect } from 'react';
  ```

- [ ] Add CSS import
  ```javascript
  import './styles/VideoPlayer.css';
  ```

- [ ] Add PropTypes if using (optional for MVP)
  ```javascript
  import PropTypes from 'prop-types';
  ```

#### Create Component Structure
- [ ] Define component function
  ```javascript
  const VideoPlayer = ({ videoSrc, onTimeUpdate }) => {
    const videoRef = useRef(null);
    // State variables
    // Event handlers
    // Render
  };

  export default VideoPlayer;
  ```

**Commit:** `feat(video-player): add VideoPlayer component structure`

---

### Step 2: Add State Management (15 minutes)

#### Add State Variables
- [ ] Add playback state
  ```javascript
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  ```

- [ ] Add video ref
  ```javascript
  const videoRef = useRef(null);
  ```

#### Create Event Handler Stubs
- [ ] Create handleLoadedMetadata stub
  ```javascript
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    setDuration(video.duration);
    setIsLoading(false);
  };
  ```

- [ ] Create handleTimeUpdate stub
  ```javascript
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    setCurrentTime(video.currentTime);
    onTimeUpdate?.(video.currentTime);
  };
  ```

- [ ] Create handlePlay stub
  ```javascript
  const handlePlay = () => setIsPlaying(true);
  ```

- [ ] Create handlePause stub
  ```javascript
  const handlePause = () => setIsPlaying(false);
  ```

- [ ] Create handleEnded stub
  ```javascript
  const handleEnded = () => setIsPlaying(false);
  ```

- [ ] Create handleError stub
  ```javascript
  const handleError = (e) => {
    setError('Failed to load video');
    setIsLoading(false);
    console.error('Video error:', e);
  };
  ```

**Commit:** `feat(video-player): add state management and event handlers`

---

### Step 3: Implement Empty State (15 minutes)

#### Add Empty State Render
- [ ] Add early return for empty state
  ```javascript
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

#### Test Empty State
- [ ] Verify component renders
- [ ] Verify empty message displays
- [ ] No console errors

**Commit:** `feat(video-player): add empty state display`

**Checkpoint:** Component structure complete ✅

---

## Phase 2: Video Element & Integration (45 minutes)

### Step 4: Render Video Element (20 minutes)

#### Add Video Element to Render
- [ ] Add video element JSX
  ```javascript
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
  ```

- [ ] Add container div
  ```javascript
  <div className="video-player-container">
    {/* loading indicator, error message, video, controls */}
  </div>
  ```

#### Add Conditional Rendering
- [ ] Add loading indicator
  ```javascript
  {isLoading && (
    <div className="loading-indicator">
      Loading video...
    </div>
  )}
  ```

- [ ] Add error message
  ```javascript
  {error && (
    <div className="error-message">{error}</div>
  )}
  ```

#### Test Video Element
- [ ] Import a video file
- [ ] Verify video element appears
- [ ] Verify video loads
- [ ] Check console for errors

**Commit:** `feat(video-player): add video element rendering`

---

### Step 5: Handle Video Source Changes (25 minutes)

#### Implement useEffect for Source Changes
- [ ] Add useEffect hook
  ```javascript
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
  ```

#### Test Source Changes
- [ ] Import first video → Verify loads
- [ ] Import second video → Verify switches correctly
- [ ] Remove video → Verify resets to empty state
- [ ] Check memory doesn't leak on multiple switches

**Commit:** `feat(video-player): implement video source change handling`

**Checkpoint:** Video element working ✅

---

## Phase 3: Playback Controls (45 minutes)

### Step 6: Create Play/Pause Control (20 minutes)

#### Implement Play/Pause Handler
- [ ] Create handlePlayPause function
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

#### Add Play/Pause Button
- [ ] Create button in render
  ```javascript
  <button 
    className="play-pause-btn"
    onClick={handlePlayPause}
    disabled={!videoSrc || isLoading}
    aria-label={isPlaying ? 'Pause video' : 'Play video'}
  >
    {isPlaying ? '⏸' : '▶'}
  </button>
  ```

#### Test Playback Control
- [ ] Click play button
- [ ] Verify video starts playing
- [ ] Verify button icon changes
- [ ] Click pause button
- [ ] Verify video stops
- [ ] Verify button icon changes back

**Commit:** `feat(video-player): add play/pause control`

---

### Step 7: Create Time Display (25 minutes)

#### Create Time Formatting Function
- [ ] Add formatTime utility
  ```javascript
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };
  ```

#### Add Time Display
- [ ] Create time display JSX
  ```javascript
  <div className="player-controls">
    <button className="play-pause-btn">...</button>
    
    <div className="time-display">
      <span>{formatTime(currentTime)}</span>
      <span className="separator">/</span>
      <span>{formatTime(duration)}</span>
    </div>
  </div>
  ```

#### Test Time Display
- [ ] Import video
- [ ] Verify duration displays (e.g., "00:05" for 5 seconds)
- [ ] Click play
- [ ] Verify current time updates (e.g., "00:01" → "00:02")
- [ ] Verify format is MM:SS

**Commit:** `feat(video-player): add time display`

**Checkpoint:** Playback controls working ✅

---

## Phase 4: Styling & Polish (45 minutes)

### Step 8: Create CSS File (30 minutes)

#### Create CSS File
- [ ] Create `src/styles/VideoPlayer.css`

#### Add Container Styles
- [ ] Style video player container
  ```css
  .video-player-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    background: var(--color-bg);
  }
  ```

#### Add Video Element Styles
- [ ] Style video element
  ```css
  .video-element {
    max-width: 100%;
    max-height: 60vh;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
  }
  ```

#### Add Controls Styles
- [ ] Style player controls container
  ```css
  .player-controls {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 16px;
    padding: 12px 24px;
    background: var(--color-surface);
    border-radius: var(--radius-md);
  }
  ```

- [ ] Style play/pause button
  ```css
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
  ```

#### Add Time Display Styles
- [ ] Style time display
  ```css
  .time-display {
    font-family: monospace;
    color: var(--color-text-secondary);
  }

  .separator {
    margin: 0 8px;
    opacity: 0.6;
  }
  ```

#### Add Loading/Error Styles
- [ ] Style loading indicator
  ```css
  .loading-indicator {
    padding: 12px;
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-text-primary);
  }
  ```

- [ ] Style error message
  ```css
  .error-message {
    padding: 12px;
    border-radius: var(--radius-md);
    background: var(--color-error);
    color: white;
  }
  ```

#### Add Empty State Styles
- [ ] Style empty state
  ```css
  .empty-state {
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .empty-message {
    text-align: center;
    color: var(--color-text-secondary);
  }

  .empty-message p {
    margin: 8px 0;
  }

  .subtext {
    font-size: 0.9em;
    opacity: 0.7;
  }
  ```

**Commit:** `style(video-player): add comprehensive styling`

---

### Step 9: Test Complete Component (15 minutes)

#### Test All Functionality
- [ ] Import video → Shows empty state before, loads video after
- [ ] Click play → Video plays, button changes
- [ ] Click pause → Video pauses, button changes
- [ ] Verify time updates during playback
- [ ] Import different video → Switches correctly
- [ ] Remove video → Resets to empty state
- [ ] Test with corrupted video → Shows error message
- [ ] Test with very short video (<1s)
- [ ] Test with very long video (>30min)

#### Check Performance
- [ ] Switch between 10 videos → No memory leak
- [ ] Check console for errors → No errors
- [ ] Verify loading is smooth
- [ ] Verify UI is responsive

**Commit:** `test(video-player): verify all functionality`

**Checkpoint:** Complete feature working ✅

---

## Phase 5: Integration (30 minutes)

### Step 10: Integrate with App Component (20 minutes)

#### Update App.js
- [ ] Add VideoPlayer import
  ```javascript
  import VideoPlayer from './components/VideoPlayer';
  ```

#### Add Video Source State
- [ ] Check if video source conversion needed
- [ ] Pass video path to VideoPlayer
  ```javascript
  <VideoPlayer 
    videoSrc={selectedClip?.path ? `file://${selectedClip.path}` : null}
    onTimeUpdate={handleVideoTimeUpdate}
  />
  ```

#### Add Time Update Handler
- [ ] Create handler in App.js
  ```javascript
  const handleVideoTimeUpdate = (time) => {
    setCurrentVideoTime(time);
    // This will be used for trim functionality later
  };
  ```

#### Test Integration
- [ ] Import video from ImportPanel
- [ ] Verify video appears in player
- [ ] Verify can play/pause
- [ ] Verify no errors

**Commit:** `feat(app): integrate VideoPlayer component`

---

### Step 11: Final Testing (10 minutes)

#### Test Complete Flow
- [ ] Import video file
- [ ] Video appears in player
- [ ] Can play video
- [ ] Can pause video
- [ ] Time displays correctly
- [ ] Import another video
- [ ] Player switches to new video
- [ ] Old video doesn't play in background

#### Test Edge Cases
- [ ] Rapidly switch between videos (no crashes)
- [ ] Play to end (stops automatically)
- [ ] Try play without video loaded (shows error)
- [ ] Check browser console (no errors)

**Commit:** `test(app): verify video player integration`

**Checkpoint:** Integration complete ✅

---

## Testing Checklist

### Manual Testing
- [ ] Import MP4 file → Video loads and displays
- [ ] Click play button → Video starts playing
- [ ] Click pause button → Video stops playing
- [ ] Video plays to end → Automatically stops
- [ ] Import different video → Player switches correctly
- [ ] Time display updates during playback
- [ ] Duration displays correctly
- [ ] Error message shows on invalid video
- [ ] Empty state shows when no video

### Performance Testing
- [ ] Switch between 10 videos → No memory leak
- [ ] Video plays smoothly → No stuttering
- [ ] No console errors during normal use

### Integration Testing
- [ ] Import video from ImportPanel
- [ ] Player reflects imported video
- [ ] Can export with player video (if export ready)
- [ ] Player resets when all videos removed

---

## Bug Fixing Checklist (If Needed)

### Common Issues & Solutions

#### Issue: Video won't load
**Symptoms:** Video element shows but no picture
**Causes:**
- File path incorrect (check file:// protocol)
- Codec not supported
- File corrupted

**Solutions:**
- Verify file path format
- Use H.264 codec for video
- Test with known-good video file

#### Issue: Audio not playing
**Symptoms:** Video plays but no sound
**Causes:**
- Muted by default
- Audio codec issue
- Browser permissions

**Solutions:**
- Ensure video.src is set
- Check audio codec (AAC recommended)
- Test with system audio enabled

#### Issue: Play button doesn't work
**Symptoms:** Clicking play does nothing
**Causes:**
- Video not loaded yet
- Missing error handler
- Async play() not caught

**Solutions:**
- Add loading state
- Catch play() promise rejection
- Disable button while loading

---

## Completion Checklist

### Code Complete
- [ ] VideoPlayer.js created and functional
- [ ] VideoPlayer.css created and styled
- [ ] App.js updated with integration
- [ ] All event handlers working
- [ ] Loading and error states implemented
- [ ] Empty state implemented

### Functionality Complete
- [ ] Video imports and displays
- [ ] Play button works
- [ ] Pause button works
- [ ] Time updates in real-time
- [ ] Duration displays correctly
- [ ] Audio synchronized
- [ ] Video switches correctly

### Quality Complete
- [ ] No console errors
- [ ] No memory leaks
- [ ] Responsive UI
- [ ] Error handling works
- [ ] Loading states work
- [ ] Empty states work

---

## Post-Implementation

### Commit Final Changes
```bash
git add src/components/VideoPlayer.js
git add src/styles/VideoPlayer.css
git add src/App.js
git commit -m "feat(video-player): complete video player implementation

- Add VideoPlayer component with play/pause controls
- Implement time display with MM:SS formatting
- Add loading and error states
- Integrate with App component
- Add comprehensive styling
- Handle video source changes
- Test edge cases and fix bugs"

git push origin feat/video-player
```

### Create PR
- [ ] Push branch to GitHub
- [ ] Create pull request
- [ ] Add description with checklist
- [ ] Self-review changes
- [ ] Merge after verification

### Update Status
- [ ] Mark PR #3 as complete
- [ ] Update activeContext.md
- [ ] Update progress.md
- [ ] Ready for PR #4

---

**Total Time Taken:** ___ hours  
**Status:** ✅ COMPLETE / 🚧 IN PROGRESS / ❌ BLOCKED


