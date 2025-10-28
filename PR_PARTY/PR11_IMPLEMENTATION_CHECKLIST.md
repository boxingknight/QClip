# PR#11: Implementation Checklist

**Use this as your daily todo list.** Check off items as you complete them.

---

## Pre-Implementation Setup (15 minutes)

- [ ] Read main planning document (~45 min)
- [ ] Prerequisites verified (MVP complete)
- [ ] Dependencies installed
  ```bash
  # No new dependencies needed - using React Context API
  npm list react
  ```
- [ ] Environment configured
  ```bash
  # Verify MVP is working
  npm start
  # Test: Import video, play, trim, export
  ```
- [ ] Git branch created
  ```bash
  git checkout -b feat/state-management-refactor
  ```

---

## Phase 1: Create Context Providers (1.5 hours)

### 1.1: Create TimelineContext (45 minutes)

#### Create File
- [ ] Create `src/context/TimelineContext.js`

#### Define State Structure
- [ ] Add initial state with clips, tracks, selectedClipId, playhead, zoom
  ```javascript
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
  ```

#### Create Reducer
- [ ] Implement timelineReducer with actions
  ```javascript
  const timelineReducer = (state, action) => {
    switch (action.type) {
      case 'ADD_CLIP':
        // Generate unique ID, add to clips array, update track
        return { ...state, clips: [...state.clips, newClip], ... };
      case 'SELECT_CLIP':
        return { ...state, selectedClipId: action.clipId };
      case 'MOVE_CLIP':
        // Update clip trackId and startTime, update track arrays
        return { ...state, clips: updatedClips, tracks: updatedTracks };
      case 'SET_PLAYHEAD':
        return { ...state, playhead: action.time };
      default:
        return state;
    }
  };
  ```

#### Create Provider Component
- [ ] Implement TimelineProvider with useReducer
  ```javascript
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
    
    const value = { ...state, addClip, selectClip, moveClip, setPlayhead };
    
    return (
      <TimelineContext.Provider value={value}>
        {children}
      </TimelineContext.Provider>
    );
  };
  ```

#### Create Custom Hook
- [ ] Implement useTimeline hook
  ```javascript
  export const useTimeline = () => {
    const context = useContext(TimelineContext);
    if (!context) {
      throw new Error('useTimeline must be used within a TimelineProvider');
    }
    return context;
  };
  ```

#### Test TimelineContext
- [ ] Test case 1: Provider renders without errors
  - Expected: No console errors
  - Actual: [Record result]
- [ ] Test case 2: useTimeline hook works
  - Expected: Returns context value
  - Actual: [Record result]
- [ ] Test case 3: addClip action works
  - Expected: Clip added to state
  - Actual: [Record result]

**Checkpoint:** TimelineContext working ✓

**Commit:** `feat(context): implement TimelineContext with reducer`

---

### 1.2: Create ProjectContext (30 minutes)

#### Create File
- [ ] Create `src/context/ProjectContext.js`

#### Define State Structure
- [ ] Add initial state with project info
  ```javascript
  const initialState = {
    projectName: 'Untitled Project',
    projectPath: null,
    isModified: false,
    lastSaved: null,
    settings: {
      resolution: { width: 1920, height: 1080 },
      framerate: 30,
      duration: 0
    }
  };
  ```

#### Create Reducer
- [ ] Implement projectReducer with actions
  ```javascript
  const projectReducer = (state, action) => {
    switch (action.type) {
      case 'CREATE_PROJECT':
        return { ...initialState, projectName: action.name };
      case 'SET_MODIFIED':
        return { ...state, isModified: action.modified };
      case 'SAVE_PROJECT':
        return { ...state, projectPath: action.path, isModified: false, lastSaved: new Date() };
      case 'LOAD_PROJECT':
        return { ...action.projectData, isModified: false };
      default:
        return state;
    }
  };
  ```

