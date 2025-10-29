# PR#15: Split & Delete Clips

**Estimated Time:** 4-6 hours  
**Complexity:** HIGH  
**Dependencies:** PR #11 (State Management Refactor), PR #12 (UI Component Library), PR #13 (Multi-Track Timeline UI), PR #14 (Drag & Drop Clips)

---

## Overview

### What We're Building
Split & Delete Clips functionality that enables users to split video clips at the playhead position and delete unwanted clips from the timeline. This PR transforms ClipForge from a basic trim editor into a professional video editor with essential editing operations.

### Why It Matters
- **Professional Workflow**: Split and delete are fundamental operations in every video editor
- **User Experience**: Essential for creating polished videos by removing unwanted segments
- **Competitive Edge**: Professional editors must support these core operations
- **Foundation**: Sets the stage for advanced features like ripple delete, auto-ripple, and smart trimming

### Success in One Sentence
"This PR is successful when users can split clips at the playhead and delete single or multiple clips with keyboard shortcuts, context menu, and toolbar buttons, all while maintaining timeline integrity."

---

## Technical Design

### Architecture Decisions

#### Decision 1: Non-Destructive Split Approach
**Options Considered:**
1. **Re-render approach** - Split video file into two files (destructive)
2. **Trim points approach** - Use trim markers to simulate split (non-destructive)
3. **Virtual clips** - Create virtual clip references (hybrid)

**Chosen:** Trim points approach (non-destructive)

**Rationale:**
- **Performance**: Instant operation (no file processing)
- **Undo-friendly**: Can easily reverse split (merge clips)
- **Storage**: No duplicate files created
- **Flexibility**: Can adjust split point later via trim
- **Industry standard**: Used by professional editors (Premiere Pro, DaVinci Resolve)

**Trade-offs:**
- Gain: Performance, undo support, flexibility, storage efficiency
- Lose: Split points tied to trim system (acceptable trade-off)

#### Decision 2: Multi-Select Delete Support
**Options Considered:**
1. **Single delete only** - Delete one clip at a time
2. **Multi-select array** - Delete all selected clips at once
3. **Range delete** - Delete clips in time range

**Chosen:** Multi-select array (delete all selected clips)

**Rationale:**
- **User efficiency**: Delete multiple clips in one operation
- **Professional standard**: All editors support multi-select delete
- **Simple implementation**: Loop through selection array
- **Keyboard friendly**: Works with existing multi-select (Cmd+Click)

**Trade-offs:**
- Gain: User efficiency, professional workflow, simple implementation
- Lose: No range delete (can add later if needed)

#### Decision 3: Context Menu Implementation
**Options Considered:**
1. **Custom dropdown** - Build custom context menu component
2. **Portal-based context menu** - Use ContextMenu component from PR#12
3. **Toolbar-only** - No context menu, toolbar buttons only

