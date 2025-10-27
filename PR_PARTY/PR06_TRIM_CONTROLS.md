# PR#6: Trim Controls

**Estimated Time:** 6 hours  
**Complexity:** MEDIUM-HIGH  
**Priority:** Critical - Day 2, Hours 21-26  
**Dependencies:** PR #3 (Player), PR #5 (Timeline)  
**Target Date:** Day 2 (Tuesday, Oct 28)

---

## Overview

### What We're Building
A trim control component that allows users to set in-point and out-point on a selected video clip. Users can scrub to a position in the video, set it as the trim start, scrub to another position, set it as the trim end, and export only that trimmed segment. This adds non-destructive editing capability to ClipForge and is the critical feature that transforms the app from a simple player into a functional video editor.

### Why It Matters
Without trim functionality, users can only export entire video files. Trim controls enable:
- Precise segment extraction (cut to specific moments)
- Content curation (export only the good parts)
- Clip management (create shorter versions)
- Professional editing workflow (mark and cut)

Trim is what distinguishes a video editor from a video player.

### Success in One Sentence
"This PR is successful when users can play a video, scrub to any position, mark that position as trim start, scrub to another position, mark it as trim end, and export only the segment between those points as a new MP4 file."

---

## Technical Design

### Architecture Decisions

#### Decision 1: Trim State Management
**Options Considered:**
1. **Local TrimControls state** - Track in/out in component only
2. **Per-clip trim data** - Store trim data with each clip object
3. **Separate trimData state** - Lift trim state to App.js
4. **Current clip reference** - Store trim for currently selected clip only

**Chosen:** Option 3 - Separate trimData state at App level

**Rationale:**
- Single source of truth for trim settings
- Timeline needs trim indicators
- Export needs trim data
- VideoPlayer needs to know when to seek to trim start
- Simple state structure: `{ inPoint: 0, outPoint: duration }`
- Reset behavior predictable (reset when new clip selected)

**Trade-offs:**
- Gain: Predictable state flow, easy to clear on clip change
- Lose: Must pass trim data through props (acceptable for MVP)

#### Decision 2: Getting Current Playback Time
**Options Considered:**
1. **timeUpdate callback** - VideoPlayer emits current time to parent
2. **Ref to video element** - Expose video ref to TrimControls
3. **IPC communication** - Pass time through Electron IPC
4. **State in App** - Lift currentTime state to App level

**Chosen:** Option 1 - timeUpdate callback from VideoPlayer

**Rationale:**
- React pattern: child notifies parent of state changes
- VideoPlayer is the source of truth for playback time
- Clean separation of concerns
- Easy to implement (add callback prop)

**Trade-offs:**
- Gain: Simple implementation, VideoPlayer controls time
- Lose: Callback fires frequently (60fps), but no performance issue

#### Decision 3: Trim Indicator Display Strategy
**Options Considered:**
1. **Timeline overlay** - Show trim region on Timeline component
2. **Video scrubber overlay** - Show markers on VideoPlayer controls
3. **Separate TrimControls UI** - Display in/out times as text
4. **Combination approach** - Text + timeline indicators

**Chosen:** Option 4 - Combination (text + timeline)

**Rationale:**
- Text times are precise (user sees exact seconds)
- Timeline indicators are visual (user sees length of trim)
- Best of both worlds: precision + visual feedback
- Timeline already renders on clip (natural place for indicators)

**Trade-offs:**
- Gain: Clear visual and precise text feedback
- Lose: Must modify two components (acceptable for UX quality)

#### Decision 4: Reset Behavior
**Options Considered:**
1. **Manual reset button only** - User must click "Reset"
2. **Auto-reset on clip change** - Clear trim when selecting new clip
3. **Persist across clips** - Keep same trim settings for all clips
4. **Hybrid** - Auto-reset + manual reset button

**Chosen:** Option 2 - Auto-reset on clip change

**Rationale:**
- Each clip should start with full clip as default
- Clean slate for each clip prevents confusion
- User can always manually reset if needed
- Prevents accidental trim data from previous clip

