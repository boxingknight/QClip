# PR#14: Testing Guide

---

## Test Categories

### 1. Unit Tests

**Function:** `calculateSnapTargets()`
- [ ] Test case 1: Find snap targets within threshold
  - Input: `draggedClip: {startTime: 5}, allClips: [{startTime: 4.8}, {startTime: 6}]`
  - Expected: `[{type: 'start', time: 4.8, distance: 0.2}]`
  - Actual: [Record result]

- [ ] Test case 2: No snap targets beyond threshold
  - Input: `draggedClip: {startTime: 5}, allClips: [{startTime: 2}, {startTime: 8}]`
  - Expected: `[]`
  - Actual: [Record result]

- [ ] Test case 3: Multiple snap targets
  - Input: `draggedClip: {startTime: 5}, allClips: [{startTime: 4.8}, {startTime: 5.2}]`
  - Expected: `[{type: 'start', time: 4.8, distance: 0.2}, {type: 'start', time: 5.2, distance: 0.2}]`
  - Actual: [Record result]

**Function:** `isValidDropPosition()`
- [ ] Test case 1: Valid drop position
  - Input: `trackId: 'track1', time: 10, clip: {duration: 5}, tracks: [{id: 'track1', clips: []}]`
  - Expected: `true`
  - Actual: [Record result]

- [ ] Test case 2: Overlap with existing clip
  - Input: `trackId: 'track1', time: 8, clip: {duration: 5}, tracks: [{id: 'track1', clips: [{startTime: 10, duration: 3}]}]`
  - Expected: `false`
  - Actual: [Record result]

- [ ] Test case 3: Invalid track ID
  - Input: `trackId: 'nonexistent', time: 10, clip: {duration: 5}, tracks: []`
  - Expected: `false`
  - Actual: [Record result]

**Function:** `pixelToTime()` and `timeToPixel()`
- [ ] Test case 1: Convert pixels to time
  - Input: `pixels: 100, zoomLevel: 10, timelineWidth: 1000`
  - Expected: `1`
  - Actual: [Record result]

- [ ] Test case 2: Convert time to pixels
  - Input: `time: 5, zoomLevel: 10, timelineWidth: 1000`
  - Expected: `500`
  - Actual: [Record result]

### 2. Integration Tests

**Scenario 1:** Drag clip between tracks
- [ ] Step 1: Import two video clips
- [ ] Step 2: Place clips on different tracks
- [ ] Step 3: Drag clip from track 1 to track 2
- [ ] Step 4: Verify clip appears on track 2
- [ ] Step 5: Verify clip removed from track 1
- [ ] Expected: Clip successfully moved between tracks

**Scenario 2:** Drag clip within same track
- [ ] Step 1: Import two video clips
- [ ] Step 2: Place clips on same track
- [ ] Step 3: Drag first clip to new position
- [ ] Step 4: Verify clip moved to new position
- [ ] Step 5: Verify other clips not affected
- [ ] Expected: Clip repositioned within track

**Scenario 3:** Snap-to-clip functionality
- [ ] Step 1: Import two video clips
- [ ] Step 2: Place clips on timeline
- [ ] Step 3: Drag clip near another clip (within 0.5s)
- [ ] Step 4: Verify snap line appears
- [ ] Step 5: Release drag
- [ ] Step 6: Verify clip snaps to position
- [ ] Expected: Clip snaps to nearest clip edge

**Scenario 4:** Overlap prevention
- [ ] Step 1: Import two video clips
- [ ] Step 2: Place clips on same track
- [ ] Step 3: Try to drag clip over existing clip
- [ ] Step 4: Verify drop is rejected
- [ ] Step 5: Verify clip returns to original position
- [ ] Expected: Overlap prevented, clip returns to original position

### 3. Edge Cases

**Edge Case 1:** Drag to same position
- [ ] Test: Drag clip to its current position
- [ ] Expected: No state change, drag operation completes normally

**Edge Case 2:** Drag with no snap targets
- [ ] Test: Drag clip in empty timeline
- [ ] Expected: No snap line appears, clip drops at exact position

**Edge Case 3:** Drag with multiple snap targets
- [ ] Test: Drag clip near multiple clips
- [ ] Expected: Snaps to closest target

**Edge Case 4:** Drag to empty track
- [ ] Test: Drag clip to track with no clips
- [ ] Expected: Clip drops at exact position

**Edge Case 5:** Drag very short clip
- [ ] Test: Drag clip with duration < 0.1 seconds
- [ ] Expected: Drag and drop works normally

**Edge Case 6:** Drag very long clip
- [ ] Test: Drag clip with duration > 60 seconds
- [ ] Expected: Drag and drop works normally

### 4. Performance Tests

**Performance Test 1:** Drag operation latency
- [ ] Test: Measure time from drag start to visual feedback
- [ ] Target: < 16ms
- [ ] Actual: [Record result]

**Performance Test 2:** Snap calculation time
- [ ] Test: Measure time to calculate snap targets
- [ ] Target: < 5ms
- [ ] Actual: [Record result]

**Performance Test 3:** State update time
- [ ] Test: Measure time to update drag state
- [ ] Target: < 10ms
- [ ] Actual: [Record result]

**Performance Test 4:** Memory usage during drag
- [ ] Test: Monitor memory usage during drag operation
- [ ] Target: No significant increase
- [ ] Actual: [Record result]

### 5. Accessibility Tests

**Accessibility Test 1:** Keyboard navigation
- [ ] Test: Navigate timeline with Tab key
- [ ] Expected: All draggable clips are focusable

**Accessibility Test 2:** Screen reader support
- [ ] Test: Use screen reader to navigate timeline
- [ ] Expected: Clips announce as draggable

