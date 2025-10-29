# PR#15: Testing Guide

## Test Categories

### 1. Unit Tests - Split Clip Functionality

#### Test Case 1.1: Split Clip with Valid Split Time ✅
**Function:** `splitClip(clipId, splitTime)`  
**Input:**
- Clip ID: `"clip-1"`
- Clip: `{ id: "clip-1", startTime: 5, duration: 10, trimIn: 0, trimOut: 10 }`
- Split time: `10` (absolute timeline time, 5 seconds into clip)

**Expected:**
- First clip: `{ id: "clip-1", startTime: 5, duration: 5, trimOut: 5 }`
- Second clip: `{ id: "clip-2", startTime: 10, duration: 5, trimIn: 5, trimOut: 10 }`
- Original clip removed from array
- Both clips added to array

**Actual:** [Record result]

**Status:** ⏳ / ✅ / ❌

---

#### Test Case 1.2: Split Clip at Start Boundary ❌ Should Fail
**Function:** `splitClip(clipId, splitTime)`  
**Input:**
- Clip: `{ id: "clip-1", startTime: 5, duration: 10 }`
- Split time: `5` (at clip start)

**Expected:**
- No split occurs (validation fails)
- Original clip unchanged
- State unchanged

**Actual:** [Record result]

**Status:** ⏳ / ✅ / ❌

---

#### Test Case 1.3: Split Clip at End Boundary ❌ Should Fail
**Function:** `splitClip(clipId, splitTime)`  
**Input:**
- Clip: `{ id: "clip-1", startTime: 5, duration: 10 }`
- Split time: `15` (at clip end)

**Expected:**
- No split occurs (validation fails)
- Original clip unchanged
- State unchanged

**Actual:** [Record result]

**Status:** ⏳ / ✅ / ❌

---

#### Test Case 1.4: Split Clip with Playhead Not on Clip ❌ Should Fail
**Function:** `splitClip(clipId, splitTime)`  
**Input:**
- Clip: `{ id: "clip-1", startTime: 5, duration: 10 }`
- Split time: `20` (after clip end)

**Expected:**
- No split occurs (validation fails)
- Original clip unchanged

**Actual:** [Record result]

**Status:** ⏳ / ✅ / ❌

---

### 2. Unit Tests - Delete Clip Functionality

#### Test Case 2.1: Delete Single Clip ✅
**Function:** `removeClip(clipId)`  
**Input:**
- Clips: `[{ id: "clip-1" }, { id: "clip-2" }]`
- Clip ID: `"clip-1"`

**Expected:**
- Clip `"clip-1"` removed from array
- Clip `"clip-2"` remains
- Selection updated (clip removed from selection if selected)

**Actual:** [Record result]

**Status:** ⏳ / ✅ / ❌

---

#### Test Case 2.2: Delete Multiple Clips (Multi-Select) ✅
**Function:** `removeClip(clipId)` called multiple times  
**Input:**
- Clips: `[{ id: "clip-1" }, { id: "clip-2" }, { id: "clip-3" }]`
- Selection: `["clip-1", "clip-2"]`
- Delete both selected clips

**Expected:**
- Both `"clip-1"` and `"clip-2"` removed
- Clip `"clip-3"` remains
- Selection cleared or updated

**Actual:** [Record result]

**Status:** ⏳ / ✅ / ❌

---

#### Test Case 2.3: Delete Non-Existent Clip ✅ Should Handle Gracefully
**Function:** `removeClip(clipId)`  
**Input:**
- Clips: `[{ id: "clip-1" }]`
- Clip ID: `"clip-nonexistent"`

**Expected:**
- No error thrown
- Clips array unchanged
- State remains valid

**Actual:** [Record result]

**Status:** ⏳ / ✅ / ❌

---

### 3. Integration Tests - Context Menu

#### Test Case 3.1: Context Menu Opens on Right-Click ✅
**Scenario:** User right-clicks on clip  
**Steps:**
1. Import clip and add to timeline
2. Right-click on clip
3. Observe context menu

**Expected:**
- Context menu appears at click position
- Menu shows clip name in header
- Menu items visible (Split, Copy, Duplicate, Delete)

**Actual:** [Record result]

**Status:** ⏳ / ✅ / ❌

---

#### Test Case 3.2: Context Menu Closes on Outside Click ✅
**Scenario:** User clicks outside context menu  
**Steps:**
1. Open context menu (right-click on clip)
2. Click outside menu area
3. Observe menu

**Expected:**
- Context menu disappears
- Menu closes cleanly

**Actual:** [Record result]

**Status:** ⏳ / ✅ / ❌

---

#### Test Case 3.3: Context Menu Closes on ESC Key ✅
**Scenario:** User presses ESC while menu is open  
**Steps:**
1. Open context menu
2. Press ESC key
3. Observe menu

**Expected:**
- Context menu disappears
- Menu closes cleanly

