# PR#5: Testing Guide - Timeline Component

**Estimated Testing Time:** 30 minutes  
**Testing Approach:** Manual testing + visual verification  
**Critical Path:** Timeline → App state → VideoPlayer integration

---

## Test Categories

### 1. Unit Tests (Component Rendering)

**Test:** Timeline renders without clips  
**Input:** Empty clips array `[]`  
**Expected:** Empty state message displayed  
**Status:** ⏳ Not started

```javascript
// Test case
const Timeline = require('./Timeline');
const result = render(<Timeline clips={[]} selectedClipId={null} />);
expect(result.getByText('No clips imported')).toBeInTheDocument();
```

**Test:** Timeline renders single clip  
**Input:** `[{id: '1', name: 'test.mp4', duration: 60}]`  
**Expected:** One clip block displayed  
**Status:** ⏳ Not started

**Test:** Timeline renders multiple clips  
**Input:** 3+ clips with varying durations  
**Expected:** All clips displayed proportionally  
**Status:** ⏳ Not started

---

### 2. Width Calculation Tests

**Test:** Widths are proportional to duration  
**Input:** Clip 1 (60s), Clip 2 (120s), Clip 3 (60s)  
**Expected:** Clip 2 is twice the width of Clip 1 and 3  
**Status:** ⏳ Not started

**Test:** Very short clip (1 second)  
**Input:** Clip with duration: 1  
**Expected:** Visible on timeline, perhaps min-width applied  
**Status:** ⏳ Not started

**Test:** Very long clip (3600 seconds)  
**Input:** Clip with duration: 3600  
**Expected:** Extends beyond viewport, horizontal scroll works  
**Status:** ⏳ Not started

**Test:** Same duration clips  
**Input:** Multiple clips with identical durations  
**Expected:** Equal widths  
**Status:** ⏳ Not started

---

### 3. Selection Tests

**Test:** Clicking clip selects it  
**Input:** Click on any clip block  
**Expected:** selectedClipId updates to clicked clip's ID  
**Status:** ⏳ Not started

**Test:** Only one clip selected at a time  
**Input:** Click clip A, then click clip B  
**Expected:** Only clip B highlighted  
**Status:** ⏳ Not started

**Test:** Visual highlight works  
**Input:** Click any clip  
**Expected:** Selected clip has border-color: primary, background: primary  
**Status:** ⏳ Not started

**Test:** Selection persists  
**Input:** Import new clip after selecting one  
**Expected:** Previously selected clip stays selected  
**Status:** ⏳ Not started

---

### 4. Integration Tests (Timeline → App → Player)

**Test:** Selection updates VideoPlayer  
**Input:** Click clip A → Click clip B  
**Expected:** VideoPlayer loads clip B  
**Status:** ⏳ Not started

**Test:** Player receives correct clip data  
**Input:** Select clip with path `/path/to/video.mp4`  
**Expected:** VideoPlayer receives `clip={videoClipObj}`  
**Status:** ⏳ Not started

**Test:** Player loads after selection change  
**Input:** Select clip  
**Expected:** Player shows video for selected clip  
**Status:** ⏳ Not started

**Test:** Import new clip updates timeline  
**Input:** Import clip via ImportPanel  
**Expected:** New clip appears on timeline  
**Status:** ⏳ Not started

---

### 5. Empty State Tests

**Test:** Empty state displays when no clips  
**Input:** clips = []  
**Expected:** Helpful message visible: "No clips imported"  
**Status:** ⏳ Not started

**Test:** Empty state hides when clips exist  
**Input:** Import first clip  
**Expected:** Empty state disappears, clip appears  
**Status:** ⏳ Not started

**Test:** Empty state is helpful  
**Input:** Show empty timeline to user  
**Expected:** Message guides user to import files  
**Status:** ⏳ Not started

---

### 6. Display Tests

**Test:** Clip names are visible  
**Input:** Clips with various names  
**Expected:** Names displayed on each clip block  
**Status:** ⏳ Not started

**Test:** Clip durations are visible  
**Input:** Clips with durations 30, 60, 120 seconds  
**Expected:** "0:30", "1:00", "2:00" displayed  
**Status:** ⏳ Not started

**Test:** Long clip names truncate  
**Input:** Clip with name "very-long-file-name-extending-beyond-clip-width.mp4"  
**Expected:** Name truncated with ellipsis  
**Status:** ⏳ Not started

