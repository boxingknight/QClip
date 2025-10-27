# PR#01: Project Setup & Boilerplate

**Estimated Time:** 4 hours  
**Complexity:** LOW  
**Priority:** Critical - Day 1, Hours 1-4  
**Dependencies:** None (Foundation PR)  
**Branch:** `feat/project-setup`

---

## Overview

### What We're Building
Initialize the ClipForge desktop video editor project with Electron, React, and FFmpeg integration. This PR establishes the foundation by setting up the development environment, project structure, and basic application scaffolding that will support all future features.

### Why It Matters
This is the foundation of our entire project. Without proper setup, no other features can be developed. Getting this right ensures smooth development for the remaining 71 hours. Critical infrastructure decisions made here (project structure, bundling, IPC setup) affect every subsequent PR.

### Success in One Sentence
"PR#01 is successful when we can run `npm start` and launch a native Electron window displaying a React app with no errors."

---

## Technical Design

### Architecture Decisions

#### Decision 1: Electron + React Stack
**Options Considered:**
1. **Tauri + React** - Smaller bundle (~10MB), but requires Rust knowledge, steeper learning curve, less mature ecosystem for video processing
2. **Electron + Vue** - Similar to our choice but with Vue instead of React
3. **Electron + React** - Mature ecosystem, large community, proven FFmpeg integration, faster to market

**Chosen:** Option 3 - Electron + React

**Rationale:**
- 72-hour constraint favors proven tools over learning curves
- Electron has mature FFmpeg integration examples
- React is widely understood and component-based approach fits video editor UI
- Large community means we can find solutions quickly if stuck
- Can evaluate Tauri for V2 if time/bundle size becomes concern

**Trade-offs:**
- **Gain:** Faster development, proven stack, better documentation
- **Lose:** Larger bundle size (~150MB), higher memory usage (acceptable for desktop)

#### Decision 2: Webpack for Bundling
**Options Considered:**
1. **Vite** - Faster HMR, modern, simpler config
2. **Webpack** - Mature, stable, proven with Electron, extensive documentation
3. **Rollup** - Smaller bundles but complex for Electron apps

**Chosen:** Webpack

**Rationale:**
- Most Electron projects use Webpack (proven compatibility)
- Extensive documentation and examples for Electron + Webpack
- Stability over speed for initial setup
- Can migrate to Vite later if needed

**Trade-offs:**
- **Gain:** Proven compatibility with Electron, extensive documentation
- **Lose:** Slightly slower HMR than Vite (acceptable for MVP)

#### Decision 3: Project Structure
**Options Considered:**
1. **Monorepo** - Separate packages for electron and renderer
2. **Single repo with folders** - Electron code at root, React in src/

**Chosen:** Single repo with folders

**Rationale:**
- Simpler for 72-hour MVP
- Faster to navigate and understand
- Standard Electron project structure
- Fewer build configuration files

**Trade-offs:**
- **Gain:** Simplicity, faster development
- **Lose:** Some modularity (acceptable for MVP)

### Project Structure

```
clipforge/
├── .gitignore                    # Git ignore patterns
├── package.json                  # npm configuration, dependencies
├── package-lock.json             # Dependency lock file
├── webpack.config.js             # Webpack bundling configuration
├── electron-builder.yml          # Build/packaging configuration
├── README.md                     # Project documentation
│
├── main.js                       # Electron main process
├── preload.js                    # IPC bridge (preload script)
│
├── src/                          # React application (renderer)
│   ├── index.js                  # React entry point
│   ├── App.js                    # Main app component
│   ├── App.css                   # Global styles
│   ├── index.html                # HTML template
│   │
│   ├── components/               # React components (empty for now)
│   │
│   ├── utils/                    # Utility functions (empty for now)
│   │
│   └── styles/                   # Component styles (empty for now)
│
└── public/                        # Static assets
    └── icon.png                  # App icon (future)
```

### IPC Architecture

**Pattern:** Secure IPC with contextBridge

**Main Process (main.js):**
```javascript
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadURL('file://' + __dirname + '/src/index.html');
}

app.on('ready', createWindow);
```

**Preload Script (preload.js):**
```javascript
const { contextBridge } = require('electron');

// Expose protected methods that allow the renderer process
// to use the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Placeholder for future IPC methods
  // Will add import, export, file operations in later PRs
});
```

**Renderer (React) - Future:**
```javascript
// Will use window.electronAPI for IPC communication
// Example: await window.electronAPI.openFileDialog()
```

