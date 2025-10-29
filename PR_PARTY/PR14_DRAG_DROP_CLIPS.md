# PR#14: Drag & Drop Clips

**Estimated Time:** 4-6 hours  
**Complexity:** MEDIUM-HIGH  
**Dependencies:** PR #11 (State Management Refactor), PR #12 (UI Component Library), PR #13 (Professional Timeline)

---

## Overview

### What We're Building
Implement drag-and-drop functionality for clips on the multi-track timeline, enabling users to reorder clips within tracks and move clips between tracks. This transforms ClipForge from a static timeline editor into an interactive, professional video editing experience with snap-to-clip functionality.

### Why It Matters
Drag-and-drop is the fundamental interaction pattern for professional video editors. Users expect to be able to rearrange clips intuitively, and this functionality is essential for:
- **Professional workflow** - Industry standard editing interaction
- **User experience** - Intuitive clip rearrangement
- **Timeline flexibility** - Dynamic clip positioning
- **Foundation for advanced features** - Split, delete, and multi-track editing

### Success in One Sentence
"This PR is successful when users can drag clips between tracks, snap to other clips, and rearrange clips within tracks with smooth visual feedback."

---

## Technical Design

### Architecture Decisions

#### Decision 1: Drag & Drop API Choice
**Options Considered:**
1. HTML5 Drag & Drop API - Native browser support, accessibility built-in
2. Custom mouse/touch events - Full control, more complex implementation
3. Third-party library (react-dnd) - Feature-rich, additional dependency

**Chosen:** HTML5 Drag & Drop API

**Rationale:**
- Native accessibility support (screen readers, keyboard navigation)
- Standard behavior users expect
- No additional dependencies
- Built-in drag feedback and drop zones
- Cross-platform consistency

**Trade-offs:**
- Gain: Accessibility, standard behavior, no dependencies
- Lose: Some customization limitations, browser quirks to handle

#### Decision 2: Snap-to-Clip Implementation
**Options Considered:**
1. Time-based snapping (0.5 second threshold) - Zoom-independent, precise
2. Pixel-based snapping (20px threshold) - Visual consistency, zoom-dependent
3. Magnetic zones around clips - Complex, potentially confusing

**Chosen:** Time-based snapping (0.5 second threshold)

**Rationale:**
- Works consistently across all zoom levels
- Professional video editor standard
- Precise time-based alignment
- Matches industry expectations

**Trade-offs:**
- Gain: Zoom-independent, precise, professional standard
- Lose: Less visual feedback during drag

#### Decision 3: Overlap Prevention Strategy
**Options Considered:**
1. Prevent overlaps entirely - Clean timeline, simple state
2. Allow overlaps with visual indication - Complex state management
3. Auto-shift clips to prevent overlaps - Unexpected behavior

**Chosen:** Prevent overlaps entirely

**Rationale:**
- Keeps timeline clean and professional
- Simpler state management
- Clear visual feedback (drop zones)
- Matches professional editor behavior

**Trade-offs:**
- Gain: Clean timeline, simple state, clear UX
- Lose: Some flexibility in clip positioning

#### Decision 4: State Management Integration
**Options Considered:**
1. Context API integration - Consistent with existing architecture
2. Local component state - Simpler, isolated
3. Redux integration - Overkill for this feature

**Chosen:** Context API integration

**Rationale:**
- Consistent with PR#11 architecture
- Centralized drag state management
- Easy integration with timeline state
- Follows established patterns

**Trade-offs:**
- Gain: Consistency, centralized state, easy integration
- Lose: Slightly more complex than local state

### Data Model

**New Drag State Structure:**
```javascript
// TimelineContext drag state
const dragState = {
  isDragging: false,
  draggedClip: null,
  dragStartTrack: null,
  dragStartPosition: null,
  dropTarget: null,
  snapTarget: null,
  isValidDrop: false
};
```

**Enhanced Clip Structure:**
```javascript
// Existing clip structure (no changes needed)
const clip = {
  id: 'clip-123',
  name: 'video.mp4',
  path: '/path/to/video.mp4',
  duration: 30.5,
  startTime: 0,
  trackId: 'video-track',
  trimIn: 0,
  trimOut: 30.5
};
```

**Track Structure (Enhanced):**
```javascript
// Track with drag support
const track = {
  id: 'video-track',
  type: 'video',
  clips: [clip1, clip2, clip3],
  height: 60,
  isDropTarget: false
};
```

### API Design

