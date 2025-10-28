# PR#11: Testing Guide

---

## Test Categories

### 1. Unit Tests

**TimelineContext Tests:**
- [ ] Test case 1: addClip adds clip to correct track
  - Input: clip object, trackId 'video-1'
  - Expected: Clip added to clips array, track clips array updated
  - Actual: [Record result]

- [ ] Test case 2: selectClip updates selectedClipId
  - Input: clipId 'clip-1'
  - Expected: selectedClipId set to 'clip-1'
  - Actual: [Record result]

- [ ] Test case 3: moveClip moves clip between tracks
  - Input: clipId, newTrackId 'video-2', newStartTime 10
  - Expected: Clip trackId updated, removed from old track, added to new track
  - Actual: [Record result]

- [ ] Test case 4: setPlayhead updates playhead position
  - Input: time 15.5
  - Expected: playhead set to 15.5
  - Actual: [Record result]

**ProjectContext Tests:**
- [ ] Test case 1: createProject resets state with new name
  - Input: projectName 'My Project'
  - Expected: projectName updated, other state reset
  - Actual: [Record result]

- [ ] Test case 2: setModified updates isModified flag
  - Input: modified true
  - Expected: isModified set to true
  - Actual: [Record result]

**UIContext Tests:**
- [ ] Test case 1: showModal opens specified modal
  - Input: modalName 'exportSettings', data {}
  - Expected: Modal isOpen true, data set
  - Actual: [Record result]

- [ ] Test case 2: showToast adds toast to queue
  - Input: toast { type: 'success', message: 'Done' }
  - Expected: Toast added to toasts array
  - Actual: [Record result]

**Timeline Utility Tests:**
- [ ] Test case 1: calculateClipPosition returns correct position
  - Input: clip { startTime: 10, duration: 30 }, zoom 1
  - Expected: { left: 16.67, width: 50 }
  - Actual: [Record result]

- [ ] Test case 2: getClipAtTime finds correct clip
  - Input: tracks with clips, time 15
  - Expected: Returns clip that contains time 15
  - Actual: [Record result]

- [ ] Test case 3: findClipGaps identifies gaps between clips
  - Input: clips with gaps
  - Expected: Array of gap objects with start and duration
  - Actual: [Record result]

- [ ] Test case 4: snapToGrid rounds to grid
  - Input: position 7.3, gridSize 1
  - Expected: 7
  - Actual: [Record result]

### 2. Integration Tests

**Context Provider Integration:**
- [ ] Test case 1: All providers work together
  - Steps:
    1. Render App with all providers
    2. Verify no provider errors
    3. Check contexts are accessible
  - Expected: App renders without errors
  - Actual: [Record result]

- [ ] Test case 2: Timeline component uses TimelineContext
  - Steps:
    1. Render Timeline within TimelineProvider
    2. Add clip via context
    3. Verify clip appears in timeline
  - Expected: Clip renders in timeline
  - Actual: [Record result]

- [ ] Test case 3: VideoPlayer updates when clip selected
  - Steps:
    1. Render VideoPlayer within TimelineProvider
    2. Select clip via context
    3. Verify video source updates
  - Expected: Video source changes to selected clip
  - Actual: [Record result]

**Component Integration:**
- [ ] Test case 1: Import → Timeline → Player workflow
  - Steps:
    1. Import video file
    2. Verify clip appears in timeline
    3. Click clip to select
    4. Verify video player shows clip
  - Expected: Complete workflow works
  - Actual: [Record result]

- [ ] Test case 2: Trim → Export workflow
  - Steps:
    1. Select clip
    2. Set trim points
    3. Export video
    4. Verify export uses trim points
  - Expected: Export respects trim points
  - Actual: [Record result]

### 3. Edge Cases

**Empty State Tests:**
- [ ] Test case 1: Timeline with no clips
  - Expected: Empty timeline renders correctly
  - Actual: [Record result]

- [ ] Test case 2: Selecting non-existent clip
  - Expected: No errors, selectedClipId remains null
  - Actual: [Record result]

- [ ] Test case 3: Moving clip to non-existent track
  - Expected: Error handling, clip not moved
  - Actual: [Record result]

