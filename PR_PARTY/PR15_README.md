# PR#15: Split & Delete Clips - Quick Start

---

## TL;DR (30 seconds)

**What:** Split clips at playhead and delete single or multiple clips from timeline  
**Why:** Essential editing operations that transform ClipForge into a professional video editor  
**Time:** 4-6 hours estimated  
**Complexity:** HIGH  
**Status:** ✅ COMPLETE & DEPLOYED

---

## Decision Framework (2 minutes)

### Should You Build This?

**Build it if:**
- ✅ PR #11-#14 complete (foundation established)
- ✅ Timeline is working and stable
- ✅ Context menu component exists (PR#12)
- ✅ Keyboard shortcuts infrastructure ready
- ✅ You have 4-6 hours available

**Skip it if:**
- ❌ Timeline architecture not stable (fix first)
- ❌ Context menu component doesn't exist (PR#12 prerequisite)
- ❌ Undo/redo system not ready (operations need undo support)
- ❌ Time-constrained (<4 hours)

**Decision Aid:** Split and delete are fundamental operations - defer only if critical bugs exist in foundation.

---

## Prerequisites (5 minutes)

### Required
- [x] PR #11 deployed (State Management Refactor)
- [x] PR #12 deployed (UI Component Library - ContextMenu)
- [x] PR #13 deployed (Multi-Track Timeline UI)
- [x] PR #14 deployed (Drag & Drop Clips)
- [x] TimelineContext working correctly
- [x] useTimeline hook functional

### Setup Commands
```bash
# 1. Verify timeline is working
npm start
# Test: Import clip, add to timeline, verify it appears

# 2. Create branch
git checkout -b feature/pr15-split-delete-clips

# 3. No new dependencies needed
```

---

## Getting Started (First Hour)

### Step 1: Read Documentation (45 minutes)
- [ ] Read this quick start (10 min)
- [ ] Read main specification (30 min) - `PR15_SPLIT_DELETE_CLIPS.md`
- [ ] Review implementation checklist (5 min)
- [ ] Note any questions

### Step 2: Understand Split Approach (15 minutes)
- [ ] Review non-destructive split strategy (trim points)
- [ ] Understand why this is better than file splitting
- [ ] Review split time calculation (relative vs absolute)
- [ ] Check how first and second clips are created

**Key Concept:** Split uses trim points, not file operations. This makes it instant and undo-friendly.

---

## Daily Progress Template

### Day 1 Goals (4-6 hours)
- [ ] Phase 1: Split Clip Reducer (1 hour)
  - [ ] Add SPLIT_CLIP reducer action
  - [ ] Add splitClip function to context
  - [ ] Add wrapper to useTimeline hook
- [ ] Phase 2: Delete Clip Reducer (30 min)
  - [ ] Add REMOVE_CLIP reducer action
  - [ ] Add removeClip function to context
  - [ ] Add wrapper to useTimeline hook
- [ ] Phase 3: Context Menu Component (2 hours)
  - [ ] Create ClipContextMenu component
  - [ ] Style context menu
  - [ ] Integrate into Clip component
- [ ] Phase 4: Keyboard Shortcuts (1 hour)
  - [ ] Add split shortcut (Cmd+B)
  - [ ] Add delete shortcut (Delete)
  - [ ] Add duplicate shortcut (Cmd+D)
- [ ] Phase 5: Integration & Testing (1.5 hours)
  - [ ] Verify toolbar integration
  - [ ] Comprehensive testing
  - [ ] Bug fixes

**Checkpoint:** Split and delete operations working ✓

---

## Common Issues & Solutions

### Issue 1: Split Time Calculation Error ✅ FIXED
**Symptoms:** Split creates clips with wrong durations  
**Cause:** Using absolute time instead of relative time (or vice versa)  
**Solution:** Always pass absolute timeline time to `splitClip`, reducer calculates relative internally
```javascript
// ✅ Correct: Pass absolute timeline time (playhead)
splitClip(clip.id, playhead);

// ❌ Wrong: Calculate relative time yourself
const relativeTime = playhead - clip.startTime;
splitClip(clip.id, relativeTime); // Reducer expects absolute!
```
**Status:** Fixed by passing `playhead` (absolute) directly to `splitClip` function.

### Issue 2: Context Menu Not Appearing
**Symptoms:** Right-click does nothing  
**Cause:** Missing right-click handler or portal rendering issue  
**Solution:** 
1. Check `handleContextMenu` is called on Clip component
2. Verify `e.preventDefault()` is called
3. Check portal rendering (learned from PR#12)
4. Verify z-index is high enough

### Issue 3: Keyboard Shortcuts Not Working
**Symptoms:** Cmd+B / Delete keys do nothing  
**Cause:** Event listeners not set up or selection is empty  
**Solution:**
1. Verify `useKeyboardShortcuts` hook is used in App component
2. Check clips are selected (shortcuts only work with selection)
3. Verify modifier keys (Cmd/Ctrl) are detected correctly
4. Check `e.preventDefault()` is called

### Issue 4: Split Validation Failing
**Symptoms:** Split button disabled even when playhead is on clip  
**Cause:** Playhead time calculation or clip boundary check  
**Solution:**
```javascript
// Check calculation:
const canSplit = playhead > clip.startTime && 
                 playhead < clip.startTime + clip.duration;
// Verify playhead is absolute timeline time
// Verify clip.startTime and clip.duration are correct
```

### Issue 5: Multi-Select Delete Not Working ✅ FIXED
**Symptoms:** Only one clip deleted when multiple selected  
**Cause:** Loop through selection array not implemented  
**Solution:**
```javascript
// ✅ Correct: Delete all selected clips
selectedClips.forEach(clip => {
  removeClip(clip.id);
});
```
**Status:** Fixed in toolbar button handlers - loops through `getSelectedClips()`.

### Issue 6: Playhead Snapping Back / Playback Stopping ✅ FIXED
**Symptoms:** Playhead jumps to beginning, first frames repeat, timeline won't play  
**Cause:** Coordinate system mismatch and feedback loop  
**Solution:**
1. Use absolute timeline time consistently throughout
2. Don't call `onTimeUpdate` during video load (only during playback)
3. Don't include `playhead` in video reload dependency array
**Status:** Fixed by standardizing coordinate system and removing feedback loops.

### Issue 7: Toolbar Buttons Not Working ✅ FIXED
**Symptoms:** Split/Delete buttons in toolbar don't do anything  
**Cause:** Buttons not wired up to functions  
**Solution:** Implement `handleSplitAction` and `handleDeleteAction` in `App.js`  
**Status:** Fixed - all toolbar buttons now functional with validation.

---

## Quick Reference

### Key Files
- `src/context/TimelineContext.js` - Split/delete reducer actions
- `src/hooks/useTimeline.js` - Split/delete function wrappers
- `src/components/timeline/ClipContextMenu.js` - Context menu component
- `src/hooks/useKeyboardShortcuts.js` - Keyboard shortcut handlers
- `src/components/timeline/Clip.js` - Context menu integration

### Key Functions
- `splitClip(clipId, splitTime)` - Split clip at absolute timeline time
- `removeClip(clipId)` - Delete single clip
- `duplicateClip(clipId, startTime?)` - Duplicate clip (bonus)

### Key Concepts
- **Non-destructive split:** Uses trim points, not file operations
- **Relative split time:** `splitTime - clip.startTime` (within clip bounds)
- **Multi-select delete:** Loop through `selection.clips` array
- **Portal rendering:** Context menu uses portal for z-index management

### Useful Commands
```bash
# Run development server
npm start

# Test split operation
# 1. Import clip
# 2. Add to timeline
# 3. Position playhead on clip
# 4. Right-click → Split or press Cmd+B

# Test delete operation
# 1. Select clip(s)
# 2. Right-click → Delete or press Delete key
```

---

## Success Metrics

**You'll know it's working when:**
- [x] Right-click on clip shows context menu
- [x] Split at playhead creates two clips
- [x] Delete removes clip from timeline
- [x] Multi-select delete removes all selected clips
- [x] Keyboard shortcuts work (Cmd+B, Delete, Cmd+D)
- [x] Toolbar buttons work (split, delete, undo, redo)
- [x] Undo/redo works for all operations
- [x] Timeline plays seamlessly through all clips
- [x] Playhead moves smoothly without snapping back
- [x] Continuous playback advances to next clip automatically

**Performance Targets:**
- Split operation: < 100ms (instant)
- Delete operation: < 50ms (instant)
- Context menu: < 50ms open time
- Keyboard response: < 100ms

---

## Help & Support

### Stuck?
1. Check main planning doc for architecture details
2. Review PR#12 context menu implementation (similar pattern)
3. Review PR#13 timeline reducer patterns (similar structure)
4. Check bug analysis docs for similar issues

### Want to Skip a Feature?
- **Copy/Paste:** Can skip (currently just duplicates)
- **Split at click:** Can skip (playhead split is standard)
- **Ripple effect for delete:** Not needed (no time shifts)

### Running Out of Time?
**Prioritize:**
1. Split functionality (essential)
2. Delete functionality (essential)
3. Context menu (discoverability)
4. Keyboard shortcuts (power users)
5. Toolbar buttons (already exist from PR#12)

---

## Motivation

**You've got this!** 💪

Split and delete are the essential operations that transform ClipForge from a basic trim editor into a professional video editor. Once these work, users can create polished videos by removing unwanted segments and splitting clips precisely.

The implementation is straightforward - simple reducer operations, context menu integration, and keyboard shortcuts. You're building on a solid foundation from PR#13, so this should be smooth!

---

## Next Steps

**When ready:**
1. Run prerequisites (5 min)
2. Read main spec (45 min)
3. Start Phase 1 from checklist
4. Commit early and often

**Status:** Ready to build! 🚀