#### Create Provider and Hook
- [ ] Implement ProjectProvider and useProject hook
  ```javascript
  export const ProjectProvider = ({ children }) => {
    const [state, dispatch] = useReducer(projectReducer, initialState);
    
    const createProject = (name) => {
      dispatch({ type: 'CREATE_PROJECT', name });
    };
    
    const setModified = (modified) => {
      dispatch({ type: 'SET_MODIFIED', modified });
    };
    
    const saveProject = async (filePath) => {
      // TODO: Implement in future PR
      dispatch({ type: 'SAVE_PROJECT', path: filePath });
    };
    
    const loadProject = async (filePath) => {
      // TODO: Implement in future PR
      dispatch({ type: 'LOAD_PROJECT', projectData: {} });
    };
    
    const value = { ...state, createProject, setModified, saveProject, loadProject };
    
    return (
      <ProjectContext.Provider value={value}>
        {children}
      </ProjectContext.Provider>
    );
  };
  ```

#### Test ProjectContext
- [ ] Test case 1: Provider renders
  - Expected: No console errors
  - Actual: [Record result]
- [ ] Test case 2: createProject works
  - Expected: Project name updated
  - Actual: [Record result]

**Checkpoint:** ProjectContext working ✓

**Commit:** `feat(context): implement ProjectContext with reducer`

---

### 1.3: Create UIContext (15 minutes)

#### Create File
- [ ] Create `src/context/UIContext.js`

#### Define State Structure
- [ ] Add initial state for UI elements
  ```javascript
  const initialState = {
    modals: {
      exportSettings: { isOpen: false, data: null },
      projectSettings: { isOpen: false, data: null }
    },
    toasts: [],
    loading: {
      export: false,
      import: false,
      recording: false
    }
  };
  ```

#### Create Reducer and Provider
- [ ] Implement UIContext with basic actions
  ```javascript
  const uiReducer = (state, action) => {
    switch (action.type) {
      case 'SHOW_MODAL':
        return { ...state, modals: { ...state.modals, [action.modalName]: { isOpen: true, data: action.data } } };
      case 'HIDE_MODAL':
        return { ...state, modals: { ...state.modals, [action.modalName]: { isOpen: false, data: null } } };
      case 'SHOW_TOAST':
        return { ...state, toasts: [...state.toasts, { id: Date.now(), ...action.toast }] };
      case 'SET_LOADING':
        return { ...state, loading: { ...state.loading, [action.key]: action.loading } };
      default:
        return state;
    }
  };
  ```

#### Test UIContext
- [ ] Test case 1: Provider renders
  - Expected: No console errors
  - Actual: [Record result]
- [ ] Test case 2: showModal works
  - Expected: Modal state updated
  - Actual: [Record result]

**Checkpoint:** All contexts created ✓

**Commit:** `feat(context): implement UIContext with reducer`

---

## Phase 2: Refactor App Component (1 hour)

### 2.1: Wrap App with Context Providers (30 minutes)

#### Update App.js
- [ ] Import all context providers
  ```javascript
  import { TimelineProvider } from './context/TimelineContext';
  import { ProjectProvider } from './context/ProjectContext';
  import { UIProvider } from './context/UIContext';
  ```

#### Wrap App Component
- [ ] Nest providers in correct order
  ```javascript
  function App() {
    return (
      <TimelineProvider>
        <ProjectProvider>
          <UIProvider>
            <div className="app">
              {/* Existing app content */}
            </div>
          </UIProvider>
        </ProjectProvider>
      </TimelineProvider>
    );
  }
  ```

#### Test Provider Nesting
- [ ] Test case 1: App renders without errors
  - Expected: App loads normally
  - Actual: [Record result]
- [ ] Test case 2: Contexts available in components
  - Expected: No "useTimeline must be used within provider" errors
  - Actual: [Record result]

**Checkpoint:** App wrapped with providers ✓

**Commit:** `feat(app): wrap App with context providers`

---

### 2.2: Remove Local State from App (30 minutes)

#### Identify Local State
- [ ] Find useState calls in App.js
  - clips state
  - selectedClipId state
  - trimData state
  - currentTime state

#### Remove State Declarations
- [ ] Remove useState imports and declarations
  ```javascript
  // Remove these lines:
  const [clips, setClips] = useState([]);
  const [selectedClipId, setSelectedClipId] = useState(null);
  const [trimData, setTrimData] = useState({ inPoint: 0, outPoint: 0 });
  const [currentTime, setCurrentTime] = useState(0);
  ```

#### Update State Usage
- [ ] Replace state usage with context hooks
  ```javascript
  const { clips, selectedClipId, addClip, selectClip } = useTimeline();
  const { setModified } = useProject();
  const { showToast } = useUI();
  ```