**Test:** Timeline header shows metadata  
**Input:** 3 clips totaling 180 seconds  
**Expected:** Header shows "3 clips • 3:00 total"  
**Status:** ⏳ Not started

---

### 7. Responsive Design Tests

**Test:** Works at minimum width (800px)  
**Input:** Resize window to 800px width  
**Expected:** Timeline displays correctly, scroll works  
**Status:** ⏳ Not started

**Test:** Works at maximum width  
**Input:** Resize window to fullscreen  
**Expected:** Clips spread proportionally  
**Status:** ⏳ Not started

**Test:** Horizontal scroll smooth  
**Input:** Many long clips exceeding viewport  
**Expected:** Smooth horizontal scroll  
**Status:** ⏳ Not started

**Test:** Hover effects work  
**Input:** Hover over clip blocks  
**Expected:** Visual feedback (transform, shadow)  
**Status:** ⏳ Not started

---

### 8. Edge Cases

**Test:** Duration is 0  
**Input:** Clip with duration: 0  
**Expected:** Handled gracefully (skip or show as dot)  
**Status:** ⏳ Not started

**Test:** Negative duration (invalid data)  
**Input:** Clip with duration: -5  
**Expected:** Handled gracefully, doesn't crash  
**Status:** ⏳ Not started

**Test:** Missing clip name  
**Input:** Clip with name: undefined  
**Expected:** Handled gracefully, shows fallback  
**Status:** ⏳ Not started

**Test:** Very large number of clips (50+)  
**Input:** Import 50 clips  
**Expected:** Timeline renders without lag  
**Status:** ⏳ Not started

---

### 9. Performance Tests

**Test:** Timeline renders 10 clips without lag  
**Input:** Import 10 clips  
**Expected:** Timeline appears instantly  
**Status:** ⏳ Not started

**Test:** Selection updates instantly  
**Input:** Click rapidly between clips  
**Expected:** Selection updates immediately (<100ms)  
**Status:** ⏳ Not started

**Test:** No memory leaks on import  
**Input:** Import → Select → Import → Select (repeated)  
**Expected:** Memory usage stable  
**Status:** ⏳ Not started

**Test:** Timeline updates on import quickly  
**Input:** Import clip  
**Expected:** Timeline updates in <200ms  
**Status:** ⏳ Not started

---

### 10. Visual Regression Tests

**Test:** Layout matches design mockups  
**Input:** Compare to design spec  
**Expected:** Layout matches  
**Status:** ⏳ Not started

**Test:** Selected state is obvious  
**Input:** Visual inspection  
**Expected:** Selected clip clearly differentiated  
**Status:** ⏳ Not started

**Test:** Empty state is inviting  
**Input:** Visual inspection  
**Expected:** Encourages user action  
**Status:** ⏳ Not started

**Test:** Hover effects provide clear feedback  
**Input:** Hover inspection  
**Expected:** Hover state is obvious  
**Status:** ⏳ Not started

---

## Manual Testing Checklist

### Before Starting Tests
- [ ] App launches in dev mode
- [ ] Console clear of errors
- [ ] PR #2 (Import) working
- [ ] PR #3 (Player) working
- [ ] Test videos ready (various lengths)

### Quick Smoke Tests (5 minutes)
- [ ] Launch app
- [ ] Import one video
- [ ] Verify timeline shows clip
- [ ] Click clip
- [ ] Verify player loads it

### Full Test Suite (25 minutes)
- [ ] Empty timeline test
- [ ] Single clip test
- [ ] Multiple clips test
- [ ] Width proportional test
- [ ] Selection highlight test
- [ ] Player integration test
- [ ] Metadata display test
- [ ] Hover effects test
- [ ] Responsive design test
- [ ] Edge cases test

---

## Acceptance Criteria

### Hard Requirements (Must Pass)
- [ ] Timeline displays imported clips
- [ ] Clip names visible on timeline
- [ ] Clip durations visible and accurate
- [ ] Clip widths proportional to duration
- [ ] Clicking clip selects it
- [ ] Selected clip highlighted visually
- [ ] Selecting clip loads it in player
- [ ] Empty state shows when no clips
- [ ] Timeline updates on new import

### Quality Gates (Should Pass)
- [ ] No console errors
- [ ] Performance acceptable (10+ clips smooth)
- [ ] Selection updates instantly
- [ ] Responsive to window resize
- [ ] Hover states provide feedback
- [ ] Empty state is helpful
- [ ] Visual design is polished