**Invalid Data Tests:**
- [ ] Test case 1: Adding clip with invalid duration
  - Input: clip { duration: -5 }
  - Expected: Error handling or validation
  - Actual: [Record result]

- [ ] Test case 2: Setting playhead to negative time
  - Input: time -10
  - Expected: Playhead set to 0 or error handling
  - Actual: [Record result]

- [ ] Test case 3: Moving clip to invalid position
  - Input: newStartTime -5
  - Expected: Error handling or validation
  - Actual: [Record result]

**Performance Edge Cases:**
- [ ] Test case 1: Timeline with 50+ clips
  - Expected: Timeline renders in <500ms
  - Actual: [Record result]

- [ ] Test case 2: Rapid context updates
  - Steps: Update playhead rapidly
  - Expected: No performance issues
  - Actual: [Record result]

### 4. Performance Tests

**Timeline Rendering Performance:**
- [ ] Benchmark 1: 10 clips render time
  - Target: <100ms
  - Actual: [Record result]

- [ ] Benchmark 2: 50 clips render time
  - Target: <500ms
  - Actual: [Record result]

- [ ] Benchmark 3: 100 clips render time
  - Target: <1000ms
  - Actual: [Record result]

**Context Update Performance:**
- [ ] Benchmark 1: addClip operation
  - Target: <50ms
  - Actual: [Record result]

- [ ] Benchmark 2: moveClip operation
  - Target: <50ms
  - Actual: [Record result]

- [ ] Benchmark 3: setPlayhead operation
  - Target: <10ms
  - Actual: [Record result]

**Memory Usage:**
- [ ] Benchmark 1: Memory usage with 10 clips
  - Target: <100MB
  - Actual: [Record result]

- [ ] Benchmark 2: Memory usage with 50 clips
  - Target: <200MB
  - Actual: [Record result]

- [ ] Benchmark 3: Memory growth over time
  - Target: No memory leaks
  - Actual: [Record result]

### 5. Regression Tests

**MVP Functionality Preservation:**
- [ ] Test case 1: Import video file
  - Expected: File imports and appears in timeline
  - Actual: [Record result]

- [ ] Test case 2: Play video
  - Expected: Video plays with audio
  - Actual: [Record result]

- [ ] Test case 3: Trim video
  - Expected: Trim points can be set and adjusted
  - Actual: [Record result]

- [ ] Test case 4: Export video
  - Expected: Video exports with trim points applied
  - Actual: [Record result]

- [ ] Test case 5: Complete workflow
  - Steps: Import → Play → Trim → Export
  - Expected: Complete workflow works identically to MVP
  - Actual: [Record result]

**UI Regression Tests:**
- [ ] Test case 1: Timeline appearance
  - Expected: Timeline looks identical to MVP
  - Actual: [Record result]

- [ ] Test case 2: Video player appearance
  - Expected: Player looks identical to MVP
  - Actual: [Record result]

- [ ] Test case 3: Import panel appearance
  - Expected: Import panel looks identical to MVP
  - Actual: [Record result]

- [ ] Test case 4: Export panel appearance
  - Expected: Export panel looks identical to MVP
  - Actual: [Record result]

### 6. Cross-Component Tests

**State Synchronization:**
- [ ] Test case 1: Timeline selection updates video player
  - Steps: Select clip in timeline
  - Expected: Video player shows selected clip
  - Actual: [Record result]

- [ ] Test case 2: Video player time updates playhead
  - Steps: Play video
  - Expected: Playhead moves with video time
  - Actual: [Record result]

- [ ] Test case 3: Import updates timeline
  - Steps: Import video file
  - Expected: Clip appears in timeline
  - Actual: [Record result]

- [ ] Test case 4: Trim updates export
  - Steps: Set trim points, export
  - Expected: Export uses trim points
  - Actual: [Record result]

---

## Acceptance Criteria

**Feature is complete when:**
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All edge case tests pass
- [ ] Performance benchmarks met
- [ ] MVP functionality preserved
- [ ] No console errors
- [ ] No memory leaks
- [ ] UI looks identical to MVP
- [ ] Ready for V2 development

