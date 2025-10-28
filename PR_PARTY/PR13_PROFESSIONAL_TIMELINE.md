# PR#13: Professional Timeline Implementation

**Estimated Time:** 24-32 hours  
**Complexity:** HIGH  
**Dependencies:** PR#01-PR#12 (MVP + UI Components + Context API)

---

## Overview

### What We're Building
A professional-grade timeline interface that rivals CapCut and iMovie, featuring magnetic timeline behavior, multi-track support, advanced clip manipulation, and intuitive scrubbing. This completely replaces our current basic timeline with a sophisticated editing environment.

### Why It Matters
- **Professional Workflow**: Users expect modern video editing tools with industry-standard features
- **User Experience**: Intuitive drag-and-drop, magnetic snapping, and visual feedback
- **Competitive Edge**: Timeline quality directly impacts user satisfaction and retention
- **Foundation**: Sets the stage for advanced features like effects, transitions, and multi-media editing

### Success in One Sentence
"This PR is successful when users can intuitively arrange, trim, cut, and manipulate video clips on a multi-track timeline with magnetic behavior and professional-grade scrubbing."

---

## Technical Design

### Architecture Decisions

#### Decision 1: Magnetic Timeline System
**Options Considered:**
1. Manual positioning - User manually places clips (current approach)
2. Magnetic snapping - Clips snap to each other and grid (CapCut style)
3. Auto-arrange - System automatically arranges clips (iMovie style)

**Chosen:** Magnetic snapping with manual override

**Rationale:**
- Provides professional feel while maintaining user control
- Prevents gaps and maintains sync
- Familiar to users from CapCut/iMovie
- Allows precision when needed

**Trade-offs:**
- Gain: Professional UX, gap prevention, intuitive workflow
- Lose: Some manual control, increased complexity

#### Decision 2: Multi-Track Architecture
**Options Considered:**
1. Single track with layers (current)
2. Multiple independent tracks (CapCut style)
3. Hierarchical track system (Premiere Pro style)

**Chosen:** Multiple independent tracks with track types

**Rationale:**
- Clear separation of content types
- Scalable for future features
- Industry standard approach
- Easier to implement initially

**Trade-offs:**
- Gain: Clear organization, scalable, professional
- Lose: More complex state management

#### Decision 3: Clip Manipulation System
**Options Considered:**
1. Separate trim controls (current)
2. Edge-based trimming (CapCut style)
3. Inline editing (DaVinci Resolve style)

**Chosen:** Edge-based trimming with context menus

**Rationale:**
- Most intuitive for users
- Industry standard approach
- Allows for precise control
- Familiar interaction pattern

**Trade-offs:**
- Gain: Intuitive UX, precise control, familiar
- Lose: More complex interaction handling

### Data Model

**New Collections/Tables:**
```
TimelineState/
├── tracks: Track[] (array of track objects)
├── clips: Clip[] (array of clip objects)
├── playhead: number (current time position)
├── zoom: number (timeline zoom level)
├── selection: SelectionState (selected clips/tracks)
├── magneticSnap: boolean (magnetic behavior enabled)
└── snapThreshold: number (snap distance in pixels)

Track/
├── id: string (unique identifier)
├── name: string (display name)
├── type: 'video' | 'audio' | 'text' | 'effect'
├── height: number (track height in pixels)
├── muted: boolean (audio track muted)
├── soloed: boolean (audio track soloed)
├── locked: boolean (track locked from editing)
├── visible: boolean (track visible)
├── color: string (track color for identification)
└── clips: string[] (array of clip IDs on this track)

Clip/
├── id: string (unique identifier)
├── trackId: string (parent track ID)
├── name: string (display name)
├── path: string (file path)
├── startTime: number (timeline start position)
├── duration: number (clip duration)
├── trimIn: number (trim start offset)
├── trimOut: number (trim end offset)
├── thumbnail: string (base64 thumbnail data)
├── waveform?: number[] (audio waveform data)
├── selected: boolean (selection state)
├── locked: boolean (clip locked)
└── effects: Effect[] (applied effects)

SelectionState/
├── clips: string[] (selected clip IDs)
├── tracks: string[] (selected track IDs)
├── mode: 'single' | 'multiple' | 'range'
└── anchor: string (selection anchor point)
```

### API Design

