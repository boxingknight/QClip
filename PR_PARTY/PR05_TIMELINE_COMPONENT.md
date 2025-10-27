# PR#5: Timeline Component

**Estimated Time:** 4 hours  
**Complexity:** MEDIUM  
**Priority:** Critical - Day 2, Hours 17-20  
**Dependencies:** PR #2 (Import), PR #3 (Player)  
**Target Date:** Day 2 (Tuesday, Oct 28)

---

## Overview

### What We're Building
A visual timeline component that displays imported video clips in a horizontal bar format. The timeline shows clip names, durations, and allows users to select clips by clicking. Selected clips are highlighted to indicate which clip is currently loaded in the video player. This is the first visual representation of the editing project and connects the import system to the trim/export workflow.

### Why It Matters
The timeline is the central organizing element of any video editor. It provides visual feedback of:
- What clips have been imported
- The sequence of clips
- The duration of each clip
- Which clip is currently selected for editing

Without the timeline, users have no way to understand the structure of their project or select which clip to edit.

### Success in One Sentence
"This PR is successful when the timeline displays imported clips horizontally, shows clip names and durations proportionally, highlights the selected clip, and clicking a clip loads it into the video player."

---

## Technical Design

### Architecture Decisions

#### Decision 1: Timeline Layout Approach
**Options Considered:**
1. **Canvas-based rendering** - Use HTML5 Canvas for custom drawing
2. **CSS-based blocks** - Use divs with calculated widths
3. **SVG-based rendering** - Use SVG elements for scalability

**Chosen:** Option 2 - CSS-based blocks

**Rationale:**
- Faster to implement for MVP (no canvas drawing logic)
- React-friendly (standard DOM updates)
- Responsive without zoom controls
- Easier to add click handlers
- Simpler styling with CSS

**Trade-offs:**
- Gain: Quick implementation, flexible styling
- Lose: Performance at very high clip counts (not a concern for MVP with single-clip trim)

#### Decision 2: Clip Width Calculation
**Options Considered:**
1. **Fixed width per clip** - All clips same width
2. **Duration-based proportional width** - Width based on clip length
3. **Fixed pixel-per-second scale** - 100px = 1 second

**Chosen:** Option 2 - Duration-based proportional width

**Rationale:**
- Most intuitive for video editing
- Shows actual project structure
- Professional video editor standard
- Helps user understand clip lengths

**Trade-offs:**
- Gain: Accurate visual representation
- Lose: Very long clips might extend beyond viewport (acceptable for MVP)

#### Decision 3: Selection State Management
**Options Considered:**
1. **Local Timeline state** - selectedClipId in Timeline component
2. **App-level state** - selectedClipId in App.js
3. **Context provider** - SelectedClipContext

**Chosen:** Option 2 - App-level state

**Rationale:**
- Single source of truth
- Timeline needs to know for highlighting
- VideoPlayer needs to know for loading
- TrimControls needs to know for applying trim
- Simple state lifting in MVP

**Trade-offs:**
- Gain: Predictable data flow, easy to debug
- Lose: Prop drilling (acceptable for MVP, could use Context if it grows)

### Data Model

**Timeline Component Props:**
```javascript
{
  clips: Array<{
    id: string;
    name: string;
    path: string;
    duration: number;  // in seconds
    inPoint?: number;  // trim start (optional for now)
    outPoint?: number; // trim end (optional for now)
  }>;
  selectedClipId: string | null;
  onSelectClip: (clipId: string) => void;
}
```

**Timeline State:**
```javascript
// No local state needed - fully controlled component
// All data comes from props
```

### Component Hierarchy

```
App.js
├── clips: [clip1, clip2, ...]
├── selectedClipId: 'clip-1'
└── Timeline
    ├── ClipsContainer
    │   └── ClipBlock (mapped from clips)
    │       ├── ClipNameLabel
    │       ├── ClipDurationLabel
    │       └── (selected highlight overlay)
    └── EmptyState (when clips.length === 0)
```

