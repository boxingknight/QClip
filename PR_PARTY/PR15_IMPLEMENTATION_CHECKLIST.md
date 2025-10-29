# PR#15: Implementation Checklist

**Use this as your daily todo list.** Check off items as you complete them.

---

## Pre-Implementation Setup (15 minutes)

- [ ] Read main planning document (~45 min)
- [ ] Prerequisites verified
  - [ ] PR #11 (State Management Refactor) complete ✅
  - [ ] PR #12 (UI Component Library) complete ✅
  - [ ] PR #13 (Multi-Track Timeline UI) complete ✅
  - [ ] PR #14 (Drag & Drop Clips) complete ✅
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
  git checkout -b feature/pr15-split-delete-clips
  ```

---

## Phase 1: Split Clip Reducer (1 hour)

### 1.1: Add SPLIT_CLIP Action to Reducer (30 minutes)

#### Update TimelineContext.js
- [ ] Add `SPLIT_CLIP` case to `timelineReducer`
- [ ] Find original clip by ID
- [ ] Validate clip exists
  ```javascript
  case 'SPLIT_CLIP':
    const originalClip = state.clips.find(c => c.id === action.clipId);
    if (!originalClip) return state;
  ```

#### Calculate Split Time
- [ ] Calculate relative split time from clip start
  ```javascript
    const splitTime = action.splitTime - originalClip.startTime;
  ```

#### Validate Split Position
- [ ] Check split time > 0
- [ ] Check split time < clip duration
- [ ] Return state if invalid
  ```javascript
    if (splitTime <= 0 || splitTime >= originalClip.duration) return state;
  ```

#### Create First Clip (Before Split)
- [ ] Copy original clip properties
- [ ] Set duration to splitTime
- [ ] Adjust trimOut: `trimIn + splitTime`
  ```javascript
    const firstClip = {
      ...originalClip,
      duration: splitTime,
      trimOut: originalClip.trimIn + splitTime
    };
  ```

#### Create Second Clip (After Split)
- [ ] Copy original clip properties
- [ ] Generate new ID: `clip-${Date.now()}`
- [ ] Set startTime to absolute split position
- [ ] Set duration to `original.duration - splitTime`
- [ ] Adjust trimIn: `original.trimIn + splitTime`
- [ ] Keep original trimOut
  ```javascript
    const secondClip = {
      ...originalClip,
      id: `clip-${Date.now()}`,
      startTime: action.splitTime,
      duration: originalClip.duration - splitTime,
      trimIn: originalClip.trimIn + splitTime,
      trimOut: originalClip.trimOut
    };
  ```

#### Update State
- [ ] Remove original clip from array
- [ ] Add both new clips to array
- [ ] Return updated state
  ```javascript
    return {
      ...state,
      clips: [
        ...state.clips.filter(c => c.id !== action.clipId),
        firstClip,
        secondClip
      ]
    };
  ```

**Checkpoint:** Split reducer working ✓

**Commit:** `feat(timeline): add SPLIT_CLIP reducer action`

---

### 1.2: Add splitClip Function to Context (15 minutes)

#### Update TimelineContext.js
- [ ] Add `splitClip` function
- [ ] Dispatch `SPLIT_CLIP` action
- [ ] Export in context value
  ```javascript
  const splitClip = (clipId, splitTime) => {
    dispatch({ type: 'SPLIT_CLIP', clipId, splitTime });
  };
  
  // In context value:
  splitClip,
  ```

**Checkpoint:** splitClip function available ✓

**Commit:** `feat(timeline): add splitClip function to context`

---

### 1.3: Add splitClip Wrapper to useTimeline Hook (15 minutes)

#### Update useTimeline.js
- [ ] Import `splitClip` from context
- [ ] Create `splitClipWithState` wrapper
- [ ] Call `saveState()` before split
- [ ] Export in hook return
  ```javascript
  const splitClipWithState = useCallback((clipId, splitTime) => {
    performOperation(() => splitClip(clipId, splitTime));
  }, [performOperation, splitClip]);
  
  // In return:
  splitClip: splitClipWithState,
  ```

**Checkpoint:** splitClip integrated with undo/redo ✓

**Commit:** `feat(timeline): add splitClip wrapper with state saving`

---

## Phase 2: Delete Clip Reducer (30 minutes)

### 2.1: Add REMOVE_CLIP Action to Reducer (15 minutes)

#### Update TimelineContext.js
- [ ] Add `REMOVE_CLIP` case to `timelineReducer`
- [ ] Filter out deleted clip
- [ ] Update selection (remove from selection if deleted)
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

**Checkpoint:** Delete reducer working ✓

**Commit:** `feat(timeline): add REMOVE_CLIP reducer action`

---

### 2.2: Add removeClip Function to Context (10 minutes)

#### Update TimelineContext.js
- [ ] Add `removeClip` function
- [ ] Dispatch `REMOVE_CLIP` action
- [ ] Export in context value
  ```javascript
  const removeClip = (clipId) => {
    dispatch({ type: 'REMOVE_CLIP', clipId });
  };
  
  // In context value:
  removeClip,
  ```

**Checkpoint:** removeClip function available ✓

**Commit:** `feat(timeline): add removeClip function to context`

---

### 2.3: Add removeClip Wrapper to useTimeline Hook (5 minutes)

#### Update useTimeline.js
- [ ] Import `removeClip` from context
- [ ] Create `removeClipWithState` wrapper
- [ ] Call `saveState()` before remove
- [ ] Export in hook return
  ```javascript
  const removeClipWithState = useCallback((clipId) => {
    performOperation(() => removeClip(clipId));
  }, [performOperation, removeClip]);
  
  // In return:
  removeClip: removeClipWithState,
  ```

**Checkpoint:** removeClip integrated with undo/redo ✓

**Commit:** `feat(timeline): add removeClip wrapper with state saving`

---

## Phase 3: Context Menu Component (2 hours)

### 3.1: Create ClipContextMenu Component (1 hour)

#### Create File
- [ ] Create `src/components/timeline/ClipContextMenu.js`

#### Add Imports
- [ ] Import React hooks
- [ ] Import useTimeline hook
- [ ] Import CSS
  ```javascript
  import React, { useEffect, useRef } from 'react';
  import { useTimeline } from '../../hooks/useTimeline';
  import './ClipContextMenu.css';
  ```

#### Create Component Structure
- [ ] Add component function with props
- [ ] Add useTimeline hook usage
- [ ] Add menu ref for outside click detection
  ```javascript
  const ClipContextMenu = ({ clip, position, onClose }) => {
    const { splitClip, removeClip, duplicateClip, playhead, saveState } = useTimeline();
    const menuRef = useRef(null);
    // ...
  };
  ```

#### Add Outside Click Handler
- [ ] Add click outside listener
- [ ] Add ESC key listener
- [ ] Cleanup listeners on unmount
  ```javascript
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);
  ```

#### Add Split Handler
- [ ] Calculate split time from playhead
- [ ] Validate split position
- [ ] Call splitClip function
- [ ] Save state and close menu
  ```javascript
  const handleSplit = () => {
    const splitTime = playhead - clip.startTime;
    
    if (splitTime > 0 && splitTime < clip.duration) {
      splitClip(clip.id, playhead); // Absolute time
      saveState();
    }
    onClose();
  };
  ```

#### Add Delete Handler
- [ ] Call removeClip function
- [ ] Save state and close menu
  ```javascript
  const handleDelete = () => {
    removeClip(clip.id);
    saveState();
    onClose();
  };
  ```

#### Add Duplicate Handler (bonus)
- [ ] Call duplicateClip function
- [ ] Save state and close menu
  ```javascript
  const handleDuplicate = () => {
    duplicateClip(clip.id);
    saveState();
    onClose();
  };
  ```

#### Add Validation Logic
- [ ] Check if playhead is on clip for split
  ```javascript
  const canSplit = playhead > clip.startTime && 
                   playhead < clip.startTime + clip.duration;
  ```

#### Add JSX Structure
- [ ] Add menu container with ref
- [ ] Add header with clip name
- [ ] Add split button (disabled if can't split)
- [ ] Add copy button (placeholder)
- [ ] Add duplicate button
- [ ] Add delete button (danger style)
- [ ] Position menu at click coordinates
  ```javascript
  return (
    <div
      ref={menuRef}
      className="clip-context-menu"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
    >
      <div className="context-menu-header">
        <span className="context-menu-title">{clip.name}</span>
      </div>
      
      <div className="context-menu-divider" />
      
      <button
        className="context-menu-item"
        onClick={handleSplit}
        disabled={!canSplit}
        title={canSplit ? 'Split clip at playhead' : 'Playhead not on clip'}
      >
        <span className="context-menu-icon">✂️</span>
        <span className="context-menu-label">Split at Playhead</span>
        <span className="context-menu-shortcut">Cmd+B</span>
      </button>
      
      {/* More buttons... */}
    </div>
  );
  ```

**Checkpoint:** Context menu component created ✓

**Commit:** `feat(timeline): create ClipContextMenu component`

---

### 3.2: Style ClipContextMenu Component (30 minutes)

#### Create CSS File
- [ ] Create `src/components/timeline/ClipContextMenu.css`

#### Add Base Styles
- [ ] Menu container positioning
- [ ] Background and border
- [ ] Shadow and rounded corners
- [ ] Z-index (high for overlay)
  ```css
  .clip-context-menu {
    position: fixed;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    z-index: 1000;
    min-width: 200px;
  }
  ```

#### Add Menu Item Styles
- [ ] Button styling
- [ ] Hover states
- [ ] Disabled states
- [ ] Icon and label layout
- [ ] Shortcut key styling
  ```css
  .context-menu-item {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-md);
    width: 100%;
    /* ... */
  }
  
  .context-menu-item.danger {
    color: var(--color-error);
  }
  ```

**Checkpoint:** Context menu styled ✓

**Commit:** `feat(timeline): style ClipContextMenu component`

---

### 3.3: Integrate Context Menu into Clip Component (30 minutes)

#### Update Clip.js
- [ ] Import ClipContextMenu component
- [ ] Add contextMenu state (null or {x, y})
- [ ] Add right-click handler
- [ ] Select clip if not selected
- [ ] Show context menu at click position
  ```javascript
  const [contextMenu, setContextMenu] = useState(null);
  
  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isSelected) {
      selectClip(clip.id, false);
    }
    
    setContextMenu({
      x: e.clientX,
      y: e.clientY
    });
  }, [clip.id, isSelected, selectClip]);
  ```

#### Add Context Menu Rendering
- [ ] Conditionally render ClipContextMenu
- [ ] Pass clip, position, and onClose props
  ```javascript
  {contextMenu && (
    <ClipContextMenu
      clip={clip}
      position={contextMenu}
      onClose={() => setContextMenu(null)}
    />
  )}
  ```

**Checkpoint:** Context menu integrated ✓

**Commit:** `feat(timeline): integrate context menu into Clip component`

---

## Phase 4: Keyboard Shortcuts (1 hour)

### 4.1: Add Split Keyboard Shortcut (20 minutes)

#### Update useKeyboardShortcuts.js
- [ ] Import splitClip from useTimeline
- [ ] Add Cmd+B / Ctrl+B handler
- [ ] Check for modifier keys
- [ ] Prevent default
- [ ] Validate selection exists
- [ ] Find clips that intersect with playhead
- [ ] Calculate split time
- [ ] Validate split position
- [ ] Call splitClip for each valid clip
  ```javascript
  // Split at playhead: Cmd/Ctrl + B
  if (cmdOrCtrl && e.key === 'b') {
    e.preventDefault();
    
    selection.clips.forEach(clipId => {
      const clip = clips.find(c => c.id === clipId);
      if (clip) {
        const splitTime = playhead - clip.startTime;
        if (splitTime > 0 && splitTime < clip.duration) {
          splitClip(clipId, playhead);
        }
      }
    });
    saveState();
    return;
  }
  ```

**Checkpoint:** Split shortcut working ✓

**Commit:** `feat(timeline): add keyboard shortcut for split (Cmd+B)`

---

### 4.2: Add Delete Keyboard Shortcut (20 minutes)

#### Update useKeyboardShortcuts.js
- [ ] Import removeClip from useTimeline
- [ ] Add Delete / Backspace handler
- [ ] Prevent default
- [ ] Validate selection exists
- [ ] Loop through selected clips
- [ ] Call removeClip for each
  ```javascript
  // Delete: Delete or Backspace
  if (e.key === 'Delete' || e.key === 'Backspace') {
    e.preventDefault();
    selection.clips.forEach(clipId => {
      removeClip(clipId);
    });
    saveState();
    return;
  }
  ```

**Checkpoint:** Delete shortcut working ✓

**Commit:** `feat(timeline): add keyboard shortcut for delete (Delete/Backspace)`

---

### 4.3: Add Duplicate Keyboard Shortcut (20 minutes)

#### Update useKeyboardShortcuts.js
- [ ] Import duplicateClip from useTimeline
- [ ] Add Cmd+D / Ctrl+D handler
- [ ] Prevent default
- [ ] Validate selection exists
- [ ] Loop through selected clips
- [ ] Call duplicateClip for each
  ```javascript
  // Duplicate: Cmd/Ctrl + D
  if (cmdOrCtrl && e.key === 'd') {
    e.preventDefault();
    selection.clips.forEach(clipId => {
      duplicateClip(clipId);
    });
    saveState();
    return;
  }
  ```

**Checkpoint:** Duplicate shortcut working ✓

**Commit:** `feat(timeline): add keyboard shortcut for duplicate (Cmd+D)`

---

## Phase 5: Integration & Testing (1.5 hours)

### 5.1: Toolbar Integration (15 minutes)

#### Verify Toolbar Buttons
- [ ] Check Toolbar component has Split button
- [ ] Check Toolbar component has Delete button
- [ ] Verify action handlers work
- [ ] Test toolbar button clicks

**Note:** Toolbar buttons already exist from PR#12, just verify integration.

**Checkpoint:** Toolbar integration verified ✓

**Commit:** `feat(timeline): verify toolbar button integration`

---

### 5.2: Testing Checklist (1 hour)

#### Unit Tests
- [ ] Test split with valid split time
- [ ] Test split at clip start (should fail)
- [ ] Test split at clip end (should fail)
- [ ] Test split with playhead not on clip (should fail)
- [ ] Test delete single clip
- [ ] Test delete multiple clips (multi-select)
- [ ] Test duplicate single clip
- [ ] Test duplicate multiple clips

#### Integration Tests
- [ ] Context menu opens on right-click
- [ ] Context menu closes on outside click
- [ ] Context menu closes on ESC key
- [ ] Split button disabled when playhead not on clip
- [ ] Keyboard shortcuts work when clips selected
- [ ] Keyboard shortcuts ignored when no selection
- [ ] Toolbar buttons trigger operations
- [ ] Operations integrate with undo/redo

#### Edge Cases
- [ ] Split last clip on track
- [ ] Delete last clip on track
- [ ] Delete all clips
- [ ] Split during playback
- [ ] Delete during playback
- [ ] Multi-select split (should split all selected clips)
- [ ] Context menu at screen edge (should stay in viewport)

#### Performance Tests
- [ ] Split operation < 100ms ✓
- [ ] Delete operation < 50ms ✓
- [ ] Context menu open < 50ms ✓
- [ ] Keyboard shortcut response < 100ms ✓

**Checkpoint:** All tests passing ✓

**Commit:** `test(timeline): comprehensive testing for split and delete`

---

### 5.3: Bug Fixes (15 minutes)

- [ ] Fix any issues found during testing
- [ ] Verify no regressions
- [ ] Test existing functionality still works

**Checkpoint:** No bugs remaining ✓

---

## Completion Checklist

- [ ] All phases complete
- [ ] All tests passing
- [ ] Performance targets met
- [ ] No critical bugs
- [ ] Context menu working
- [ ] Keyboard shortcuts working
- [ ] Toolbar buttons working
- [ ] Undo/redo integration verified
- [ ] Documentation updated

---

## Final Commit

```bash
git add .
git commit -m "feat(pr15): split and delete clips complete

- Split clip at playhead (Cmd+B)
- Delete single or multiple clips (Delete/Backspace)
- Context menu with portal rendering
- Keyboard shortcuts integrated
- Toolbar buttons functional
- Undo/redo support"
git push
```

---

**Status:** ✅ COMPLETE when all items checked