#### Test State Removal
- [ ] Test case 1: App still renders
  - Expected: No errors
  - Actual: [Record result]
- [ ] Test case 2: Components receive context data
  - Expected: Timeline shows clips from context
  - Actual: [Record result]

**Checkpoint:** App uses context instead of local state ✓

**Commit:** `refactor(app): remove local state, use context hooks`

---

## Phase 3: Update Components (1.5 hours)

### 3.1: Refactor Timeline Component (45 minutes)

#### Update Imports
- [ ] Add useTimeline import
  ```javascript
  import { useTimeline } from '../context/TimelineContext';
  ```

#### Replace Props with Context
- [ ] Remove props from Timeline component
  ```javascript
  // Change from:
  const Timeline = ({ clips, selectedClipId, onSelectClip }) => {
  
  // To:
  const Timeline = () => {
    const { clips, tracks, selectedClipId, selectClip } = useTimeline();
  ```

#### Update Clip Rendering
- [ ] Update clip rendering to use tracks
  ```javascript
  {tracks.map(track => (
    <div key={track.id} className="track">
      <div className="track-header">
        <span className="track-name">{track.name}</span>
      </div>
      <div className="track-content">
        {track.clips.map(clipId => {
          const clip = clips.find(c => c.id === clipId);
          return (
            <div
              key={clip.id}
              className={`clip ${selectedClipId === clip.id ? 'selected' : ''}`}
              onClick={() => selectClip(clip.id)}
            >
              {clip.name}
            </div>
          );
        })}
      </div>
    </div>
  ))}
  ```

#### Test Timeline Refactor
- [ ] Test case 1: Timeline renders clips
  - Expected: Clips appear in timeline
  - Actual: [Record result]
- [ ] Test case 2: Click clip selects it
  - Expected: Clip becomes selected
  - Actual: [Record result]

**Checkpoint:** Timeline uses TimelineContext ✓

**Commit:** `refactor(timeline): use TimelineContext instead of props`

---

### 3.2: Refactor VideoPlayer Component (30 minutes)

#### Update Imports
- [ ] Add useTimeline import
  ```javascript
  import { useTimeline } from '../context/TimelineContext';
  ```

#### Replace Props with Context
- [ ] Remove props, use context
  ```javascript
  const VideoPlayer = () => {
    const { clips, selectedClipId, setPlayhead } = useTimeline();
    const selectedClip = clips.find(clip => clip.id === selectedClipId);
  ```

