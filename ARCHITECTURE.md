# ClipForge Architecture Documentation

**Project:** ClipForge Desktop Video Editor MVP  
**Version:** 1.0  
**Architecture:** Electron + React + FFmpeg  
**Created:** October 29, 2025

---

## System Overview

ClipForge is a desktop video editor built with Electron, providing a native desktop experience for video editing tasks. The application follows a secure, modern architecture with clear separation between the main process (Node.js) and renderer process (React).

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ClipForge Desktop App                    │
├─────────────────────────────────────────────────────────────┤
│  Main Process (Node.js)     │    Renderer Process (React)   │
│  ┌─────────────────────────┐ │  ┌─────────────────────────┐  │
│  │ • File System Access   │ │  │ • UI Components        │  │
│  │ • FFmpeg Integration   │◄┼──┤ • State Management     │  │
│  │ • Native Dialogs      │ │  │ • User Interactions    │  │
│  │ • IPC Handlers        │ │  │ • Video Playback       │  │
│  │ • Process Management  │ │  │ • Timeline Rendering   │  │
│  └─────────────────────────┘ │  └─────────────────────────┘  │
│           ▲                   │           ▲                  │
│           │ IPC               │           │                  │
│           │ (contextBridge)  │           │                  │
│           ▼                   │           ▼                  │
│  ┌─────────────────────────┐ │  ┌─────────────────────────┐  │
│  │ • Preload Script       │ │  │ • React Components      │  │
│  │ • Security Layer       │ │  │ • CSS Styling          │  │
│  │ • API Exposure         │ │  │ • Event Handling       │  │
│  └─────────────────────────┘ │  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Technologies

### Electron Framework
- **Main Process:** Node.js environment with full system access
- **Renderer Process:** Chromium-based UI with React
- **IPC Communication:** Secure message passing via contextBridge
- **Security:** Context isolation enabled, node integration disabled

### React Frontend
- **Component Architecture:** Functional components with hooks
- **State Management:** React useState for local state
- **Styling:** CSS modules with CSS custom properties
- **Build System:** Webpack for bundling and optimization

### FFmpeg Integration
- **Video Processing:** Native FFmpeg binaries bundled with app
- **Export Pipeline:** MP4 encoding with progress tracking
- **Format Support:** MP4, MOV input/output
- **Performance:** Async processing with IPC progress updates

---

## Process Architecture

### Main Process (`main.js`)

**Responsibilities:**
- Application lifecycle management
- Window creation and management
- IPC handlers for file operations
- FFmpeg process spawning and monitoring
- Native dialog integration

**Key Modules:**
```javascript
// main.js structure
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

// IPC Handlers
ipcMain.handle('select-video-files', handleFileSelection);
ipcMain.handle('export-video', handleVideoExport);
ipcMain.handle('show-save-dialog', handleSaveDialog);
ipcMain.handle('get-temp-path', handleTempPath);
```

**Security Configuration:**
```javascript
webPreferences: {
  nodeIntegration: false,        // Disabled for security
  contextIsolation: true,       // Enabled for security
  preload: path.join(__dirname, 'preload.js')
}
```

### Preload Script (`preload.js`)

**Purpose:** Secure API bridge between main and renderer processes

**Exposed APIs:**
```javascript
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  selectVideoFiles: () => ipcRenderer.invoke('select-video-files'),
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  
  // Video processing
  exportVideo: (data) => ipcRenderer.invoke('export-video', data),
  onExportProgress: (callback) => ipcRenderer.on('export-progress', callback),
  
  // System utilities
  getTempPath: () => ipcRenderer.invoke('get-temp-path'),
  
  // Error handling
  onError: (callback) => ipcRenderer.on('error', callback)
});
```

### Renderer Process (React App)

**Entry Point:** `src/index.js`
- React app initialization
- Error boundary setup
- Global error handlers

**Main App Component:** `src/App.js`
- Global state management
- Component orchestration
- IPC communication coordination

---

## Component Architecture

### Component Hierarchy

```
App (src/App.js)
├── ErrorBoundary
│   └── ErrorFallback
├── ImportPanel
│   ├── File validation utilities
│   └── Drag-drop handlers
├── VideoPlayer
│   ├── HTML5 video element
│   ├── Custom controls
│   └── Time update callbacks
├── Timeline
│   ├── Clip visualization
│   ├── Selection handling
│   ├── Trim indicators
│   └── Interactive controls
└── ExportPanel
    ├── Export controls
    ├── Progress tracking
    └── Success/error states
```

