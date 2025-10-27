# PR#6: Trim Controls - Implementation Checklist

**Use this as your daily todo list.** Check off items as you complete them.

**Estimated Time:** 6 hours  
**Complexity:** MEDIUM-HIGH  
**Current Phase:** 📋 Ready to Start

---

## Pre-Implementation Setup (15 minutes)

- [ ] Read main planning document (`PR06_TRIM_CONTROLS.md`) (~20 min)
- [ ] Verify PR #3 (Video Player) complete with time update capability
- [ ] Verify PR #5 (Timeline) complete with clip selection
- [ ] Check App.js has clips state and selectedClipId state
- [ ] Git branch created:
```bash
git checkout -b feature/pr06-trim-controls
```

---

## Phase 1: TrimControls Component (90 minutes)

### Step 1.1: Create TrimControls Component Structure (20 minutes)

#### Create File
- [ ] Create `src/components/TrimControls.js`

#### Add Imports
- [ ] Add React import
- [ ] Add CSS import
- [ ] Import timeHelpers utility
```javascript
import React from 'react';
import './TrimControls.css';
import { formatDuration } from '../utils/timeHelpers';
```

#### Create Component Structure
- [ ] Create function component with props
```javascript
const TrimControls = ({
  currentTime,
  duration,
  inPoint,
  outPoint,
  onSetInPoint,
  onSetOutPoint,
  onResetTrim
}) => {
  return (
    <div className="trim-controls">
      <p>Trim Controls</p>
    </div>
  );
};

export default TrimControls;
```

**Checkpoint:** Component structure created ✓

**Commit:** `feat(trim): create basic TrimControls component structure`

---

### Step 1.2: Add Current Time Display (15 minutes)

#### Display Current Playback Time
- [ ] Add time display section
```javascript
<div className="trim-time-display">
  <span className="label">Current Time:</span>
  <span className="time">{formatDuration(currentTime)}</span>
  <span className="separator">/</span>
  <span className="duration">{formatDuration(duration)}</span>
</div>
```

#### Import in App.js
- [ ] Add import statement
- [ ] Add to App layout (temporary props for now)

**Checkpoint:** Current time displays ✓

**Commit:** `feat(trim): add current time display`

---

### Step 1.3: Add Set In Point Button (15 minutes)

#### Add Set In Button
- [ ] Add button with handler
```javascript
<button
  className="btn-set"
  onClick={onSetInPoint}
  disabled={currentTime >= outPoint || currentTime < 0}
  title="Set trim start to current position"
>
  Set In
</button>
```

#### Add In Point Display
- [ ] Display current in point value
```javascript
<div className="trim-point">
  <label>In Point:</label>
  <span className="time-value">{formatDuration(inPoint)}</span>
  {/* Button here */}
</div>
```

**Checkpoint:** Set In button functional ✓

**Commit:** `feat(trim): add set in point button`

---

### Step 1.4: Add Set Out Point Button (15 minutes)

#### Add Set Out Button
- [ ] Add button with handler
```javascript
<button
  className="btn-set"
  onClick={onSetOutPoint}
  disabled={currentTime <= inPoint || currentTime > duration}
  title="Set trim end to current position"
>
  Set Out
</button>
```

#### Add Out Point Display
- [ ] Display current out point value
```javascript
<div className="trim-point">
  <label>Out Point:</label>
  <span className="time-value">{formatDuration(outPoint)}</span>
  {/* Button here */}
</div>
```

**Checkpoint:** Set Out button functional ✓

**Commit:** `feat(trim): add set out point button`

---

### Step 1.5: Add Reset Button (10 minutes)

#### Add Reset Button
- [ ] Add reset button
```javascript
<button
  className="btn-reset"
  onClick={onResetTrim}
  title="Reset trim to full clip"
>
  Reset Trim
</button>
```

#### Add Trim Duration Display
- [ ] Display calculated trim duration
```javascript
<div className="trim-duration">
  <label>Trim Duration:</label>
  <span className="duration-value">
    {formatDuration(outPoint - inPoint)}
  </span>
</div>
```

**Checkpoint:** Reset button and duration display working ✓

**Commit:** `feat(trim): add reset button and trim duration display`

---

### Step 1.6: Add Error Display (15 minutes)

#### Add Validation Logic
- [ ] Check if trim is valid
```javascript
const isValid = inPoint < outPoint && inPoint >= 0 && outPoint <= duration;
```

#### Display Error Message
- [ ] Show error when invalid
```javascript
{!isValid && (
  <div className="trim-error">
    ⚠️ In point must be before out point
  </div>
)}
```