**Actual:** [Record result]

**Status:** ⏳ / ✅ / ❌

---

#### Test Case 3.4: Split Button Disabled When Playhead Not on Clip ✅
**Scenario:** Playhead is not on clip, user opens context menu  
**Steps:**
1. Position playhead before clip start
2. Right-click on clip
3. Observe split button

**Expected:**
- Split button disabled
- Button shows tooltip: "Playhead not on clip"
- Button visually appears disabled

**Actual:** [Record result]

**Status:** ⏳ / ✅ / ❌

---

#### Test Case 3.5: Split Button Enabled When Playhead on Clip ✅
**Scenario:** Playhead is on clip, user opens context menu  
**Steps:**
1. Position playhead on clip
2. Right-click on clip
3. Observe split button

**Expected:**
- Split button enabled
- Button shows tooltip: "Split clip at playhead"
- Button is clickable

**Actual:** [Record result]

**Status:** ⏳ / ✅ / ❌

---

### 4. Integration Tests - Keyboard Shortcuts

#### Test Case 4.1: Split Shortcut Works (Cmd+B / Ctrl+B) ✅
**Scenario:** User presses split shortcut with clip selected  
**Steps:**
1. Select clip on timeline
2. Position playhead on clip
3. Press Cmd+B (Mac) or Ctrl+B (Windows)
4. Observe timeline

**Expected:**
- Clip splits at playhead position
- Two clips appear in timeline
- Operation complete

**Actual:** [Record result]

**Status:** ⏳ / ✅ / ❌

---

#### Test Case 4.2: Split Shortcut Ignored When No Selection ✅
**Scenario:** User presses split shortcut with no clip selected  
**Steps:**
1. Deselect all clips
2. Press Cmd+B / Ctrl+B
3. Observe timeline

**Expected:**
- Nothing happens
- No error thrown
- Timeline unchanged

**Actual:** [Record result]

**Status:** ⏳ / ✅ / ❌

---

#### Test Case 4.3: Delete Shortcut Works (Delete / Backspace) ✅
**Scenario:** User presses delete shortcut with clip selected  
**Steps:**
1. Select clip(s) on timeline
2. Press Delete or Backspace
3. Observe timeline

**Expected:**
- Selected clip(s) removed from timeline
- Timeline updated
- Operation complete

**Actual:** [Record result]

**Status:** ⏳ / ✅ / ❌

---

#### Test Case 4.4: Delete Shortcut Works with Multi-Select ✅
**Scenario:** User presses delete with multiple clips selected  
**Steps:**
1. Select multiple clips (Cmd+Click)
2. Press Delete or Backspace
3. Observe timeline

**Expected:**
- All selected clips removed
- Timeline updated
- Operation complete

**Actual:** [Record result]

**Status:** ⏳ / ✅ / ❌

---

#### Test Case 4.5: Duplicate Shortcut Works (Cmd+D / Ctrl+D) ✅
**Scenario:** User presses duplicate shortcut with clip selected  
**Steps:**
1. Select clip(s) on timeline
2. Press Cmd+D / Ctrl+D
3. Observe timeline

**Expected:**
- Clip(s) duplicated
- Duplicates appear after originals with 1-second offset
- Operation complete

**Actual:** [Record result]

**Status:** ⏳ / ✅ / ❌

---

### 5. Edge Cases

#### Test Case 5.1: Split Last Clip on Track ✅
**Input:**
- Single clip on timeline
- Split clip

**Expected:**
- Clip splits into two clips
- Both clips remain on timeline
- Timeline integrity maintained

**Actual:** [Record result]

**Status:** ⏳ / ✅ / ❌

---

#### Test Case 5.2: Delete Last Clip on Track ✅
**Input:**
- Single clip on timeline
- Delete clip

**Expected:**
- Clip removed
- Timeline empty (or shows empty state)
- No errors

**Actual:** [Record result]

**Status:** ⏳ / ✅ / ❌

---

#### Test Case 5.3: Delete All Clips ✅
**Input:**
- Multiple clips on timeline
- Select all clips
- Delete all

**Expected:**
- All clips removed
- Timeline empty
- No errors

**Actual:** [Record result]

**Status:** ⏳ / ✅ / ❌

---

#### Test Case 5.4: Split During Playback ✅
**Input:**
- Video playing
- Playhead moving
- Split at current playhead

**Expected:**
- Split occurs at current playhead position
- Two clips created
- Playback continues (or pauses if implemented)

**Actual:** [Record result]

**Status:** ⏳ / ✅ / ❌

---

#### Test Case 5.5: Delete During Playback ✅
**Input:**
- Video playing
- Delete clip currently playing

**Expected:**
- Clip removed
- Playback stops or moves to next clip (depending on implementation)
- No errors

**Actual:** [Record result]

**Status:** ⏳ / ✅ / ❌

---

