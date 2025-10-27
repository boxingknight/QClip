# ClipForge - System Patterns

**Architecture:** Electron (main + renderer) + React + FFmpeg  
**Pattern:** Component-based UI with IPC for file operations

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                  Electron Main Process              │
│                  (Node.js Runtime)                  │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │         BrowserWindow (Renderer)              │  │
│  │  ┌────────────────────────────────────────┐   │  │
│  │  │        React Application               │   │  │
│  │  │                                        │   │  │
│  │  │  ┌──────────┐  ┌──────────┐          │   │  │
│  │  │  │ Import   │  │ Player   │          │   │  │
│  │  │  │ Panel    │  │          │          │   │  │
│  │  │  └──────────┘  └──────────┘          │   │  │
│  │  │                                        │   │  │
│  │  │  ┌────────────────────────────┐      │   │  │
│  │  │  │      Timeline               │      │   │  │
│  │  │  └────────────────────────────┘      │   │  │
│  │  │                                        │   │  │
│  │  │  ┌──────────┐  ┌──────────┐          │   │  │
│  │  │  │ Trim     │  │ Export   │          │   │  │
│  │  │  │ Controls │  │ Panel    │          │   │  │
│  │  │  └──────────┘  └──────────┘          │   │  │
│  │  └────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │        FFmpeg Processing Module               │  │
│  │        (fluent-ffmpeg)                         │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

### App Component (State Manager)
```javascript
App.js (Root)
│
├── clips: [{ id, name, path, duration, inPoint, outPoint }]
├── selectedClip: { id, ... }
├── currentTime: number
│
├── ImportPanel
│   └── handles import → adds to clips[]
│
├── VideoPlayer
│   └── displays selectedClip
│
├── Timeline
│   └── displays clips[], highlights selectedClip
│
├── TrimControls
│   └── sets inPoint/outPoint on selectedClip
│
└── ExportPanel
    └── exports selectedClip with trim points
```

### Data Flow Pattern

```
User Action → Component → App State → Component Update → UI
     ↓
[Import File] → ImportPanel → clips.push() → Timeline updates
                                                Player loads
```

---

## State Management Pattern

### Single Source of Truth
**Location:** App.js  
**Structure:**
```javascript
const [clips, setClips] = useState([]);           // All imported clips
const [selectedClipId, setSelectedClipId] = useState(null); // Currently selected
const [currentTime, setCurrentTime] = useState(0);  // Playhead position
const [trimData, setTrimData] = useState({          // Active trim settings
  inPoint: 0,
  outPoint: 0
});
```

### State Updates Flow
1. **Import** → `setClips([...clips, newClip])`
2. **Select** → `setSelectedClipId(clip.id)` → Filter player/timeline
3. **Trim** → `setTrimData({ inPoint, outPoint })` → Visual indicators
4. **Export** → Use current clip + trimData → FFmpeg

---

## IPC Communication Pattern

### Communication Bridge
```
Renderer (React)  ←→  Preload Script  ←→  Main Process (Node.js)
                             ↑
                    contextBridge.exposeInMainWorld()
```

### IPC APIs Exposed

#### 1. File Import
```javascript
// Renderer
const filePath = await window.electronAPI.openFileDialog();

// Main
ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog({
    filters: [{ name: 'Video', extensions: ['mp4', 'mov'] }]
  });
  return result.filePaths[0];
});
```

#### 2. Video Export
```javascript
// Renderer
await window.electronAPI.exportVideo({
  inputPath: clip.path,
  outputPath: savePath,
  trimStart: trimData.inPoint,
  trimEnd: trimData.outPoint
});

// Main
ipcMain.handle('export-video', async (event, options) => {
  return await exportVideo(options);
});
```

#### 3. File Metadata
```javascript
// Renderer
const metadata = await window.electronAPI.getVideoMetadata(filePath);

// Main
ipcMain.handle('get-video-metadata', async (event, filePath) => {
  return await ffprobe.ffprobe(filePath);
});
```

---

## Component Responsibilities

### ImportPanel
**Purpose:** File import UI  
**Responsible For:**
- Drag-and-drop handling
- File picker trigger
- File validation
- Adding clips to state

**Dependencies:** App state (clips setter)

### VideoPlayer
**Purpose:** Video preview and playback  
**Responsible For:**
- Displaying selected clip
- Play/pause controls
- Time display
- Reporting current time to App

**Dependencies:** `selectedClip.path`, App state (currentTime)

### Timeline
**Purpose:** Visual clip representation  
**Responsible For:**
- Displaying all clips
- Clip selection (click handler)
- Showing selected clip highlight
- Trim indicators overlay

**Dependencies:** `clips[]`, `selectedClipId`, `trimData`

### TrimControls
**Purpose:** Trim point management  
**Responsible For:**
- Setting in/out points
- Displaying current trim times
- Reset trim functionality
- Validation (in < out)

**Dependencies:** `currentTime`, App state (trimData setter)

### ExportPanel
**Purpose:** Export UI and controls  
**Responsible For:**
- Export button
- Save dialog trigger
- Progress display
- Success/error messages