**Chosen:** Portal-based context menu (reuse PR#12 component)

**Rationale:**
- **Consistency**: Same context menu pattern across app
- **Proven**: Portal architecture already working from PR#12
- **Accessibility**: ContextMenu has keyboard navigation
- **Discoverability**: Right-click makes operations discoverable

**Trade-offs:**
- Gain: Consistency, proven pattern, accessibility, discoverability
- Lose: Slight overhead (acceptable for UX benefit)

#### Decision 4: Split Position Strategy
**Options Considered:**
1. **Split at playhead** - Split where playhead is positioned (standard)
2. **Split at click** - Split where user clicks on clip
3. **Both options** - Support playhead and click positions

**Chosen:** Split at playhead (standard approach)

**Rationale:**
- **Industry standard**: Professional editors use playhead split (⌘B / Ctrl+B)
- **Precision**: Playhead position is visible and controlled
- **Consistency**: Matches user expectations from CapCut/Premiere Pro
- **Simplicity**: Single split method is cleaner UX

**Trade-offs:**
- Gain: Industry standard, precision, consistency, simplicity
- Lose: No click-to-split (can add as advanced feature later)

### Data Model

**State Changes:**
```javascript
// Timeline state already supports these operations
TimelineState/
├── clips: Clip[]
│   ├── Clip (first part after split)
│   │   ├── id: string (original ID)
│   │   ├── duration: number (splitTime)
│   │   ├── trimOut: number (trimIn + splitTime)
│   │   └── ... (other properties unchanged)
│   └── Clip (second part after split)
│       ├── id: string (new ID: `clip-${Date.now()}`)
│       ├── startTime: number (absolute split position)
│       ├── duration: number (original - splitTime)
│       ├── trimIn: number (original.trimIn + splitTime)
│       └── ... (other properties from original)
└── selection: SelectionState
    └── clips: string[] (updated after split/delete)
```

**Action Types:**
```javascript
// Split clip action
{
  type: 'SPLIT_CLIP',
  clipId: string,
  splitTime: number // Absolute timeline time
}

// Remove clip(s) action
{
  type: 'REMOVE_CLIP',
  clipId: string // Can be called multiple times for multi-select
}

// Duplicate clip action (bonus feature)
{
  type: 'DUPLICATE_CLIP',
  clipId: string,
  startTime?: number // Optional position
}
```

### API Design

**New Functions:**
```javascript
/**
 * Split clip at playhead position
 * @param {string} clipId - ID of clip to split
 * @param {number} splitTime - Absolute timeline time to split at
 * @returns {void}
 */
export function splitClip(clipId: string, splitTime: number): void

/**
 * Delete clip(s) from timeline
 * @param {string|string[]} clipId - Clip ID or array of IDs
 * @returns {void}
 */
export function removeClip(clipId: string | string[]): void

/**
 * Duplicate clip (bonus feature)
 * @param {string} clipId - ID of clip to duplicate
 * @param {number} startTime - Optional position for duplicate
 * @returns {void}
 */
export function duplicateClip(clipId: string, startTime?: number): void
```

**Context Menu API:**
```javascript
/**
 * ClipContextMenu component props
 */
interface ClipContextMenuProps {
  clip: Clip;
  position: { x: number; y: number };
  onClose: () => void;
}

/**
 * Context menu operations
 */
const contextMenuOperations = {
  split: () => void,      // Split at playhead
  copy: () => void,        // Copy to clipboard (future)
  duplicate: () => void,   // Duplicate clip
  delete: () => void      // Delete clip
};
```

**Keyboard Shortcuts API:**
```javascript
/**
 * Keyboard shortcuts (useKeyboardShortcuts hook)
 */
const keyboardShortcuts = {
  'Cmd+B' / 'Ctrl+B': splitClip,           // Split at playhead
  'Delete' / 'Backspace': removeClip,       // Delete selected
  'Cmd+D' / 'Ctrl+D': duplicateClip       // Duplicate selected
};
```

### Component Hierarchy
```
Timeline/
├── Track/
│   └── Clip/
│       ├── ClipContextMenu/ ✨ NEW
│       │   ├── SplitButton
│       │   ├── CopyButton
│       │   ├── DuplicateButton
│       │   └── DeleteButton
│       └── (right-click handler) ✨ NEW
└── Toolbar/
    └── TimelineGroup/
        ├── SplitButton (existing)
        └── DeleteButton (existing)
```

---

## Implementation Details

### File Structure
**New Files:**
```
src/
├── components/
│   └── timeline/
│       └── ClipContextMenu.js (~140 lines) ✨ NEW
│       └── ClipContextMenu.css (~80 lines) ✨ NEW
```

**Modified Files:**
- `src/context/TimelineContext.js` (+50/-5 lines) - SPLIT_CLIP, REMOVE_CLIP, DUPLICATE_CLIP reducers
- `src/hooks/useTimeline.js` (+30/-5 lines) - splitClip, removeClip wrappers
- `src/hooks/useKeyboardShortcuts.js` (+50/-10 lines) - Split/delete handlers
- `src/components/timeline/Clip.js` (+10/-0 lines) - Context menu integration
- `src/components/ui/Toolbar.js` (no changes - already has buttons from PR#12)

### Key Implementation Steps

#### Phase 1: Split Clip Reducer (1 hour)
1. Add `SPLIT_CLIP` case to timeline reducer
2. Calculate relative split time from clip start
3. Create first clip (up to split point)
4. Create second clip (after split point)
5. Replace original clip with two new clips
6. Preserve all clip properties (trim points, metadata)

**Reducer Logic:**
```javascript
case 'SPLIT_CLIP':
  const originalClip = state.clips.find(c => c.id === action.clipId);
  if (!originalClip) return state;
  
  // Calculate relative split time
  const splitTime = action.splitTime - originalClip.startTime;
  
  // Validate split position
  if (splitTime <= 0 || splitTime >= originalClip.duration) return state;
  
  // First clip (up to split point)
  const firstClip = {
    ...originalClip,
    duration: splitTime,
    trimOut: originalClip.trimIn + splitTime
  };
  
  // Second clip (after split point)
  const secondClip = {
    ...originalClip,
    id: `clip-${Date.now()}`, // New unique ID
    startTime: action.splitTime, // Absolute timeline position
    duration: originalClip.duration - splitTime,
    trimIn: originalClip.trimIn + splitTime,
    trimOut: originalClip.trimOut
  };
  
  return {
    ...state,
    clips: [
      ...state.clips.filter(c => c.id !== action.clipId),
      firstClip,
      secondClip
    ]
  };
```

#### Phase 2: Delete Clip Reducer (30 minutes)
1. Add `REMOVE_CLIP` case to timeline reducer
2. Filter out deleted clip from clips array
3. Clear selection if deleted clip was selected

**Reducer Logic:**
```javascript
case 'REMOVE_CLIP':
  return {
    ...state,
    clips: state.clips.filter(clip => clip.id !== action.clipId),
    selection: {
      ...state.selection,
      clips: state.selection.clips.filter(id => id !== action.clipId)
    }
  };
```

#### Phase 3: Context Menu Component (2 hours)
1. Create `ClipContextMenu.js` component
2. Use ContextMenu component from PR#12 as base
3. Add split, copy, duplicate, delete buttons
4. Validate operations (e.g., canSplit check)
5. Position menu at click coordinates
6. Handle outside click and ESC to close
7. Integrate with useTimeline hook

**Context Menu Component:**
```javascript
const ClipContextMenu = ({ clip, position, onClose }) => {
  const { splitClip, removeClip, duplicateClip, playhead } = useTimeline();
  
  const canSplit = playhead > clip.startTime && 
                   playhead < clip.startTime + clip.duration;
  
  const handleSplit = () => {
    const splitTime = playhead - clip.startTime;
    if (splitTime > 0 && splitTime < clip.duration) {
      splitClip(clip.id, playhead); // Absolute time
    }
    onClose();
  };
  
  const handleDelete = () => {
    removeClip(clip.id);
    onClose();
  };
  
  // ... more handlers
  
  return (
    <div className="clip-context-menu" style={{ left, top }}>
      {/* Menu items */}
    </div>
  );
};
```

#### Phase 4: Keyboard Shortcuts (1 hour)
1. Add split handler (Cmd+B / Ctrl+B)
2. Add delete handler (Delete / Backspace)
3. Add duplicate handler (Cmd+D / Ctrl+D)
4. Validate selection before operations
5. Support multi-select for delete/duplicate

**Keyboard Shortcuts:**
```javascript
// Split at playhead: Cmd/Ctrl + B
if (cmdOrCtrl && e.key === 'b') {
  selection.clips.forEach(clipId => {
    const clip = clips.find(c => c.id === clipId);
    if (clip && playhead > clip.startTime && 
        playhead < clip.startTime + clip.duration) {
      splitClip(clipId, playhead);
    }
  });
}

// Delete: Delete or Backspace
if (e.key === 'Delete' || e.key === 'Backspace') {
  selection.clips.forEach(clipId => removeClip(clipId));
}
```

#### Phase 5: Integration & Testing (1 hour)
1. Integrate context menu into Clip component
2. Add right-click handler to Clip
3. Test split with various clip positions
4. Test delete with single and multi-select
5. Test keyboard shortcuts
6. Test context menu positioning
7. Verify undo/redo integration

---

## Testing Strategy

### Test Categories

**Unit Tests:**
- Split clip with valid split time
- Split clip at boundaries (should fail)
- Delete single clip
- Delete multiple clips
- Context menu validation (canSplit check)

**Integration Tests:**
- Context menu opens on right-click
- Context menu closes on outside click
- Keyboard shortcuts work when clips selected
- Keyboard shortcuts ignored when no selection
- Toolbar buttons trigger operations
- Operations integrate with undo/redo

**Edge Cases:**
- Split at clip start (should fail)
- Split at clip end (should fail)
- Delete last clip on track
- Delete all clips
- Split during playback
- Delete during playback

**Performance Tests:**
- Split operation < 100ms
- Delete operation < 50ms
- Context menu open < 50ms
- Keyboard shortcut response < 100ms

---

## Success Criteria

**Feature is complete when:**
- [ ] Users can split clips at playhead position
- [ ] Users can delete single clips
- [ ] Users can delete multiple clips (multi-select)
- [ ] Context menu appears on right-click
- [ ] Keyboard shortcuts work (⌘B, Delete, ⌘D)
- [ ] Toolbar buttons work
- [ ] Split validation works (playhead must be on clip)
- [ ] All operations integrate with undo/redo
- [ ] No timeline corruption after operations
- [ ] Performance targets met

**Performance Targets:**
- Split operation: < 100ms
- Delete operation: < 50ms
- Context menu: < 50ms open time
- Keyboard response: < 100ms

**Quality Gates:**
- Zero critical bugs
- All operations undoable
- No timeline state corruption
- Context menu accessible

---

## Risk Assessment

### Risk 1: Split Time Calculation Errors
**Likelihood:** MEDIUM  
**Impact:** HIGH  
**Mitigation:** 
- Validate split time (must be > 0 and < duration)
- Calculate relative time from clip start
- Test with edge cases (boundaries, zero, negative)
- Use absolute timeline time for second clip startTime

**Status:** 🟢 Mitigated

### Risk 2: Context Menu Positioning
**Likelihood:** MEDIUM  
**Impact:** MEDIUM  
**Mitigation:**
- Use portal rendering (learned from PR#12)
- Store click coordinates (e.clientX, e.clientY)
- Boundary detection (keep menu in viewport)
- Test on different screen sizes

**Status:** 🟢 Mitigated (portal pattern from PR#12)

### Risk 3: Multi-Select Delete Performance
**Likelihood:** LOW  
**Impact:** LOW  
**Mitigation:**
- Simple filter operation (O(n) complexity)
- Batch state update (single reducer call per clip)
- Limit selection size if needed (future)

**Status:** 🟢 Low risk

### Risk 4: Undo/Redo Integration
**Likelihood:** LOW  
**Impact:** MEDIUM  
**Mitigation:**
- Use saveState() before operations (already in useTimeline)
- Test undo/redo after each operation
- Verify state consistency

**Status:** 🟢 Already integrated

---

## Open Questions

None - All decisions made during planning.

---

## Timeline

**Total Estimate:** 4-6 hours

| Phase | Task | Time | Status |
|-------|------|------|--------|
| 1 | Split Clip Reducer | 1 h | ⏳ |
| 2 | Delete Clip Reducer | 0.5 h | ⏳ |
| 3 | Context Menu Component | 2 h | ⏳ |
| 4 | Keyboard Shortcuts | 1 h | ⏳ |
| 5 | Integration & Testing | 1.5 h | ⏳ |

---

## Dependencies

**Requires:**
- [x] PR #11 complete (State Management Refactor)
- [x] PR #12 complete (UI Component Library - ContextMenu)
- [x] PR #13 complete (Multi-Track Timeline UI)
- [x] PR #14 complete (Drag & Drop Clips)

**Blocks:**
- PR #16 (Undo/Redo System) - Benefits from these operations

---

## References

- Related PR: [#13] (Professional Timeline)
- Related PR: [#12] (UI Component Library)
- Design reference: CapCut, iMovie, Premiere Pro split/delete behavior
- Context menu pattern: PR#12 ContextMenu component