### State Management

**App-Level State:**
```javascript
const [clips, setClips] = useState([]);           // Imported video files
const [selectedClipId, setSelectedClipId] = useState(null);  // Current selection
const [trimData, setTrimData] = useState({         // Trim points
  inPoint: 0,
  outPoint: 0,
  isActive: false
});
const [isExporting, setIsExporting] = useState(false);      // Export status
```

**Component-Level State:**
- VideoPlayer: playback state, current time
- ImportPanel: drag state, loading state
- ExportPanel: progress, error states

---

## IPC Communication Flow

### File Import Flow

```
1. User clicks "Browse Files"
   ↓
2. Renderer → Main: 'select-video-files'
   ↓
3. Main: Shows native file dialog
   ↓
4. Main → Renderer: Returns file paths
   ↓
5. Renderer: Updates clips state
   ↓
6. Timeline: Renders new clips
```

### Video Export Flow

```
1. User clicks "Export Video"
   ↓
2. Renderer → Main: 'export-video' (with trim data)
   ↓
3. Main: Shows save dialog
   ↓
4. Main: Spawns FFmpeg process
   ↓
5. Main → Renderer: 'export-progress' (continuous)
   ↓
6. Renderer: Updates progress bar
   ↓
7. Main → Renderer: Export complete/error
   ↓
8. Renderer: Shows success/error message
```

### Trim Workflow

```
1. User double-clicks timeline
   ↓
2. Timeline: Updates trim state
   ↓
3. Timeline: Renders trim indicators
   ↓
4. User clicks "Apply Trim"
   ↓
5. Renderer → Main: 'export-video' (with trim)
   ↓
6. Main: Creates trimmed video file
   ↓
7. Main → Renderer: Returns trimmed file path
   ↓
8. Renderer: Updates clip to use trimmed version
```

---

## File System Architecture

### Project Structure

```
clipforge/
├── main.js                    # Electron main process
├── preload.js                 # IPC bridge
├── package.json               # Dependencies and scripts
├── electron-builder.yml       # Packaging configuration
├── webpack.config.js          # React bundling
├── src/                       # React application
│   ├── index.js              # App entry point
│   ├── App.js                # Main component
│   ├── App.css               # Global styles
│   ├── components/           # UI components
│   │   ├── ImportPanel.js    # File import
│   │   ├── VideoPlayer.js    # Video playback
│   │   ├── Timeline.js       # Timeline visualization
│   │   ├── ExportPanel.js    # Export controls
│   │   ├── ErrorBoundary.js  # Error handling
│   │   └── ErrorFallback.js  # Error UI
│   ├── styles/               # Component styles
│   │   ├── ImportPanel.css
│   │   ├── VideoPlayer.css
│   │   ├── Timeline.css
│   │   └── ExportPanel.css
│   └── utils/                # Utility functions
│       ├── fileHelpers.js    # File validation
│       ├── timeHelpers.js    # Time formatting
│       ├── logger.js          # Logging utility
│       └── trimValidation.js # Trim validation
├── electron/                  # Electron-specific code
│   └── ffmpeg/
│       └── videoProcessing.js # FFmpeg integration
├── dist/                      # Build output
│   ├── bundle.js             # React bundle
│   ├── index.html            # HTML template
│   └── ClipForge-*.dmg       # Packaged app
└── PR_PARTY/                  # Development documentation
    ├── README.md             # PR documentation hub
    ├── PR01_*.md             # PR #1 documentation
    ├── PR02_*.md             # PR #2 documentation
    └── ...                   # Additional PR docs
```

### Build Process

**Development Build:**
```bash
npm run build    # Webpack bundle
npm start        # Launch Electron
```

**Production Build:**
```bash
npm run build:app    # Production webpack bundle
npm run package      # Create DMG with electron-builder
```

**Output Structure:**
```
dist/
├── bundle.js              # React application bundle
├── index.html             # HTML template
├── ClipForge-1.0.0-arm64.dmg  # macOS installer
└── mac-arm64/             # Unpacked app bundle
    └── ClipForge.app/     # macOS application
```

---

## Security Architecture

### Security Principles

1. **Context Isolation:** Renderer process cannot access Node.js APIs
2. **No Node Integration:** Prevents direct system access from renderer
3. **API Exposure:** Only necessary APIs exposed via contextBridge
4. **Input Validation:** All user inputs validated before processing
5. **Error Boundaries:** Graceful error handling prevents crashes