### Timeline Scale Strategy

**Challenge:** How to fit clips of varying lengths on screen

**Solution:** Use CSS flexbox with proportional widths

```javascript
// Calculate width as percentage of total timeline duration
const clipWidthPercent = (clip.duration / totalDuration) * 100;
```

**Edge Cases:**
- **Empty timeline:** Show "No clips imported" message
- **Single clip:** Takes up full width
- **Multiple clips:** Proportional to their durations
- **Very long clip:** Will scroll horizontally (accept for MVP)

---

## Implementation Details

### File Structure
**New Files:**
```
src/
├── components/
│   └── Timeline.js (~150-200 lines)
├── styles/
│   └── Timeline.css (~100-150 lines)
```

**Modified Files:**
- `src/App.js` (+50/-10 lines) - Add selectedClipId state, pass to Timeline
- `src/components/VideoPlayer.js` (+20 lines) - Accept clip selection, load selected clip

### Key Implementation Steps

#### Phase 1: Component Structure (30 minutes)
1. Create Timeline.js component
2. Create Timeline.css styling file
3. Add basic JSX structure
4. Import in App.js
5. Render placeholder

#### Phase 2: Clip Display (60 minutes)
1. Map clips array to ClipBlock components
2. Display clip names
3. Display clip durations
4. Calculate and apply proportional widths
5. Style clip blocks

#### Phase 3: Selection & Interaction (60 minutes)
1. Add click handler to clips
2. Update App state on selection
3. Highlight selected clip visually
4. Connect selection to VideoPlayer
5. Load selected clip in player

#### Phase 4: Polish & Empty States (30 minutes)
1. Add empty timeline state
2. Show helpful message when no clips
3. Add hover states
4. Improve visual styling
5. Add metadata display (total duration, clip count)

### Code Examples

**Example 1: Timeline Component Structure**
```javascript
import React from 'react';
import './Timeline.css';

const Timeline = ({ clips, selectedClipId, onSelectClip }) => {
  // Empty state
  if (clips.length === 0) {
    return (
      <div className="timeline timeline-empty">
        <p>No clips imported</p>
        <p className="timeline-hint">Drag and drop video files to get started</p>
      </div>
    );
  }

  // Calculate total duration for proportional widths
  const totalDuration = clips.reduce((sum, clip) => sum + clip.duration, 0);

  return (
    <div className="timeline">
      <div className="timeline-header">
        <span className="timeline-info">
          {clips.length} clip{clips.length !== 1 ? 's' : ''} • 
          {formatDuration(totalDuration)} total
        </span>
      </div>
      
      <div className="timeline-clips">
        {clips.map(clip => (
          <ClipBlock
            key={clip.id}
            clip={clip}
            widthPercent={(clip.duration / totalDuration) * 100}
            isSelected={selectedClipId === clip.id}
            onSelect={() => onSelectClip(clip.id)}
          />
        ))}
      </div>
    </div>
  );
};
```

**Example 2: ClipBlock Sub-Component**
```javascript
const ClipBlock = ({ clip, widthPercent, isSelected, onSelect }) => {
  return (
    <div
      className={`clip-block ${isSelected ? 'selected' : ''}`}
      style={{ width: `${widthPercent}%` }}
      onClick={onSelect}
    >
      <div className="clip-info">
        <span className="clip-name">{clip.name}</span>
        <span className="clip-duration">{formatDuration(clip.duration)}</span>
      </div>
    </div>
  );
};
```

**Example 3: Utility Function for Time Formatting**
```javascript
// src/utils/timeHelpers.js
export function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
```

