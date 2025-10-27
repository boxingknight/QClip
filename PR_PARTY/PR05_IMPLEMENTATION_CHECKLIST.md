# PR#5: Timeline Component - Implementation Checklist

**Use this as your daily todo list.** Check off items as you complete them.

**Estimated Time:** 4 hours  
**Complexity:** MEDIUM  
**Current Phase:** 📋 Ready to Start

---

## Pre-Implementation Setup (15 minutes)

- [ ] Read main planning document (`PR05_TIMELINE_COMPONENT.md`) (~20 min)
- [ ] Verify PR #2 (Import) complete with clips data structure
- [ ] Verify PR #3 (Player) complete and accepting clip props
- [ ] Check App.js has clips state array
- [ ] Git branch created:
```bash
git checkout -b feature/pr05-timeline
```

---

## Phase 1: Component Structure (30 minutes)

### Step 1.1: Create Timeline Component (10 minutes)

#### Create File
- [ ] Create `src/components/Timeline.js`

#### Add Imports
- [ ] Add React import
```javascript
import React from 'react';
import './Timeline.css';
```

#### Create Basic Component Structure
- [ ] Create function component with props
```javascript
const Timeline = ({ clips, selectedClipId, onSelectClip }) => {
  return (
    <div className="timeline">
      <p>Timeline Component</p>
    </div>
  );
};

export default Timeline;
```

#### Import in App.js
- [ ] Add import statement
```javascript
import Timeline from './components/Timeline';
```

- [ ] Render Timeline in App layout
```javascript
<Timeline
  clips={clips}
  selectedClipId={selectedClipId}
  onSelectClip={handleSelectClip}
/>
```

**Checkpoint:** Timeline renders placeholder ✓

**Commit:** `feat(timeline): create basic Timeline component structure`

---

### Step 1.2: Create Timeline CSS File (10 minutes)

#### Create File
- [ ] Create `src/styles/Timeline.css`

#### Add Basic Styles
- [ ] Add timeline container styles
```css
.timeline {
  height: 120px;
  background: var(--color-surface);
  border-top: 2px solid var(--color-secondary);
  padding: 12px;
  overflow-x: auto;
}
```

- [ ] Link CSS in Timeline.js
```javascript
import './styles/Timeline.css';
```

**Checkpoint:** Timeline has styled container ✓

**Commit:** `style(timeline): add basic Timeline container styles`

---

### Step 1.3: Create Helper Utilities (10 minutes)

#### Create File
- [ ] Create `src/utils/timeHelpers.js`

#### Add Format Duration Function
- [ ] Implement formatDuration utility
```javascript
/**
 * Format seconds to MM:SS
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted time string
 */
export function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
```

- [ ] Test with edge cases:
  - formatDuration(0) → "0:00" ✓
  - formatDuration(5) → "0:05" ✓
  - formatDuration(65) → "1:05" ✓
  - formatDuration(3650) → "60:50" ✓

**Checkpoint:** Time formatting function working ✓

**Commit:** `feat(utils): add formatDuration helper function`

---

## Phase 2: Clip Display (60 minutes)

### Step 2.1: Empty State (10 minutes)

#### Implement Empty Timeline
- [ ] Update Timeline.js to check for empty clips
```javascript
if (clips.length === 0) {
  return (
    <div className="timeline timeline-empty">
      <p>No clips imported</p>
      <p className="timeline-hint">Drag and drop video files to get started</p>
    </div>
  );
}
```