### Security Implementation

**Preload Script Security:**
```javascript
// Only expose necessary APIs
contextBridge.exposeInMainWorld('electronAPI', {
  // Specific functions only
  selectVideoFiles: () => ipcRenderer.invoke('select-video-files'),
  // No general ipcRenderer access
});
```

**Main Process Security:**
```javascript
// Validate all IPC inputs
ipcMain.handle('export-video', async (event, data) => {
  // Validate data structure
  if (!data || !data.inputPath || !data.outputPath) {
    throw new Error('Invalid export data');
  }
  // Process safely
});
```

---

## Performance Architecture

### Memory Management

**Video Element Cleanup:**
```javascript
// VideoPlayer component cleanup
useEffect(() => {
  return () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.removeAttribute('src');
      videoRef.current.load();
    }
  };
}, [videoPath]);
```

**State Optimization:**
- Minimal state updates
- Debounced user interactions
- Lazy loading of video metadata

### FFmpeg Performance

**Async Processing:**
- Non-blocking video processing
- Progress updates via IPC
- Error handling with timeouts

**Resource Management:**
- Temporary file cleanup
- Process termination on app close
- Memory-efficient video processing

---

## Error Handling Architecture

### Error Boundary System

**Global Error Boundary:**
```javascript
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

**Component-Level Error Handling:**
- Try-catch blocks for async operations
- User-friendly error messages
- Graceful degradation

### Logging System

**Structured Logging:**
```javascript
// Development logging
logger.info('Video imported', { path: videoPath, duration: metadata.duration });
logger.error('Export failed', error, { inputPath, outputPath });
```

**Production Logging:**
- Minimal console output
- Error reporting to main process
- User notification system

---

## Packaging Architecture

### Electron Builder Configuration

**macOS Packaging:**
```yaml
# electron-builder.yml
appId: com.clipforge.app
productName: ClipForge
directories:
  output: dist
files:
  - dist/bundle.js
  - dist/index.html
  - electron/ffmpeg/**
extraResources:
  - from: electron/ffmpeg/
    to: ffmpeg/
asarUnpack:
  - electron/ffmpeg/**
```

**FFmpeg Binary Bundling:**
- Binaries included in app bundle
- ASAR unpacking for executables
- Path resolution for production

---

## Development Architecture

### Documentation-First Development

**PR Documentation System:**
- Comprehensive planning before coding
- Step-by-step implementation checklists
- Bug analysis and prevention strategies
- Complete retrospective documentation

**Documentation Structure:**
```
PR_PARTY/
├── README.md                    # Documentation hub
├── PR01_PROJECT_SETUP.md        # Technical specification
├── PR01_IMPLEMENTATION_CHECKLIST.md  # Step-by-step tasks
├── PR01_README.md               # Quick start guide
├── PR01_PLANNING_SUMMARY.md     # Executive overview
├── PR01_TESTING_GUIDE.md        # Testing strategy
└── PR01_COMPLETE_SUMMARY.md     # Completion retrospective
```

### Testing Architecture

**Testing Strategy:**
- Manual testing after each phase
- Component-level testing
- Integration testing
- End-to-end workflow testing

**Quality Gates:**
- All tests passing
- No console errors
- Performance benchmarks met
- User acceptance criteria satisfied

---

## Future Architecture Considerations

### Scalability

**Potential Improvements:**
- Multi-track timeline support
- Advanced video effects
- Cloud storage integration
- Real-time collaboration

**Architecture Adaptations:**
- State management upgrade (Redux/Zustand)
- Component library standardization
- Plugin architecture for effects
- WebRTC for real-time features

### Performance Optimizations

**Potential Enhancements:**
- WebGL-based timeline rendering
- Web Workers for video processing
- Progressive video loading
- Caching strategies

---

## Conclusion

ClipForge demonstrates a well-architected desktop application built with modern web technologies. The clear separation of concerns, secure IPC communication, and comprehensive error handling create a robust foundation for video editing functionality.

The architecture successfully balances:
- **Security** (context isolation, API exposure)
- **Performance** (async processing, memory management)
- **Maintainability** (component architecture, documentation)
- **User Experience** (native dialogs, responsive UI)

This architecture provides a solid foundation for future enhancements while maintaining the simplicity and reliability required for an MVP demonstration.

---

**Architecture Documentation Complete**  
**Total Words:** ~2,500  
**Last Updated:** October 29, 2025
