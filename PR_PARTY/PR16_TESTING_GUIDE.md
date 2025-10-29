# PR#16: Testing Guide

## Test Categories

### 1. Unit Tests

**TimelineContext Reducer:**

**Test: SAVE_STATE Creates History Entry**
```javascript
// Test
dispatch({ type: 'SAVE_STATE' });

// Verify
expect(state.history.length).toBe(1);
expect(state.historyIndex).toBe(0);
expect(state.history[0]).toMatchObject({
  clips: [...state.clips],
  tracks: [...state.tracks],
  selection: { ...state.selection },
  playhead: state.playhead,
  zoom: state.zoom
});
```

**Test: SAVE_STATE Limits History to 50 Entries**
```javascript
// Setup: Create 51 state saves
for (let i = 0; i < 51; i++) {
  dispatch({ type: 'SAVE_STATE' });
}

// Verify
expect(state.history.length).toBe(50);
expect(state.historyIndex).toBe(49);
```

**Test: UNDO Reverts to Previous State**
```javascript
// Setup
const initialState = { clips: [...], tracks: [...], selection: {...}, playhead: 0, zoom: 1 };
dispatch({ type: 'SAVE_STATE' }); // historyIndex = 0
// Make change (add clip)
dispatch({ type: 'ADD_CLIPS', clips: [newClip] });
dispatch({ type: 'SAVE_STATE' }); // historyIndex = 1

// Test
dispatch({ type: 'UNDO' });

// Verify
expect(state.historyIndex).toBe(0);
expect(state.clips).toEqual(initialState.clips);
expect(state.tracks).toEqual(initialState.tracks);
expect(state.selection).toEqual(initialState.selection);
expect(state.playhead).toBe(initialState.playhead);
expect(state.zoom).toBe(initialState.zoom);
```

**Test: UNDO Does Nothing When at Beginning**
```javascript
// Setup: At beginning of history
state.historyIndex = 0;

// Test
dispatch({ type: 'UNDO' });

// Verify
expect(state.historyIndex).toBe(0);
expect(state.clips).toEqual(currentState.clips);
```

**Test: REDO Advances to Next State**
```javascript
// Setup
dispatch({ type: 'SAVE_STATE' }); // historyIndex = 0
// Make change
dispatch({ type: 'ADD_CLIPS', clips: [newClip] });
dispatch({ type: 'SAVE_STATE' }); // historyIndex = 1
dispatch({ type: 'UNDO' }); // historyIndex = 0

// Test
dispatch({ type: 'REDO' });

// Verify
expect(state.historyIndex).toBe(1);
expect(state.clips).toContain(newClip);
```

**Test: REDO Does Nothing When at End**
```javascript
// Setup: At end of history
state.historyIndex = state.history.length - 1;

// Test
dispatch({ type: 'REDO' });

// Verify
expect(state.historyIndex).toBe(state.history.length - 1);
expect(state.clips).toEqual(currentState.clips);
```

**Test: History Branching**
```javascript
// Setup
dispatch({ type: 'SAVE_STATE' }); // historyIndex = 0
dispatch({ type: 'ADD_CLIPS', clips: [clipA] });
dispatch({ type: 'SAVE_STATE' }); // historyIndex = 1
dispatch({ type: 'ADD_CLIPS', clips: [clipB] });
dispatch({ type: 'SAVE_STATE' }); // historyIndex = 2
dispatch({ type: 'UNDO' }); // historyIndex = 1 (at clipA state)
dispatch({ type: 'ADD_CLIPS', clips: [clipC] });
dispatch({ type: 'SAVE_STATE' }); // Should remove clipB from history

// Verify
expect(state.history.length).toBe(3); // Initial, clipA, clipA+clipC
expect(state.historyIndex).toBe(2);
expect(state.history[1].clips).toContain(clipA);
expect(state.history[1].clips).not.toContain(clipB);
```

**State Snapshot Tests:**

**Test: Clips Array Deep Copied**
```javascript
// Setup
dispatch({ type: 'SAVE_STATE' });
const snapshot = state.history[0];

// Modify current state
state.clips.push(newClip);

// Verify snapshot unchanged
expect(snapshot.clips).not.toContain(newClip);
expect(snapshot.clips.length).toBeLessThan(state.clips.length);
```

**Test: Tracks Array Deep Copied**
```javascript
// Similar test for tracks array
```

**Test: Selection Object Copied**
```javascript
// Setup
dispatch({ type: 'SAVE_STATE' });
const snapshot = state.history[0];

// Modify current selection
state.selection.clips = ['new-clip-id'];

// Verify snapshot unchanged
expect(snapshot.selection.clips).not.toContain('new-clip-id');
```

