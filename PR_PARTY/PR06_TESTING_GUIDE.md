# PR#6: Trim Controls - Testing Guide

**Purpose:** Comprehensive testing strategy for trim controls feature  
**Estimated Testing Time:** 1 hour  
**Test Categories:** Unit, Integration, Edge Cases, Export

---

## Test Categories

### 1. Unit Tests (30 minutes)

**Test: TrimControls Component Rendering**

Test: Component renders with default props
```javascript
// Expected: Component renders without crashing
<TrimControls
  currentTime={0}
  duration={120}
  inPoint={0}
  outPoint={120}
  onSetInPoint={() => {}}
  onSetOutPoint={() => {}}
  onResetTrim={() => {}}
/>
```

Test: Displays current time correctly
- Input: `currentTime={15}`, `duration={60}`
- Expected: Shows "0:15 / 1:00"

Test: Displays in/out points correctly
- Input: `inPoint={5}`, `outPoint={30}`
- Expected: Shows "In Point: 0:05" and "Out Point: 0:30"

Test: Calculates trim duration correctly
- Input: `inPoint={10}`, `outPoint={35}`
- Expected: Shows "Trim Duration: 0:25"

Test: Buttons disabled appropriately
- When `currentTime >= outPoint`: Set In button disabled ✓
- When `currentTime <= inPoint`: Set Out button disabled ✓
- When `currentTime < 0`: Set In button disabled ✓
- When `currentTime > duration`: Set Out button disabled ✓

Test: Error message displays when invalid
- When `inPoint >= outPoint`: Show error message ✓
- When `inPoint < 0`: Show error message ✓
- When `outPoint > duration`: Show error message ✓

---

### 2. Integration Tests (30 minutes)

**Test: Complete Trim Workflow**

Scenario 1: Basic Trim Workflow
1. Import video (duration: 120s)
2. Play video to 10 seconds
3. Click "Set In"
   - Expected: `trimData.inPoint` is 10
   - Expected: In point displays "0:10"
4. Play video to 45 seconds
5. Click "Set Out"
   - Expected: `trimData.outPoint` is 45
   - Expected: Out point displays "0:45"
   - Expected: Trim duration shows "0:35"
6. Verify trim indicators show on timeline
   - Expected: Region from 10s to 45s highlighted
   - Expected: Regions before 10s and after 45s darkened
7. Export video
   - Expected: Exported video duration is 35 seconds
   - Expected: Exported video plays correctly

Scenario 2: Reset Trim
1. Set in point to 15s
2. Set out point to 60s
3. Click "Reset Trim"
   - Expected: `inPoint` reset to 0
   - Expected: `outPoint` reset to clip duration
   - Expected: Timeline indicators cleared

Scenario 3: Select New Clip
1. Import clip A, set trim to 10-40s
2. Import clip B
3. Select clip B
   - Expected: Trim reset to full clip B
   - Expected: Timeline shows no trim indicators for clip B
4. Select clip A again
   - Expected: Trim back to 10-40s for clip A

Scenario 4: Time Updates During Playback
1. Import video
2. Start playback
3. Verify current time updates in TrimControls
   - Expected: Time increments in real-time
   - Expected: Format is MM:SS
4. Click Set In while playing
   - Expected: In point set to exact current time
5. Continue playback
6. Click Set Out while playing
   - Expected: Out point set to exact current time

---

### 3. Edge Case Tests (20 minutes)

**Test: Boundary Conditions**

Test: Set In at video start (0 seconds)
- Action: Play to beginning, click "Set In"
- Expected: In point is 0, button not disabled

Test: Set Out at video end
- Action: Play to end, click "Set Out"
- Expected: Out point equals video duration, button works

Test: Set In and Out at same position (should error)
- Action: Set in at 10s, try to set out at 10s
- Expected: Set Out button disabled
- Expected: Error message shown
- Expected: No export possible

Test: Set Out before In (should error)
- Action: Set out at 20s, try to set in at 30s
- Expected: Set In button disabled at 30s
- Expected: Error message shown
- Expected: Must reset or change out point first

Test: Very short trim (< 1 second)
- Action: Set in at 10s, set out at 10.5s
- Expected: Trim duration shows "0:00" (rounds down)
- Expected: Validation prevents export (optional)

Test: Very long clip (> 10 minutes)
- Action: Import 20-minute video
- Action: Set in at 60s, set out at 120s
- Expected: Trim indicators render correctly
- Expected: Export works correctly

Test: Trim at exact boundaries
- Action: Set in at 0, set out at duration
- Expected: Full clip selected (no actual trim)
- Expected: Export produces same length as original