---

## Test Data Scenarios

### Scenario 1: Happy Path
**Setup:**
1. Launch app
2. Import 3 video clips (30s, 60s, 30s)
3. Click first clip
4. Verify player loads

**Expected:**
- Timeline shows 3 clips proportionally
- First clip auto-selected
- Player shows first clip
- Clicking other clips updates player
- Metadata shows "3 clips • 2:00 total"

---

### Scenario 2: Empty State
**Setup:**
1. Launch app
2. Do not import any clips

**Expected:**
- Empty timeline visible
- Helpful message displayed
- Hint about importing files
- Visual design inviting

---

### Scenario 3: Long Timeline
**Setup:**
1. Import 5 long clips (180+ seconds each)
2. Resize window to minimum width

**Expected:**
- All clips visible
- Horizontal scroll works
- Widths proportional
- Metadata accurate

---

### Scenario 4: Selection Workflow
**Setup:**
1. Import 3 clips
2. Click clip 1
3. Click clip 2
4. Import clip 4

**Expected:**
- Clip 1 highlights on click
- Clip 2 highlights when clicked (clip 1 deselected)
- Player loads each selected clip
- Selection persists after importing clip 4

---

## Performance Benchmarks

### Target Metrics
| Metric | Target | Acceptable | Test Command |
|--------|--------|------------|--------------|
| 10-clip render time | <100ms | <200ms | Measure component render |
| Selection update | <100ms | <200ms | Measure state update |
| Timeline update on import | <200ms | <500ms | Measure after import |
| Memory usage (10 clips) | <50MB | <100MB | DevTools Memory Profiler |

---

## Integration Testing

### Timeline → App State Flow
**Test:** Selection updates App state
1. Click clip with id='clip-123'
2. Check App.js state: `selectedClipId` === 'clip-123'
3. Verify Timeline re-renders with updated selectedClipId

**Test:** Player receives updated clip
1. Select clip A (player shows A)
2. Click clip B
3. Verify VideoPlayer receives clip B data

### Timeline → VideoPlayer Flow
**Test:** Player loads selected clip
1. Import clip
2. Click clip on timeline
3. Verify VideoPlayer video.src matches clip.path

---

## Regression Tests (After Future PRs)

### After PR #6 (Trim)
- [ ] Timeline shows trim indicators (if visual indicators added)
- [ ] Selecting trimmed clip works
- [ ] Trim data persists when selecting other clips

### After PR #7 (UI Polish)
- [ ] Timeline styling consistent with other components
- [ ] Color scheme matches
- [ ] Typography consistent

---

## Test Execution Plan

### Phase 1: Unit Tests (10 min)
Run tests for component rendering, width calculation, and selection logic.

### Phase 2: Integration Tests (10 min)
Test Timeline → App → Player communication.

### Phase 3: Visual Tests (10 min)
Test display, hover effects, responsive design.

**Total Time:** 30 minutes

---

## Test Results Recording

### Pass/Fail Log
```markdown
## Test Results

### Unit Tests
- [ ] Timeline renders without clips - PASS
- [ ] Timeline renders single clip - PASS
- [ ] Timeline renders multiple clips - PASS

### Width Calculation
- [ ] Widths proportional to duration - PASS
- [ ] Very short clip (1 second) - PASS

### Selection
- [ ] Clicking clip selects it - PASS
- [ ] Only one selected at a time - PASS
- [ ] Visual highlight works - PASS

### Integration
- [ ] Selection updates VideoPlayer - PASS
- [ ] Player receives correct data - PASS

### Performance
- [ ] 10 clips without lag - PASS
- [ ] Selection updates instantly - PASS

### Issues Found
- [List any bugs found and when they were fixed]
```

---

## Known Limitations (For MVP)

**Acceptable Limitations:**
1. No zoom controls (horizontal scroll only)
2. No scrub/playhead dragging
3. No multi-track layers
4. No drag-drop rearrangement
5. No clip splitting from timeline
6. No clip deletion from timeline

**These are post-MVP features.**

---

## Success Definition

**Timeline component is complete when:**
- ✅ All hard requirements pass
- ✅ Integration with player works
- ✅ Visual design is polished
- ✅ Performance is acceptable
- ✅ No console errors
- ✅ Test results documented
- ✅ Ready for PR #6 (Trim Controls)

---

**Status:** ⏳ Testing not started  
**Next Action:** Begin testing after implementation complete

