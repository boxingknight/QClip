# PR#14: Implementation Checklist

**Use this as your daily todo list.** Check off items as you complete them.

---

## ⚠️ CRITICAL: Preserve Existing Functionality

**Before starting ANY implementation:**
- [ ] Read `PR14_EXISTING_IMPLEMENTATION_ANALYSIS.md` thoroughly
- [ ] Understand: Media Library → Timeline drag & drop is **ALREADY WORKING** ✅
- [ ] Understand: Clip dragging uses mouse events (needs conversion to HTML5 drag & drop)
- [ ] **DO NOT MODIFY:** `src/components/MediaLibrary.js` - it works perfectly
- [ ] **DO NOT MODIFY:** Media Library → Timeline drag flow - preserve exactly as-is
- [ ] **TEST AFTER EVERY CHANGE:** Verify Media Library drag still works after each modification

**Key Principle:** Build on what exists, don't break what works!

---

## 📋 What's Being Preserved vs Upgraded

### ✅ PRESERVE (Do Not Change):
1. **Media Library Drag & Drop** (`src/components/MediaLibrary.js`)
   - HTML5 drag & drop from Media Library to Timeline ✅
   - JSON data transfer with `type: 'media-library-item'` ✅
   - Snap-to-end positioning ✅
   - **Action:** DO NOT TOUCH - works perfectly

2. **Clip Trimming Functionality** (`src/components/timeline/Clip.js`)
   - Mouse-based trim handles ✅
   - `handleTrimStart`, `handleTrimMove` ✅
   - **Action:** Keep mouse events for trimming (precision required)

3. **Existing TimelineContext Functions**
   - `moveClip()` function ✅
   - `addClip()` function ✅
   - **Action:** Use existing functions, don't replace

### 🔄 UPGRADE (Convert/Enhance):
1. **Clip Dragging Within Timeline**
   - **Current:** Mouse events (mousedown/mousemove) - limited to same track
   - **Target:** HTML5 drag & drop - enables cross-track movement
   - **Action:** Remove mouse drag logic, add HTML5 drag handlers

2. **Track Drop Handler**
   - **Current:** Handles Media Library items ✅
   - **Target:** Handle BOTH Media Library items AND Timeline clips
   - **Action:** Enhance `handleDrop` to support both types (preserve Media Library handling)

3. **Snap-to-Clip Functionality**
   - **Current:** Basic pixel-based magnetic snap (useMagneticSnap hook)
   - **Target:** Time-based snap (0.5s threshold) with visual indicators
   - **Action:** Add time-based snap calculation, add visual snap lines

4. **Overlap Prevention**
   - **Current:** None (clips can overlap)
   - **Target:** Prevent overlaps with visual feedback
   - **Action:** Add validation function, prevent invalid drops

5. **Visual Feedback**
   - **Current:** Basic dragging class
   - **Target:** Drag preview, enhanced drop zones, snap lines
   - **Action:** Add new visual feedback components

---

## Pre-Implementation Setup (15 minutes)

- [ ] Read main planning document (~45 min)
- [ ] Read `PR14_EXISTING_IMPLEMENTATION_ANALYSIS.md` (~20 min)
- [ ] Prerequisites verified
  - [ ] PR #11 (State Management Refactor) complete
  - [ ] PR #12 (UI Component Library) complete  
  - [ ] PR #13 (Professional Timeline) complete
- [ ] **Baseline Testing:** Test existing functionality
  - [ ] Media Library → Timeline drag works ✅
  - [ ] Clip dragging within track works (mouse events) ✅
  - [ ] Record current behavior for comparison
- [ ] Dependencies installed
  ```bash
  # No new dependencies needed
  ```
- [ ] Environment configured
  ```bash
  # Verify timeline is working
  npm start
  ```
- [ ] Git branch created
  ```bash
  git checkout -b feature/pr14-drag-drop-clips
  ```

---

## Phase 1: Drag State Foundation (1.5 hours)

### 1.1: Add Drag State to TimelineContext (30 minutes)