#### Style Error State
- [ ] Add error styling to duration value
- [ ] Test with invalid settings

**Checkpoint:** Error display functional ✓

**Commit:** `feat(trim): add validation and error display`

---

## Phase 2: App State Integration (60 minutes)

### Step 2.1: Add Trim Data State (10 minutes)

#### Add State to App.js
- [ ] Add trimData state
```javascript
const [trimData, setTrimData] = useState({ inPoint: 0, outPoint: 0 });
```

#### Initialize with Selected Clip Duration
- [ ] Add useEffect to initialize trimData
```javascript
useEffect(() => {
  if (selectedClip) {
    setTrimData({
      inPoint: 0,
      outPoint: selectedClip.duration
    });
  }
}, [selectedClipId, selectedClip?.duration]);
```

**Checkpoint:** Trim state initialized ✓

**Commit:** `feat(trim): add trim data state to App`

---

### Step 2.2: Add Current Time State (10 minutes)

#### Add Current Time State
- [ ] Add currentTime state to App.js
```javascript
const [currentTime, setCurrentTime] = useState(0);
```

#### Create Time Update Handler
- [ ] Add handler for time updates
```javascript
const handleTimeUpdate = (time) => {
  setCurrentTime(time);
};
```

**Checkpoint:** Current time state working ✓

**Commit:** `feat(trim): add current time state`

---

### Step 2.3: Create Set In Point Handler (10 minutes)

#### Create Handler
- [ ] Add set in point handler
```javascript
const handleSetInPoint = () => {
  if (!selectedClip) return;
  
  setTrimData(prev => ({
    ...prev,
    inPoint: currentTime
  }));
};
```

#### Add Validation
- [ ] Validate currentTime < outPoint
- [ ] Validate currentTime >= 0

**Checkpoint:** Set in point handler working ✓

**Commit:** `feat(trim): implement set in point handler`

---

### Step 2.4: Create Set Out Point Handler (10 minutes)

#### Create Handler
- [ ] Add set out point handler
```javascript
const handleSetOutPoint = () => {
  if (!selectedClip) return;
  
  setTrimData(prev => ({
    ...prev,
    outPoint: currentTime
  }));
};
```

#### Add Validation
- [ ] Validate currentTime > inPoint
- [ ] Validate currentTime <= duration

**Checkpoint:** Set out point handler working ✓

**Commit:** `feat(trim): implement set out point handler`

---

### Step 2.5: Create Reset Trim Handler (10 minutes)

#### Create Handler
- [ ] Add reset handler
```javascript
const handleResetTrim = () => {
  if (!selectedClip) return;
  
  setTrimData({
    inPoint: 0,
    outPoint: selectedClip.duration
  });
};
```

#### Pass Handlers to TrimControls
- [ ] Connect TrimControls in App render
```javascript
<TrimControls
  currentTime={currentTime}
  duration={selectedClip?.duration || 0}
  inPoint={trimData.inPoint}
  outPoint={trimData.outPoint}
  onSetInPoint={handleSetInPoint}
  onSetOutPoint={handleSetOutPoint}
  onResetTrim={handleResetTrim}
/>
```

**Checkpoint:** All handlers connected ✓

**Commit:** `feat(trim): implement reset handler and connect to component`

---

### Step 2.6: Add Trim Validation (10 minutes)

#### Add Validation Logic
- [ ] Check in < out
- [ ] Check in >= 0
- [ ] Check out <= duration
- [ ] Check minimum duration (> 0.1s)

#### Add Edge Case Handling
- [ ] Handle edge cases (boundary conditions)
- [ ] Test with various clip durations

**Checkpoint:** Validation working correctly ✓

**Commit:** `feat(trim): add comprehensive validation logic`

---

## Phase 3: VideoPlayer Time Updates (30 minutes)

### Step 3.1: Add onTimeUpdate Prop (15 minutes)

#### Add Prop to VideoPlayer
- [ ] Update VideoPlayer component signature
```javascript
const VideoPlayer = ({ clip, onTimeUpdate }) => {
```

#### Add Time Update Listener
- [ ] Add event listener
```javascript
useEffect(() => {
  const video = videoRef.current;
  if (!video || !onTimeUpdate) return;

  const handleTimeUpdate = () => {
    onTimeUpdate(video.currentTime);
  };

  video.addEventListener('timeupdate', handleTimeUpdate);

  return () => {
    video.removeEventListener('timeupdate', handleTimeUpdate);
  };
}, [onTimeUpdate]);
```