**Trade-offs:**
- Gain: Predictable behavior, no stale data
- Lose: Can't carry over trim settings (rarely wanted anyway)

#### Decision 5: Validation Strategy
**Options Considered:**
1. **No validation** - Let FFmpeg handle it
2. **Basic validation** - Check in < out only
3. **Comprehensive validation** - Check in < out, times in bounds, min duration
4. **Real-time validation** - Validate as user sets points

**Chosen:** Option 3 - Comprehensive validation in real-time

**Rationale:**
- Better UX: catch errors before export
- Clear error messages guide user
- Prevents wasted export time
- Builds user confidence

**Trade-offs:**
- Gain: Good user experience, professional feel
- Lose: Extra validation logic (worth it)

### Data Model

**TrimControls Props:**
```javascript
{
  currentTime: number;        // Current playback time in seconds
  duration: number;           // Total video duration in seconds
  inPoint: number;            // Trim start time
  outPoint: number;           // Trim end time
  onSetInPoint: () => void;  // Set in point to currentTime
  onSetOutPoint: () => void;  // Set out point to currentTime
  onResetTrim: () => void;   // Reset to full clip
}
```

**App State Structure:**
```javascript
// App.js state
const [clips, setClips] = useState([]);
const [selectedClipId, setSelectedClipId] = useState(null);
const [trimData, setTrimData] = useState({
  inPoint: 0,
  outPoint: 0  // Will be set to clip duration
});
const [currentTime, setCurrentTime] = useState(0);

// Helper to get currently selected clip
const selectedClip = clips.find(c => c.id === selectedClipId);
```

**Trim Data Flow:**
```
VideoPlayer (plays video, reports time)
  ↓ timeupdate event
App.js (updates currentTime state)
  ↓ currentTime prop
TrimControls (displays current time, sets in/out)
  ↓ onSetInPoint/onSetOutPoint callbacks
App.js (updates trimData state)
  ↓ trimData prop
Timeline (shows trim indicators)
ExportPanel (uses trimData for export)
  ↓ sends to FFmpeg
FFmpeg (processes trimmed segment)
```

### Component Hierarchy

```
App.js
├── clips: [clip1, clip2, ...]
├── selectedClipId: 'clip-1'
├── trimData: { inPoint: 5, outPoint: 30 }
├── currentTime: 15.5
│
├── VideoPlayer
│   └── onTimeUpdate={(time) => setCurrentTime(time)}
│
├── Timeline
│   ├── clips
│   ├── selectedClipId
│   ├── trimData ← Shows trim indicators
│   └── ClipBlock (with trim overlay)
│
└── TrimControls
    ├── currentTime
    ├── duration
    ├── inPoint
    ├── outPoint
    ├── onSetInPoint
    ├── onSetOutPoint
    └── onResetTrim
```

### Visual Design

**TrimControls Layout:**
```
┌─────────────────────────────────────┐
│ Trim Controls                        │
├─────────────────────────────────────┤
│ Current Time: 0:15 / 1:30           │
├─────────────────────────────────────┤
│ In Point: 0:05  [Set In]            │
│ Out Point: 0:30  [Set Out]          │
├─────────────────────────────────────┤
│ Trim Duration: 0:25                │
│                                     │
│ [Reset Trim]                        │
└─────────────────────────────────────┘
```

**Timeline Trim Indicators:**
```
Clip: ────────────────
      │     │ ← trim region
      0:05  0:30
```

---

## Implementation Details

### File Structure
**New Files:**
```
src/
├── components/
│   └── TrimControls.js (~200 lines)
├── styles/
│   └── TrimControls.css (~150 lines)
└── utils/
    └── timeHelpers.js (~50 lines) - Additional utilities
```

**Modified Files:**
- `src/App.js` (+80/-20 lines) - Add trimData state, currentTime state, callbacks
- `src/components/VideoPlayer.js` (+30 lines) - Add onTimeUpdate callback
- `src/components/Timeline.js` (+80 lines) - Add trim indicators rendering
- `src/components/ExportPanel.js` (+40 lines) - Use trimData for export
- `electron/ffmpeg/videoProcessing.js` (+50 lines) - Add trim support to export