Test: Multiple trim/reset cycles
- Action: Set trim 5 times, reset 3 times, set trim again
- Expected: State updates correctly each time
- Expected: No memory leaks or state corruption

Test: Trim during paused playback
- Action: Pause at 25s, click "Set In"
- Expected: In point set to 25s correctly

Test: Trim during fast forward/scrub
- Action: Scrub to 40s, click "Set Out"
- Expected: Out point set to 40s correctly
- Expected: No race conditions

---

### 4. Validation Tests (15 minutes)

**Test: Input Validation**

Test: inPoint must be < outPoint
- Action: Try to set in > out
- Expected: Error message, export disabled

Test: inPoint must be >= 0
- Action: Try to set negative in point (shouldn't be possible)
- Expected: In point clamped to 0

Test: outPoint must be <= duration
- Action: Try to set out > duration
- Expected: Error message, export disabled

Test: Minimum trim duration
- Action: Set in at 10.0s, set out at 10.1s (very short)
- Expected: Validation allows (or shows warning)
- Expected: FFmpeg can handle sub-second trims

Test: Button states reflect validation
- Expected: Disabled buttons when invalid
- Expected: Enabled buttons when valid
- Expected: Tooltips explain why disabled

---

### 5. Export Tests (30 minutes)

**Test: Export with Trim**

Test: Export full clip (no trim)
- Input: Default trim (0 to duration)
- Expected: Export completes
- Expected: Exported file duration equals original
- Expected: File plays correctly

Test: Export with start trim (inPoint > 0)
- Input: inPoint = 30, outPoint = duration
- Expected: Export includes only last portion
- Expected: Exported duration equals `duration - inPoint`
- Expected: Exported video starts at inPoint content

Test: Export with end trim (outPoint < duration)
- Input: inPoint = 0, outPoint = 60
- Expected: Export includes only first 60 seconds
- Expected: Exported duration is 60 seconds
- Expected: Exported video ends at outPoint content

Test: Export with both trims (segment)
- Input: inPoint = 30, outPoint = 90
- Expected: Export includes 30-90 second segment
- Expected: Exported duration is 60 seconds
- Expected: Exported video contains correct segment

Test: Export with very short trim
- Input: inPoint = 10, outPoint = 11
- Expected: Export includes 1-second segment
- Expected: Exported video is very short but plays
- Expected: No FFmpeg errors

Test: Export with trim at exact boundaries
- Input: inPoint = 0, outPoint = duration
- Expected: Exported video identical to no trim
- Expected: No unnecessary re-encoding

Test: Verify exported video content
- Input: Set in during action shot, set out during slow moment
- Expected: Exported video shows only that segment
- Expected: Content matches expectations

---

### 6. Visual Regression Tests (15 minutes)

**Test: Timeline Trim Indicators**

Test: Trim indicators appear on selected clip
- Action: Import clip, select it, set trim
- Expected: Trim indicators visible on timeline
- Expected: Darkened regions outside trim
- Expected: Highlighted region inside trim

Test: Trim indicators update on trim change
- Action: Change in point
- Expected: Darkened left region adjusts
- Expected: Highlighted region adjusts

Test: Trim indicators clear on reset
- Action: Reset trim
- Expected: No darkened or highlighted regions
- Expected: Full clip visible

Test: Trim indicators clear on clip change
- Action: Set trim on clip A, select clip B
- Expected: Clip A still has indicators
- Expected: Clip B has no indicators

Test: Multiple clips with different trims
- Action: Import 3 clips, set different trims
- Action: Switch between clips
- Expected: Each clip shows its own trim state
- Expected: Indicators update on selection

---

## Acceptance Criteria

**Feature is complete when:**

**Hard Requirements (Must Pass):**
- [ ] Can set in-point to current playback position
- [ ] Can set out-point to current playback position
- [ ] Trim times display correctly (formatted as MM:SS)
- [ ] Trim indicators show on timeline visually
- [ ] Export respects trim settings
- [ ] Exported video has correct duration (matches outPoint - inPoint)
- [ ] Trim resets on clip selection
- [ ] Reset button clears trim settings
- [ ] Set In/Out buttons disabled when out of bounds
- [ ] Error message shown when trim invalid

**Quality Indicators (Should Pass):**
- [ ] Current time updates smoothly during playback
- [ ] Trim indicators are visually clear
- [ ] Buttons have helpful tooltips
- [ ] Error messages are user-friendly
- [ ] No console errors during trim workflow
- [ ] Timeline updates instantly on trim change
- [ ] Export progress shows during export
- [ ] Exported video plays in external player

**Performance Targets:**
- Time updates: < 100ms delay (acceptable for 60fps)
- Trim settings: Update instantly (< 50ms)
- Export: Normal FFmpeg export time + trim overhead (~2-5s for typical clip)
- Timeline rendering: Update instantly on trim change
- Memory: No memory leaks on multiple trim operations

**Quality Gates:**
- Zero critical bugs blocking workflow
- All features work as expected
- Error handling prevents user frustration
- Visual feedback is obvious and accurate
- Code is maintainable and documented

---

## Manual Testing Checklist

### Setup
- [ ] App launched successfully
- [ ] Video file imported
- [ ] Video plays correctly
- [ ] Timeline shows imported clip
- [ ] No console errors on startup

### Trim Workflow
- [ ] Play video and verify current time updates
- [ ] Scrub to 10 seconds
- [ ] Click "Set In" - in point displays "0:10"
- [ ] Scrub to 45 seconds
- [ ] Click "Set Out" - out point displays "0:45"
- [ ] Trim duration shows "0:35"
- [ ] Timeline shows trim indicators:
  - [ ] Region before 10s darkened
  - [ ] Region 10s-45s highlighted
  - [ ] Region after 45s darkened
- [ ] Click "Reset Trim" - trim clears
- [ ] Set trim again on same clip
- [ ] Select different clip - trim resets
- [ ] Select original clip - trim is back

### Export
- [ ] Set trim to 10-45 seconds
- [ ] Click "Export"
- [ ] Save dialog appears
- [ ] Choose export location
- [ ] Export completes
- [ ] Exported file duration is ~35 seconds
- [ ] Exported file plays in VLC/QuickTime
- [ ] Exported content matches trimmed segment

### Edge Cases
- [ ] Try to set in after out (should disable)
- [ ] Try to set out before in (should disable)
- [ ] Set trim to full clip (0 to duration)
- [ ] Export full clip (should work)
- [ ] Set very short trim (< 1 second)
- [ ] Set trim at video start (0:00)
- [ ] Set trim at video end
- [ ] Reset while playback is active
- [ ] Change trim while exporting (should work or error gracefully)

### Validation
- [ ] Invalid trim shows error message
- [ ] Buttons disabled when invalid
- [ ] Error message clears when valid
- [ ] Export disabled when invalid
- [ ] Helpful tooltips explain disabled state

---

## Automated Testing (Future)

When time allows, consider adding unit tests for:
- formatDuration() utility function
- Validation logic (isValid function)
- State updates (handleSetInPoint, handleSetOutPoint)

Example test structure:
```javascript
describe('TrimControls', () => {
  it('renders current time correctly', () => {
    render(<TrimControls currentTime={15} duration={60} />);
    expect(screen.getByText('0:15 / 1:00')).toBeInTheDocument();
  });

  it('calls onSetInPoint when Set In clicked', () => {
    const onSetInPoint = jest.fn();
    render(<TrimControls onSetInPoint={onSetInPoint} />);
    fireEvent.click(screen.getByText('Set In'));
    expect(onSetInPoint).toHaveBeenCalled();
  });

  it('disables Set Out button when currentTime <= inPoint', () => {
    render(<TrimControls currentTime={10} inPoint={15} />);
    const button = screen.getByText('Set Out');
    expect(button).toBeDisabled();
  });
});
```

---

## Test Data

**Sample Videos for Testing:**
- Short clip: 30 seconds, < 50MB
- Medium clip: 2 minutes, ~100MB
- Long clip: 10 minutes, ~500MB
- Test clips with distinct content at different timepoints
- Test clip with audio (verify audio included in export)

**Trim Scenarios:**
- First 10 seconds
- Last 10 seconds
- Middle segment (30-60 seconds from 2-minute clip)
- Very short segment (< 1 second)
- Full clip (0 to duration)

---

## Bug Reporting Template

If you encounter bugs during testing:

**Bug Title:** [Brief description]

**Severity:** [CRITICAL/HIGH/MEDIUM/LOW]

**Steps to Reproduce:**
1. [Action 1]
2. [Action 2]
3. [Action 3]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Console Errors:**
[Any errors in console]

**Environment:**
- OS: [macOS/Windows]
- Electron version: [version]
- React version: [version]

---

## Success Criteria

### Completion
Feature is complete and ready to merge when:
- [ ] All acceptance criteria pass
- [ ] All manual tests pass
- [ ] Export produces correctly trimmed video
- [ ] No console errors
- [ ] Code committed and pushed
- [ ] Ready for user testing

### Quality
Feature is production-ready when:
- [ ] Works consistently across multiple test runs
- [ ] Export produces high-quality video
- [ ] Timeline indicators are accurate
- [ ] Performance is acceptable
- [ ] User feedback is positive

---

**Document Status:** Testing Guide Complete  
**Next Action:** Execute tests during implementation Phase 6

