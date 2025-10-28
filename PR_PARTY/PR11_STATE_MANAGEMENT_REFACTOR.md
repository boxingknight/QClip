# PR#11: State Management Refactor

**Estimated Time:** 4-6 hours  
**Complexity:** HIGH  
**Dependencies:** MVP Complete (PRs #1-10)  
**Priority:** CRITICAL - Foundation for all V2 features

---

## Overview

### What We're Building
Refactor ClipForge's state management from local useState to Context API to support scalable multi-track timeline editing, project management, and advanced V2 features. This PR establishes the architectural foundation that enables all subsequent V2 development.

### Why It Matters
The MVP uses simple useState in App.js for state management, which works for single-clip editing but becomes unmanageable with:
- Multiple tracks (video, overlay, audio)
- Complex timeline operations (drag-drop, split, undo/redo)
- Project save/load functionality
- Recording state management
- UI state (modals, toasts, loading states)

Context API provides centralized state management that scales to V2's complexity while maintaining React's component model.

### Success in One Sentence
"This PR is successful when all MVP functionality works identically but now uses Context API for state management, enabling multi-track timeline development."

---

## Technical Design

### Architecture Decisions

#### Decision 1: Context API vs External State Management
**Options Considered:**
1. Context API - Built into React, simpler setup
2. Zustand - Lightweight external library
3. Redux - Full-featured but complex

**Chosen:** Context API

**Rationale:**
- Built into React (no additional dependencies)
- Sufficient for ClipForge's state complexity
- Easier to understand and maintain
- Better TypeScript support
- Simpler testing

**Trade-offs:**
- Gain: Simplicity, no external dependencies
- Lose: Some performance optimizations (not critical for ClipForge)

#### Decision 2: Context Structure
**Options Considered:**
1. Single large context with all state
2. Multiple focused contexts (Timeline, Project, UI)
3. Hybrid approach (separate contexts + shared utilities)

**Chosen:** Multiple focused contexts

**Rationale:**
- Better separation of concerns
- Easier to test individual contexts
- Prevents unnecessary re-renders
- More maintainable as features grow

**Trade-offs:**
- Gain: Better organization, performance
- Lose: Slightly more complex provider setup

#### Decision 3: State Shape Design
**Options Considered:**
1. Flat state structure
2. Nested state with normalization
3. Normalized state with references

**Chosen:** Nested state with normalization

**Rationale:**
- Easier to work with for timeline operations
- Clear hierarchy (project → tracks → clips)
- Sufficient for ClipForge's scale
- Easier debugging

**Trade-offs:**
- Gain: Simplicity, clarity
- Lose: Some update complexity (manageable with helpers)

### Data Model

**TimelineContext State:**
```javascript
{
  clips: [
    {
      id: 'clip-1',
      name: 'video1.mp4',
      path: '/path/to/video1.mp4',
      duration: 30.5,
      startTime: 0,
      trackId: 'video-1',
      trimIn: 0,
      trimOut: 30.5,
      effects: []
    }
  ],
  tracks: [
    {
      id: 'video-1',
      type: 'video',
      name: 'Video Track 1',
      clips: ['clip-1'],
      height: 60,
      muted: false,
      locked: false
    },
    {
      id: 'video-2', 
      type: 'video',
      name: 'Video Track 2',
      clips: [],
      height: 60,
      muted: false,
      locked: false
    },
    {
      id: 'audio-1',
      type: 'audio', 
      name: 'Audio Track',
      clips: [],
      height: 40,
      muted: false,
      locked: false
    }
  ],
  selectedClipId: 'clip-1',
  playhead: 0,
  zoom: 1,
  duration: 30.5
}
```

**ProjectContext State:**
```javascript
{
  projectName: 'Untitled Project',
  projectPath: null,
  isModified: false,
  lastSaved: null,
  settings: {
    resolution: { width: 1920, height: 1080 },
    framerate: 30,
    duration: 0
  }
}
```

**UIContext State:**
```javascript
{
  modals: {
    exportSettings: { isOpen: false, data: null },
    projectSettings: { isOpen: false, data: null }
  },
  toasts: [
    { id: 'toast-1', type: 'success', message: 'Export complete', duration: 3000 }
  ],
  loading: {
    export: false,
    import: false,
    recording: false
  }
}
```

### API Design

**TimelineContext Actions:**
```javascript
/**
 * Add a new clip to the timeline
 * @param {Object} clip - Clip data (name, path, duration)
 * @param {string} trackId - Target track ID
 * @returns {void}
 */
const addClip = (clip, trackId) => {
  // Generate unique ID
  // Add to clips array
  // Add clip ID to track clips array
  // Update timeline duration
};

/**
 * Move a clip to a new position or track
 * @param {string} clipId - Clip to move
 * @param {string} newTrackId - Target track
 * @param {number} newStartTime - New start time
 * @returns {void}
 */
const moveClip = (clipId, newTrackId, newStartTime) => {
  // Update clip trackId and startTime
  // Remove from old track clips array
  // Add to new track clips array
  // Sort clips by startTime
};

/**
 * Select a clip for editing
 * @param {string} clipId - Clip to select
 * @returns {void}
 */
const selectClip = (clipId) => {
  // Update selectedClipId
  // Update video player source
};

/**
 * Split a clip at the current playhead
 * @param {string} clipId - Clip to split
 * @param {number} splitTime - Time to split at
 * @returns {void}
 */
const splitClip = (clipId, splitTime) => {
  // Create two new clips from original
  // Update durations and start times
  // Replace original clip with two new clips
  // Update track clips arrays
};
```

**ProjectContext Actions:**
```javascript
/**
 * Create a new project
 * @param {string} projectName - Name for the project
 * @returns {void}
 */
const createProject = (projectName) => {
  // Reset all state to defaults
  // Set project name
  // Mark as modified
};

/**
 * Save current project to file
 * @param {string} filePath - Path to save to
 * @returns {Promise<void>}
 */
const saveProject = async (filePath) => {
  // Serialize all context state
  // Write to .clipforge file
  // Update project path and saved time
  // Mark as not modified
};

/**
 * Load project from file
 * @param {string} filePath - Path to load from
 * @returns {Promise<void>}
 */
const loadProject = async (filePath) => {
  // Read .clipforge file
  // Deserialize state
  // Update all contexts
  // Mark as not modified
};
```

### Component Hierarchy
```
App/
├── TimelineProvider
│   ├── ProjectProvider
│   │   ├── UIProvider
│   │   │   ├── Toolbar
│   │   │   ├── Timeline
│   │   │   │   ├── Track (multiple)
│   │   │   │   │   └── Clip (multiple)
│   │   │   │   └── Playhead
│   │   │   ├── VideoPlayer
│   │   │   ├── ImportPanel
│   │   │   ├── ExportPanel
│   │   │   └── StatusBar
│   │   │   └── ToastContainer
│   │   │   └── ModalContainer
```

---

## Implementation Details

### File Structure
**New Files:**
```
src/
├── context/
│   ├── TimelineContext.js (~200 lines)
│   ├── ProjectContext.js (~150 lines)
│   └── UIContext.js (~100 lines)
├── hooks/
│   ├── useTimeline.js (~50 lines)
│   ├── useProject.js (~50 lines)
│   └── useUI.js (~50 lines)
└── utils/
    └── timelineCalculations.js (~100 lines)
```

**Modified Files:**
- `src/App.js` (+100/-50 lines) - Context providers, state refactor
- `src/components/Timeline.js` (+50/-30 lines) - Use TimelineContext
- `src/components/VideoPlayer.js` (+20/-10 lines) - Use TimelineContext
- `src/components/ImportPanel.js` (+30/-20 lines) - Use TimelineContext
- `src/components/ExportPanel.js` (+20/-10 lines) - Use TimelineContext

### Key Implementation Steps

#### Phase 1: Create Context Providers (1.5 hours)
1. Create TimelineContext with state and actions
2. Create ProjectContext with state and actions  
3. Create UIContext with state and actions
4. Create custom hooks for each context
5. Test contexts in isolation

#### Phase 2: Refactor App Component (1 hour)
1. Wrap App with context providers
2. Remove local state from App.js
3. Update App to use context hooks
4. Test MVP functionality still works

#### Phase 3: Update Components (1.5 hours)
1. Refactor Timeline component to use TimelineContext
2. Refactor VideoPlayer to use TimelineContext
3. Refactor ImportPanel to use TimelineContext
4. Refactor ExportPanel to use TimelineContext
5. Test all components work together

#### Phase 4: Create Utilities (1 hour)
1. Create timeline calculation utilities
2. Add helper functions for common operations
3. Test utility functions
4. Update components to use utilities

### Code Examples

**TimelineContext Implementation:**
```javascript
// src/context/TimelineContext.js
import React, { createContext, useContext, useReducer } from 'react';

const TimelineContext = createContext();

const initialState = {
  clips: [],
  tracks: [
    { id: 'video-1', type: 'video', name: 'Video Track 1', clips: [], height: 60, muted: false, locked: false },
    { id: 'video-2', type: 'video', name: 'Video Track 2', clips: [], height: 60, muted: false, locked: false },
    { id: 'audio-1', type: 'audio', name: 'Audio Track', clips: [], height: 40, muted: false, locked: false }
  ],
  selectedClipId: null,
  playhead: 0,
  zoom: 1,
  duration: 0
};

const timelineReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_CLIP':
      const newClip = {
        id: `clip-${Date.now()}`,
        ...action.clip,
        trackId: action.trackId,
        startTime: action.startTime || 0,
        trimIn: 0,
        trimOut: action.clip.duration,
        effects: []
      };
      
      return {
        ...state,
        clips: [...state.clips, newClip],
        tracks: state.tracks.map(track => 
          track.id === action.trackId 
            ? { ...track, clips: [...track.clips, newClip.id] }
            : track
        ),
        duration: Math.max(state.duration, newClip.startTime + newClip.duration)
      };

    case 'SELECT_CLIP':
      return {
        ...state,
        selectedClipId: action.clipId
      };

    case 'MOVE_CLIP':
      return {
        ...state,
        clips: state.clips.map(clip =>
          clip.id === action.clipId
            ? { ...clip, trackId: action.newTrackId, startTime: action.newStartTime }
            : clip
        ),
        tracks: state.tracks.map(track => ({
          ...track,
          clips: track.clips.filter(clipId => 
            clipId !== action.clipId || track.id === action.newTrackId
          )
        }))
      };

    case 'SET_PLAYHEAD':
      return {
        ...state,
        playhead: action.time
      };

    default:
      return state;
  }
};

export const TimelineProvider = ({ children }) => {
  const [state, dispatch] = useReducer(timelineReducer, initialState);

  const addClip = (clip, trackId, startTime = 0) => {
    dispatch({ type: 'ADD_CLIP', clip, trackId, startTime });
  };

  const selectClip = (clipId) => {
    dispatch({ type: 'SELECT_CLIP', clipId });
  };

  const moveClip = (clipId, newTrackId, newStartTime) => {
    dispatch({ type: 'MOVE_CLIP', clipId, newTrackId, newStartTime });
  };

  const setPlayhead = (time) => {
    dispatch({ type: 'SET_PLAYHEAD', time });
  };

  const value = {
    ...state,
    addClip,
    selectClip,
    moveClip,
    setPlayhead
  };

  return (
    <TimelineContext.Provider value={value}>
      {children}
    </TimelineContext.Provider>
  );
};

export const useTimeline = () => {
  const context = useContext(TimelineContext);
  if (!context) {
    throw new Error('useTimeline must be used within a TimelineProvider');
  }
  return context;
};
```

**App Component Refactor:**
```javascript
// src/App.js (refactored)
import React from 'react';
import { TimelineProvider } from './context/TimelineContext';
import { ProjectProvider } from './context/ProjectContext';
import { UIProvider } from './context/UIContext';
import Timeline from './components/Timeline';
import VideoPlayer from './components/VideoPlayer';
import ImportPanel from './components/ImportPanel';
import ExportPanel from './components/ExportPanel';
import './App.css';

function App() {
  return (
    <TimelineProvider>
      <ProjectProvider>
        <UIProvider>
          <div className="app">
            <div className="app-header">
              <h1>ClipForge</h1>
            </div>
            
            <div className="app-content">
              <div className="left-panel">
                <ImportPanel />
              </div>
              
              <div className="center-panel">
                <VideoPlayer />
                <Timeline />
              </div>
              
              <div className="right-panel">
                <ExportPanel />
              </div>
            </div>
          </div>
        </UIProvider>
      </ProjectProvider>
    </TimelineProvider>
  );
}

export default App;
```

**Timeline Component Refactor:**
```javascript
// src/components/Timeline.js (refactored)
import React from 'react';
import { useTimeline } from '../context/TimelineContext';
import './styles/Timeline.css';

const Timeline = () => {
  const { clips, tracks, selectedClipId, playhead, selectClip } = useTimeline();

  const handleClipClick = (clipId) => {
    selectClip(clipId);
  };

  return (
    <div className="timeline">
      <div className="timeline-header">
        <h3>Timeline</h3>
        <div className="timeline-controls">
          <span>Zoom: 1x</span>
          <span>Duration: {Math.round(playhead)}s</span>
        </div>
      </div>
      
      <div className="timeline-tracks">
        {tracks.map(track => (
          <div key={track.id} className="track">
            <div className="track-header">
              <span className="track-name">{track.name}</span>
              <div className="track-controls">
                <button className="mute-btn">M</button>
                <button className="lock-btn">L</button>
              </div>
            </div>
            
            <div className="track-content">
              {track.clips.map(clipId => {
                const clip = clips.find(c => c.id === clipId);
                if (!clip) return null;
                
                return (
                  <div
                    key={clip.id}
                    className={`clip ${selectedClipId === clip.id ? 'selected' : ''}`}
                    onClick={() => handleClipClick(clip.id)}
                    style={{
                      left: `${(clip.startTime / 60) * 100}%`,
                      width: `${(clip.duration / 60) * 100}%`
                    }}
                  >
                    <span className="clip-name">{clip.name}</span>
                    <span className="clip-duration">{Math.round(clip.duration)}s</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      <div 
        className="playhead"
        style={{ left: `${(playhead / 60) * 100}%` }}
      />
    </div>
  );
};

export default Timeline;
```

---

## Testing Strategy

### Test Categories

**Unit Tests:**
- TimelineContext reducer actions
- ProjectContext reducer actions
- UIContext reducer actions
- Timeline calculation utilities
- Custom hooks

**Integration Tests:**
- Context providers work together
- Components use context correctly
- State updates propagate properly
- MVP functionality preserved

**Manual Tests:**
- Import video → appears in timeline
- Select clip → video player updates
- Trim clip → export uses trim points
- All existing features work identically

### Test Cases

**TimelineContext Tests:**
```javascript
describe('TimelineContext', () => {
  test('addClip adds clip to correct track', () => {
    const { result } = renderHook(() => useTimeline(), {
      wrapper: TimelineProvider
    });
    
    const clip = { name: 'test.mp4', duration: 30 };
    result.current.addClip(clip, 'video-1');
    
    expect(result.current.clips).toHaveLength(1);
    expect(result.current.tracks[0].clips).toContain(result.current.clips[0].id);
  });

  test('selectClip updates selectedClipId', () => {
    // Test implementation
  });

  test('moveClip moves clip between tracks', () => {
    // Test implementation
  });
});
```

**Integration Tests:**
```javascript
describe('Context Integration', () => {
  test('Timeline component uses TimelineContext', () => {
    render(
      <TimelineProvider>
        <Timeline />
      </TimelineProvider>
    );
    
    // Verify timeline renders with context data
    expect(screen.getByText('Timeline')).toBeInTheDocument();
  });

  test('VideoPlayer updates when clip selected', () => {
    // Test video player updates with selected clip
  });
});
```

**Manual Test Checklist:**
- [ ] Import video file → appears in timeline
- [ ] Click clip in timeline → video player shows clip
- [ ] Set trim points → export uses trim
- [ ] All existing UI works identically
- [ ] No console errors
- [ ] Performance similar to MVP

---

## Success Criteria

**Feature is complete when:**
- [ ] All three contexts created and working
- [ ] App component uses context providers
- [ ] All components refactored to use contexts
- [ ] Timeline utilities created and tested
- [ ] All MVP functionality preserved
- [ ] No prop drilling remains
- [ ] Context providers properly nested
- [ ] Performance similar to MVP
- [ ] No console errors
- [ ] Ready for multi-track timeline development

**Performance Targets:**
- App launch time: <3 seconds (same as MVP)
- Timeline render time: <100ms for 10 clips
- Context update time: <50ms for state changes
- Memory usage: <50MB increase over MVP

**Quality Gates:**
- All existing tests pass
- No TypeScript errors
- No console warnings
- MVP workflow identical to before

---

## Risk Assessment

### Risk 1: Breaking MVP Functionality
**Likelihood:** MEDIUM  
**Impact:** HIGH  
**Mitigation:** 
- Test after each phase
- Keep MVP tests running
- Refactor incrementally
- Rollback plan ready

**Status:** 🟡 MEDIUM

### Risk 2: Context Performance Issues
**Likelihood:** LOW  
**Impact:** MEDIUM  
**Mitigation:**
- Use useMemo for expensive calculations
- Split contexts to prevent unnecessary re-renders
- Profile performance during development

**Status:** 🟢 LOW

### Risk 3: State Management Complexity
**Likelihood:** MEDIUM  
**Impact:** MEDIUM  
**Mitigation:**
- Start with simple state shapes
- Use reducer pattern for complex updates
- Document state structure clearly
- Test state transitions thoroughly

**Status:** 🟡 MEDIUM

### Risk 4: Component Refactoring Errors
**Likelihood:** HIGH  
**Impact:** MEDIUM  
**Mitigation:**
- Refactor one component at a time
- Test each component individually
- Keep original components as backup
- Use TypeScript for better error catching

**Status:** 🔴 HIGH

---

## Open Questions

1. **State Normalization:** Should we normalize clip/track relationships?
   - Option A: Keep nested structure (simpler)
   - Option B: Normalize with references (more complex)
   - Decision needed by: Phase 1

2. **Context Splitting:** Should we split TimelineContext further?
   - Option A: Keep single TimelineContext (current plan)
   - Option B: Split into ClipsContext + TracksContext
   - Decision needed by: Phase 1

3. **Undo/Redo Integration:** Should we prepare state for undo/redo?
   - Option A: Add undo/redo in separate PR
   - Option B: Prepare state structure now
   - Decision needed by: Phase 2

---

## Timeline

**Total Estimate:** 4-6 hours

| Phase | Task | Time | Status |
|-------|------|------|--------|
| 1 | Create Context Providers | 1.5h | ⏳ |
| 2 | Refactor App Component | 1h | ⏳ |
| 3 | Update Components | 1.5h | ⏳ |
| 4 | Create Utilities | 1h | ⏳ |
| 5 | Testing & Validation | 1h | ⏳ |

---

## Dependencies

**Requires:**
- [ ] MVP complete (PRs #1-10)
- [ ] All existing components working
- [ ] Test suite passing

**Blocks:**
- PR #12 (UI Component Library)
- PR #13 (Multi-Track Timeline)
- All subsequent V2 PRs

---

## References

- Related PR: [#12] (UI Component Library)
- Architecture doc: [clipforge-prd-v2.md]
- Context API docs: [React Context API]
- Similar implementation: [PR #5 Timeline Component]

---

**Document Status:** Ready for Implementation  
**Next Action:** Begin Phase 1 - Create Context Providers