### Build Configuration

**Webpack (webpack.config.js):**
```javascript
const path = require('path');

module.exports = {
  entry: './src/index.js',
  target: 'electron-renderer',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
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
  resolve: {
    extensions: ['.js', '.jsx']
  }
};
```

**Electron Builder (electron-builder.yml):**
```yaml
appId: com.clipforge.app
productName: ClipForge
files:
  - dist/**/*
  - main.js
  - preload.js
  - package.json
extraFiles:
  - from: "src/index.html"
    to: "index.html"
```

---

## Implementation Details

### File Structure

**New Files:**
```
.gitignore (new)                          # ~20 lines
package.json (new)                        # ~50 lines
webpack.config.js (new)                   # ~30 lines
electron-builder.yml (new)                # ~20 lines
main.js (new)                             # ~50 lines
preload.js (new)                          # ~30 lines
src/index.js (new)                        # ~20 lines
src/App.js (new)                          # ~30 lines
src/App.css (new)                         # ~50 lines
src/index.html (new)                      # ~30 lines
README.md (new)                           # ~100 lines
```

**Total New Files:** 10 files (~420 lines)

### Key Implementation Steps

#### Step 1: Initialize Git Repository (15 minutes)
```bash
git init
echo "node_modules/" >> .gitignore
echo "dist/" >> .gitignore
echo ".DS_Store" >> .gitignore
echo "*.log" >> .gitignore
git add .gitignore
git commit -m "chore: initialize repository"
```

**Verification:** Git repo exists, .gitignore created

#### Step 2: Initialize npm Project (15 minutes)
```bash
npm init -y
```

**Edit package.json:**
```json
{
  "name": "clipforge",
  "version": "1.0.0",
  "description": "Desktop video editor MVP",
  "main": "main.js",
  "scripts": {
    "start": "webpack serve && electron .",
    "dev": "webpack serve",
    "build": "webpack --mode production",
    "package": "electron-builder"
  }
}
```

**Verification:** package.json exists with correct name and scripts

#### Step 3: Install Dependencies (20 minutes)
```bash
# Core dependencies
npm install electron

# React
npm install react react-dom

# Build tools
npm install --save-dev webpack webpack-cli webpack-dev-server
npm install --save-dev @babel/core @babel/preset-react babel-loader
npm install --save-dev css-loader style-loader

# FFmpeg (for future PRs)
npm install fluent-ffmpeg ffmpeg-static ffprobe-static

# Packaging
npm install --save-dev electron-builder

# Development
npm install --save-dev nodemon
```

**Verification:** All packages install without errors, node_modules/ directory created

#### Step 4: Create Webpack Configuration (20 minutes)
**File:** `webpack.config.js`
```javascript
const path = require('path');

module.exports = {
  entry: './src/index.js',
  target: 'electron-renderer',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  devServer: {
    static: path.resolve(__dirname, 'dist'),
    port: 3000
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  }
};
```

**Verification:** Webpack config created, correct entry and output paths

#### Step 5: Create Electron Main Process (30 minutes)
**File:** `main.js`
```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load from webpack dev server in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile('src/index.html');
  }
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
```

**Verification:** Main process created with proper window configuration

#### Step 6: Create Preload Script (20 minutes)
**File:** `preload.js`
```javascript
const { contextBridge } = require('electron');

// Expose protected methods that allow the renderer process
// to use ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // IPC methods will be added in future PRs
  // For now, just verify communication works
  ping: () => 'pong'
});
```

**Verification:** Preload script created with contextBridge pattern

#### Step 7: Create React Entry Point (20 minutes)
**File:** `src/index.js`
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**File:** `src/App.js`
```javascript
import React from 'react';
import './App.css';

function App() {
  // Test IPC communication
  const testIPC = () => {
    if (window.electronAPI) {
      const result = window.electronAPI.ping();
      console.log('IPC test:', result);
    }
  };

  React.useEffect(() => {
    testIPC();
  }, []);

  return (
    <div className="app">
      <div className="header">
        <h1>ClipForge</h1>
        <p className="subtitle">Desktop Video Editor MVP</p>
      </div>
      <div className="main-content">
        <div className="welcome">
          <h2>Welcome to ClipForge</h2>
          <p>Your desktop video editor is ready!</p>
          <p className="status">✅ Project setup complete</p>
          <p className="status">✅ Electron main process running</p>
          <p className="status">✅ React renderer loaded</p>
          <p className="status">✅ IPC communication active</p>
        </div>
      </div>
    </div>
  );
}

export default App;
```