**New TimelineContext Methods:**
```javascript
/**
 * Start drag operation for a clip
 * @param {string} clipId - ID of clip being dragged
 * @param {string} trackId - ID of source track
 * @param {number} startTime - Original start time
 */
const startDrag = (clipId, trackId, startTime) => {
  // Implementation: Set drag state, calculate snap targets
};

/**
 * Update drag position and snap targets
 * @param {string} trackId - Target track ID
 * @param {number} time - Target time position
 */
const updateDrag = (trackId, time) => {
  // Implementation: Update drop target, calculate snap
};

/**
 * Complete drag operation
 * @param {string} trackId - Final track ID
 * @param {number} time - Final time position
 */
const completeDrag = (trackId, time) => {
  // Implementation: Update clip position, clear drag state
};

/**
 * Cancel drag operation
 */
const cancelDrag = () => {
  // Implementation: Restore original position, clear drag state
};
```

**New Hook: useDragDrop**
```javascript
/**
 * Custom hook for drag and drop functionality
 * @returns {Object} Drag and drop handlers and state
 */
const useDragDrop = () => {
  return {
    onDragStart: (e, clipId, trackId) => { /* ... */ },
    onDragOver: (e, trackId) => { /* ... */ },
    onDrop: (e, trackId) => { /* ... */ },
    onDragEnd: (e) => { /* ... */ },
    dragState: { /* ... */ }
  };
};
```

### Component Hierarchy
```
Timeline/
├── TimelineTracks/
│   ├── Track (draggable clips)
│   │   ├── Clip (draggable)
│   │   └── DropZone (drop target)
│   └── Track (draggable clips)
└── TimelineHeader/
    └── DragControls (visual feedback)
```

---

## Implementation Details

### File Structure
**New Files:**
```
src/
├── hooks/
│   └── useDragDrop.js (~150 lines)
├── components/timeline/
│   ├── DragPreview.js (~80 lines)
│   └── DropZone.js (~60 lines)
└── utils/
    └── dragDropCalculations.js (~100 lines)
```

**Modified Files:**
- `src/context/TimelineContext.js` (+200/-50 lines) - Drag state management
- `src/components/timeline/Track.js` (+100/-20 lines) - Drag handlers
- `src/components/timeline/Clip.js` (+80/-10 lines) - Draggable attributes
- `src/components/timeline/Timeline.js` (+50/-10 lines) - Drag state display

### Key Implementation Steps

#### Phase 1: Drag State Foundation (1.5 hours)
1. Add drag state to TimelineContext
2. Create drag state management methods
3. Add drag state to useTimeline hook
4. Test drag state updates

#### Phase 2: HTML5 Drag & Drop Integration (2 hours)
1. Implement useDragDrop hook
2. Add draggable attributes to Clip component
3. Add drop zone handling to Track component
4. Test basic drag and drop

#### Phase 3: Snap-to-Clip Logic (1.5 hours)
1. Create snap calculation utilities
2. Implement snap target detection
3. Add visual snap indicators
4. Test snap functionality

#### Phase 4: Visual Feedback & Polish (1 hour)
1. Add drag preview component
2. Implement drop zone highlighting
3. Add smooth animations
4. Test visual feedback

### Code Examples

**Example 1: Drag Start Handler**
```javascript
const handleDragStart = (e, clipId, trackId) => {
  const clip = clips.find(c => c.id === clipId);
  const track = tracks.find(t => t.id === trackId);
  
  // Set drag data
  e.dataTransfer.setData('application/clipforge-clip', JSON.stringify({
    clipId,
    trackId,
    startTime: clip.startTime
  }));
  
  // Set drag image
  e.dataTransfer.setDragImage(dragPreview, 0, 0);
  
  // Update drag state
  startDrag(clipId, trackId, clip.startTime);
  
  // Calculate snap targets
  const snapTargets = calculateSnapTargets(clip, trackId);
  setSnapTargets(snapTargets);
};
```

**Example 2: Drop Handler**
```javascript
const handleDrop = (e, targetTrackId) => {
  e.preventDefault();
  
  const dragData = JSON.parse(e.dataTransfer.getData('application/clipforge-clip'));
  const { clipId, trackId: sourceTrackId } = dragData;
  
  // Calculate drop position
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const time = pixelToTime(x, zoomLevel);
  
  // Apply snap if within threshold
  const snappedTime = applySnap(time, snapTargets);
  
  // Validate drop position
  if (isValidDropPosition(targetTrackId, snappedTime, clipId)) {
    // Update clip position
    moveClip(clipId, sourceTrackId, targetTrackId, snappedTime);
    
    // Clear drag state
    completeDrag();
  } else {
    // Cancel drag
    cancelDrag();
  }
};
```