---

### 2. Integration Tests

**Keyboard Shortcuts:**

**Scenario 1: Undo Keyboard Shortcut**
- [ ] Step 1: Make a change (drag clip, split clip, delete clip)
- [ ] Step 2: Press ⌘Z (Mac) or Ctrl+Z (Windows/Linux)
- [ ] Expected: Change is undone, state reverts

**Scenario 2: Redo Keyboard Shortcuts**
- [ ] Step 1: Undo a change
- [ ] Step 2: Press ⌘⇧Z or ⌘Y (Mac) or Ctrl+Shift+Z or Ctrl+Y (Windows/Linux)
- [ ] Expected: Change is redone, state restores

**Scenario 3: Keyboard Shortcut When No History**
- [ ] Step 1: Start with no history (fresh timeline)
- [ ] Step 2: Press ⌘Z
- [ ] Expected: Nothing happens (no error, no state change)

**Scenario 4: Redo When at End**
- [ ] Step 1: Make change, save, undo
- [ ] Step 2: Redo (restore state)
- [ ] Step 3: Press ⌘Y again
- [ ] Expected: Nothing happens (no error, no state change)

**Toolbar Buttons:**

**Scenario 5: Undo Button**
- [ ] Step 1: Make a change
- [ ] Step 2: Click undo button in toolbar
- [ ] Expected: Change is undone

**Scenario 6: Redo Button**
- [ ] Step 1: Undo a change
- [ ] Step 2: Click redo button in toolbar
- [ ] Expected: Change is redone

**Scenario 7: Button Disabled States**
- [ ] Step 1: Start with no history
- [ ] Expected: Undo button disabled
- [ ] Step 2: Make change, undo
- [ ] Expected: Redo button enabled
- [ ] Step 3: Make another change (after undo)
- [ ] Expected: Redo button disabled again

**Operation Integration:**

**Scenario 8: Drag Operation Undo**
- [ ] Step 1: Drag clip to new position
- [ ] Step 2: Press ⌘Z
- [ ] Expected: Clip returns to original position

**Scenario 9: Split Operation Undo**
- [ ] Step 1: Split clip at playhead
- [ ] Step 2: Press ⌘Z
- [ ] Expected: Split is undone, original clip restored

**Scenario 10: Delete Operation Undo**
- [ ] Step 1: Delete clip
- [ ] Step 2: Press ⌘Z
- [ ] Expected: Deleted clip is restored

**Scenario 11: Duplicate Operation Undo**
- [ ] Step 1: Duplicate clip
- [ ] Step 2: Press ⌘Z
- [ ] Expected: Duplicate is removed

---

### 3. Edge Cases

**Empty History:**
- [ ] canUndo() returns false when historyIndex === -1
- [ ] Undo does nothing when no history
- [ ] canRedo() returns false when at end of history
- [ ] Redo does nothing when at end of history
- [ ] Undo button disabled when no history
- [ ] Redo button disabled when at end of history

**History Branching:**
- [ ] Undo then new action clears future history
- [ ] History correctly truncates when new action after undo
- [ ] HistoryIndex updates correctly on branch
- [ ] Can't redo actions that were cleared by branching

**Memory Management:**
- [ ] History never exceeds 50 entries
- [ ] Oldest entries are removed when limit reached
- [ ] HistoryIndex adjusts correctly when entries removed
- [ ] Memory usage stays reasonable (<50MB for 50 states)

**Rapid Operations:**
- [ ] Multiple rapid saveState() calls handled correctly
- [ ] Undo/redo work correctly after rapid operations
- [ ] No memory leaks with rapid operations
- [ ] UI remains responsive during rapid operations

**State Copying:**
- [ ] Modifying history entry doesn't affect current state
- [ ] Modifying current state doesn't affect history entries
- [ ] Deep copy prevents reference sharing bugs
- [ ] Clips array independence verified
- [ ] Tracks array independence verified
- [ ] Selection object independence verified

---

### 4. Performance Tests

**History Creation:**
- [ ] saveState() completes in <10ms for typical timeline (10 clips)
- [ ] saveState() completes in <50ms for large timeline (100 clips)
- [ ] State snapshot size reasonable (<1MB per snapshot)

**Undo/Redo Operations:**
- [ ] Undo completes in <50ms for typical timeline
- [ ] Undo completes in <200ms for large timeline
- [ ] Redo completes in <50ms for typical timeline
- [ ] Redo completes in <200ms for large timeline
- [ ] No UI freezing during undo/redo