#### Update TimelineContext
- [ ] Add drag state to context
  ```javascript
  const [dragState, setDragState] = useState({
    isDragging: false,
    draggedClip: null,
    dragStartTrack: null,
    dragStartPosition: null,
    dropTarget: null,
    snapTarget: null,
    isValidDrop: false
  });
  ```

#### Add Drag State Methods
- [ ] Create startDrag function
  ```javascript
  const startDrag = useCallback((clipId, trackId, startTime) => {
    const clip = clips.find(c => c.id === clipId);
    setDragState({
      isDragging: true,
      draggedClip: clip,
      dragStartTrack: trackId,
      dragStartPosition: startTime,
      dropTarget: null,
      snapTarget: null,
      isValidDrop: false
    });
  }, [clips]);
  ```

- [ ] Create updateDrag function
  ```javascript
  const updateDrag = useCallback((trackId, time) => {
    setDragState(prev => ({
      ...prev,
      dropTarget: trackId,
      snapTarget: calculateSnapTarget(time, prev.draggedClip),
      isValidDrop: isValidDropPosition(trackId, time, prev.draggedClip)
    }));
  }, []);
  ```

- [ ] Create completeDrag function
  ```javascript
  const completeDrag = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedClip: null,
      dragStartTrack: null,
      dragStartPosition: null,
      dropTarget: null,
      snapTarget: null,
      isValidDrop: false
    });
  }, []);
  ```

- [ ] Create cancelDrag function
  ```javascript
  const cancelDrag = useCallback(() => {
    // Restore original position if needed
    completeDrag();
  }, [completeDrag]);
  ```

#### Update Context Provider
- [ ] Add drag methods to context value
  ```javascript
  const value = {
    // ... existing values
    dragState,
    startDrag,
    updateDrag,
    completeDrag,
    cancelDrag
  };
  ```

**Checkpoint:** Drag state management working ✓

**Commit:** `feat(timeline): add drag state management to TimelineContext`

---

### 1.2: Create Drag Drop Utilities (30 minutes)

#### Create dragDropCalculations.js
- [ ] Create file `src/utils/dragDropCalculations.js`

**Note:** Time conversion functions (`pixelsToTime`, `timeToPixels`) already exist in `src/utils/timelineCalculations.js`. Import and use those instead of duplicating.

- [ ] Import existing time conversion functions
  ```javascript
  import { pixelsToTime, timeToPixels } from './timelineCalculations';
  ```

- [ ] Add time-based snap calculation function
  ```javascript
  /**
   * Calculate snap targets based on TIME (not pixels) for zoom-independence
   * Uses 0.5 second threshold as professional video editor standard
   */
  export const calculateSnapTargets = (draggedClip, allClips, snapThreshold = 0.5) => {
    const targets = [];
    
    allClips.forEach(clip => {
      if (clip.id === draggedClip.id) return;
      
      // Check start time (snap to clip start)
      const startDistance = Math.abs(draggedClip.startTime - clip.startTime);
      if (startDistance <= snapThreshold) {
        targets.push({
          type: 'start',
          time: clip.startTime,
          clipId: clip.id,
          distance: startDistance
        });
      }
      
      // Check end time (snap to clip end)
      const endTime = clip.startTime + clip.duration;
      const endDistance = Math.abs(draggedClip.startTime - endTime);
      if (endDistance <= snapThreshold) {
        targets.push({
          type: 'end',
          time: endTime,
          clipId: clip.id,
          distance: endDistance
        });
      }
    });
    
    // Sort by distance (closest first)
    return targets.sort((a, b) => a.distance - b.distance);
  };
  ```

- [ ] Add drop validation function (overlap prevention)
  ```javascript
  /**
   * Validate if a drop position is valid (no overlaps)
   * Returns true if clip can be placed at this position without overlapping other clips
   */
  export const isValidDropPosition = (trackId, time, draggedClip, allClips, currentTrackClips) => {
    // Find track clips (all clips on the target track)
    const trackClips = currentTrackClips || allClips.filter(c => c.trackId === trackId);
    
    // Calculate dragged clip's time range
    const draggedClipStart = time;
    const draggedClipEnd = time + draggedClip.duration;
    
    // Check for overlaps with other clips on the same track
    return !trackClips.some(clip => {
      // Skip the clip being dragged (if it's on the same track)
      if (clip.id === draggedClip.id) return false;
      
      // Calculate existing clip's time range
      const clipStart = clip.startTime;
      const clipEnd = clip.startTime + clip.duration;
      
      // Check for overlap: clips overlap if their time ranges intersect
      return (draggedClipStart < clipEnd && draggedClipEnd > clipStart);
    });
  };
  ```