**Performance Targets:**
- Timeline render: <100ms for 10 clips
- Context updates: <50ms for state changes
- Memory usage: <100MB for typical projects
- App launch: <3 seconds (same as MVP)

**Quality Gates:**
- Zero critical bugs
- All existing tests pass
- No TypeScript errors
- No console warnings
- Performance within targets

---

## Manual Testing Checklist

### Pre-Testing Setup
- [ ] MVP is working and tested
- [ ] Development branch created
- [ ] All contexts implemented
- [ ] App refactored to use contexts

### Phase 1: Context Testing
- [ ] TimelineContext renders without errors
- [ ] ProjectContext renders without errors
- [ ] UIContext renders without errors
- [ ] All contexts accessible via hooks
- [ ] No "must be used within provider" errors

### Phase 2: Component Testing
- [ ] Timeline component uses TimelineContext
- [ ] VideoPlayer component uses TimelineContext
- [ ] ImportPanel component uses TimelineContext
- [ ] ExportPanel component uses TimelineContext
- [ ] All components render correctly

### Phase 3: Workflow Testing
- [ ] Import video → appears in timeline
- [ ] Click clip → video player updates
- [ ] Set trim points → export uses trim
- [ ] Complete MVP workflow works
- [ ] No functionality lost

### Phase 4: Performance Testing
- [ ] App launches quickly (<3 seconds)
- [ ] Timeline responsive with multiple clips
- [ ] No memory leaks during extended use
- [ ] Context updates are fast
- [ ] No performance regression

### Phase 5: Edge Case Testing
- [ ] Empty timeline renders correctly
- [ ] Invalid data handled gracefully
- [ ] Error states display properly
- [ ] No crashes with edge cases
- [ ] Error boundaries work

---

## Test Data

### Sample Clips for Testing
```javascript
const testClips = [
  {
    id: 'clip-1',
    name: 'sample1.mp4',
    path: '/path/to/sample1.mp4',
    duration: 30.5,
    startTime: 0,
    trackId: 'video-1',
    trimIn: 0,
    trimOut: 30.5,
    effects: []
  },
  {
    id: 'clip-2',
    name: 'sample2.mp4',
    path: '/path/to/sample2.mp4',
    duration: 45.2,
    startTime: 35,
    trackId: 'video-1',
    trimIn: 5,
    trimOut: 40,
    effects: []
  }
];
```

### Sample Tracks for Testing
```javascript
const testTracks = [
  {
    id: 'video-1',
    type: 'video',
    name: 'Video Track 1',
    clips: ['clip-1', 'clip-2'],
    height: 60,
    muted: false,
    locked: false
  },
  {
    id: 'video-2',
    type: 'video',
    name: 'Video Track 2',
    clips: [],
    height: 60,
    muted: false,
    locked: false
  },
  {
    id: 'audio-1',
    type: 'audio',
    name: 'Audio Track',
    clips: [],
    height: 40,
    muted: false,
    locked: false
  }
];
```

---

## Debugging Guide

### Common Issues

**Issue 1: "useTimeline must be used within a TimelineProvider"**
- Check: Component wrapped in TimelineProvider
- Check: Provider imported correctly
- Check: Provider nesting order

**Issue 2: State not updating**
- Check: Using context hook correctly
- Check: Reducer action types match
- Check: State updates in reducer

**Issue 3: Performance issues**
- Check: Unnecessary re-renders
- Check: Context splitting
- Check: useMemo usage

**Issue 4: MVP functionality broken**
- Check: Context initial state
- Check: Component refactoring
- Check: State flow

### Debug Tools
- React DevTools for context inspection
- Console logging in reducers
- Performance profiling
- Memory usage monitoring

---

## Test Environment Setup

### Required Tools
- React DevTools extension
- Browser DevTools
- Performance profiler
- Memory usage monitor

### Test Commands
```bash
# Start development server
npm start

# Run tests (if available)
npm test

# Check for console errors
# Open DevTools Console

# Performance testing
# Use React DevTools Profiler
```

---

**Testing Status:** Ready for implementation  
**Next Action:** Begin testing after each implementation phase