**File:** `src/App.css`
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: #f5f5f5;
  color: #333;
}

.app {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: #2c3e50;
  color: white;
  padding: 20px;
  text-align: center;
}

.header h1 {
  font-size: 32px;
  margin-bottom: 5px;
}

.subtitle {
  font-size: 14px;
  opacity: 0.8;
}

.main-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.welcome {
  background: white;
  border-radius: 8px;
  padding: 40px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  max-width: 500px;
  text-align: center;
}

.welcome h2 {
  margin-bottom: 20px;
  color: #2c3e50;
}

.welcome p {
  margin: 10px 0;
  color: #666;
}

.status {
  color: #27ae60;
  font-weight: 500;
}

.status::before {
  content: "✓ ";
  margin-right: 5px;
}
```

**File:** `src/index.html`
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ClipForge</title>
</head>
<body>
  <div id="root"></div>
  <script src="/bundle.js"></script>
</body>
</html>
```

**Verification:** React app renders, no console errors

#### Step 8: Configure Electron Builder (15 minutes)
**File:** `electron-builder.yml`
```yaml
appId: com.clipforge.app
productName: ClipForge
directories:
  output: dist
files:
  - dist/bundle.js
  - src/index.html
  - main.js
  - preload.js
  - package.json
mac:
  category: public.app-category.video
  target: dmg
win:
  target: nsis
```

**Verification:** electron-builder.yml created with correct configuration

#### Step 9: Create README (30 minutes)
**File:** `README.md`
```markdown
# ClipForge - Desktop Video Editor MVP

A simple desktop video editor for quick clip trimming and export.

## Features (MVP)
- Import video files (MP4, MOV)
- Preview videos
- Timeline visualization
- Trim clips (set in/out points)
- Export to MP4

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
\`\`\`bash
npm install
\`\`\`

### Development
\`\`\`bash
# Terminal 1: Start webpack dev server
npm run dev

# Terminal 2: Start Electron
npm start
\`\`\`

### Build
\`\`\`bash
npm run build
npm run package
\`\`\`

## Project Structure
- \`main.js\` - Electron main process
- \`preload.js\` - IPC bridge
- \`src/\` - React application
- \`src/components/\` - UI components (to be added)

## Technologies
- Electron (desktop framework)
- React (UI framework)
- FFmpeg (video processing)
- Webpack (bundling)

## Timeline
- MVP Development: Oct 27-29, 2025
- Deadline: Oct 29, 10:59 PM CT
```

**Verification:** README contains setup instructions

#### Step 10: Test Setup (30 minutes)
**Commands:**
```bash
# Test webpack build
npm run dev
# Expected: Dev server starts on localhost:3000

# Test Electron launch (in new terminal)
npm start
# Expected: Electron window opens, shows React app

# Test IPC communication
# Check browser console for "IPC test: pong"
```

**Verification:** App launches successfully, all status messages display

---

## Testing Strategy

### Test Categories

#### Unit Tests: None for MVP
**Rationale:** No business logic in setup PR, save time for core features

#### Integration Tests: Manual Verification
**Test 1: Git Repository**
- [ ] Repository initialized
- [ ] .gitignore excludes node_modules, dist
- [ ] Can commit files

**Test 2: npm Project**
- [ ] package.json exists with correct name
- [ ] All dependencies installed
- [ ] node_modules/ directory created

**Test 3: Build System**
- [ ] `npm run dev` starts webpack dev server
- [ ] No webpack errors
- [ ] bundle.js generated in dist/

**Test 4: Electron Launch**
- [ ] `npm start` opens Electron window
- [ ] Window size: 1200x800
- [ ] No console errors

**Test 5: React Rendering**
- [ ] "ClipForge" header displays
- [ ] Status messages display (✓ indicators)
- [ ] No React errors in console

**Test 6: IPC Communication**
- [ ] Open DevTools console
- [ ] See "IPC test: pong" message
- [ ] window.electronAPI.ping() returns 'pong'

#### Edge Cases
- **Test:** Launch twice (should handle gracefully)
- **Test:** Close window and reopen (should work)
- **Test:** Resize window (should resize properly)
- **Test:** Quit and relaunch app (should work)

