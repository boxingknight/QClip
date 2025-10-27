# PR#6: Trim Controls - Quick Start

---

## TL;DR (30 seconds)

**What:** Add trim controls to set in-point and out-point on video clips, enabling users to export specific segments.

**Why:** Essential feature for video editing—users need to extract specific moments from long clips.

**Time:** 6 hours estimated

**Complexity:** MEDIUM-HIGH

**Status:** 📋 READY TO START

---

## Decision Framework (2 minutes)

### Should You Build This Feature?

**Green Lights (Build it!):**
- ✅ PR #3 (Video Player) is complete with time tracking
- ✅ PR #5 (Timeline) is complete with clip selection
- ✅ You have 6+ hours available
- ✅ You understand the trim workflow (set in/out points, export segment)
- ✅ You're comfortable with React state management

**Red Lights (Defer it!):**
- ❌ Video Player time updates not implemented
- ❌ Timeline component not working
- ❌ Less than 4 hours available (minimum viable trim)
- ❌ Unfamiliar with state lifting patterns
- ❌ Other critical features incomplete

**Decision Aid:** If you can successfully import a video, play it, and see it on the timeline, you're ready. Trim builds on these foundations.

---

## Prerequisites (5 minutes)

### Required
- [ ] PR #3: Video Player complete and functional
- [ ] PR #5: Timeline complete with clip selection
- [ ] App.js has clips state array
- [ ] Selected clip can be played in VideoPlayer
- [ ] Current playback time accessible from VideoPlayer

### Setup Commands
```bash
# 1. Ensure previous PRs are complete
# (PR #3 and PR #5 should be merged)

# 2. Create feature branch
git checkout -b feature/pr06-trim-controls

# 3. Verify dependencies
npm list | grep -E "react|electron"

# 4. Launch app to verify current state
npm start
```

---

## Getting Started (First Hour)