**Example 3: Snap Calculation**
```javascript
const calculateSnapTargets = (draggedClip, trackId) => {
  const snapThreshold = 0.5; // seconds
  const targets = [];
  
  // Get all clips in timeline
  const allClips = tracks.flatMap(track => track.clips);
  
  allClips.forEach(clip => {
    if (clip.id === draggedClip.id) return;
    
    // Check start time
    const startDistance = Math.abs(draggedClip.startTime - clip.startTime);
    if (startDistance <= snapThreshold) {
      targets.push({
        type: 'start',
        time: clip.startTime,
        clipId: clip.id,
        distance: startDistance
      });
    }
    
    // Check end time
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
  
  return targets.sort((a, b) => a.distance - b.distance);
};
```

---

## Testing Strategy

### Test Categories

**Unit Tests:**
- Drag state management functions
- Snap calculation utilities
- Drop validation logic
- Time conversion functions

**Integration Tests:**
- Drag and drop between tracks
- Snap-to-clip functionality
- Overlap prevention
- State updates after drag

**Edge Cases:**
- Drag to same position
- Drag to invalid position
- Drag with no snap targets
- Drag with multiple snap targets
- Drag to empty track

**Performance Tests:**
- Drag operation latency < 16ms
- Snap calculation < 5ms
- State update < 10ms

---

## Success Criteria

**Feature is complete when:**
- [ ] Users can drag clips between tracks
- [ ] Users can drag clips within the same track
- [ ] Snap-to-clip works with 0.5 second threshold
- [ ] Overlaps are prevented with visual feedback
- [ ] Drag preview shows clip information
- [ ] Drop zones highlight during drag
- [ ] All drag operations update timeline state
- [ ] Keyboard accessibility works (Tab navigation)
- [ ] Screen reader support works
- [ ] Performance meets targets

**Performance Targets:**
- Drag operation: < 16ms response time
- Snap calculation: < 5ms
- State update: < 10ms
- Visual feedback: < 100ms

**Quality Gates:**
- Zero critical bugs
- All tests passing
- No console errors
- Accessibility compliance
- Cross-browser compatibility

---

## Risk Assessment

### Risk 1: HTML5 Drag & Drop Browser Quirks
**Likelihood:** MEDIUM  
**Impact:** MEDIUM  
**Mitigation:** Test on multiple browsers, implement fallbacks  
**Status:** 🟡

### Risk 2: Performance with Many Clips
**Likelihood:** LOW  
**Impact:** HIGH  
**Mitigation:** Optimize snap calculations, limit snap targets  
**Status:** 🟢

### Risk 3: State Management Complexity
**Likelihood:** MEDIUM  
**Impact:** MEDIUM  
**Mitigation:** Keep drag state simple, clear separation  
**Status:** 🟡

### Risk 4: Accessibility Implementation
**Likelihood:** LOW  
**Impact:** HIGH  
**Mitigation:** Use HTML5 API, test with screen readers  
**Status:** 🟢

---

## Open Questions

1. **Question 1:** Should we support drag to create gaps between clips?
   - Option A: Yes, allow gaps (more flexible)
   - Option B: No, always snap to clips (simpler)
   - Decision needed by: Phase 2

2. **Question 2:** Should we show snap lines during drag?
   - Option A: Yes, visual feedback (better UX)
   - Option B: No, just snap (simpler)
   - Decision needed by: Phase 3

---

## Timeline

**Total Estimate:** 4-6 hours

| Phase | Task | Time | Status |
|-------|------|------|--------|
| 1 | Drag State Foundation | 1.5h | ⏳ |
| 2 | HTML5 Drag & Drop | 2h | ⏳ |
| 3 | Snap-to-Clip Logic | 1.5h | ⏳ |
| 4 | Visual Feedback | 1h | ⏳ |

---

## Dependencies

**Requires:**
- [ ] PR #11 complete (State Management Refactor)
- [ ] PR #12 complete (UI Component Library)
- [ ] PR #13 complete (Professional Timeline)

**Blocks:**
- PR #15 (Split & Delete Clips - needs drag state)
- PR #16 (Undo/Redo System - needs drag operations)

---

## References

- Related PR: [#13] (Professional Timeline)
- HTML5 Drag & Drop API: [MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)
- Accessibility: [WCAG Drag & Drop Guidelines](https://www.w3.org/WAI/ARIA/apg/patterns/drag-and-drop/)
- Similar implementation: PR #13 (Timeline interactions)