**Memory Usage:**
- [ ] 10-state history uses <10MB memory
- [ ] 50-state history uses <50MB memory
- [ ] Memory doesn't grow unbounded with operations
- [ ] Garbage collection frees old history entries

**Stress Tests:**
- [ ] 100 rapid saveState() calls handled correctly
- [ ] 50 undo operations in sequence work correctly
- [ ] 50 redo operations in sequence work correctly
- [ ] Undo/redo cycles don't cause memory leaks

---

### 5. User Experience Tests

**Workflow: Experiment Freely**
- [ ] Make multiple changes (drag, split, delete)
- [ ] Undo multiple times to try different arrangement
- [ ] Redo to get back to preferred state
- [ ] Make new changes and verify they save correctly

**Workflow: Mistake Recovery**
- [ ] Accidentally delete important clip
- [ ] Press ⌘Z immediately
- [ ] Expected: Clip restored instantly
- [ ] Continue editing normally

**Workflow: History Branching**
- [ ] Make change A, save
- [ ] Make change B, save
- [ ] Undo to A
- [ ] Make change C, save
- [ ] Try to redo to B
- [ ] Expected: Can't redo to B (cleared by branching)

---

## Acceptance Criteria

**Feature is complete when:**

- [x] ✅ All timeline operations support undo/redo (drag, split, delete, duplicate)
- [x] ✅ Keyboard shortcuts work (⌘Z, ⌘⇧Z, ⌘Y)
- [x] ✅ Toolbar buttons work and show correct disabled state
- [x] ✅ History limited to 50 entries (memory safety)
- [x] ✅ State snapshots preserve all timeline state correctly
- [x] ✅ No memory leaks with extended use
- [x] ✅ Works seamlessly with all timeline operations
- [x] ✅ Undo/redo operations complete in <50ms
- [x] ✅ No UI freezing during operations
- [x] ✅ All edge cases handled correctly

**Performance Targets:**
- ✅ Undo operation: <50ms
- ✅ Redo operation: <50ms
- ✅ saveState() operation: <10ms
- ✅ Memory per snapshot: <1MB
- ✅ Total memory for 50 states: <50MB

**Quality Gates:**
- ✅ Zero critical bugs
- ✅ All edge cases handled
- ✅ No console errors
- ✅ Smooth user experience

---

## Test Checklist

**Before Starting Tests:**
- [ ] Timeline working correctly
- [ ] Can drag clips
- [ ] Can split clips
- [ ] Can delete clips
- [ ] Can duplicate clips

**Unit Tests:**
- [ ] SAVE_STATE creates history entry
- [ ] SAVE_STATE limits to 50 entries
- [ ] UNDO reverts to previous state
- [ ] UNDO does nothing at beginning
- [ ] REDO advances to next state
- [ ] REDO does nothing at end
- [ ] History branching works correctly
- [ ] State snapshots are independent

**Integration Tests:**
- [ ] Keyboard shortcuts work
- [ ] Toolbar buttons work
- [ ] Button disabled states correct
- [ ] Drag operation undo works
- [ ] Split operation undo works
- [ ] Delete operation undo works
- [ ] Duplicate operation undo works

**Edge Cases:**
- [ ] Empty history handled
- [ ] History branching handled
- [ ] Memory management verified
- [ ] Rapid operations handled
- [ ] State copying verified

**Performance:**
- [ ] saveState() performance acceptable
- [ ] Undo/redo performance acceptable
- [ ] Memory usage reasonable
- [ ] Stress tests pass

---

## Manual Testing Script

**Quick Test (5 minutes):**
1. Import clip to timeline
2. Drag clip to new position
3. Press ⌘Z - clip should return to original position
4. Press ⌘⇧Z - clip should move back to new position
5. Split clip at playhead
6. Press ⌘Z - split should be undone
7. Delete clip
8. Press ⌘Z - clip should be restored
9. ✅ All undo/redo working correctly

**Comprehensive Test (15 minutes):**
1. Import 5 clips to timeline
2. Drag clips around to different positions
3. Split 2 clips
4. Delete 1 clip
5. Duplicate 1 clip
6. Undo 10 times (should restore original state)
7. Redo 10 times (should restore final state)
8. Make new change after undo (should clear future history)
9. Try to redo (should not work - history cleared)
10. ✅ All operations working correctly

---

## Bug Reporting Template

If bugs are found during testing:

**Bug Report:**
- **Operation:** [What operation was being undone/redone]
- **Steps to Reproduce:** [Step-by-step]
- **Expected:** [What should happen]
- **Actual:** [What actually happened]
- **History State:** [history.length, historyIndex value]
- **Console Errors:** [Any errors in console]