### Key Implementation Steps

#### Phase 1: TrimControls Component (90 minutes)
1. Create TrimControls.js structure
2. Create TrimControls.css styling
3. Display current time (read-only)
4. Add Set In Point button
5. Add Set Out Point button
6. Add Reset Trim button
7. Display trim times and duration

#### Phase 2: App State Integration (60 minutes)
1. Add trimData state to App.js
2. Add currentTime state to App.js
3. Create onSetInPoint callback
4. Create onSetOutPoint callback
5. Create onResetTrim callback
6. Add validation logic (in < out, bounds checking)
7. Connect TrimControls to App state

#### Phase 3: VideoPlayer Time Updates (30 minutes)
1. Add onTimeUpdate prop to VideoPlayer
2. Emit currentTime to parent on timeupdate event
3. Update App currentTime state
4. Pass currentTime to TrimControls
5. Test time updates during playback

#### Phase 4: Timeline Trim Indicators (90 minutes)
1. Modify Timeline.js to accept trimData prop
2. Calculate trim region for each clip
3. Render trim indicators as overlays
4. Visual styling (darken non-trimmed regions)
5. Show trimmed segment clearly
6. Update on selection change

#### Phase 5: Export Integration (60 minutes)
1. Pass trimData to ExportPanel
2. Modify export function to accept trim data
3. Update FFmpeg export to use setStartTime()
4. Update FFmpeg export to use setDuration()
5. Test trimmed export
6. Verify exported video length matches trim

#### Phase 6: Polish & Testing (30 minutes)
1. Add error states for invalid trim
2. Disable buttons when out of bounds
3. Add helpful hover messages
4. Test edge cases
5. Verify trim persists during playback
6. Verify reset clears trim

### Code Examples

**Example 1: TrimControls Component Structure**
```javascript
import React from 'react';
import './TrimControls.css';
import { formatDuration } from '../utils/timeHelpers';

const TrimControls = ({
  currentTime,
  duration,
  inPoint,
  outPoint,
  onSetInPoint,
  onSetOutPoint,
  onResetTrim
}) => {
  const trimDuration = outPoint - inPoint;
  const isValid = inPoint < outPoint && inPoint >= 0 && outPoint <= duration;

  return (
    <div className="trim-controls">
      <h3 className="trim-controls-title">Trim Controls</h3>
      
      <div className="trim-time-display">
        <span className="label">Current Time:</span>
        <span className="time">{formatDuration(currentTime)}</span>
        <span className="separator">/</span>
        <span className="duration">{formatDuration(duration)}</span>
      </div>

      <div className="trim-points">
        <div className="trim-point">
          <label>In Point:</label>
          <span className="time-value">{formatDuration(inPoint)}</span>
          <button
            className="btn-set"
            onClick={onSetInPoint}
            disabled={currentTime >= outPoint || currentTime < 0}
            title="Set trim start to current position"
          >
            Set In
          </button>
        </div>

        <div className="trim-point">
          <label>Out Point:</label>
          <span className="time-value">{formatDuration(outPoint)}</span>
          <button
            className="btn-set"
            onClick={onSetOutPoint}
            disabled={currentTime <= inPoint || currentTime > duration}
            title="Set trim end to current position"
          >
            Set Out
          </button>
        </div>
      </div>

      <div className="trim-duration">
        <label>Trim Duration:</label>
        <span className={isValid ? 'duration-value' : 'duration-value error'}>
          {formatDuration(trimDuration)}
        </span>
      </div>

      {!isValid && (
        <div className="trim-error">
          ⚠️ In point must be before out point
        </div>
      )}

      <button
        className="btn-reset"
        onClick={onResetTrim}
        title="Reset trim to full clip"
      >
        Reset Trim
      </button>
    </div>
  );
};

export default TrimControls;
```