**Example 4: App State Updates**
```javascript
// src/App.js
function App() {
  const [clips, setClips] = useState([]);
  const [selectedClipId, setSelectedClipId] = useState(null);

  const handleImportClip = (clip) => {
    setClips([...clips, clip]);
    // Auto-select first imported clip
    if (clips.length === 0) {
      setSelectedClipId(clip.id);
    }
  };

  const handleSelectClip = (clipId) => {
    setSelectedClipId(clipId);
  };

  return (
    <div className="app">
      <ImportPanel onImport={handleImportClip} />
      <VideoPlayer clip={clips.find(c => c.id === selectedClipId)} />
      <Timeline
        clips={clips}
        selectedClipId={selectedClipId}
        onSelectClip={handleSelectClip}
      />
    </div>
  );
}
```

**Example 5: CSS Styling**
```css
.timeline {
  height: 120px;
  background: var(--color-surface);
  border-top: 2px solid var(--color-secondary);
  padding: 12px;
  overflow-x: auto;
}

.timeline-header {
  margin-bottom: 8px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.timeline-clips {
  display: flex;
  gap: 4px;
  height: 80px;
}

.clip-block {
  background: var(--color-surface-hover);
  border: 2px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  padding: 8px;
  transition: all var(--transition-fast);
  min-width: 100px;
}

.clip-block:hover {
  background: var(--color-surface);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.clip-block.selected {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: white;
}

.clip-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.clip-name {
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.clip-duration {
  font-size: 12px;
  opacity: 0.8;
}

.timeline-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
}

.timeline-hint {
  margin-top: 8px;
  font-size: 14px;
}
```

---

## Testing Strategy

### Test Categories

**Unit Tests:**
- Timeline renders without clips (empty state)
- Timeline renders single clip
- Timeline renders multiple clips
- Clip widths are proportional to durations
- Selected clip shows highlight
- Clicking clip calls onSelectClip

**Integration Tests:**
- Import clip → Timeline shows it → Click clip → Player loads it
- Import multiple clips → Timeline shows all → Select different clips → Player updates
- Selected clip highlighted → Import new clip → Selection persists

**Visual Regression Tests:**
- Timeline layout matches design mockups
- Selected state visible and clear
- Empty state helpful and inviting
- Responsive at different window widths

### Acceptance Criteria

**Feature is complete when:**
- [ ] Timeline displays imported clips
- [ ] Clip names visible on timeline
- [ ] Clip durations visible and accurate
- [ ] Clip widths proportional to duration
- [ ] Clicking clip selects it
- [ ] Selected clip highlighted visually
- [ ] Selecting clip loads it in player
- [ ] Empty state shows helpful message
- [ ] Multiple clips render correctly
- [ ] Timeline updates on new import
- [ ] No console errors

**Performance Targets:**
- Render 10+ clips without lag
- Selection updates instantly (<100ms)
- No memory leaks on clip import/removal

**Quality Gates:**
- Clean, maintainable code
- Proper error handling
- Accessible (keyboard navigation if time allows)
- Responsive layout

---

## Success Criteria

### Hard Requirements (Must Pass)
- Timeline displays all imported clips horizontally
- Clip names and durations visible
- Clicking clip selects it and updates player
- Selected clip visually highlighted
- Empty timeline shows helpful message
- Timeline updates when new clip imported

### Quality Indicators (Should Pass)
- Clips are clearly distinguishable
- Selection highlight is obvious
- Layout is clean and professional
- No console errors
- Works with 1-10 clips
- Responsive to window resize

---

## Risk Assessment

### Risk 1: Clip Width Calculation Issues
**Likelihood:** MEDIUM  
**Impact:** HIGH  
**Mitigation:** Test with clips of varying durations, handle edge cases (very short/long clips)  
**Status:** 🟡 Medium Risk

### Risk 2: Selection Not Updating Player
**Likelihood:** MEDIUM  
**Impact:** HIGH  
**Mitigation:** Test integration between Timeline → App state → VideoPlayer thoroughly  
**Status:** 🟡 Medium Risk

### Risk 3: Empty State Not Visible
**Likelihood:** LOW  
**Impact:** LOW  
**Mitigation:** Clear visual design for empty state  
**Status:** 🟢 Low Risk