**Checkpoint:** Utility functions working ✓

**Commit:** `feat(utils): add drag drop calculation utilities`

---

### 1.3: Update useTimeline Hook (30 minutes)

#### Add Drag Methods to Hook
- [ ] Update `src/hooks/useTimeline.js`

- [ ] Add drag state to hook return
  ```javascript
  const {
    // ... existing values
    dragState,
    startDrag,
    updateDrag,
    completeDrag,
    cancelDrag
  } = useContext(TimelineContext);
  
  return {
    // ... existing returns
    dragState,
    startDrag,
    updateDrag,
    completeDrag,
    cancelDrag
  };
  ```

**Checkpoint:** Hook updated with drag methods ✓

**Commit:** `feat(hooks): add drag methods to useTimeline hook`

---

## Phase 2: Convert Clip Component to HTML5 Drag & Drop (2 hours)

**Goal:** Convert Clip component from mouse events to HTML5 drag & drop API while preserving trimming functionality.

### 2.1: Update Clip Component - Replace Mouse Drag with HTML5 Drag & Drop (1 hour)

#### Remove Mouse-Based Dragging
- [ ] Open `src/components/timeline/Clip.js`
- [ ] **PRESERVE:** Trim functionality (keep `handleTrimStart`, `handleTrimMove` - these still use mouse events)
- [ ] **REMOVE:** Mouse-based drag logic:
  - [ ] Remove `handleMouseDown` drag start logic (lines 132-153)
  - [ ] Remove drag logic from `handleMouseMove` (keep trim logic only)
  - [ ] Update `handleMouseUp` to only handle trimming

#### Add HTML5 Drag & Drop Handlers
- [ ] Add drag start handler for Clip component
  ```javascript
  /**
   * Handle drag start - convert from Media Library style
   * Uses HTML5 Drag & Drop API with JSON data transfer
   */
  const handleDragStart = useCallback((e) => {
    // Prevent drag if clip is locked
    if (clip.locked) {
      e.preventDefault();
      return;
    }
    
    // Select clip if not already selected
    if (!isSelected) {
      selectClip(clip.id, false);
    }
    
    // Set drag data (similar to Media Library format but different type)
    e.dataTransfer.effectAllowed = 'move'; // Use 'move' to indicate repositioning
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'timeline-clip',  // Different type from 'media-library-item'
      clipId: clip.id,
      trackId: clip.trackId,
      startTime: clip.startTime,
      clip: clip  // Include full clip data
    }));
    
    // Also set text/plain for fallback compatibility
    e.dataTransfer.setData('text/plain', clip.id);
    
    // Start drag state in context (optional, for visual feedback)
    if (startDrag) {
      startDrag(clip.id, clip.trackId, clip.startTime);
    }
    
    console.log('🎬 [CLIP] Drag started:', { clipId: clip.id, trackId: clip.trackId });
  }, [clip, isSelected, selectClip, startDrag]);
  ```

- [ ] Add drag end handler
  ```javascript
  /**
   * Handle drag end - cleanup
   */
  const handleDragEnd = useCallback((e) => {
    // Clean up drag state in context
    if (completeDrag) {
      completeDrag();
    }
    
    console.log('🎬 [CLIP] Drag ended');
  }, [completeDrag]);
  ```

- [ ] Update Clip JSX to use HTML5 drag & drop
  ```javascript
  <div
    ref={clipRef}
    className={`clip ${isSelected ? 'selected' : ''} ${dragState?.isDragging && dragState?.draggedClip?.id === clip.id ? 'dragging' : ''}`}
    draggable={!clip.locked}  // Only draggable if not locked
    onDragStart={handleDragStart}
    onDragEnd={handleDragEnd}
    onClick={handleClick}
    onContextMenu={handleContextMenu}
    // Keep trim handles separate (they still use mouse events)
    // ... rest of component
  >
  ```