**Dependencies:** `selectedClip`, `trimData`, IPC export API

---

## File System Pattern

### File Access Strategy
**Renderer:** Never directly access files  
**Main Process:** All file operations (Node.js fs module)

### Video File Handling
1. **Import:** Store file paths, not video data
2. **Playback:** Use file:// URLs in `<video>` element
3. **Export:** Pass paths to FFmpeg, let FFmpeg handle file I/O

### Path Resolution
```javascript
// Main process (absolute path)
const absolutePath = path.resolve(filePath);

// Renderer (file:// URL)
const fileUrl = `file://${absolutePath}`;
```

---

## FFmpeg Integration Pattern

### Processing Flow
```
Export Trigger → IPC → Main Process → FFmpeg Command → Progress Updates → IPC → Renderer → UI Update
```

### Command Building Pattern
```javascript
ffmpeg(inputPath)
  .seekInput(trimStart)              // Set in point
  .duration(trimEnd - trimStart)      // Set out point
  .output(outputPath)                 // Destination
  .outputOptions([
    '-c:v libx264',                   // Video codec
    '-c:a aac',                       // Audio codec
    '-preset fast'                    // Encoding speed
  ])
  .on('start', (cmd) => log(cmd))
  .on('progress', (progress) => sendProgress())
  .on('end', () => sendComplete())
  .on('error', (err) => sendError())
  .run();
```

### Metadata Extraction Pattern
```javascript
ffprobe.ffprobe(inputPath, (err, metadata) => {
  const duration = metadata.format.duration;
  const videoStream = metadata.streams.find(s => s.codec_type === 'video');
  const width = videoStream.width;
  const height = videoStream.height;
  // Store with clip data
});
```

---

## UI Layout Pattern

### Visual Layout
```
┌─────────────────────────────────────────────────────┐
│                    Header                            │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────┐         ┌──────────────┐             │
│  │ Import   │         │              │             │
│  │ Panel    │         │   Video      │  ┌────────┐│
│  │          │         │   Player     │  │ Trim   ││
│  │ Files:   │         │              │  │Controls││
│  │ - clip1  │         │  [Play] ═══  │  └────────┘│
│  │ - clip2  │         │              │             │
│  └──────────┘         └──────────────┘             │
│                                                      │
│  ┌───────────────────────────────────────────┐      │
│  │  Timeline                                  │      │
│  │  [Clip1] [Clip2]                          │      │
│  └───────────────────────────────────────────┘      │
│                                                      │
│  ┌────────────────────────────────────────────┐      │
│  │  [Export Button]    Status: Ready          │      │
│  └────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────┘
```

### Responsive Strategy
- **Fixed heights:** Timeline, header, footer
- **Flexible width:** Player (responses to window resize)
- **Minimum width:** 800px (timeline usability)

---

## Error Handling Pattern

### Error Flow
```
Error → Component → App State (error message) → UI Display → User Action
```

### Error Types

#### 1. File Import Errors
- **Unsupported format** → Show error in ImportPanel
- **File too large** → Warn before import
- **Corrupt file** → Show error, don't crash

#### 2. Playback Errors
- **Unsupported codec** → Show error in Player
- **File not found** → Show error, offer re-import
- **Permission denied** → Show user-friendly message

#### 3. Export Errors
- **FFmpeg fails** → Show error, allow retry
- **Insufficient disk space** → Check before starting
- **Invalid trim times** → Validate before export

### Error Display Pattern
```javascript
const [error, setError] = useState(null);

// Set error
setError({ type: 'EXPORT_ERROR', message: 'FFmpeg failed to encode' });

// Display error
{error && (
  <div className="error-message">
    {error.message}
    <button onClick={() => setError(null)}>Dismiss</button>
  </div>
)}
```

---

## Performance Optimization Patterns

### Large File Handling
**Problem:** Loading entire video into memory  
**Solution:** Use file paths, let HTML5 video handle streaming

### Timeline Performance
**Problem:** Re-rendering entire timeline on every state change  
**Solution:** Use React.memo for clip blocks, only re-render changed clips

### Export Progress
**Problem:** UI freeze during export  
**Solution:** Use FFmpeg progress events, update UI asynchronously

### Memory Cleanup
**Pattern:**
```javascript
useEffect(() => {
  return () => {
    // Cleanup on unmount
    videoElement.pause();
    videoElement.src = '';
  };
}, []);
```

---

## Testing Patterns

### Unit Test Pattern
- **Components:** Test rendering with props
- **Utilities:** Test file validation, time formatting

### Integration Test Pattern
1. Import file → Verify in clips array
2. Select clip → Verify player loads
3. Set trim → Verify indicators show
4. Export → Verify file created

### Manual Test Pattern
1. Launch app (dev mode)
2. Import MP4
3. Play video
4. Set trim points
5. Export
6. Verify exported file in VLC

---

## Current Architecture Status

**Pattern:** Single-page React app with IPC file operations  
**State:** Components designed, not yet implemented  
**Next:** PR #1 - Initialize project with this architecture