**New Functions:**
```javascript
/**
 * Timeline manipulation functions
 */
export const timelineAPI = {
  // Track management
  addTrack: (type: TrackType, name?: string) => Track,
  removeTrack: (trackId: string) => void,
  renameTrack: (trackId: string, name: string) => void,
  reorderTracks: (trackIds: string[]) => void,
  
  // Clip manipulation
  addClip: (trackId: string, clip: Clip) => Clip,
  removeClip: (clipId: string) => void,
  moveClip: (clipId: string, newStartTime: number, newTrackId?: string) => void,
  trimClip: (clipId: string, trimIn: number, trimOut: number) => void,
  splitClip: (clipId: string, splitTime: number) => Clip[],
  
  // Selection management
  selectClip: (clipId: string, addToSelection?: boolean) => void,
  selectRange: (startTime: number, endTime: number) => void,
  clearSelection: () => void,
  
  // Timeline navigation
  setPlayhead: (time: number) => void,
  setZoom: (zoom: number) => void,
  fitToContent: () => void,
  
  // Magnetic behavior
  enableMagneticSnap: (enabled: boolean) => void,
  setSnapThreshold: (threshold: number) => void,
  findSnapPoints: (clipId: string, position: number) => number[]
};
```

### Component Hierarchy
```
Timeline/
├── TimelineHeader/
│   ├── PlaybackControls
│   ├── ZoomControls
│   └── TimelineInfo
├── TimelineRuler/
│   ├── TimeMarkers
│   ├── FrameMarkers
│   └── PlayheadIndicator
├── TimelineTracks/
│   ├── Track/
│   │   ├── TrackHeader/
│   │   │   ├── TrackControls
│   │   │   ├── TrackName
│   │   │   └── TrackHeightSlider
│   │   └── TrackContent/
│   │       ├── Clip/
│   │       │   ├── ClipThumbnail
│   │       │   ├── ClipLabel
│   │       │   ├── TrimHandles
│   │       │   └── WaveformDisplay
│   │       └── TrackDropZone
│   └── AddTrackButton
└── TimelineFooter/
    ├── TimelineOverview
    └── TimelineStatus
```

---

## Implementation Details

### File Structure
**New Files:**
```
src/
├── components/
│   └── timeline/
│       ├── Timeline.js (~200 lines)
│       ├── TimelineHeader.js (~150 lines)
│       ├── TimelineRuler.js (~100 lines)
│       ├── TimelineTracks.js (~120 lines)
│       ├── Track.js (~180 lines)
│       ├── TrackHeader.js (~120 lines)
│       ├── TrackContent.js (~100 lines)
│       ├── Clip.js (~250 lines)
│       ├── ClipThumbnail.js (~80 lines)
│       ├── ClipLabel.js (~60 lines)
│       ├── TrimHandles.js (~120 lines)
│       ├── WaveformDisplay.js (~100 lines)
│       ├── Playhead.js (~80 lines)
│       └── TimelineOverview.js (~100 lines)
├── hooks/
│   ├── useTimeline.js (~150 lines)
│   ├── useMagneticSnap.js (~100 lines)
│   ├── useClipManipulation.js (~120 lines)
│   └── useTimelineNavigation.js (~80 lines)
├── utils/
│   ├── timelineCalculations.js (~200 lines)
│   ├── magneticSnap.js (~150 lines)
│   ├── clipOperations.js (~180 lines)
│   └── timelineRendering.js (~120 lines)
└── styles/
    ├── Timeline.css (~300 lines)
    ├── Track.css (~200 lines)
    ├── Clip.css (~250 lines)
    └── TimelineControls.css (~150 lines)
```

**Modified Files:**
- `src/context/TimelineContext.js` (+200/-50 lines) - Enhanced state management
- `src/components/Timeline.js` (+50/-200 lines) - Replace with new implementation
- `src/App.js` (+20/-10 lines) - Update timeline integration

### Key Implementation Steps

#### Phase 1: Core Timeline Foundation (8-10 hours)
1. **Timeline State Management**
   - Extend TimelineContext with new state structure
   - Implement track and clip management
   - Add selection state management
   - Implement undo/redo system

2. **Basic Timeline Structure**
   - Create Timeline component with header, ruler, tracks, footer
   - Implement TimelineRuler with time markers
   - Create basic Track component structure
   - Add Playhead component with scrubbing

3. **Timeline Calculations**
   - Implement time ↔ pixel conversion utilities
   - Add zoom level calculations
   - Create clip positioning logic
   - Implement playhead positioning