**Checkpoint:** Clip component converted to HTML5 drag & drop ✓  
**Test:** Verify clip can be dragged (but won't work until Track handles drops)

**Commit:** `feat(timeline): convert Clip component from mouse events to HTML5 drag & drop`

---

### 2.2: Enhance Track Component Drop Handler (1 hour)

#### Preserve Media Library Drop Functionality
- [ ] Open `src/components/timeline/Track.js`
- [ ] **CRITICAL:** Keep existing Media Library drop handling EXACTLY AS-IS
- [ ] Current `handleDrop` handles Media Library items ✅ - DO NOT BREAK THIS

#### Add Timeline Clip Drop Handling
- [ ] Enhance `handleDrop` to handle BOTH Media Library items AND Timeline clips
  ```javascript
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (track.locked) {
      return;
    }

    try {
      // FIRST: Try to handle Timeline clip (NEW)
      const jsonData = e.dataTransfer.getData('application/json');
      if (jsonData) {
        try {
          const data = JSON.parse(jsonData);
          
          // Handle Media Library items (PRESERVE - already working)
          if (data.type === 'media-library-item') {
            // ... existing Media Library drop code - DO NOT CHANGE
            sourceClip = data.mediaItem;
            // ... rest of Media Library handling
            return; // Exit early after handling Media Library
          }
          
          // Handle Timeline clips (NEW)
          if (data.type === 'timeline-clip') {
            console.log('🎬 [TRACK] Dropping Timeline clip:', data.clipId);
            
            const sourceClip = data.clip;
            const sourceTrackId = data.trackId;
            
            // Calculate drop position
            const rect = trackRef.current.getBoundingClientRect();
            const dropX = e.clientX - rect.left;
            const dropTime = pixelsToTime(dropX, zoom);
            
            // Apply snap-to-clip if available
            const snapTargets = calculateSnapTargets(
              sourceClip,
              timelineClips.filter(c => c.id !== sourceClip.id),
              0.5
            );
            const snappedTime = snapTargets.length > 0 ? snapTargets[0].time : dropTime;
            
            // Validate drop position (overlap prevention)
            const isValid = isValidDropPosition(
              track.id,
              snappedTime,
              sourceClip,
              timelineClips,
              timelineClips.filter(c => c.trackId === track.id)
            );
            
            if (isValid) {
              // Move clip using existing moveClip function
              if (sourceTrackId === track.id) {
                // Same track - just update position
                moveClip(sourceClip.id, snappedTime, track.id);
              } else {
                // Different track - move to new track
                moveClip(sourceClip.id, snappedTime, track.id);
              }
              console.log('🎬 [TRACK] ✅ Timeline clip moved successfully');
            } else {
              console.warn('🎬 [TRACK] ⚠️ Invalid drop position (overlap prevented)');
              // Could show visual feedback for invalid drop
            }
            return; // Exit after handling Timeline clip
          }
        } catch (error) {
          console.error('🎬 [TRACK] ❌ Failed to parse JSON drag data:', error);
        }
      }
      
      // FALLBACK: Try text/plain (for compatibility)
      const clipId = e.dataTransfer.getData('text/plain');
      if (clipId) {
        const sourceClip = timelineClips.find(clip => clip.id === clipId);
        if (sourceClip) {
          // Handle as Timeline clip (same logic as above)
          // ... (duplicate the Timeline clip handling above)
        }
      }
    } catch (error) {
      console.error('🎬 [TRACK] ❌ Error handling drop:', error);
    }
  }, [track, track.locked, track.id, timelineClips, zoom, moveClip, calculateSnapTargets, isValidDropPosition]);
  ```

- [ ] Update `handleDragOver` to accept Timeline clips
  ```javascript
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!track.locked) {
      setIsDragOver(true);
      
      // Check drag data type to set appropriate drop effect
      const jsonData = e.dataTransfer.getData('application/json');
      if (jsonData) {
        try {
          const data = JSON.parse(jsonData);
          if (data.type === 'timeline-clip') {
            e.dataTransfer.dropEffect = 'move'; // Repositioning
          } else if (data.type === 'media-library-item') {
            e.dataTransfer.dropEffect = 'copy'; // Adding new clip
          }
        } catch (e) {
          // Default to move
          e.dataTransfer.dropEffect = 'move';
        }
      } else {
        // Default to move for Timeline clips
        e.dataTransfer.dropEffect = 'move';
      }
    }
  }, [track.locked]);
  ```

**Checkpoint:** Track handles both Media Library items AND Timeline clips ✓  
**Test:** 
- [ ] Verify Media Library → Timeline drag still works ✅
- [ ] Verify Timeline clip → Timeline drag works ✅

**Commit:** `feat(timeline): enhance Track drop handler to support Timeline clip drag & drop`

---

### 2.3: Critical Testing - Preserve Media Library Functionality (15 minutes)

**⚠️ CRITICAL:** After modifying Track.js, verify Media Library drag & drop still works!

- [ ] Test Media Library → Timeline drag:
  - [ ] Import a video clip
  - [ ] Drag from Media Library to Timeline track
  - [ ] Verify clip appears on timeline ✅
  - [ ] Verify snap-to-end positioning works ✅
  - [ ] Verify visual feedback works ✅
- [ ] If Media Library drag is broken:
  - [ ] Roll back Track.js changes
  - [ ] Review handleDrop logic
  - [ ] Ensure Media Library handling is preserved
- [ ] Document test results:
  - [ ] Media Library drag: ✅ PASS / ❌ FAIL
  - [ ] Timeline clip drag: ✅ PASS / ❌ FAIL

**Checkpoint:** Both drag sources work correctly ✓

**Commit:** (No commit needed - just verification)

---

## Phase 3: Enhance Snap-to-Clip Logic (1.5 hours)

**Note:** Basic magnetic snap already exists via `useMagneticSnap` hook. We're enhancing it with time-based snap and visual indicators.

### 3.1: Implement Time-Based Snap Detection (45 minutes)

#### Update Snap Calculation Utilities
- [ ] Update `src/utils/dragDropCalculations.js`

- [ ] Add findSnapTarget helper function
  ```javascript
  /**
   * Find the closest snap target within threshold
   * Returns null if no target within threshold
   */
  export const findSnapTarget = (time, snapTargets, threshold = 0.5) => {
    if (!snapTargets || snapTargets.length === 0) return null;
    
    const closestTarget = snapTargets[0];
    if (closestTarget.distance <= threshold) {
      return closestTarget;
    }
    
    return null;
  };
  ```

- [ ] Add snap line calculation (for visual display)
  ```javascript
  /**
   * Calculate pixel position for snap line visual indicator
   * Converts time-based snap target to pixel position for rendering
   */
  export const calculateSnapLine = (snapTarget, zoom, timelineWidth) => {
    if (!snapTarget) return null;
    
    // Use existing timeToPixels function from timelineCalculations
    return {
      x: timeToPixels(snapTarget.time, zoom), // Already has zoom built in
      type: snapTarget.type,
      clipId: snapTarget.clipId,
      time: snapTarget.time
    };
  };
  ```

#### Integrate Snap Detection in Track Drop Handler
- [ ] Update Track.js handleDrop to use time-based snap
  ```javascript
  // In handleDrop, after calculating dropTime:
  
  // Calculate snap targets using time-based calculation
  const snapTargets = calculateSnapTargets(
    sourceClip,
    timelineClips.filter(c => c.id !== sourceClip.id),
    0.5 // 0.5 second threshold
  );
  
  // Find closest snap target
  const snapTarget = findSnapTarget(dropTime, snapTargets, 0.5);
  
  // Use snapped time if available, otherwise use drop time
  const finalTime = snapTarget ? snapTarget.time : dropTime;
  ```

**Checkpoint:** Snap detection working ✓

**Commit:** `feat(timeline): implement snap-to-clip detection`

---

### 3.2: Add Visual Snap Indicators (45 minutes)

#### Create SnapLine Component
- [ ] Create file `src/components/timeline/SnapLine.js`

- [ ] Implement snap line component
  ```javascript
  const SnapLine = ({ snapLine, timelineWidth }) => {
    if (!snapLine) return null;
    
    return (
      <div
        className="snap-line"
        style={{
          position: 'absolute',
          left: snapLine.x,
          top: 0,
          bottom: 0,
          width: '2px',
          backgroundColor: '#6366f1',
          zIndex: 10,
          pointerEvents: 'none'
        }}
      />
    );
  };
  ```

#### Update Timeline Component
- [ ] Add snap line to timeline
  ```javascript
  const Timeline = () => {
    const { dragState } = useTimeline();
    const snapLine = calculateSnapLine(
      dragState.snapTarget,
      zoomLevel,
      timelineWidth
    );
    
    return (
      <div className="timeline">
        {/* ... existing timeline content */}
        <SnapLine snapLine={snapLine} timelineWidth={timelineWidth} />
      </div>
    );
  };
  ```

- [ ] Add snap line CSS
  ```css
  .snap-line {
    animation: snap-pulse 0.5s ease-in-out infinite alternate;
  }
  
  @keyframes snap-pulse {
    from { opacity: 0.6; }
    to { opacity: 1; }
  }
  ```

**Checkpoint:** Visual snap indicators working ✓

**Commit:** `feat(timeline): add visual snap indicators`

---

## Phase 4: Visual Feedback & Polish (1 hour)

### 4.1: Add Drag Preview (30 minutes)

#### Create DragPreview Component
- [ ] Create file `src/components/timeline/DragPreview.js`

- [ ] Implement drag preview
  ```javascript
  const DragPreview = ({ clip, isVisible }) => {
    if (!isVisible || !clip) return null;
    
    return (
      <div className="drag-preview">
        <div className="drag-preview-content">
          <div className="drag-preview-icon">🎬</div>
          <div className="drag-preview-text">
            <div className="drag-preview-name">{clip.name}</div>
            <div className="drag-preview-duration">{formatTime(clip.duration)}</div>
          </div>
        </div>
      </div>
    );
  };
  ```

- [ ] Add drag preview CSS
  ```css
  .drag-preview {
    position: fixed;
    top: -1000px;
    left: -1000px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    pointer-events: none;
    z-index: 1000;
  }
  
  .drag-preview-content {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .drag-preview-icon {
    font-size: 16px;
  }
  
  .drag-preview-name {
    font-weight: 500;
  }
  
  .drag-preview-duration {
    opacity: 0.7;
  }
  ```

#### Update Clip Component
- [ ] Add drag preview to drag start
  ```javascript
  const handleDragStart = (e) => {
    // Create drag preview
    const preview = document.createElement('div');
    preview.className = 'drag-preview';
    preview.innerHTML = `
      <div class="drag-preview-content">
        <div class="drag-preview-icon">🎬</div>
        <div class="drag-preview-text">
          <div class="drag-preview-name">${clip.name}</div>
          <div class="drag-preview-duration">${formatTime(clip.duration)}</div>
        </div>
      </div>
    `;
    document.body.appendChild(preview);
    
    e.dataTransfer.setDragImage(preview, 0, 0);
    
    // Clean up preview after drag
    setTimeout(() => {
      document.body.removeChild(preview);
    }, 0);
    
    onDragStart(e, clip.id, trackId);
  };
  ```

**Checkpoint:** Drag preview working ✓

**Commit:** `feat(timeline): add drag preview component`

---

### 4.2: Add Smooth Animations (30 minutes)

#### Add Transition CSS
- [ ] Update `src/components/timeline/Clip.css`

- [ ] Add smooth transitions
  ```css
  .clip {
    transition: all 0.2s ease;
  }
  
  .clip:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .clip.dragging {
    opacity: 0.5;
    transform: rotate(2deg);
  }
  ```

- [ ] Update `src/components/timeline/Track.css`

- [ ] Add track transitions
  ```css
  .track {
    transition: background-color 0.2s ease, border-color 0.2s ease;
  }
  
  .track.drop-target {
    background-color: rgba(99, 102, 241, 0.1);
    border: 2px dashed #6366f1;
  }
  ```

#### Add Animation Classes
- [ ] Update Clip component with animation classes
  ```javascript
  const clipClassName = classNames('clip', {
    'selected': isSelected,
    'dragging': dragState.isDragging && dragState.draggedClip?.id === clip.id
  });
  ```

- [ ] Update Track component with animation classes
  ```javascript
  const trackClassName = classNames('track', track.type, {
    'drop-target': dragState.dropTarget === track.id
  });
  ```

**Checkpoint:** Smooth animations working ✓

**Commit:** `feat(timeline): add smooth drag and drop animations`

---

## Testing Phase (1 hour)

### ⚠️ CRITICAL: Regression Testing

**MUST TEST AFTER EVERY CHANGE:**

- [ ] **Media Library → Timeline Drag (CRITICAL):**
  - [ ] Import video clips to Media Library
  - [ ] Drag clip from Media Library to Timeline
  - [ ] Verify clip appears on timeline ✅
  - [ ] Verify snap-to-end positioning works ✅
  - [ ] Verify clip metadata preserved ✅
  - [ ] Verify visual feedback works ✅
  - [ ] **Status:** ✅ PASS / ❌ FAIL

- [ ] **Clip Trimming (PRESERVE):**
  - [ ] Verify trim handles still work ✅
  - [ ] Verify trim drag still uses mouse events ✅
  - [ ] Verify trim feedback displays correctly ✅
  - [ ] **Status:** ✅ PASS / ❌ FAIL

### Unit Tests
- [ ] Test drag state management functions
  ```javascript
  describe('drag state management', () => {
    it('should start drag operation', () => {
      // Test startDrag function
    });
    
    it('should update drag position', () => {
      // Test updateDrag function
    });
    
    it('should complete drag operation', () => {
      // Test completeDrag function
    });
  });
  ```

- [ ] Test snap calculation utilities
  ```javascript
  describe('snap calculations', () => {
    it('should find snap targets within threshold (time-based)', () => {
      // Test calculateSnapTargets with 0.5s threshold
    });
    
    it('should validate drop positions (overlap prevention)', () => {
      // Test isValidDropPosition
    });
  });
  ```

### Integration Tests

- [ ] **Timeline Clip Drag (NEW):**
  - [ ] Drag clip within same track
  - [ ] Verify position updates correctly ✅
  - [ ] Drag clip from video track to audio track
  - [ ] Verify clip moves to new track ✅
  - [ ] Verify original track updates correctly ✅
  - [ ] Drag clip from audio track back to video track
  - [ ] Verify cross-track movement works both ways ✅

- [ ] **Snap-to-Clip Functionality (UPGRADED):**
  - [ ] Drag clip near another clip (within 0.5s)
  - [ ] Verify snap line appears ✅
  - [ ] Verify clip snaps to clip edge ✅
  - [ ] Test at different zoom levels (snap should work consistently) ✅
  - [ ] Verify snap to clip start AND clip end ✅

- [ ] **Overlap Prevention (NEW):**
  - [ ] Try to drag clip over existing clip
  - [ ] Verify drop is rejected ✅
  - [ ] Verify visual feedback for invalid drop ✅
  - [ ] Verify clip position not changed after invalid drop ✅

- [ ] **Both Drag Sources Work:**
  - [ ] Media Library → Timeline: ✅
  - [ ] Timeline Clip → Timeline: ✅
  - [ ] Both use same drop zones: ✅

### Manual Testing
- [ ] **Complete Drag & Drop Workflow:**
  - [ ] Import multiple video clips to Media Library
  - [ ] Drag clips from Media Library to Timeline ✅
  - [ ] Drag clips between tracks on Timeline ✅
  - [ ] Verify snap-to-clip works ✅
  - [ ] Verify overlap prevention works ✅
  - [ ] Verify visual feedback for all operations ✅

- [ ] **Edge Cases:**
  - [ ] Drag to same position (should work) ✅
  - [ ] Drag with no snap targets (should work) ✅
  - [ ] Drag to empty track (should work) ✅
  - [ ] Drag with multiple snap targets (should snap to closest) ✅
  - [ ] Drag locked clip (should not work) ✅
  - [ ] Drag to locked track (should not work) ✅

### Performance Testing
- [ ] Benchmark drag operations
  - [ ] Drag response time < 16ms ✅
  - [ ] Snap calculation < 5ms ✅
  - [ ] State update < 10ms ✅
- [ ] Test with many clips (50+)
  - [ ] Snap calculation still fast ✅
  - [ ] No lag during drag ✅

---

## Bug Fixing (If needed)

### Common Issues
- [ ] Drag not starting - Check draggable attribute
- [ ] Drop not working - Check preventDefault()
- [ ] Snap not working - Check snap calculation
- [ ] Visual feedback missing - Check CSS classes

### Debug Checklist
- [ ] Check console for errors
- [ ] Verify drag state updates
- [ ] Check event handlers
- [ ] Verify CSS classes applied

---

## Documentation Phase (30 minutes)

- [ ] Update JSDoc comments for new functions
- [ ] Add inline comments for complex logic
- [ ] Update README with drag and drop features
- [ ] Document drag and drop API

---

## Deployment Phase (30 minutes)

### Pre-Deploy Checklist
- [ ] All tests passing
- [ ] No console errors
- [ ] Performance targets met
- [ ] Accessibility working

### Deploy
- [ ] Build: `npm run build`
- [ ] Test: `npm start`
- [ ] Verify drag and drop works
- [ ] Test snap functionality

---

## Completion Checklist

### Functionality Checklist
- [ ] All phases complete
- [ ] **Media Library → Timeline drag still works ✅** (CRITICAL)
- [ ] Clip dragging converted to HTML5 drag & drop
- [ ] Cross-track clip movement working
- [ ] Snap-to-clip functionality working (time-based, 0.5s threshold)
- [ ] Overlap prevention implemented
- [ ] Visual feedback implemented (drag preview, snap lines, drop zones)
- [ ] Clip trimming still works (mouse events preserved) ✅

### Quality Checklist
- [ ] Performance targets met
- [ ] All tests passing
- [ ] No regression in Media Library drag ✅
- [ ] No regression in clip trimming ✅
- [ ] No critical bugs
- [ ] No console errors

### Documentation Checklist
- [ ] Inline comments added
- [ ] JSDoc comments updated
- [ ] README updated if needed
- [ ] Bug analysis documented (if bugs found)

### Final Testing
- [ ] **Complete workflow test:**
  - [ ] Import videos → Media Library ✅
  - [ ] Drag from Media Library → Timeline ✅
  - [ ] Drag clips between tracks ✅
  - [ ] Snap-to-clip works ✅
  - [ ] Overlap prevention works ✅
- [ ] **Regression test:**
  - [ ] All existing features still work ✅

### Deployment
- [ ] Branch merged to main
- [ ] All commits pushed
- [ ] PR_PARTY README updated
- [ ] Memory bank updated
- [ ] Celebration! 🎉

---

## Key Implementation Reminders

### ⚠️ DO NOT:
- ❌ Modify `src/components/MediaLibrary.js` (it works perfectly)
- ❌ Break Media Library → Timeline drag flow
- ❌ Remove clip trimming functionality
- ❌ Change existing time conversion functions (use existing utilities)

### ✅ DO:
- ✅ Build on existing functionality
- ✅ Test Media Library drag after EVERY change
- ✅ Use HTML5 drag & drop for consistency
- ✅ Implement time-based snap (not pixel-based)
- ✅ Add overlap prevention with visual feedback
- ✅ Preserve all existing features

### 📋 Implementation Order:
1. Phase 1: Add drag state (doesn't touch existing code)
2. Phase 2: Convert Clip component (remove mouse drag, add HTML5 drag)
3. Phase 2: Enhance Track drop handler (preserve Media Library, add Timeline clips)
4. **CRITICAL TEST:** Verify Media Library drag still works
5. Phase 3: Add snap-to-clip enhancements
6. Phase 4: Add visual feedback
7. Final testing: Comprehensive regression testing

---

**Remember:** This is an enhancement, not a rewrite. Preserve what works, upgrade what needs it! 🚀

