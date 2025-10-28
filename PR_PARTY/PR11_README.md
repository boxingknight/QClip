# PR#11: State Management Refactor - Quick Start

---

## TL;DR (30 seconds)

**What:** Refactor ClipForge's state management from local useState to Context API for scalable V2 development.

**Why:** MVP's simple state management can't handle multi-track timelines, project save/load, and complex V2 features.

**Time:** 4-6 hours estimated

**Complexity:** HIGH

**Status:** 📋 PLANNED

---

## Decision Framework (2 minutes)

### Should You Build This?

**Green Lights (Build it!):**
- ✅ MVP is complete and working
- ✅ You have 4-6 hours available
- ✅ You understand React Context API
- ✅ You want to enable V2 features
- ✅ You're ready for architectural changes

**Red Lights (Skip/defer it!):**
- ❌ MVP still has bugs or issues
- ❌ Time-constrained (<4 hours)
- ❌ Not comfortable with Context API
- ❌ Want to add V2 features without refactoring
- ❌ Prefer external state management libraries

**Decision Aid:** This is a foundational PR that enables all V2 features. If you want multi-track timelines, project save/load, or recording capabilities, this refactor is essential. Consider it an investment in future development speed.

---

## Prerequisites (5 minutes)

### Required
- [ ] MVP complete (PRs #1-10) and working
- [ ] All existing features tested and functional
- [ ] Understanding of React Context API
- [ ] Git branch ready for V2 development

### Setup Commands
```bash
# 1. Verify MVP is working
npm start
# Test: Import video, play, trim, export

# 2. Create V2 development branch
git checkout -b feat/state-management-refactor

# 3. Verify React version supports Context API
npm list react
# Should show React 16.3+ (Context API introduced in 16.3)
```

---

## Getting Started (First Hour)

### Step 1: Read Documentation (45 minutes)
- [ ] Read this quick start (10 min)
- [ ] Read main specification (25 min)
- [ ] Review implementation checklist (10 min)
- [ ] Note any questions or concerns

### Step 2: Set Up Environment (15 minutes)
- [ ] Verify MVP functionality works
- [ ] Create development branch
- [ ] Open relevant files in editor
- [ ] Review current App.js state structure

### Step 3: Start Phase 1
- [ ] Open implementation checklist
- [ ] Begin creating TimelineContext
- [ ] Test context in isolation
- [ ] Commit when context works

---

## Daily Progress Template

### Day 1 Goals (4-6 hours)
- [ ] Task 1: Create all three contexts (1.5h)
- [ ] Task 2: Refactor App component (1h)
- [ ] Task 3: Update all components (1.5h)
- [ ] Task 4: Create utilities and test (1h)

**Checkpoint:** All MVP functionality works with Context API

### Day 2 Goals (If needed)
- [ ] Task 1: Fix any bugs from Day 1 (1h)
- [ ] Task 2: Performance testing (30 min)
- [ ] Task 3: Documentation updates (30 min)

---

## Common Issues & Solutions

### Issue 1: "useTimeline must be used within a TimelineProvider"
**Symptoms:** Console error when components try to use context  
**Cause:** Component not wrapped in TimelineProvider  
**Solution:** 
```javascript
// Wrap component with provider
<TimelineProvider>
  <YourComponent />
</TimelineProvider>
```

### Issue 2: State not updating when context changes
**Symptoms:** UI doesn't reflect context state changes  
**Cause:** Component not re-rendering on context updates  
**Solution:** 
```javascript
// Make sure you're using the context hook
const { clips, addClip } = useTimeline(); // ✅ Correct
// Not: const clips = someOtherState; // ❌ Wrong
```

### Issue 3: Performance issues with context updates
**Symptoms:** App feels slow, especially with many clips  
**Cause:** Too many components re-rendering on context changes  
**Solution:** 
```javascript
// Use useMemo for expensive calculations
const memoizedClips = useMemo(() => 
  clips.filter(clip => clip.trackId === currentTrack), 
  [clips, currentTrack]
);
```

### Issue 4: MVP functionality broken after refactor
**Symptoms:** Import/play/trim/export no longer works  
**Cause:** Context state not properly initialized or updated  
**Solution:** 
1. Check context initial state matches MVP state
2. Verify all components use context hooks
3. Test each feature individually
4. Compare with original MVP implementation

---

## Quick Reference

### Key Files
- `src/context/TimelineContext.js` - Main timeline state management
- `src/context/ProjectContext.js` - Project save/load state
- `src/context/UIContext.js` - UI state (modals, toasts)
- `src/App.js` - Context provider setup
- `src/utils/timelineCalculations.js` - Timeline utility functions

### Key Functions
- `useTimeline()` - Access timeline state and actions
- `useProject()` - Access project state and actions
- `useUI()` - Access UI state and actions
- `addClip(clip, trackId)` - Add clip to timeline
- `selectClip(clipId)` - Select clip for editing
- `moveClip(clipId, newTrackId, newStartTime)` - Move clip

### Key Concepts
- **Context API:** React's built-in state management solution
- **Provider Pattern:** Wrap components to provide context
- **Custom Hooks:** useTimeline, useProject, useUI for easy access
- **Reducer Pattern:** useReducer for complex state updates
- **State Normalization:** Clips stored separately from tracks

### Useful Commands
```bash
# Start development server
npm start

# Run tests (if available)
npm test

# Check for console errors
# Open DevTools Console and watch for errors

# Verify context is working
# Add console.log in useTimeline hook
```

---

## Success Metrics

**You'll know it's working when:**
- [ ] All MVP features work identically to before
- [ ] No "useTimeline must be used within provider" errors
- [ ] Timeline shows clips from context state
- [ ] Video player updates when clip selected
- [ ] Import adds clips to context state
- [ ] Export works with context data

**Performance Targets:**
- App launch time: <3 seconds (same as MVP)
- Timeline render: <100ms for 10 clips
- Context updates: <50ms for state changes

---

## Help & Support

### Stuck?
1. Check main planning doc for detailed architecture
2. Review implementation checklist for step-by-step guidance
3. Compare with MVP implementation to understand what changed
4. Test each context in isolation before integrating

### Want to Skip This PR?
**Impact:** You won't be able to build V2 features like:
- Multi-track timeline editing
- Project save/load functionality
- Recording state management
- Complex UI state (modals, toasts)

**Alternative:** Use external state management (Zustand, Redux) but this adds dependencies and complexity.

### Running Out of Time?
**Priority Order:**
1. TimelineContext (essential for multi-track)
2. App component refactor (enables everything)
3. Timeline component update (core functionality)
4. Other components (can be done later)

**Minimum Viable:** TimelineContext + App refactor enables multi-track development.

---

## Motivation

**You've got this!** 💪

The MVP is complete and working perfectly. This refactor is just reorganizing the same functionality to be more scalable. You're not changing what ClipForge does - you're making it easier to add powerful V2 features.

**Think of it as:** Moving from a small apartment to a house with room to grow. Same furniture, better foundation.

---

## Next Steps

**When ready:**
1. Run prerequisites (5 min)
2. Read main spec (45 min)
3. Start Phase 1 from checklist
4. Commit early and often

**Status:** Ready to build the foundation for V2! 🚀

---

## Context for Future PRs

**This PR enables:**
- PR #12: UI Component Library (needs UIContext)
- PR #13: Multi-Track Timeline (needs TimelineContext)
- PR #26: Project Save/Load (needs ProjectContext)
- All subsequent V2 PRs depend on this foundation

**After this PR:**
- State management is centralized and scalable
- Components are decoupled from specific state
- New features can be added without prop drilling
- Timeline can support multiple tracks
- Project management becomes possible

---

**Remember:** This is an investment in future development speed. Every hour spent here saves multiple hours in V2 development.