### Acceptance Criteria
- [ ] Can clone repo and run `npm install && npm start`
- [ ] Electron window opens without errors
- [ ] React app renders "Welcome to ClipForge" message
- [ ] IPC communication works (console shows "pong")
- [ ] No console errors or warnings
- [ ] Project structure follows plan
- [ ] All files created as specified

---

## Success Criteria

**Feature is complete when:**
- [ ] Git repository initialized
- [ ] npm project configured
- [ ] All dependencies installed
- [ ] Webpack configuration working
- [ ] Electron main process created
- [ ] Preload script created
- [ ] React app renders successfully
- [ ] Electron window opens without errors
- [ ] IPC communication verified
- [ ] README documentation complete
- [ ] Can run `npm start` and see working app

**Code Quality:**
- No console errors
- No build warnings
- Files properly structured
- Follows Electron best practices (context isolation)

---

## Risk Assessment

### Risk 1: Webpack + Electron Configuration Issues
**Likelihood:** MEDIUM  
**Impact:** HIGH  
**Mitigation:** 
- Follow standard Electron + Webpack example
- Test immediately when setup complete
- Have fallback config ready

### Risk 2: Dependency Conflicts
**Likelihood:** LOW  
**Impact:** MEDIUM  
**Mitigation:**
- Use latest stable versions
- Start fresh npm install if issues

### Risk 3: IPC Not Working
**Likelihood:** LOW  
**Impact:** HIGH  
**Mitigation:**
- Test IPC in this PR (verify "pong")
- Follow context isolation best practices
- Document IPC pattern for future PRs

### Risk 4: Time Overrun
**Likelihood:** LOW  
**Impact:** MEDIUM  
**Mitigation:**
- Focus on getting app to launch (can polish later)
- Skip unit tests for this PR
- Move documentation to next PR if needed

**Overall Risk:** 🟡 LOW-MEDIUM

---

## Timeline

**Total Estimate:** 4 hours

| Step | Task | Time | Status |
|------|------|------|--------|
| 1 | Git initialization | 15 min | ⏳ |
| 2 | npm project setup | 15 min | ⏳ |
| 3 | Install dependencies | 20 min | ⏳ |
| 4 | Webpack config | 20 min | ⏳ |
| 5 | Electron main process | 30 min | ⏳ |
| 6 | Preload script | 20 min | ⏳ |
| 7 | React app | 20 min | ⏳ |
| 8 | Electron Builder | 15 min | ⏳ |
| 9 | README | 30 min | ⏳ |
| 10 | Testing | 30 min | ⏳ |
| **Total** | | **4h** | ⏳ |

**Buffer:** 1 hour included in estimate for troubleshooting

---

## Dependencies

**Requires:**
- None (Foundation PR)

**Blocks:**
- PR #2: File Import (requires setup)
- PR #3: Video Player (requires setup)
- PR #4: FFmpeg Export (requires setup)
- All subsequent PRs

---

## Notes

### Development Commands
```bash
# Start development (run in two terminals)
npm run dev        # Terminal 1: Start webpack
npm start          # Terminal 2: Start Electron

# Build for production
npm run build      # Build webpack bundle
npm run package    # Package Electron app
```

### Key Files to Create
1. `.gitignore` - Ignore node_modules, dist
2. `package.json` - Project configuration
3. `webpack.config.js` - Webpack bundling
4. `electron-builder.yml` - Packaging config
5. `main.js` - Electron main process
6. `preload.js` - IPC bridge
7. `src/index.js` - React entry
8. `src/App.js` - Main component
9. `src/App.css` - Styles
10. `src/index.html` - HTML template
11. `README.md` - Documentation

### IPC Pattern Established
This PR establishes the IPC pattern that will be used throughout the project:
- **Main Process:** Handles file operations, FFmpeg
- **Preload Script:** Secure IPC bridge
- **Renderer (React):** Uses `window.electronAPI`

Future PRs will extend `window.electronAPI` with:
- `openFileDialog()`
- `exportVideo(options)`
- `getVideoMetadata(path)`

---

## Next Steps

After PR #1 completion:
1. Verify all tests pass
2. Commit with message: `feat(pr01): initialize project setup`
3. Update PR_PARTY/README.md with status
4. Start PR #2: File Import
5. Update memory-bank/activeContext.md
6. Update memory-bank/progress.md

---

**Status:** 📋 READY TO START  
**Estimated Start:** Oct 27, 2025  
**Estimated Complete:** Oct 27, 2025 (4 hours later)