**Example 2: App State Management**
```javascript
// src/App.js
function App() {
  const [clips, setClips] = useState([]);
  const [selectedClipId, setSelectedClipId] = useState(null);
  const [trimData, setTrimData] = useState({ inPoint: 0, outPoint: 0 });
  const [currentTime, setCurrentTime] = useState(0);

  const selectedClip = clips.find(c => c.id === selectedClipId);

  // Set trim in point to current playback time
  const handleSetInPoint = () => {
    if (!selectedClip) return;
    
    setTrimData(prev => ({
      ...prev,
      inPoint: currentTime
    }));
  };

  // Set trim out point to current playback time
  const handleSetOutPoint = () => {
    if (!selectedClip) return;
    
    setTrimData(prev => ({
      ...prev,
      outPoint: currentTime
    }));
  };

  // Reset trim to full clip
  const handleResetTrim = () => {
    if (!selectedClip) return;
    
    setTrimData({
      inPoint: 0,
      outPoint: selectedClip.duration
    });
  };

  // Update current playback time from VideoPlayer
  const handleTimeUpdate = (time) => {
    setCurrentTime(time);
  };

  // Reset trim when selecting new clip
  useEffect(() => {
    if (selectedClip) {
      setTrimData({
        inPoint: 0,
        outPoint: selectedClip.duration
      });
      setCurrentTime(0);
    }
  }, [selectedClipId, selectedClip?.duration]);

  return (
    <div className="app">
      <ImportPanel onImport={handleImportClip} />
      
      <VideoPlayer
        clip={selectedClip}
        onTimeUpdate={handleTimeUpdate}
      />
      
      <Timeline
        clips={clips}
        selectedClipId={selectedClipId}
        onSelectClip={handleSelectClip}
        trimData={trimData}
      />
      
      <TrimControls
        currentTime={currentTime}
        duration={selectedClip?.duration || 0}
        inPoint={trimData.inPoint}
        outPoint={trimData.outPoint}
        onSetInPoint={handleSetInPoint}
        onSetOutPoint={handleSetOutPoint}
        onResetTrim={handleResetTrim}
      />
      
      <ExportPanel
        clip={selectedClip}
        trimData={trimData}
      />
    </div>
  );
}
```

**Example 3: VideoPlayer Time Update Integration**
```javascript
// src/components/VideoPlayer.js
const VideoPlayer = ({ clip, onTimeUpdate }) => {
  const videoRef = useRef(null);

  // Listen to timeupdate events and notify parent
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (onTimeUpdate) {
        onTimeUpdate(video.currentTime);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [onTimeUpdate]);

  return (
    <div className="video-player">
      <video
        ref={videoRef}
        src={clip?.path}
        controls
      />
    </div>
  );
};
```

**Example 4: Timeline Trim Indicators**
```javascript
// src/components/Timeline.js
const Timeline = ({ clips, selectedClipId, onSelectClip, trimData }) => {
  const selectedClip = clips.find(c => c.id === selectedClipId);

  return (
    <div className="timeline">
      {clips.map(clip => {
        const isSelected = clip.id === selectedClipId;
        const clipTrimData = isSelected ? trimData : null;
        
        return (
          <ClipBlock
            key={clip.id}
            clip={clip}
            isSelected={isSelected}
            onSelect={() => onSelectClip(clip.id)}
            trimData={clipTrimData}
          />
        );
      })}
    </div>
  );
};

const ClipBlock = ({ clip, isSelected, onSelect, trimData }) => {
  return (
    <div className="clip-block" onClick={onSelect}>
      {trimData && (
        <div className="trim-overlay">
          {/* Non-trimmed left region */}
          {trimData.inPoint > 0 && (
            <div
              className="trim-darken"
              style={{ width: `${(trimData.inPoint / clip.duration) * 100}%` }}
            />
          )}
          
          {/* Trimmed region */}
          <div className="trim-highlighted" />
          
          {/* Non-trimmed right region */}
          {trimData.outPoint < clip.duration && (
            <div
              className="trim-darken"
              style={{ width: `${((clip.duration - trimData.outPoint) / clip.duration) * 100}%` }}
            />
          )}
        </div>
      )}
      
      {/* Clip info overlay */}
      <div className="clip-info">
        <span>{clip.name}</span>
      </div>
    </div>
  );
};
```