**Checkpoint:** Time updates emitted ✓

**Commit:** `feat(trim): add time update callback to VideoPlayer`

---

### Step 3.2: Connect to App (15 minutes)

#### Pass Handler to VideoPlayer
- [ ] Update App render
```javascript
<VideoPlayer
  clip={selectedClip}
  onTimeUpdate={handleTimeUpdate}
/>
```

#### Test Time Updates
- [ ] Verify currentTime updates during playback
- [ ] Verify TrimControls receives updated time
- [ ] Check console for time updates

**Checkpoint:** Time updates flowing correctly ✓

**Commit:** `feat(trim): connect time updates to App state`

---

## Phase 4: Timeline Trim Indicators (90 minutes)

### Step 4.1: Modify Timeline Component (30 minutes)

#### Add trimData Prop
- [ ] Update Timeline signature
```javascript
const Timeline = ({ clips, selectedClipId, onSelectClip, trimData }) => {
```

#### Pass trimData to ClipBlock
- [ ] Get trim data for selected clip
```javascript
const selectedClip = clips.find(c => c.id === selectedClipId);
const clipTrimData = isSelected ? trimData : null;
```

#### Update ClipBlock Call
- [ ] Pass trimData to ClipBlock
```javascript
<ClipBlock
  key={clip.id}
  clip={clip}
  isSelected={isSelected}
  onSelect={() => onSelectClip(clip.id)}
  trimData={clipTrimData}
/>
```

**Checkpoint:** Timeline receives trim data ✓

**Commit:** `feat(trim): add trim data to Timeline component`

---

### Step 4.2: Render Trim Indicators (40 minutes)

#### Create Trim Overlay in ClipBlock
- [ ] Add trim overlay div
```javascript
{trimData && (
  <div className="trim-overlay">
    {/* Trim indicators here */}
  </div>
)}
```

#### Calculate Trim Regions
- [ ] Calculate left darken region (before in-point)
- [ ] Calculate middle highlighted region (trimmed segment)
- [ ] Calculate right darken region (after out-point)

#### Render Darken Regions
- [ ] Render non-trimmed sections as darkened
```javascript
{trimData.inPoint > 0 && (
  <div
    className="trim-darken"
    style={{ 
      width: `${(trimData.inPoint / clip.duration) * 100}%`,
      left: 0
    }}
  />
)}

{trimData.outPoint < clip.duration && (
  <div
    className="trim-darken"
    style={{ 
      width: `${((clip.duration - trimData.outPoint) / clip.duration) * 100}%`,
      right: 0
    }}
  />
)}
```

#### Render Trim Highlight
- [ ] Render trimmed segment as highlighted
```javascript
<div 
  className="trim-highlighted"
  style={{
    left: `${(trimData.inPoint / clip.duration) * 100}%`,
    width: `${((trimData.outPoint - trimData.inPoint) / clip.duration) * 100}%`
  }}
/>
```

**Checkpoint:** Trim indicators display visually ✓

**Commit:** `feat(trim): implement trim indicators on timeline`

---

### Step 4.3: Style Trim Indicators (20 minutes)

#### Add CSS for Trim Overlay
- [ ] Create `.trim-overlay` style
- [ ] Create `.trim-darken` style
- [ ] Create `.trim-highlighted` style
- [ ] Position absolutely over clip block

#### Test Visual Appearance
- [ ] Verify darkened regions visible
- [ ] Verify highlighted region visible
- [ ] Test with various trim settings
- [ ] Ensure indicators update when trim changes

**Checkpoint:** Trim indicators styled correctly ✓

**Commit:** `style(trim): add visual styling for trim indicators`

---

## Phase 5: Export Integration (60 minutes)

### Step 5.1: Update ExportPanel Props (10 minutes)

#### Add trimData Prop
- [ ] Update ExportPanel signature
```javascript
const ExportPanel = ({ clip, trimData }) => {
```

#### Pass trimData from App
- [ ] Update App render
```javascript
<ExportPanel
  clip={selectedClip}
  trimData={trimData}
/>
```

**Checkpoint:** ExportPanel receives trim data ✓

**Commit:** `feat(trim): pass trim data to ExportPanel`

---

### Step 5.2: Update Export Handler (20 minutes)