#### Update Video Source
- [ ] Use selectedClip from context
  ```javascript
  useEffect(() => {
    if (selectedClip) {
      videoRef.current.src = `file://${selectedClip.path}`;
    }
  }, [selectedClip]);
  ```

#### Update Time Callback
- [ ] Use setPlayhead from context
  ```javascript
  const handleTimeUpdate = (e) => {
    setPlayhead(e.target.currentTime);
  };
  ```

#### Test VideoPlayer Refactor
- [ ] Test case 1: VideoPlayer shows selected clip
  - Expected: Video loads when clip selected
  - Actual: [Record result]
- [ ] Test case 2: Time updates playhead
  - Expected: Playhead moves with video
  - Actual: [Record result]

**Checkpoint:** VideoPlayer uses TimelineContext ✓

**Commit:** `refactor(videoplayer): use TimelineContext instead of props`

---

### 3.3: Refactor ImportPanel Component (15 minutes)

#### Update Imports
- [ ] Add useTimeline import
  ```javascript
  import { useTimeline } from '../context/TimelineContext';
  ```

#### Replace Props with Context
- [ ] Remove props, use context
  ```javascript
  const ImportPanel = () => {
    const { clips, addClip } = useTimeline();
  ```

#### Update Import Handler
- [ ] Use addClip from context
  ```javascript
  const handleImport = (file) => {
    const clip = {
      name: file.name,
      path: file.path,
      duration: file.duration
    };
    addClip(clip, 'video-1');
  };
  ```

#### Test ImportPanel Refactor
- [ ] Test case 1: Import adds clip to timeline
  - Expected: Clip appears in timeline after import
  - Actual: [Record result]

**Checkpoint:** ImportPanel uses TimelineContext ✓

**Commit:** `refactor(importpanel): use TimelineContext instead of props`

---

## Phase 4: Create Utilities (1 hour)

### 4.1: Create Timeline Calculation Utilities (45 minutes)

#### Create File
- [ ] Create `src/utils/timelineCalculations.js`

#### Implement Utility Functions
- [ ] Add calculateClipPosition function
  ```javascript
  export const calculateClipPosition = (clip, zoom = 1) => {
    return {
      left: (clip.startTime / 60) * 100 * zoom,
      width: (clip.duration / 60) * 100 * zoom
    };
  };
  ```

- [ ] Add getClipAtTime function
  ```javascript
  export const getClipAtTime = (tracks, time) => {
    for (const track of tracks) {
      for (const clipId of track.clips) {
        const clip = clips.find(c => c.id === clipId);
        if (clip && time >= clip.startTime && time <= clip.startTime + clip.duration) {
          return clip;
        }
      }
    }
    return null;
  };
  ```

- [ ] Add findClipGaps function
  ```javascript
  export const findClipGaps = (clips) => {
    const sortedClips = clips.sort((a, b) => a.startTime - b.startTime);
    const gaps = [];
    
    for (let i = 0; i < sortedClips.length - 1; i++) {
      const currentClip = sortedClips[i];
      const nextClip = sortedClips[i + 1];
      const gap = nextClip.startTime - (currentClip.startTime + currentClip.duration);
      
      if (gap > 0) {
        gaps.push({
          start: currentClip.startTime + currentClip.duration,
          duration: gap
        });
      }
    }
    
    return gaps;
  };
  ```

- [ ] Add snapToGrid function
  ```javascript
  export const snapToGrid = (position, gridSize = 1) => {
    return Math.round(position / gridSize) * gridSize;
  };
  ```

#### Test Utilities
- [ ] Test case 1: calculateClipPosition works
  - Expected: Returns correct position and width
  - Actual: [Record result]
- [ ] Test case 2: getClipAtTime finds correct clip
  - Expected: Returns clip at specified time
  - Actual: [Record result]

**Checkpoint:** Timeline utilities working ✓

**Commit:** `feat(utils): add timeline calculation utilities`

---

### 4.2: Update Components to Use Utilities (15 minutes)

#### Update Timeline Component
- [ ] Import and use calculateClipPosition
  ```javascript
  import { calculateClipPosition } from '../utils/timelineCalculations';
  
  // In clip rendering:
  const position = calculateClipPosition(clip, zoom);
  <div style={{ left: `${position.left}%`, width: `${position.width}%` }}>
  ```

#### Test Utility Integration
- [ ] Test case 1: Timeline uses utilities
  - Expected: Clip positioning works correctly
  - Actual: [Record result]

**Checkpoint:** Components use utilities ✓

**Commit:** `refactor(components): use timeline calculation utilities`

---

## Testing Phase (1 hour)

### Integration Tests
- [ ] Test complete workflow
  - [ ] Import video file
  - [ ] Verify clip appears in timeline
  - [ ] Click clip to select it
  - [ ] Verify video player shows clip
  - [ ] Set trim points
  - [ ] Export video
  - [ ] Verify export works

### Performance Tests
- [ ] Test with multiple clips
  - [ ] Import 5+ video files
  - [ ] Verify timeline performance
  - [ ] Test clip selection performance

### Manual Testing
- [ ] All MVP features work identically
- [ ] No console errors
- [ ] No performance regression
- [ ] Context providers work correctly

---

## Bug Fixing (If needed)

### Bug #1: [Title]
- [ ] Reproduced
- [ ] Root cause identified
- [ ] Fix implemented
- [ ] Tested
- [ ] Documented in bug analysis doc

---

## Documentation Phase (30 minutes)

- [ ] Update component comments
- [ ] Document context usage
- [ ] Update README if needed
- [ ] Create complete summary

---

## Completion Checklist

- [ ] All contexts created and working
- [ ] App component refactored
- [ ] All components use contexts
- [ ] Timeline utilities created
- [ ] All MVP functionality preserved
- [ ] No prop drilling remains
- [ ] Context providers properly nested
- [ ] Performance similar to MVP
- [ ] No console errors
- [ ] Ready for multi-track timeline development
- [ ] Complete summary written
- [ ] PR_PARTY README updated
- [ ] Branch merged
- [ ] Celebration! 🎉

---

**Total Estimated Time:** 4-6 hours  
**Critical Success Factor:** Don't break MVP functionality during refactor