#### Phase 2: Multi-Track System (8-10 hours)
1. **Track Management**
   - Implement Track component with header and content
   - Add track controls (mute, solo, lock, visibility)
   - Create track height adjustment
   - Implement track reordering

2. **Clip System**
   - Create Clip component with thumbnail and label
   - Implement clip positioning and sizing
   - Add clip selection and highlighting
   - Create clip drag-and-drop functionality

3. **Track Types**
   - Implement video track with thumbnails
   - Add audio track with waveform display
   - Create text track for overlays
   - Add effect track for filters

#### Phase 3: Advanced Clip Manipulation (8-12 hours)
1. **Edge Trimming**
   - Implement TrimHandles component
   - Add drag-to-trim functionality
   - Create visual feedback during trimming
   - Implement trim validation

2. **Clip Operations**
   - Add split/cut functionality
   - Implement copy/paste operations
   - Create delete with ripple effect
   - Add clip duplication

3. **Magnetic Timeline**
   - Implement magnetic snap detection
   - Add snap point calculation
   - Create visual snap indicators
   - Implement snap threshold settings

### Code Examples

**Example 1: Timeline Context Enhancement**
```javascript
// Enhanced TimelineContext with new state structure
const TimelineContext = createContext();

const timelineReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TRACK':
      return {
        ...state,
        tracks: [...state.tracks, {
          id: generateId(),
          name: action.name || `Track ${state.tracks.length + 1}`,
          type: action.trackType,
          height: 60,
          muted: false,
          soloed: false,
          locked: false,
          visible: true,
          color: getTrackColor(action.trackType),
          clips: []
        }]
      };
      
    case 'ADD_CLIP':
      return {
        ...state,
        clips: [...state.clips, {
          id: generateId(),
          trackId: action.trackId,
          name: action.name,
          path: action.path,
          startTime: action.startTime,
          duration: action.duration,
          trimIn: 0,
          trimOut: action.duration,
          thumbnail: action.thumbnail,
          waveform: action.waveform,
          selected: false,
          locked: false,
          effects: []
        }]
      };
      
    case 'MOVE_CLIP':
      return {
        ...state,
        clips: state.clips.map(clip =>
          clip.id === action.clipId
            ? { ...clip, startTime: action.startTime, trackId: action.trackId }
            : clip
        )
      };
      
    case 'TRIM_CLIP':
      return {
        ...state,
        clips: state.clips.map(clip =>
          clip.id === action.clipId
            ? { 
                ...clip, 
                trimIn: action.trimIn, 
                trimOut: action.trimOut,
                duration: action.trimOut - action.trimIn
              }
            : clip
        )
      };
      
    case 'SPLIT_CLIP':
      const originalClip = state.clips.find(c => c.id === action.clipId);
      const splitTime = action.splitTime - originalClip.startTime;
      
      return {
        ...state,
        clips: [
          ...state.clips.filter(c => c.id !== action.clipId),
          {
            ...originalClip,
            duration: splitTime,
            trimOut: originalClip.trimIn + splitTime
          },
          {
            ...originalClip,
            id: generateId(),
            startTime: action.splitTime,
            duration: originalClip.duration - splitTime,
            trimIn: originalClip.trimIn + splitTime,
            trimOut: originalClip.trimOut
          }
        ]
      };
      
    default:
      return state;
  }
};
```