#### Add Empty State Styles
- [ ] Style empty timeline in Timeline.css
```css
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

**Checkpoint:** Empty timeline shows helpful message ✓

**Commit:** `feat(timeline): add empty state display`

---

### Step 2.2: Clip Block Component (20 minutes)

#### Create ClipBlock Sub-Component
- [ ] Add ClipBlock inside Timeline.js (or separate file)
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

#### Style Clip Blocks
- [ ] Add clip-block styles in Timeline.css
```css
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
```

**Checkpoint:** Clip blocks render with name and duration ✓

**Commit:** `feat(timeline): create ClipBlock component with styling`

---

### Step 2.3: Map Clips to Timeline (15 minutes)

#### Calculate Total Duration
- [ ] Add total duration calculation in Timeline.js
```javascript
const totalDuration = clips.reduce((sum, clip) => sum + clip.duration, 0);
```

#### Map Clips to ClipBlocks
- [ ] Render clips with proportional widths
```javascript
return (
  <div className="timeline">
    <div className="timeline-clips">
      {clips.map(clip => (
        <ClipBlock
          key={clip.id}
          clip={clip}
          widthPercent={(clip.duration / totalDuration) * 100}
          isSelected={false}
          onSelect={() => {}} // TODO: Implement selection
        />
      ))}
    </div>
  </div>
);
```

#### Style Timeline Clips Container
- [ ] Add timeline-clips styles in Timeline.css
```css
.timeline-clips {
  display: flex;
  gap: 4px;
  height: 80px;
}
```

**Checkpoint:** All clips display with proportional widths ✓

**Commit:** `feat(timeline): render clips with proportional widths`

---

### Step 2.4: Timeline Header (15 minutes)

#### Add Header with Metadata
- [ ] Add timeline header in Timeline.js
```javascript
return (
  <div className="timeline">
    <div className="timeline-header">
      <span className="timeline-info">
        {clips.length} clip{clips.length !== 1 ? 's' : ''} • 
        {formatDuration(totalDuration)} total
      </span>
    </div>
    <div className="timeline-clips">
      {/* clips map */}
    </div>
  </div>
);
```

#### Style Header
- [ ] Add timeline-header styles in Timeline.css
```css
.timeline-header {
  margin-bottom: 8px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.timeline-info {
  font-weight: 500;
}
```

**Checkpoint:** Timeline shows metadata (clip count, duration) ✓

**Commit:** `feat(timeline): add timeline header with metadata`

---

## Phase 3: Selection & Interaction (60 minutes)

### Step 3.1: Add App State for Selection (10 minutes)

#### Add Selection State to App.js
- [ ] Add selectedClipId state
```javascript
const [selectedClipId, setSelectedClipId] = useState(null);
```

#### Add Selection Handler
- [ ] Implement handleSelectClip function
```javascript
const handleSelectClip = (clipId) => {
  setSelectedClipId(clipId);
};
```

#### Pass to Timeline
- [ ] Update Timeline props
```javascript
<Timeline
  clips={clips}
  selectedClipId={selectedClipId}
  onSelectClip={handleSelectClip}
/>
```

**Checkpoint:** Selection state managed in App ✓

**Commit:** `feat(app): add selectedClipId state management`

---

### Step 3.2: Implement Click Handler (10 minutes)

#### Update ClipBlock Click Handler
- [ ] Connect onSelect prop in Timeline.js
```javascript
{clips.map(clip => (
  <ClipBlock
    key={clip.id}
    clip={clip}
    widthPercent={(clip.duration / totalDuration) * 100}
    isSelected={selectedClipId === clip.id}
    onSelect={() => onSelectClip(clip.id)}
  />
))}
```

#### Test Click Interaction
- [ ] Click clip → console.log(clip.id) to verify
- [ ] Check selectedClipId updates in React DevTools

**Checkpoint:** Clicking clip updates selectedClipId ✓

**Commit:** `feat(timeline): implement clip click selection`

---

### Step 3.3: Visual Selection Highlight (15 minutes)

#### Add Selected Styles
- [ ] Update ClipBlock to use isSelected prop
```javascript
className={`clip-block ${isSelected ? 'selected' : ''}`}
```

#### Style Selected State
- [ ] Add selected styles in Timeline.css
```css
.clip-block.selected {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: white;
}

.clip-block.selected .clip-duration {
  opacity: 0.9;
}
```

#### Test Selection UI
- [ ] Click different clips
- [ ] Verify only one clip highlighted at a time
- [ ] Verify selection persists when clicking same clip

**Checkpoint:** Selected clip visually highlighted ✓

**Commit:** `feat(timeline): add visual selection highlight`

---

### Step 3.4: Connect to VideoPlayer (15 minutes)

#### Update VideoPlayer Props
- [ ] Check VideoPlayer.js accepts clip prop
```javascript
// Should already have this from PR #3
const VideoPlayer = ({ clip, onTimeUpdate }) => {
  // ...
};
```

#### Load Selected Clip in Player
- [ ] Update App.js to pass selected clip to player
```javascript
const selectedClip = clips.find(c => c.id === selectedClipId);

<VideoPlayer 
  clip={selectedClip}
  onTimeUpdate={handleTimeUpdate}
/>
```

#### Test Player Integration
- [ ] Import clip → Select clip → Player loads it
- [ ] Select different clip → Player updates
- [ ] Verify video path correct in player

**Checkpoint:** Selecting clip loads it in player ✓

**Commit:** `feat(app): connect timeline selection to video player`

---

### Step 3.5: Auto-Select First Clip (10 minutes)

#### Update Import Handler
- [ ] Auto-select first imported clip
```javascript
const handleImportClip = (clip) => {
  const newClips = [...clips, clip];
  setClips(newClips);
  
  // Auto-select first clip if none selected
  if (selectedClipId === null && newClips.length === 1) {
    setSelectedClipId(clip.id);
  }
};
```

**Checkpoint:** First imported clip auto-selects ✓

**Commit:** `feat(app): auto-select first imported clip`

---

## Phase 4: Polish & Empty States (30 minutes)

### Step 4.1: Improve Empty State (10 minutes)

#### Enhance Empty State Design
- [ ] Add icon or visual element (optional)
- [ ] Improve messaging
```javascript
<div className="timeline timeline-empty">
  <div className="timeline-empty-icon">🎬</div>
  <p className="timeline-empty-title">No clips yet</p>
  <p className="timeline-empty-hint">
    Drag and drop video files to get started
  </p>
</div>
```

#### Style Enhanced Empty State
- [ ] Add styles for icon and improved layout
```css
.timeline-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  height: 200px;
}

