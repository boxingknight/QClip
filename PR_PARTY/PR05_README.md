# PR#5: Timeline Component - Quick Start

---

## TL;DR (30 seconds)

**What:** Build a visual timeline showing imported video clips horizontally with proportional widths based on duration. Users can click clips to select them for editing.

**Why:** The timeline is the central organizing element of any video editor - it shows what's been imported, allows clip selection, and connects to the player/trim/export workflow.

**Time:** 4 hours estimated

**Complexity:** MEDIUM

**Status:** 📋 READY TO START

---

## Decision Framework (2 minutes)

### Should You Build This Now?

**Green Lights (Build it!):**
- ✅ PR #2 (Import) complete with clips in state
- ✅ PR #3 (Player) complete and working
- ✅ You have 4+ hours available
- ✅ Clear understanding of how selection should work
- ✅ Excited to see visual timeline come together

**Red Lights (Skip/defer):**
- ❌ PR #2 not complete - No clips data to display
- ❌ PR #3 not complete - Can't connect to player
- ❌ Less than 2 hours available (won't finish in time)
- ❌ Confused about component communication

**Decision Aid:** If imports work but player isn't ready, you can still build the timeline and test with mock data.

---

## Prerequisites (5 minutes)

### Required
- [ ] PR #2 (Import) deployed and working
- [ ] PR #3 (Player) deployed and working
- [ ] App.js has clips state array working
- [ ] Git branch: `git checkout -b feature/pr05-timeline`

### Understanding Needed
- **React:** Component creation, props, state lifting
- **CSS:** Flexbox layout, transitions, hover states
- **Data flow:** Timeline → App state → VideoPlayer

### Files You'll Create
- `src/components/Timeline.js` (~150-200 lines)
- `src/styles/Timeline.css` (~100-150 lines)
- `src/utils/timeHelpers.js` (~20 lines)

### Files You'll Modify
- `src/App.js` (+50/-10 lines) - Add selection state
- `src/components/VideoPlayer.js` - (May need updates if not from PR#3)

---

## Getting Started (First Hour)

### Step 1: Read Documentation (20 minutes)
- [ ] Read this quick start (5 min)
- [ ] Read main specification `PR05_TIMELINE_COMPONENT.md` (15 min)
- [ ] Note any questions

### Step 2: Setup Environment (10 minutes)
- [ ] Check out branch (if not already)
```bash
git checkout -b feature/pr05-timeline
```
- [ ] Verify clips import is working
- [ ] Verify player loads clips correctly
- [ ] Open relevant files in editor

### Step 3: Start Phase 1 (30 minutes)
- [ ] Open `PR05_IMPLEMENTATION_CHECKLIST.md`
- [ ] Follow Phase 1 tasks step-by-step
- [ ] Commit after each checkpoint

---

## Daily Progress Template

### First 30 Minutes
- [ ] Create Timeline.js structure
- [ ] Create Timeline.css
- [ ] Add time formatting utility

**Checkpoint:** Timeline placeholder renders

### Next 60 Minutes
- [ ] Implement empty state
- [ ] Create ClipBlock component
- [ ] Map clips to timeline with proportional widths
- [ ] Add timeline header with metadata

**Checkpoint:** All clips display correctly

### Next 60 Minutes
- [ ] Add selection state to App.js
- [ ] Implement click handlers
- [ ] Add visual highlight for selection
- [ ] Connect selection to VideoPlayer
- [ ] Auto-select first imported clip

**Checkpoint:** Clicking clips selects them and loads in player

### Final 30 Minutes
- [ ] Polish empty state
- [ ] Add hover effects
- [ ] Test responsive design
- [ ] Integration testing
- [ ] Final polish and cleanup

**Checkpoint:** Complete, working timeline component

---

## Common Issues & Solutions

### Issue 1: Clips Not Displaying
**Symptoms:** Timeline shows empty state even with clips  
**Cause:** Props not passed correctly  
**Solution:**
```javascript
// Check App.js - are you passing clips?
<Timeline clips={clips} />

// Add debug:
console.log('Timeline clips:', clips);
```
**Prevention:** Always check props in React DevTools

### Issue 2: Selection Not Working
**Symptoms:** Clicking clips does nothing  
**Cause:** onSelectClip not called or state not updating  
**Solution:**
```javascript
// In Timeline, verify click handler:
onClick={() => onSelectClip(clip.id)}

// In App, check handler exists:
const handleSelectClip = (clipId) => {
  console.log('Selecting clip:', clipId);
  setSelectedClipId(clipId);
};
```
**Prevention:** Add console.logs, verify state updates in DevTools

### Issue 3: Selection Not Updating Player
**Symptoms:** Clip selected but player doesn't change  
**Cause:** VideoPlayer not receiving updated clip  
**Solution:**
```javascript
// In App.js, verify passing selected clip:
const selectedClip = clips.find(c => c.id === selectedClipId);

<VideoPlayer clip={selectedClip} />
```
**Prevention:** Test prop flow from Timeline → App → VideoPlayer

### Issue 4: Width Calculation Broken
**Symptoms:** All clips same width or incorrect widths  
**Cause:** Division by zero or totalDuration is 0  
**Solution:**
```javascript
// Add guard:
const totalDuration = clips.reduce((sum, c) => sum + c.duration, 0) || 1;

// Check individual durations:
clips.forEach(clip => {
  console.log(clip.name, clip.duration);
});
```
**Prevention:** Validate clips data structure on import

### Issue 5: CSS Not Applying
**Symptoms:** Component renders but unstyled  
**Cause:** CSS import path or class names  
**Solution:**
```javascript
// Check import:
import './Timeline.css'; // Not '../styles/Timeline.css' if component in src/components/

// Check class names match:
className="clip-block" // In JSX
.clip-block { } // In CSS
```
**Prevention:** Use consistent naming, double-check paths

---

## Quick Reference

### Key Files
- `src/components/Timeline.js` - Main component (~150-200 lines)
- `src/styles/Timeline.css` - All timeline styles (~100-150 lines)
- `src/utils/timeHelpers.js` - Duration formatting (~20 lines)
- `src/App.js` - State management (add selection state)

### Key Functions
- `Timeline({ clips, selectedClipId, onSelectClip })` - Main component
- `formatDuration(seconds)` - Format seconds to MM:SS
- `handleSelectClip(clipId)` - Update selection in App state

### Key Concepts
- **Proportional widths:** `(clip.duration / totalDuration) * 100`
- **Selection state:** Lift to App.js for single source of truth
- **Empty state:** Show when clips.length === 0
- **Click handler:** Call onSelectClip with clip.id

### Useful Commands
```bash
# Start dev server
npm start

# Check React component tree
# Open React DevTools in browser

# Test clip selection
# Click clips, watch selectedClipId update

# Test player integration
# Select clip, verify player loads it
```

---

## Success Metrics

### You'll Know It's Working When:
- [ ] Timeline shows imported clips horizontally
- [ ] Clip names and durations visible on each clip
- [ ] Clips have proportional widths based on duration
- [ ] Clicking a clip highlights it
- [ ] Only one clip can be selected at a time
- [ ] Selecting a clip loads it in the video player
- [ ] Empty timeline shows helpful message when no clips
- [ ] Timeline header shows clip count and total duration
- [ ] Hover effects provide visual feedback
- [ ] No console errors

### Performance Targets
- Timeline renders 10+ clips without lag
- Selection updates instantly (<100ms)
- No memory leaks on import/selection
- Smooth scrolling with many clips

---

## Architecture

### Data Flow
```
Timeline Component
↓ (clips, selectedClipId, onSelectClip props)
App.js (State Manager)
↓ (selectedClip prop)
VideoPlayer Component
```

### Selection Flow
```
User clicks clip
→ Timeline calls onSelectClip(clip.id)
→ App state: setSelectedClipId(clip.id)
→ Timeline re-renders with updated selectedClipId
→ VideoPlayer receives updated clip prop
→ VideoPlayer loads new clip
```

---

## Testing Strategy

### Quick Tests (10 minutes)
1. **Empty state:** No clips → See helpful message ✓
2. **Single clip:** Import one → Displayed, auto-selected ✓
3. **Multiple clips:** Import 3+ → All displayed proportionally ✓
4. **Selection:** Click clips → Highlights, player updates ✓
5. **Data accuracy:** Check clip names/durations match imported files ✓

### Integration Tests (20 minutes)
1. Import → Timeline updates → Select → Player loads ✓
2. Import multiple → Select different clips → Player updates ✓
3. Timeline metadata matches actual clip data ✓
4. Selection persists when possible ✓

---

## Help & Support

### Stuck on Something?
1. Check `PR05_TIMELINE_COMPONENT.md` for detailed explanations
2. Review similar component patterns (search GitHub for "timeline components")
3. Check React DevTools for state/props issues
4. Review console for errors

### Want to Skip Some Features?
**Can Skip:**
- Timeline metadata header (nice-to-have)
- Enhanced empty state (basic message is fine)
- Complex hover animations (simple hover is fine)

**Cannot Skip:**
- Clip display with proportional widths
- Click selection
- Visual highlight
- Connection to player

### Running Out of Time?
**Priority Order:**
1. CRITICAL: Display clips, click selection, highlight ✓
2. IMPORTANT: Connect to player, proportional widths ✓
3. NICE-TO-HAVE: Metadata header, enhanced empty state

---

## Motivation

**You're building the visual heart of the video editor!** 💪

This is the component that makes the app feel like a real video editor. Seeing clips appear on the timeline is satisfying, and the ability to click to select creates an intuitive workflow. You're connecting all the pieces:

- Import (PR #2) → Provides data
- Timeline (PR #5) → Visualizes data, enables selection
- Player (PR #3) → Shows selected clip
- Trim (PR #6) → Edits selected clip
- Export (PR #4) → Outputs edited clip

The timeline is the bridge that makes everything work together.

---

## Next Steps

### When Ready:
1. Read main specification (20 min)
2. Setup environment (10 min)
3. Start Phase 1 from checklist (30 min)
4. Commit early and often
5. Celebrate milestones! 🎉

### After Completion:
- Commit with descriptive message
- Test integration with player
- Update progress.md
- Merge to main
- Move to PR #6: Trim Controls

**Status:** Ready to build! 🚀

**Remember:** Start simple (placeholder), then add features incrementally (empty state, clip display, selection, integration). You've got this!