**Example 5: FFmpeg Export with Trim**
```javascript
// electron/ffmpeg/videoProcessing.js
const exportVideo = (inputPath, outputPath, options = {}) => {
  return new Promise((resolve, reject) => {
    const { trimData, onProgress } = options;
    
    let command = ffmpeg(inputPath)
      .setFfmpegPath(ffmpegPath)
      .setFfprobePath(ffprobePath);

    // Apply trim settings if provided
    if (trimData && trimData.inPoint > 0) {
      command = command.setStartTime(trimData.inPoint);
    }

    if (trimData && trimData.outPoint) {
      const duration = trimData.outPoint - trimData.inPoint;
      command = command.setDuration(duration);
    }

    command
      .output(outputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .on('progress', (progress) => {
        if (onProgress) {
          onProgress({
            percent: progress.percent || 0,
            currentTime: progress.timemark || '0:00:00'
          });
        }
      })
      .on('end', () => {
        console.log(`Export completed: ${outputPath}`);
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        reject(new Error(`Export failed: ${err.message}`));
      })
      .run();
  });
};
```

**Example 6: Export Integration**
```javascript
// src/components/ExportPanel.js
const ExportPanel = ({ clip, trimData }) => {
  const handleExport = async () => {
    if (!clip) return;
    
    try {
      // Show save dialog
      const result = await window.electronAPI.showSaveDialog({
        filters: [{ name: 'MP4 Video', extensions: ['mp4'] }]
      });
      
      if (result.canceled) return;
      
      const outputPath = result.filePath;
      
      // Export with trim data
      const exportResult = await window.electronAPI.exportVideo({
        inputPath: clip.path,
        outputPath: outputPath,
        trimData: trimData
      });
      
      if (exportResult.success) {
        showSuccess('Video exported successfully!');
      } else {
        showError(`Export failed: ${exportResult.error}`);
      }
    } catch (error) {
      showError(`Export error: ${error.message}`);
    }
  };

  return (
    <div className="export-panel">
      <button onClick={handleExport}>
        Export Trimmed Video
      </button>
      {trimData && (
        <div className="export-info">
          Exporting: {trimData.outPoint - trimData.inPoint}s segment
        </div>
      )}
    </div>
  );
};
```

---

## Testing Strategy

### Test Categories

**Unit Tests:**
- TrimControls renders with default values
- Set In Point button updates state
- Set Out Point button updates state
- Reset Trim button clears trim
- Validation prevents in >= out
- Validation prevents negative times
- Validation prevents out > duration

**Integration Tests:**
- Set In/Out → Timeline shows trim indicators
- Set In/Out → Export produces trimmed video
- Trim → Select new clip → Trim resets
- Trim → Reset → Trim clears
- Play video → Set In → Time updates correctly
- Play video → Set Out → Time updates correctly

**Edge Cases:**
- Set In at 0 seconds
- Set Out at video end
- Set In and Out at same position
- Set In after Out (should show error)
- Set Out before In (should show error)
- Very short trim (< 1 second)
- Very long clip (> 10 minutes)
- Trim at video boundaries
- Multiple trim/reset cycles

**Export Tests:**
- Export with full trim (0 to duration)
- Export with start trim (inPoint > 0)
- Export with end trim (outPoint < duration)
- Export with both trims
- Verify exported video duration matches trim
- Verify exported video plays correctly

---

## Success Criteria

### Hard Requirements (Must Pass)
- Can set in-point during playback
- Can set out-point during playback
- Trim times display correctly
- Trim indicators show on timeline
- Export respects trim settings
- Trimmed export has correct duration
- Trim resets on clip selection
- Reset button clears trim

### Quality Indicators (Should Pass)
- Buttons disabled appropriately
- Error messages clear and helpful
- Visual feedback during trim setting
- Timeline indicators clear and accurate
- Trim persists during playback
- No console errors

---

## Risk Assessment

### Risk 1: Time Synchronization Issues
**Likelihood:** HIGH  
**Impact:** HIGH  
**Mitigation:** Use timeupdate event for accurate time, add debug logging  
**Status:** 🔴 High Risk