#### Update Export Function
- [ ] Modify export handler to use trim data
```javascript
const handleExport = async () => {
  if (!clip) return;
  
  try {
    const result = await window.electronAPI.showSaveDialog({
      filters: [{ name: 'MP4 Video', extensions: ['mp4'] }]
    });
    
    if (result.canceled) return;
    
    const outputPath = result.filePath;
    
    const exportResult = await window.electronAPI.exportVideo({
      inputPath: clip.path,
      outputPath: outputPath,
      trimData: trimData
    });
    
    if (exportResult.success) {
      showSuccess('Video exported successfully!');
    }
  } catch (error) {
    showError(error.message);
  }
};
```

#### Display Trim Info
- [ ] Show trim duration in export UI
```javascript
{trimData && (
  <div className="export-info">
    Exporting: {trimData.outPoint - trimData.inPoint}s segment
  </div>
)}
```

**Checkpoint:** Export uses trim data ✓

**Commit:** `feat(trim): update export to use trim data`

---

### Step 5.3: Update FFmpeg Processing (30 minutes)

#### Update Export Function Signature
- [ ] Modify to accept trim options
```javascript
const exportVideo = (inputPath, outputPath, options = {}) => {
  const { trimData, onProgress } = options;
```

#### Add Trim Logic
- [ ] Add start time if inPoint > 0
```javascript
if (trimData && trimData.inPoint > 0) {
  command = command.setStartTime(trimData.inPoint);
}
```

#### Add Duration if Trimmed
- [ ] Add duration calculation
```javascript
if (trimData && trimData.outPoint) {
  const duration = trimData.outPoint - trimData.inPoint;
  command = command.setDuration(duration);
}
```

#### Update IPC Handler
- [ ] Modify IPC handler to pass trimData
```javascript
ipcMain.handle('export-video', async (event, { inputPath, outputPath, trimData }) => {
  try {
    const result = await exportVideo(inputPath, outputPath, { trimData });
    return { success: true, outputPath: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
```

**Checkpoint:** FFmpeg uses trim settings ✓

**Commit:** `feat(trim): add FFmpeg trim support to export`

---

## Phase 6: Polish & Testing (30 minutes)

### Step 6.1: Add Error States (10 minutes)

#### Disable Buttons When Invalid
- [ ] Disable Set In when >= out point
- [ ] Disable Set Out when <= in point
- [ ] Test button states

#### Add Helpful Messages
- [ ] Add tooltips to buttons
- [ ] Add validation messages
- [ ] Test error display

**Checkpoint:** Error states functional ✓

**Commit:** `feat(trim): add error states and helpful messages`

---

### Step 6.2: Test Trim Workflow (10 minutes)

#### Test Complete Workflow
- [ ] Import video
- [ ] Play video and scrub to position
- [ ] Click Set In
- [ ] Verify in point displayed
- [ ] Scrub to another position
- [ ] Click Set Out
- [ ] Verify out point displayed
- [ ] Verify trim indicators on timeline
- [ ] Click Reset
- [ ] Verify trim cleared
- [ ] Export trimmed video
- [ ] Verify exported video duration matches

**Checkpoint:** Complete workflow tested ✓

**Commit:** `test(trim): test complete trim workflow`

---

### Step 6.3: Edge Case Testing (10 minutes)

#### Test Edge Cases
- [ ] Set In at 0 seconds
- [ ] Set Out at video end
- [ ] Set In and Out at same time (should error)
- [ ] Set Out before In (should error)
- [ ] Select new clip (should reset trim)
- [ ] Reset after setting trim
- [ ] Export with full trim (no actual trim)
- [ ] Export with very short trim (< 1 second)

**Checkpoint:** Edge cases handled ✓

**Commit:** `test(trim): test edge cases and boundary conditions`

---

## Completion Checklist

- [ ] All Phase 1 tasks complete
- [ ] All Phase 2 tasks complete
- [ ] All Phase 3 tasks complete
- [ ] All Phase 4 tasks complete
- [ ] All Phase 5 tasks complete
- [ ] All Phase 6 tasks complete
- [ ] No console errors
- [ ] All features working
- [ ] Ready to test export

**Final Commit:** `feat(trim): complete trim controls implementation`

---

## Time Tracking

**Estimated Total:** 6 hours  
**Actual Total:** ___ hours

| Phase | Estimated | Actual |
|-------|-----------|--------|
| Phase 1 | 90 min | ___ min |
| Phase 2 | 60 min | ___ min |
| Phase 3 | 30 min | ___ min |
| Phase 4 | 90 min | ___ min |
| Phase 5 | 60 min | ___ min |
| Phase 6 | 30 min | ___ min |
| Buffer | 30 min | ___ min |