### Step 1: Read Documentation (20 minutes)
- [ ] Read this quick start (you're doing it!)
- [ ] Read `PR06_TRIM_CONTROLS.md` main specification (15 min)
- [ ] Review `PR06_IMPLEMENTATION_CHECKLIST.md` structure (5 min)
- [ ] Note any questions or concerns

### Step 2: Understand the Workflow (15 minutes)
- [ ] Understand trim concept: marking start and end points
- [ ] Visualize workflow:
  1. Import video
  2. Play video and scrub
  3. Click "Set In" at desired start
  4. Click "Set Out" at desired end
  5. Export trimmed video
- [ ] Review state flow diagram in main spec
- [ ] Understand trimData structure: `{ inPoint: 0, outPoint: duration }`

### Step 3: Set Up Environment (15 minutes)
- [ ] Open `src/App.js` in editor
- [ ] Open `src/components/VideoPlayer.js`
- [ ] Open `src/components/Timeline.js`
- [ ] Create `src/components/TrimControls.js` (empty for now)
- [ ] Create `src/styles/TrimControls.css` (empty for now)
- [ ] Note current state structure in App.js

### Step 4: Start Phase 1 (First 10 minutes of implementation)
- [ ] Open `PR06_IMPLEMENTATION_CHECKLIST.md`
- [ ] Begin Step 1.1: Create TrimControls component structure
- [ ] Check off items as you complete them
- [ ] Commit frequently

---

## Daily Progress Template

### Day 1: Component Building (3 hours)

**Morning Session (90 minutes)**
- [ ] Task 1.1: Create TrimControls structure (20 min)
- [ ] Task 1.2: Add current time display (15 min)
- [ ] Task 1.3: Add Set In button (15 min)
- [ ] Task 1.4: Add Set Out button (15 min)
- [ ] Task 1.5: Add Reset button (10 min)
- [ ] Task 1.6: Add error display (15 min)

**Checkpoint:** TrimControls renders with all buttons

**Afternoon Session (90 minutes)**
- [ ] Task 2.1: Add trim data state (10 min)
- [ ] Task 2.2: Add current time state (10 min)
- [ ] Task 2.3: Create Set In handler (10 min)
- [ ] Task 2.4: Create Set Out handler (10 min)
- [ ] Task 2.5: Create Reset handler (10 min)
- [ ] Task 2.6: Add validation logic (10 min)
- [ ] Task 3.1: Add time update prop (15 min)
- [ ] Task 3.2: Connect to App (15 min)
- [ ] Test: Set In/Out works ✓

**Checkpoint:** Trim state management complete

---

### Day 2: Integration (3 hours)

**Morning Session (90 minutes)**
- [ ] Task 4.1: Modify Timeline component (30 min)
- [ ] Task 4.2: Render trim indicators (40 min)
- [ ] Task 4.3: Style trim indicators (20 min)

**Checkpoint:** Timeline shows trim indicators

**Afternoon Session (90 minutes)**
- [ ] Task 5.1: Update ExportPanel props (10 min)
- [ ] Task 5.2: Update export handler (20 min)
- [ ] Task 5.3: Update FFmpeg processing (30 min)
- [ ] Task 6.1: Add error states (10 min)
- [ ] Task 6.2: Test workflow (10 min)
- [ ] Task 6.3: Test edge cases (10 min)

**Checkpoint:** Complete workflow tested and working ✓

---

## Common Issues & Solutions

### Issue 1: Time Updates Not Working
**Symptoms:** Current time stays at 0 in TrimControls  
**Cause:** onTimeUpdate not connected or VideoPlayer not emitting  
**Solution:** 
```javascript
// In VideoPlayer.js
useEffect(() => {
  const video = videoRef.current;
  if (!video || !onTimeUpdate) return;
  
  const handleTimeUpdate = () => {
    onTimeUpdate(video.currentTime);
  };
  
  video.addEventListener('timeupdate', handleTimeUpdate);
  
  return () => video.removeEventListener('timeupdate', handleTimeUpdate);
}, [onTimeUpdate]);
```

### Issue 2: Trim Indicators Not Showing
**Symptoms:** Timeline doesn't show trim overlay  
**Cause:** trimData prop not passed or null check missing  
**Solution:** 
```javascript
// In Timeline.js, make sure to pass trimData
<Timeline
  clips={clips}
  selectedClipId={selectedClipId}
  onSelectClip={handleSelectClip}
  trimData={trimData}  // ← Don't forget this
/>
```

### Issue 3: Buttons Disabled Inappropriately
**Symptoms:** Set In/Out buttons always disabled  
**Cause:** Validation logic too strict or currentTime not updating  
**Solution:** Check validation logic:
```javascript
disabled={
  currentTime >= outPoint ||  // Too far right (past out point)
  currentTime < 0             // Before start
}
```

### Issue 4: Exported Video Wrong Duration
**Symptoms:** Exported video not trimmed correctly  
**Cause:** FFmpeg trim logic incorrect or trimData not passed  
**Solution:** Verify FFmpeg integration:
```javascript
if (trimData && trimData.inPoint > 0) {
  command.setStartTime(trimData.inPoint);
}
const duration = trimData.outPoint - trimData.inPoint;
command.setDuration(duration);
```

### Issue 5: Trim Resets Unexpectedly
**Symptoms:** Trim cleared when switching clips  
**Cause:** useEffect clearing on every render  
**Solution:** Check useEffect dependencies:
```javascript
useEffect(() => {
  if (selectedClip) {
    setTrimData({
      inPoint: 0,
      outPoint: selectedClip.duration
    });
  }
}, [selectedClipId, selectedClip?.duration]);  // ← Dependencies
```

---

## Quick Reference

### Key Files
- `src/components/TrimControls.js` - Main trim controls UI (~200 lines)
- `src/styles/TrimControls.css` - Trim control styling (~150 lines)
- `src/App.js` - State management and handlers (+80 lines)
- `src/components/VideoPlayer.js` - Time update callbacks (+30 lines)
- `src/components/Timeline.js` - Trim indicator rendering (+80 lines)
- `src/components/ExportPanel.js` - Trim data integration (+40 lines)
- `electron/ffmpeg/videoProcessing.js` - FFmpeg trim support (+50 lines)

### Key Functions
- `handleSetInPoint()` - Sets in point to current playback time
- `handleSetOutPoint()` - Sets out point to current playback time
- `handleResetTrim()` - Resets trim to full clip
- `handleTimeUpdate(time)` - Updates current time state
- `formatDuration(seconds)` - Formats seconds as MM:SS

### Key State
- `trimData: { inPoint: number, outPoint: number }` - Trim settings
- `currentTime: number` - Current playback position
- Props: `currentTime`, `duration`, `inPoint`, `outPoint`, callbacks

### Key Concepts
- **Non-destructive editing:** Trim doesn't modify original, only export settings
- **Time-based selection:** In/out points marked as seconds from start
- **Visual feedback:** Timeline shows what will be exported
- **Validation:** Prevents invalid trim (in >= out)

### Useful Commands
```bash
# Run app
npm start

# Test trim workflow
# 1. Import video
# 2. Play and scrub
# 3. Set In at 5 seconds
# 4. Set Out at 30 seconds
# 5. Export and verify duration is 25 seconds

# Debug time updates
# Add console.log in handleTimeUpdate to verify updates
```

---

## Success Metrics

**You'll know it's working when:**
- [ ] Current time displays and updates during playback
- [ ] Set In button sets in point to current time
- [ ] Set Out button sets out point to current time
- [ ] Trim indicators show on timeline (darkened/ highlighted regions)
- [ ] Reset button clears trim settings
- [ ] Exported video is correct duration (outPoint - inPoint)
- [ ] Export produces playable MP4 file

**Performance Targets:**
- Time updates: < 100ms delay (60fps acceptable)
- Trim settings: Instant feedback
- Export: Normal FFmpeg export time + trim overhead (~2-5s for typical clip)

**Quality Gates:**
- No console errors during trim workflow
- Buttons disable appropriately
- Error messages clear and helpful
- Visual feedback obvious and accurate
- Timeline indicators match trim settings
- Exported video plays correctly in external player

---

## Help & Support

### Stuck?
1. Check main planning doc (`PR06_TRIM_CONTROLS.md`) for detailed explanations
2. Review implementation checklist for step-by-step guidance
3. Check similar trim implementations in video editing software
4. Verify state flow (VideoPlayer → App → TrimControls → Export)

### Want to Skip a Feature?
Can skip temporarily:
- Visual trim indicators (just use text times)
- Reset button (auto-reset on clip change is enough)
- Detailed validation messages (basic validation sufficient)

Cannot skip:
- Set In/Out buttons (core functionality)
- Trim state management (needed for export)
- Export integration (the whole point!)

### Running Out of Time?
**Minimum Viable Trim (4 hours):**
- Skip trim indicators on timeline
- Skip detailed validation messages
- Just get Set In/Out working and export

**Core Trim (6 hours):**
- Full implementation with all features
- Visual indicators
- Complete validation

---

## Motivation

**You've got this!** 💪

Trim is the feature that transforms ClipForge from a simple player into a real video editor. Once users can mark segments and export them, you have a functional product. The workflow is:

1. Import → 2. Watch → 3. Mark segment → 4. Export

Simple, powerful, and exactly what users need.

**You've already built:**
- ✅ File import system (PR #2)
- ✅ Video playback (PR #3)
- ✅ Timeline display (PR #5)

Now you're adding the **magic** that ties it all together: the ability to extract the perfect moment.

---

## Next Steps

**When ready:**
1. Read main specification (20 min)
2. Review checklist structure (5 min)
3. Start Phase 1 from checklist
4. Commit frequently
5. Test after each phase
6. Celebrate when export produces trimmed video! 🎉

**Status:** Ready to build! 🚀

---

**Remember:** Test early and test often. Set In/Out buttons should work within the first 2 hours. If they don't, something is wrong with the state flow—debug immediately before continuing.