.timeline-empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.timeline-empty-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--color-text-primary);
}

.timeline-empty-hint {
  font-size: 14px;
  opacity: 0.8;
}
```

**Checkpoint:** Empty state is inviting and helpful ✓

**Commit:** `style(timeline): improve empty state design`

---

### Step 4.2: Add Hover States (10 minutes)

#### Enhance Hover Feedback
- [ ] Add smooth transitions
- [ ] Improve hover state styles
```css
.clip-block {
  /* existing styles */
  user-select: none; /* Prevent text selection */
}

.clip-block:hover:not(.selected) {
  background: var(--color-surface);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
```

#### Add Active State
- [ ] Add click feedback
```css
.clip-block:active {
  transform: translateY(0);
}
```

**Checkpoint:** Hover states provide clear feedback ✓

**Commit:** `style(timeline): add hover and active states`

---

### Step 4.3: Responsive Design (10 minutes)

#### Test Different Window Sizes
- [ ] Test at minimum width (800px)
- [ ] Test at maximum width
- [ ] Test with long clip names (text ellipsis)
- [ ] Test with short clip names
- [ ] Test with many clips (horizontal scroll)

#### Adjust Responsive Behavior
- [ ] Ensure min-width on clip blocks works
- [ ] Verify horizontal scroll smooth
- [ ] Check timeline header doesn't wrap

**Checkpoint:** Timeline works at all screen sizes ✓

**Commit:** `style(timeline): improve responsive design`

---

## Integration Testing Phase (30 minutes)

### Manual Testing Checklist
- [ ] **Empty state:** Import no clips → See helpful message
- [ ] **Single clip:** Import one clip → Displays, auto-selected → Player loads
- [ ] **Multiple clips:** Import 3+ clips → All display proportionally
- [ ] **Selection:** Click different clips → Only one highlighted → Player updates
- [ ] **Metadata:** Import clips → Header shows correct count and duration
- [ ] **Scroll:** Very long timeline → Horizontal scroll works
- [ ] **Hover:** Hover clips → Visual feedback works
- [ ] **Width:** Clips of different durations → Proportional widths correct

### Integration Tests
- [ ] Import clip → Timeline updates → Select → Player loads
- [ ] Import multiple clips → Select each → Player loads correct one
- [ ] Timeline selection persists when importing new clip
- [ ] Empty timeline shows when all clips removed (if implemented later)

### Console Tests
- [ ] No React warnings
- [ ] No undefined prop errors
- [ ] No console errors on click
- [ ] Clean console output

**Checkpoint:** All integration tests pass ✓

**Commit:** `test(timeline): integration testing complete`

---

## Bug Fixing (If needed)

### Bug #1: Clips Not Displaying
- [ ] Check clips array passed to Timeline
- [ ] Check clips array format matches expected
- [ ] Add console.log(clips) to debug
- [ ] Fix and commit

### Bug #2: Selection Not Working
- [ ] Check onSelectClip prop passed
- [ ] Check click handler calling onSelectClip
- [ ] Verify selectedClipId updates
- [ ] Fix and commit

### Bug #3: Selection Not Updating Player
- [ ] Check VideoPlayer receiving clip prop
- [ ] Check clip path format
- [ ] Verify player loading logic
- [ ] Fix and commit

### Bug #4: Width Calculation Wrong
- [ ] Check duration values
- [ ] Check percentage calculation
- [ ] Add debugging logs
- [ ] Fix and commit

---

## Documentation Phase (15 minutes)

### Add Comments
- [ ] Add JSDoc comments to Timeline component
```javascript
/**
 * Timeline component displays imported video clips
 * @param {Array} clips - Array of clip objects
 * @param {string|null} selectedClipId - ID of selected clip
 * @param {Function} onSelectClip - Handler for clip selection
 */
```

- [ ] Add comments for complex logic (width calculation, selection)
- [ ] Add comments for empty state logic

### Update README
- [ ] Document Timeline component in README.md
- [ ] Add screenshot or description of timeline feature
- [ ] Note any known limitations

**Checkpoint:** Code is well-documented ✓

**Commit:** `docs(timeline): add code comments and documentation`

---

## Final Testing Phase (15 minutes)

### Pre-Merge Checklist
- [ ] App launches without errors
- [ ] Timeline displays correctly
- [ ] All interactions work smoothly
- [ ] No console errors or warnings
- [ ] Code follows project style
- [ ] Comments added for complex logic
- [ ] All tests pass (manual)

### Clean Code Review
- [ ] Remove console.logs (if any added for debugging)
- [ ] Remove TODO comments
- [ ] Ensure consistent formatting
- [ ] Verify no commented-out code
- [ ] Check for unused imports

**Checkpoint:** Code is clean and ready ✓

---

## Completion Checklist

- [ ] All tasks checked off
- [ ] Timeline displays clips horizontally
- [ ] Clip names and durations visible
- [ ] Clicking clips selects them
- [ ] Selected clip highlighted
- [ ] Selection updates video player
- [ ] Empty state shows helpful message
- [ ] Timeline updates on import
- [ ] No console errors
- [ ] Code is clean and documented
- [ ] Tests pass
- [ ] README updated

**Time Tracking:**
- [ ] Record actual time taken
- [ ] Compare to 4-hour estimate
- [ ] Note any deviations and why

**Status:** ✅ COMPLETE / 🚧 IN PROGRESS / 📋 NOT STARTED

---

## Notes Section

**Progress Updates:**
- [Add notes as you work, e.g., "Took 1.5 hours for selection, had bug with player not updating"]

**Decisions Made:**
- [Add any decisions deviating from plan]

**Issues Encountered:**
- [Document any problems and solutions]

**Time Spent:**
- [Keep track of actual time]

---

**Ready to start!** Begin with Phase 1, Step 1.1: Create Timeline Component. 🚀