**Example 2: Magnetic Snap Implementation**
```javascript
// Magnetic snap detection and calculation
export const useMagneticSnap = (clips, snapThreshold = 10) => {
  const findSnapPoints = useCallback((clipId, position) => {
    const snapPoints = [];
    const currentClip = clips.find(c => c.id === clipId);
    
    clips.forEach(clip => {
      if (clip.id === clipId) return;
      
      // Snap to clip edges
      const clipStart = clip.startTime;
      const clipEnd = clip.startTime + clip.duration;
      
      // Check if position is near clip start
      if (Math.abs(position - clipStart) <= snapThreshold) {
        snapPoints.push({
          position: clipStart,
          type: 'clip-start',
          clipId: clip.id,
          strength: 1 - (Math.abs(position - clipStart) / snapThreshold)
        });
      }
      
      // Check if position is near clip end
      if (Math.abs(position - clipEnd) <= snapThreshold) {
        snapPoints.push({
          position: clipEnd,
          type: 'clip-end',
          clipId: clip.id,
          strength: 1 - (Math.abs(position - clipEnd) / snapThreshold)
        });
      }
      
      // Check if position is near clip center
      const clipCenter = clipStart + (clip.duration / 2);
      if (Math.abs(position - clipCenter) <= snapThreshold) {
        snapPoints.push({
          position: clipCenter,
          type: 'clip-center',
          clipId: clip.id,
          strength: 1 - (Math.abs(position - clipCenter) / snapThreshold)
        });
      }
    });
    
    // Sort by strength (strongest first)
    return snapPoints.sort((a, b) => b.strength - a.strength);
  }, [clips, snapThreshold]);
  
  const getSnappedPosition = useCallback((clipId, position) => {
    const snapPoints = findSnapPoints(clipId, position);
    return snapPoints.length > 0 ? snapPoints[0].position : position;
  }, [findSnapPoints]);
  
  return { findSnapPoints, getSnappedPosition };
};
```