**Accessibility Test 3:** ARIA labels
- [ ] Test: Check ARIA labels on draggable elements
- [ ] Expected: Proper labels for drag operations

**Accessibility Test 4:** Focus management
- [ ] Test: Focus behavior during drag operations
- [ ] Expected: Focus returns to appropriate element after drag

### 6. Cross-Browser Tests

**Browser Test 1:** Chrome
- [ ] Test: Drag and drop functionality
- [ ] Expected: Works correctly

**Browser Test 2:** Firefox
- [ ] Test: Drag and drop functionality
- [ ] Expected: Works correctly

**Browser Test 3:** Safari
- [ ] Test: Drag and drop functionality
- [ ] Expected: Works correctly

**Browser Test 4:** Edge
- [ ] Test: Drag and drop functionality
- [ ] Expected: Works correctly

---

## Acceptance Criteria

Feature is complete when:
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

---

## Manual Testing Workflow

### Pre-Test Setup
1. Launch ClipForge
2. Import 3-4 test video clips
3. Verify timeline loads with multiple tracks
4. Verify clips are visible and selectable

### Test Sequence
1. **Basic Drag and Drop**
   - Drag clip from video track to audio track
   - Verify clip moves successfully
   - Drag clip back to original track
   - Verify clip returns successfully

2. **Snap-to-Clip Testing**
   - Place two clips on same track
   - Drag first clip near second clip
   - Verify snap line appears
   - Release drag
   - Verify clip snaps to position

3. **Overlap Prevention**
   - Place two clips on same track
   - Try to drag first clip over second clip
   - Verify drop is rejected
   - Verify clip returns to original position

4. **Visual Feedback**
   - Start drag operation
   - Verify drag preview appears
   - Verify drop zones highlight
   - Verify snap lines appear when appropriate

5. **Performance Testing**
   - Drag clips rapidly
   - Verify smooth performance
   - Check for any lag or stuttering

### Post-Test Verification
1. Verify timeline state is correct
2. Verify no console errors
3. Verify all clips still playable
4. Verify export still works

---

## Bug Reporting Template

### Bug Report Format
```
**Bug Title:** [Brief description]

**Severity:** CRITICAL/HIGH/MEDIUM/LOW

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result:** [What should happen]

**Actual Result:** [What actually happens]

**Environment:**
- Browser: [Chrome/Firefox/Safari/Edge]
- OS: [macOS/Windows/Linux]
- ClipForge Version: [Version]

**Console Errors:** [Any error messages]

**Screenshots:** [If applicable]
```

---

## Test Data

### Test Clips
- **Short clip:** 2-3 seconds duration
- **Medium clip:** 10-15 seconds duration  
- **Long clip:** 30+ seconds duration
- **Different formats:** MP4, MOV
- **Different resolutions:** 720p, 1080p

### Test Scenarios
- **Empty timeline:** No clips
- **Single clip:** One clip on timeline
- **Multiple clips:** 3-4 clips on timeline
- **Mixed tracks:** Clips on different track types
- **Dense timeline:** Many clips close together

---

## Performance Benchmarks

### Target Metrics
- **Drag start latency:** < 16ms
- **Snap calculation:** < 5ms
- **State update:** < 10ms
- **Visual feedback:** < 100ms
- **Memory usage:** No significant increase

### Measurement Tools
- Browser DevTools Performance tab
- React DevTools Profiler
- Custom performance markers
- Memory usage monitoring

---

## Regression Testing

### After Each Change
- [ ] Basic drag and drop still works
- [ ] Snap-to-clip still works
- [ ] Overlap prevention still works
- [ ] Visual feedback still works
- [ ] Performance still meets targets

### Before Release
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All edge cases tested
- [ ] All performance tests pass
- [ ] All accessibility tests pass
- [ ] Cross-browser testing complete

---

## Test Automation

### Unit Test Examples
```javascript
describe('Drag and Drop', () => {
  it('should calculate snap targets correctly', () => {
    const draggedClip = { startTime: 5, duration: 3 };
    const allClips = [
      { startTime: 4.8, duration: 2 },
      { startTime: 6, duration: 2 }
    ];
    
    const targets = calculateSnapTargets(draggedClip, allClips);
    expect(targets).toHaveLength(1);
    expect(targets[0].time).toBe(4.8);
  });
  
  it('should validate drop positions correctly', () => {
    const track = { id: 'track1', clips: [] };
    const isValid = isValidDropPosition('track1', 10, { duration: 5 }, [track]);
    expect(isValid).toBe(true);
  });
});
```

### Integration Test Examples
```javascript
describe('Drag and Drop Integration', () => {
  it('should move clip between tracks', async () => {
    // Setup timeline with clips
    const { getByTestId } = render(<Timeline />);
    
    // Drag clip from track 1 to track 2
    const clip = getByTestId('clip-1');
    const track2 = getByTestId('track-2');
    
    fireEvent.dragStart(clip);
    fireEvent.dragOver(track2);
    fireEvent.drop(track2);
    
    // Verify clip moved
    expect(track2).toContainElement(clip);
  });
});
```

---

## Success Criteria

### Functional Success
- [ ] All drag and drop operations work correctly
- [ ] Snap-to-clip functionality works as expected
- [ ] Overlap prevention works reliably
- [ ] Visual feedback is clear and responsive

### Performance Success
- [ ] All performance targets met
- [ ] No memory leaks
- [ ] Smooth animations
- [ ] Responsive user interface

### Quality Success
- [ ] No critical bugs
- [ ] All tests passing
- [ ] Accessibility compliance
- [ ] Cross-browser compatibility

### User Experience Success
- [ ] Intuitive drag and drop behavior
- [ ] Clear visual feedback
- [ ] Professional feel
- [ ] Users say "This feels like a real video editor!"