#### Test Case 5.6: Context Menu at Screen Edge ✅
**Input:**
- Right-click clip near right edge of screen
- Open context menu

**Expected:**
- Menu appears and stays in viewport
- Menu positioned correctly (doesn't go off-screen)
- Menu is fully visible

**Actual:** [Record result]

**Status:** ⏳ / ✅ / ❌

---

#### Test Case 5.7: Split Very Short Clip ✅
**Input:**
- Clip duration: 0.1 seconds
- Split at 0.05 seconds

**Expected:**
- Split occurs (if validation allows)
- Two clips created with correct durations
- No errors

**Actual:** [Record result]

**Status:** ⏳ / ✅ / ❌

---

#### Test Case 5.8: Multi-Select Split ✅
**Input:**
- Multiple clips selected (Cmd+Click)
- Playhead on one of the clips
- Press Cmd+B

**Expected:**
- Only clips with playhead on them split
- Other selected clips unchanged
- Operation complete

**Actual:** [Record result]

**Status:** ⏳ / ✅ / ❌

---

### 6. Performance Tests

#### Test Case 6.1: Split Operation Speed ✅
**Metric:** Time to complete split operation  
**Target:** < 100ms  
**Method:**
1. Measure time before splitClip call
2. Call splitClip
3. Measure time after completion
4. Calculate difference

**Result:** [X]ms (target: < 100ms)

**Status:** ⏳ / ✅ / ❌

---

#### Test Case 6.2: Delete Operation Speed ✅
**Metric:** Time to complete delete operation  
**Target:** < 50ms  
**Method:**
1. Measure time before removeClip call
2. Call removeClip
3. Measure time after completion
4. Calculate difference

**Result:** [X]ms (target: < 50ms)

**Status:** ⏳ / ✅ / ❌

---

#### Test Case 6.3: Context Menu Open Speed ✅
**Metric:** Time from right-click to menu visible  
**Target:** < 50ms  
**Method:**
1. Measure time on contextmenu event
2. Wait for menu to appear
3. Measure time when menu visible
4. Calculate difference

**Result:** [X]ms (target: < 50ms)

**Status:** ⏳ / ✅ / ❌

---

#### Test Case 6.4: Keyboard Shortcut Response Time ✅
**Metric:** Time from keypress to operation complete  
**Target:** < 100ms  
**Method:**
1. Measure time on keydown event
2. Wait for operation completion
3. Measure time when complete
4. Calculate difference

**Result:** [X]ms (target: < 100ms)

**Status:** ⏳ / ✅ / ❌

---

### 7. Undo/Redo Integration Tests

#### Test Case 7.1: Undo Split Operation ✅
**Steps:**
1. Split clip
2. Press Cmd+Z / Ctrl+Z
3. Observe timeline

**Expected:**
- Split reversed (two clips become one)
- Timeline restored to pre-split state
- Undo works correctly

**Actual:** [Record result]

**Status:** ⏳ / ✅ / ❌

---

#### Test Case 7.2: Undo Delete Operation ✅
**Steps:**
1. Delete clip
2. Press Cmd+Z / Ctrl+Z
3. Observe timeline

**Expected:**
- Clip restored to timeline
- Timeline restored to pre-delete state
- Undo works correctly

**Actual:** [Record result]

**Status:** ⏳ / ✅ / ❌

---

#### Test Case 7.3: Redo Split Operation ✅
**Steps:**
1. Split clip
2. Undo (Cmd+Z)
3. Redo (Cmd+Shift+Z)
4. Observe timeline

**Expected:**
- Split reapplied
- Two clips appear again
- Redo works correctly

**Actual:** [Record result]

**Status:** ⏳ / ✅ / ❌

---

#### Test Case 7.4: Redo Delete Operation ✅
**Steps:**
1. Delete clip
2. Undo (Cmd+Z)
3. Redo (Cmd+Shift+Z)
4. Observe timeline

**Expected:**
- Clip removed again
- Timeline restored to deleted state
- Redo works correctly

**Actual:** [Record result]

**Status:** ⏳ / ✅ / ❌

---

## Acceptance Criteria

Feature is complete when:
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] All edge cases handled
- [ ] Performance targets met
- [ ] Undo/redo working for all operations
- [ ] No critical bugs
- [ ] Context menu accessible
- [ ] Keyboard shortcuts documented

---

## Test Results Summary

**Total Test Cases:** 35+  
**Passing:** [X]  
**Failing:** [X]  
**Not Tested:** [X]

**Performance:**
- Split: [X]ms (target: < 100ms) ✅ / ❌
- Delete: [X]ms (target: < 50ms) ✅ / ❌
- Context menu: [X]ms (target: < 50ms) ✅ / ❌
- Keyboard: [X]ms (target: < 100ms) ✅ / ❌

**Status:** ⏳ IN PROGRESS / ✅ COMPLETE / ❌ BLOCKED

---

## Notes

[Add any additional test cases or observations here]