**Example 3: Clip Component with Edge Trimming**
```javascript
// Advanced Clip component with trimming capabilities
const Clip = ({ clip, track, onMove, onTrim, onSplit, onSelect, isSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isTrimming, setIsTrimming] = useState(false);
  const [trimHandle, setTrimHandle] = useState(null); // 'start' | 'end'
  const [dragStart, setDragStart] = useState({ x: 0, time: 0 });
  
  const { getSnappedPosition } = useMagneticSnap();
  const { timeToPixels, pixelsToTime } = useTimelineCalculations();
  
  const handleMouseDown = (e, handleType) => {
    if (handleType === 'move') {
      setIsDragging(true);
      setDragStart({ x: e.clientX, time: clip.startTime });
    } else if (handleType === 'trim-start' || handleType === 'trim-end') {
      setIsTrimming(true);
      setTrimHandle(handleType === 'trim-start' ? 'start' : 'end');
    }
    
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      const deltaTime = pixelsToTime(deltaX);
      const newPosition = clip.startTime + deltaTime;
      const snappedPosition = getSnappedPosition(clip.id, newPosition);
      
      onMove(clip.id, snappedPosition);
    } else if (isTrimming) {
      const deltaX = e.clientX - dragStart.x;
      const deltaTime = pixelsToTime(deltaX);
      
      if (trimHandle === 'start') {
        const newTrimIn = Math.max(0, clip.trimIn + deltaTime);
        const newTrimOut = Math.max(newTrimIn + 0.1, clip.trimOut);
        onTrim(clip.id, newTrimIn, newTrimOut);
      } else if (trimHandle === 'end') {
        const newTrimOut = Math.min(clip.duration, clip.trimOut + deltaTime);
        const newTrimIn = Math.min(newTrimOut - 0.1, clip.trimIn);
        onTrim(clip.id, newTrimIn, newTrimOut);
      }
    }
  }, [isDragging, isTrimming, trimHandle, dragStart, clip, onMove, onTrim]);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsTrimming(false);
    setTrimHandle(null);
  }, []);
  
  useEffect(() => {
    if (isDragging || isTrimming) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isTrimming, handleMouseMove, handleMouseUp]);
  
  const clipStyle = {
    left: timeToPixels(clip.startTime),
    width: timeToPixels(clip.duration),
    height: track.height - 4,
    backgroundColor: isSelected ? '#3b82f6' : '#64748b',
    border: isSelected ? '2px solid #1d4ed8' : '1px solid #475569'
  };
  
  return (
    <div
      className={`clip ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      style={clipStyle}
      onClick={() => onSelect(clip.id)}
    >
      {/* Clip Thumbnail */}
      <ClipThumbnail clip={clip} />
      
      {/* Clip Label */}
      <ClipLabel clip={clip} />
      
      {/* Waveform Display (for audio clips) */}
      {track.type === 'audio' && (
        <WaveformDisplay waveform={clip.waveform} />
      )}
      
      {/* Trim Handles */}
      <div className="trim-handles">
        <div
          className="trim-handle trim-handle-start"
          onMouseDown={(e) => handleMouseDown(e, 'trim-start')}
        />
        <div
          className="trim-handle trim-handle-end"
          onMouseDown={(e) => handleMouseDown(e, 'trim-end')}
        />
      </div>
      
      {/* Move Handle */}
      <div
        className="move-handle"
        onMouseDown={(e) => handleMouseDown(e, 'move')}
      />
    </div>
  );
};
```

---

## Testing Strategy

### Test Categories

**Unit Tests:**
- Timeline calculations: time ↔ pixel conversion accuracy
- Magnetic snap: snap point detection and positioning
- Clip operations: move, trim, split, delete functionality
- Track management: add, remove, reorder, resize tracks

**Integration Tests:**
- Drag and drop: clip movement between tracks
- Edge trimming: real-time trim updates
- Multi-selection: selecting multiple clips
- Undo/redo: operation history management

**Edge Cases:**
- Empty timeline behavior
- Single clip timeline
- Maximum zoom levels
- Rapid user interactions
- Large number of clips/tracks

**Performance Tests:**
- Timeline rendering with 100+ clips
- Smooth scrubbing at 60fps
- Memory usage with large projects
- Responsive UI during operations

---

## Success Criteria

**Feature is complete when:**
- [ ] Users can add/remove/reorder tracks
- [ ] Clips can be dragged between tracks
- [ ] Edge trimming works with visual feedback
- [ ] Magnetic snapping prevents gaps
- [ ] Timeline scrubbing is smooth and responsive
- [ ] Multi-clip selection works correctly
- [ ] Undo/redo system functions properly
- [ ] All operations have visual feedback
- [ ] Performance is smooth with 50+ clips
- [ ] Keyboard shortcuts work for all operations

**Performance Targets:**
- Timeline rendering: < 16ms (60fps)
- Clip operations: < 100ms response time
- Memory usage: < 200MB for 100 clips
- Smooth scrubbing: No frame drops

**Quality Gates:**
- Zero critical bugs
- All tests passing
- No console errors
- Responsive design maintained
- Accessibility standards met

---

## Risk Assessment

### Risk 1: Performance with Large Projects
**Likelihood:** HIGH  
**Impact:** HIGH  
**Mitigation:** Implement virtual scrolling, lazy loading, and performance monitoring  
**Status:** 🔴

### Risk 2: Complex State Management
**Likelihood:** MEDIUM  
**Impact:** HIGH  
**Mitigation:** Use proven patterns, extensive testing, and incremental implementation  
**Status:** 🟡

### Risk 3: Magnetic Snap Complexity
**Likelihood:** MEDIUM  
**Impact:** MEDIUM  
**Mitigation:** Start with simple snap logic, iterate based on user feedback  
**Status:** 🟡

### Risk 4: Browser Compatibility
**Likelihood:** LOW  
**Impact:** MEDIUM  
**Mitigation:** Test on multiple browsers, use standard APIs  
**Status:** 🟢

---

## Open Questions

1. **Thumbnail Generation:** Should we generate thumbnails on import or on-demand?
   - Option A: Generate on import (faster display, more storage)
   - Option B: Generate on-demand (less storage, slower initial display)
   - Decision needed by: Phase 1 completion

2. **Waveform Display:** Should we use Web Audio API or server-side generation?
   - Option A: Web Audio API (client-side, real-time)
   - Option B: Server-side generation (more accurate, requires processing)
   - Decision needed by: Phase 2 completion

3. **Undo/Redo Granularity:** What level of operations should be undoable?
   - Option A: Every operation (fine-grained)
   - Option B: Logical operations (coarser-grained)
   - Decision needed by: Phase 1 completion

---

## Timeline

**Total Estimate:** 24-32 hours

| Phase | Task | Time | Status |
|-------|------|------|--------|
| 1 | Core Timeline Foundation | 8-10h | ⏳ |
| 2 | Multi-Track System | 8-10h | ⏳ |
| 3 | Advanced Clip Manipulation | 8-12h | ⏳ |

---

## Dependencies

**Requires:**
- [ ] PR#01-PR#12 complete (MVP + UI Components + Context API)
- [ ] Current timeline implementation (to replace)
- [ ] FFmpeg integration (for clip operations)

**Blocks:**
- PR#14 (Advanced Effects) - waiting on timeline foundation
- PR#15 (Audio Editing) - waiting on multi-track system
- PR#16 (Export System) - waiting on clip manipulation

---

## References

- CapCut Timeline Analysis: [Research findings]
- iMovie Interface Study: [Research findings]
- Video Editing UX Patterns: [Industry standards]
- React Performance Optimization: [Best practices]