### Risk 4: Very Long Timeline Extending Beyond Viewport
**Likelihood:** MEDIUM  
**Impact:** MEDIUM  
**Mitigation:** Accept for MVP (horizontal scroll), add zoom controls post-MVP  
**Status:** 🟡 Medium Risk (acceptable for MVP)

### Risk 5: Integration Issues with Existing Components
**Likelihood:** HIGH  
**Impact:** MEDIUM  
**Mitigation:** 
- Verify App.js state structure matches imports
- Test with mock data first
- Update VideoPlayer props carefully  
**Status:** 🔴 High Risk - Must coordinate with PR #2 and #3

### Risk 6: Styling Conflicts
**Likelihood:** LOW  
**Impact:** LOW  
**Mitigation:** Use consistent CSS variables, test with other components  
**Status:** 🟢 Low Risk

---

## Timeline Estimates

**Total Time:** 4 hours

| Task | Time | Dependencies |
|------|------|--------------|
| Component structure | 30 min | None |
| Clip display | 60 min | Clips data from App |
| Selection & interaction | 60 min | App state management |
| Polish & empty states | 30 min | Above complete |
| Integration testing | 30 min | All above |
| Bug fixes | 10 min | As needed |

**Buffer:** 30 minutes for unexpected issues

---

## Dependencies

### Requires (Must be Complete)
- **PR #2:** File Import - Clips data in state
- **PR #3:** Video Player - Will load selected clip

### Blocks
- **PR #6:** Trim Controls - Needs selection to know which clip to trim
- **PR #7:** UI Polish - May adjust timeline styling

### Integration Points
- **App.js state:** Must coordinate selectedClipId state
- **VideoPlayer.js:** Must accept clip prop and update
- **ImportPanel:** Clips array must be compatible

---

## Open Questions

1. **Selection Persistence:** Should selection persist when importing new clips?
   - **Decision:** Yes - maintain selection unless it becomes invalid
   - **Rationale:** Better UX, allows adding clips without losing context

2. **Auto-Selection:** Should first imported clip auto-select?
   - **Decision:** Yes - auto-select first clip
   - **Rationale:** Immediately usable, shows connection to player

3. **Timeline Metadata:** What metadata to display?
   - **Decision:** Clip count and total duration in header
   - **Rationale:** Helps user understand project scope

4. **Scroll Behavior:** Horizontal scroll acceptable for MVP?
   - **Decision:** Yes - horizontal scroll acceptable
   - **Rationale:** Can add zoom controls post-MVP

5. **Click Targets:** Entire clip block clickable or just label?
   - **Decision:** Entire clip block clickable
   - **Rationale:** Larger target = better UX

---

## References

### Related Documents
- `clipforge-prd.md` - Overall project requirements
- `clipforge-task-list.md` - PR #5 task breakdown
- `memory-bank/systemPatterns.md` - Architecture patterns
- `memory-bank/activeContext.md` - Current project status

### Similar Implementations (For Inspiration)
- Video editing timeline UIs (Premiere, Final Cut, DaVinci)
- Audio editor timeline patterns (Audacity, Reaper)
- React timeline components on GitHub
- CSS-only timeline layouts

### Technical Resources
- React component patterns: https://react.dev/
- CSS Flexbox guide: https://css-tricks.com/snippets/css/a-guide-to-flexbox/
- Timeline UI research: Analyze existing video editors

---

## Post-MVP Enhancements

### Future Features (Not in MVP)
- **Timeline Zoom:** In/out zoom controls
- **Scrubbing:** Drag playhead to seek
- **Multi-track:** Vertical layers for video/audio
- **Drag-drop Rearrangement:** Reorder clips by dragging
- **Split:** Double-click to split clip
- **Delete:** Context menu to remove clip
- **Time Ruler:** Second/minute markers
- **Waveform Preview:** Visual audio representation

---

**Document Status:** Planning Complete  
**Next Action:** Review this specification, then create implementation checklist