### Risk 2: Trim Validation Bugs
**Likelihood:** MEDIUM  
**Impact:** MEDIUM  
**Mitigation:** Comprehensive validation, clear error messages, edge case testing  
**Status:** 🟡 Medium Risk

### Risk 3: FFmpeg Trim Integration
**Likelihood:** MEDIUM  
**Impact:** HIGH  
**Mitigation:** Test FFmpeg trim commands thoroughly, verify output duration  
**Status:** 🟡 Medium Risk

### Risk 4: State Management Complexity
**Likelihood:** MEDIUM  
**Impact:** MEDIUM  
**Mitigation:** Keep state simple (inPoint, outPoint only), clear data flow  
**Status:** 🟡 Medium Risk

### Risk 5: Integration with Existing Components
**Likelihood:** HIGH  
**Impact:** HIGH  
**Mitigation:** Coordinate with VideoPlayer and Timeline components, test incrementally  
**Status:** 🔴 High Risk

---

## Timeline Estimates

**Total Time:** 6 hours

| Phase | Task | Time | Dependencies |
|-------|------|------|--------------|
| 1 | TrimControls component | 90 min | None |
| 2 | App state integration | 60 min | Phase 1 |
| 3 | VideoPlayer time updates | 30 min | Phase 2 |
| 4 | Timeline indicators | 90 min | Phase 3 |
| 5 | Export integration | 60 min | Phase 4 |
| 6 | Polish & testing | 30 min | All above |

**Buffer:** 30 minutes for unexpected issues

---

## Dependencies

### Requires (Must be Complete)
- **PR #3:** Video Player - Provides playback and time tracking
- **PR #5:** Timeline - Shows trim indicators, receives trim data

### Blocks
- **PR #7:** UI Polish - May adjust trim control styling
- **PR #9:** Packaging - Must work in packaged app

### Integration Points
- **App.js state:** Must coordinate trimData and currentTime
- **VideoPlayer:** Must emit timeupdate events
- **Timeline:** Must display trim indicators
- **ExportPanel:** Must use trim data for export
- **FFmpeg:** Must support setStartTime() and setDuration()

---

## Open Questions

1. **Auto-Seek to In Point:** Should player auto-seek to trim in-point when set?
   - **Decision:** No - keep current playback position
   - **Rationale:** User might want to watch after setting in point

2. **Trim Indicators Color:** What color for trim indicators?
   - **Decision:** Use primary color for trimmed segment, dark overlay for non-trimmed
   - **Rationale:** Clear visual distinction

3. **Export with No Trim:** What if user exports without setting trim?
   - **Decision:** Export full clip (trim defaults to full clip)
   - **Rationale:** Least surprising behavior

4. **Multiple Clips:** Should each clip have separate trim settings?
   - **Decision:** No - only trim selected clip
   - **Rationale:** MVP is single-clip editing, clearer UX

5. **Keyboard Shortcuts:** Add keyboard shortcuts for trim buttons?
   - **Decision:** No - buttons only for MVP
   - **Rationale:** Can add post-MVP if time allows

---

## References

### Related Documents
- `clipforge-prd.md` - Overall project requirements
- `clipforge-task-list.md` - PR #6 task breakdown
- `memory-bank/systemPatterns.md` - Architecture patterns
- `memory-bank/activeContext.md` - Current project status

### Technical Resources
- FFmpeg trim documentation: https://ffmpeg.org/ffmpeg.html#Video-Filters
- React state management: https://react.dev/learn/state-a-component-s-memory
- HTML5 video timeupdate: https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/timeupdate_event

---

## Post-MVP Enhancements

### Future Features (Not in MVP)
- **Multi-clip trim:** Trim multiple clips in sequence
- **Fine-tuning:** Precise frame-by-frame trim adjustment
- **Preview trim:** Play only trimmed segment before export
- **Trim presets:** Common trim lengths (30s, 60s clips)
- **Undo/redo:** Multiple trim operations
- **Copy trim:** Apply same trim to multiple clips

---

**Document Status:** Planning Complete  
**Next Action:** Review this specification, then create implementation checklist

