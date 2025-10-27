# ClipForge - Technical Context

**Stack:** Electron + React + FFmpeg  
**Platform:** Desktop (macOS primary, Windows optional)  
**Timeline:** 72-hour MVP

---

## Technology Stack

### Desktop Framework: Electron
**Why:** Mature ecosystem, web-friendly, faster development  
**Rationale:** 72-hour constraint favors proven tools over learning curve  
**Pitfalls to Watch:**
- Main vs renderer process communication (IPC)
- Context isolation and preload scripts
- FFmpeg binary bundling
- Memory leaks with video elements

**Alternatives Considered:**
- **Tauri** - Smaller bundle, but Rust learning curve risky for time constraint

### Frontend Framework: React
**Why:** Component-based, good for complex state management  
**Dependencies:**
- `react`, `react-dom`
- `@babel/core`, `@babel/preset-react`
- `webpack`, `webpack-cli`, `webpack-dev-server`
- `babel-loader`, `css-loader`, `style-loader`

### Media Processing: fluent-ffmpeg
**Why:** Node.js wrapper for FFmpeg, well-documented API  
**Packages:**
- `fluent-ffmpeg`
- `ffmpeg-static` (pre-built binaries)
- `ffprobe-static` (metadata extraction)

**Rationale:** Handles encoding, trimming, concatenation in main process

### Video Player: HTML5 `<video>`
**Why:** Native browser support, simple API for MVP  
**Note:** Can upgrade to Video.js later if needed

### Timeline UI: Custom CSS/DOM
**Why:** Faster for simple MVP timeline  
**Alternatives:** Fabric.js or Konva.js if timeline becomes complex

### Packaging: Electron Builder
**Why:** Industry standard for Electron apps  
**Features:**
- Code signing
- Auto-updater support
- DMG/EXE generation
- Automatic FFmpeg bundling

---

## Development Setup

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm or yarn
- Git

### Installation
```bash
# Initialize project
npm init

# Install core dependencies
npm install electron react react-dom

# Install dev dependencies
npm install --save-dev electron-builder webpack webpack-cli webpack-dev-server @babel/core @babel/preset-react babel-loader css-loader style-loader

# Install FFmpeg
npm install fluent-ffmpeg ffmpeg-static ffprobe-static

# Install development tools
npm install --save-dev nodemon
```

### Project Structure
```
clipforge/
├── main.js                    # Electron main process
├── preload.js                 # IPC bridge
├── package.json
├── webpack.config.js          # Webpack configuration
├── electron-builder.yml       # Build configuration
├── .gitignore
├── README.md
│
├── src/                       # React application
│   ├── index.js              # Entry point
│   ├── App.js               # Main component
│   ├── App.css              # Global styles
│   │
│   ├── components/
│   │   ├── ImportPanel.js
│   │   ├── Timeline.js
│   │   ├── VideoPlayer.js
│   │   ├── TrimControls.js
│   │   └── ExportPanel.js
│   │
│   ├── utils/
│   │   ├── videoProcessor.js # IPC helpers
│   │   └── fileHelpers.js   # Validation
│   │
│   └── styles/
│       ├── ImportPanel.css
│       ├── Timeline.css
│       ├── VideoPlayer.css
│       ├── TrimControls.css
│       └── ExportPanel.css
│
├── public/
│   ├── index.html
│   └── icon.png
│
└── dist/                      # Build output (gitignored)
    └── ClipForge-1.0.0.dmg    # Packaged app
```

---

## Technical Constraints

### Performance Constraints
- **Large video files** - Don't load entire file into memory
- **Export time** - Must complete in reasonable time (<2x video duration)
- **Memory management** - Properly cleanup video elements

### Platform Constraints
- **macOS priority** - Develop and test on Mac first
- **Windows optional** - Build for Windows if time permits
- **Packaged app** - Must work in packaged mode, not just dev

### Browser Constraints (Electron Renderer)
- **File access** - Limited in renderer, use IPC to main process
- **Video codec support** - Depends on Electron's Chromium version
- **CORS** - No CORS issues with file:// URLs

---

## Key Dependencies

### Core Dependencies
```json
{
  "dependencies": {
    "electron": "^latest",
    "react": "^18.x",
    "react-dom": "^18.x",
    "fluent-ffmpeg": "^latest",
    "ffmpeg-static": "^latest",
    "ffprobe-static": "^latest"
  }
}
```

### Development Dependencies
```json
{
  "devDependencies": {
    "electron-builder": "^latest",
    "@babel/core": "^latest",
    "@babel/preset-react": "^latest",
    "webpack": "^5.x",
    "webpack-cli": "^latest",
    "webpack-dev-server": "^latest",
    "babel-loader": "^latest",
    "css-loader": "^latest",
    "style-loader": "^latest",
    "nodemon": "^latest"
  }
}
```

### npm Scripts
```json
{
  "scripts": {
    "start": "webpack serve & electron .",
    "dev": "webpack serve --hot",
    "build": "webpack --mode production",
    "package": "electron-builder",
    "pack:mac": "electron-builder --mac",
    "pack:win": "electron-builder --win"
  }
}
```

---

## Webpack Configuration

### Basic Setup
```javascript
module.exports = {
  entry: './src/index.js',
  target: 'electron-renderer',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: { loader: 'babel-loader' }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};
```

### Development Server
- Hot reload for React
- Connect to Electron main process
- Handle file:// protocol

---

## Electron Builder Configuration

### electron-builder.yml
```yaml
appId: com.clipforge.app
productName: ClipForge
directories:
  output: dist
files:
  - "dist/**/*"
  - "main.js"
  - "preload.js"
  - "node_modules/**/*"
mac:
  category: public.app-category.video
  target: dmg
win:
  target: nsis
```

### Key Configuration Points
- Include FFmpeg binaries in build
- Set app icon
- Configure code signing (if time permits)
- Set output directory

---

## IPC Communication Pattern

### Main Process (main.js)
```javascript
const { ipcMain } = require('electron');
const { exportVideo } = require('./electron/ffmpeg/videoProcessing');

ipcMain.handle('export-video', async (event, { inputPath, outputPath, trimStart, trimEnd }) => {
  try {
    await exportVideo(inputPath, outputPath, trimStart, trimEnd);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
```

### Preload Script (preload.js)
```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  exportVideo: (options) => ipcRenderer.invoke('export-video', options)
});
```

### Renderer Process (React)
```javascript
window.electronAPI.exportVideo({
  inputPath: '/path/to/video.mp4',
  outputPath: '/path/to/output.mp4',
  trimStart: 5.0,
  trimEnd: 30.0
});
```

---

## FFmpeg Integration

### Basic Export Function
```javascript
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const ffprobePath = require('ffprobe-static').path;

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

function exportVideo(inputPath, outputPath, trimStart, trimEnd) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .seekInput(trimStart)
      .duration(trimEnd - trimStart)
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}
```

### Video Processing Tasks
1. **Extract duration** - ffprobe for metadata
2. **Apply trim** - seekInput() + duration()
3. **Re-encode** - .output() with codec options
4. **Progress tracking** - .on('progress') events

---

## Development Workflow

### Local Development
```bash
# Terminal 1: Start webpack dev server
npm run dev

# Terminal 2: Start Electron
electron .
```

### Production Build
```bash
# Build webpack bundle
npm run build

# Package Electron app
npm run package

# Output: dist/ClipForge-1.0.0.dmg
```

### Testing Strategy
1. **Dev mode testing** - Immediate feedback
2. **Packaged app testing** - Critical on Day 2
3. **Clean machine testing** - Optional, if time permits

---

## Known Technical Challenges

### 1. FFmpeg Binary Bundling
**Challenge:** Include FFmpeg in packaged app  
**Solution:** Use ffmpeg-static, configure in electron-builder.yml  
**Test:** Export functionality in packaged app

### 2. Video File Path Handling
**Challenge:** file:// vs absolute paths  
**Solution:** Use path.resolve() in Electron, file:// in renderer  
**Test:** Import and playback

### 3. Memory Management
**Challenge:** Large video files can cause memory issues  
**Solution:** Don't load video into memory, use file paths  
**Test:** Large file import (>500MB)

### 4. IPC Security
**Challenge:** Context isolation prevents direct file access  
**Solution:** Use preload script with contextBridge  
**Test:** All file operations work in packaged app

---

## Browser Support (Electron Renderer)

### Video Codecs Supported
- MP4 (H.264 + AAC) - ✅
- MOV (H.264 + AAC) - ✅
- WebM - ⚠️ Depends on Chromium version

### Video Element Limitations
- No programmatic codec selection
- Codec support depends on Electron's Chromium version
- Large files may have performance issues

---

## Build Targets

### Production Builds
- **macOS:** DMG format
- **Windows:** EXE installer (NSIS)
- **Linux:** AppImage (optional)

### Bundle Size Targets
- Expected: ~150-200MB (due to FFmpeg + Electron)
- FFmpeg binaries: ~50MB
- Electron base: ~100MB
- App code: Minimal

---

## Current Status

**Setup:** Not started  
**Dependencies:** Not installed  
**Configuration:** Files need creation  
**Next:** PR #1 - Initialize project structure

