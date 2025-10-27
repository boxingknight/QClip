# PR#01: Implementation Checklist

**Use this as your daily todo list.** Check off items as you complete them.

**Branch:** `feat/project-setup`  
**Estimated Time:** 4 hours  
**Priority:** Critical - Day 1, Hours 1-4

---

## Pre-Implementation Setup (5 minutes)

- [ ] Open terminal in project root (`/Users/loganmay/QClip`)
- [ ] Read main planning document (`PR_PARTY/PR01_PROJECT_SETUP.md`)
- [ ] Ensure Node.js 18+ is installed
  ```bash
  node --version
  # Should show v18.x.x or higher
  ```
- [ ] Create feature branch
  ```bash
  git checkout -b feat/project-setup
  ```

---

## Phase 1: Git & npm Initialization (30 minutes)

### 1.1: Initialize Git Repository (15 minutes)

#### Initialize Git
- [ ] Run `git init`
  ```bash
  git init
  ```

#### Create .gitignore
- [ ] Create `.gitignore` file
  ```bash
  touch .gitignore
  ```

- [ ] Add ignore patterns
  ```gitignore
  # Dependencies
  node_modules/
  
  # Build outputs
  dist/
  build/
  
  # OS files
  .DS_Store
  Thumbs.db
  
  # Logs
  *.log
  npm-debug.log*
  
  # IDE
  .vscode/
  .idea/
  ```

- [ ] Commit initial files
  ```bash
  git add .gitignore
  git commit -m "chore: add .gitignore"
  ```

**Checkpoint:** Git repository initialized ✓

---

### 1.2: Initialize npm Project (15 minutes)

#### Create package.json
- [ ] Run npm init
  ```bash
  npm init -y
  ```

#### Edit package.json
- [ ] Update package.json with correct settings
  ```bash
  # Edit package.json manually or use text editor
  ```
  
  Required fields:
  ```json
  {
    "name": "clipforge",
    "version": "1.0.0",
    "description": "Desktop video editor MVP",
    "main": "main.js",
    "scripts": {
      "start": "webpack serve & electron .",
      "dev": "webpack serve",
      "build": "webpack --mode production",
      "package": "electron-builder"
    }
  }
  ```

- [ ] Save package.json

**Checkpoint:** npm project initialized ✓

**Commit:** `chore: initialize npm project`

---

## Phase 2: Install Dependencies (20 minutes)

### 2.1: Install Core Dependencies

#### Install Electron
- [ ] Run npm install
  ```bash
  npm install --save-dev electron
  ```

#### Install React
- [ ] Install React
  ```bash
  npm install react react-dom
  ```

**Checkpoint:** Core dependencies installed ✓

### 2.2: Install Build Tools

#### Install Webpack and loaders
- [ ] Install Webpack
  ```bash
  npm install --save-dev webpack webpack-cli webpack-dev-server
  ```

#### Install Babel
- [ ] Install Babel
  ```bash
  npm install --save-dev @babel/core @babel/preset-react babel-loader
  ```

#### Install CSS loaders
- [ ] Install CSS loaders
  ```bash
  npm install --save-dev css-loader style-loader
  ```

**Checkpoint:** Build tools installed ✓

### 2.3: Install FFmpeg (for future PRs)
- [ ] Install FFmpeg
  ```bash
  npm install fluent-ffmpeg ffmpeg-static ffprobe-static
  ```

**Checkpoint:** FFmpeg packages installed ✓

### 2.4: Install Electron Builder
- [ ] Install Electron Builder
  ```bash
  npm install --save-dev electron-builder
  ```

### 2.5: Install Development Tools
- [ ] Install nodemon (optional)
  ```bash
  npm install --save-dev nodemon
  ```

**Checkpoint:** All dependencies installed ✓

- [ ] Verify installation
  ```bash
  ls node_modules/ | grep electron
  ls node_modules/ | grep react
  ls node_modules/ | grep webpack
  ```

**Commit:** `chore: install dependencies`

---

## Phase 3: Build Configuration (40 minutes)

### 3.1: Create Webpack Configuration (20 minutes)

#### Create webpack.config.js
- [ ] Create file
  ```bash
  touch webpack.config.js
  ```

#### Write webpack configuration
- [ ] Add Webpack config
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
      port: 3000,
      hot: true
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

- [ ] Save file

**Checkpoint:** Webpack configuration created ✓

### 3.2: Create Electron Builder Configuration (15 minutes)

#### Create electron-builder.yml
- [ ] Create file
  ```bash
  touch electron-builder.yml
  ```

#### Write configuration
- [ ] Add Electron Builder config
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

- [ ] Save file

**Checkpoint:** Electron Builder configuration created ✓

**Commit:** `chore: configure build tools`

---

## Phase 4: Electron Setup (50 minutes)

### 4.1: Create Main Process (30 minutes)

#### Create main.js
- [ ] Create file
  ```bash
  touch main.js
  ```

#### Write main process code
- [ ] Add Electron main process
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

    // Open DevTools in development
    if (process.env.NODE_ENV === 'development') {
      mainWindow.webContents.openDevTools();
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

- [ ] Save file

**Checkpoint:** Main process created ✓

### 4.2: Create Preload Script (20 minutes)

#### Create preload.js
- [ ] Create file
  ```bash
  touch preload.js
  ```

#### Write preload code
- [ ] Add preload script
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

- [ ] Save file

**Checkpoint:** Preload script created ✓

**Commit:** `feat(pr01): create electron main process and preload script`

---

## Phase 5: React Application (40 minutes)

### 5.1: Create Directory Structure

#### Create src directory
- [ ] Create src directory
  ```bash
  mkdir -p src
  mkdir -p src/components
  mkdir -p src/utils
  mkdir -p src/styles
  ```

**Checkpoint:** Directory structure created ✓

### 5.2: Create HTML Template (10 minutes)

#### Create src/index.html
- [ ] Create file
  ```bash
  touch src/index.html
  ```

#### Write HTML
- [ ] Add HTML template
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

- [ ] Save file

**Checkpoint:** HTML template created ✓

### 5.3: Create React Entry Point (15 minutes)

#### Create src/index.js
- [ ] Create file
  ```bash
  touch src/index.js
  ```

#### Write React entry
- [ ] Add React entry code
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

- [ ] Save file

**Checkpoint:** React entry created ✓

### 5.4: Create App Component (15 minutes)

#### Create src/App.js
- [ ] Create file
  ```bash
  touch src/App.js
  ```

#### Write App component
- [ ] Add App component
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

- [ ] Save file

**Checkpoint:** App component created ✓

### 5.5: Create Styles (10 minutes)

#### Create src/App.css
- [ ] Create file
  ```bash
  touch src/App.css
  ```

#### Write CSS
- [ ] Add CSS
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

- [ ] Save file

**Checkpoint:** Styles created ✓

**Commit:** `feat(pr01): create React application`

---

## Phase 6: Testing & Verification (30 minutes)

### 6.1: Test Webpack Build

#### Start webpack dev server
- [ ] Run webpack
  ```bash
  npm run dev
  ```

- [ ] Verify webpack starts
  - [ ] See "webpack compiled successfully" message
  - [ ] Check http://localhost:3000 in browser (should see app)
  - [ ] Press Ctrl+C to stop webpack

**Checkpoint:** Webpack builds successfully ✓

### 6.2: Test Electron Launch

#### Update package.json start script
- [ ] Check package.json scripts
  ```bash
  cat package.json | grep -A5 scripts
  ```

- [ ] Update if needed (use nodemon or similar for hot reload)
  ```bash
  # In package.json, update start script:
  "start": "concurrently \"npm run dev\" \"wait-on http://localhost:3000 && electron .\""
  ```

- [ ] Install concurrently if needed
  ```bash
  npm install --save-dev concurrently wait-on
  ```

#### Start Electron
- [ ] Run start command (in separate terminal)
  ```bash
  npm start
  ```

**Checkpoint:** Electron launches without errors ✓

### 6.3: Verify Application

#### Visual verification
- [ ] Electron window opens
- [ ] Window size is 1200x800
- [ ] "ClipForge" header displays
- [ ] Welcome message shows all status checkmarks

**Checkpoint:** UI displays correctly ✓

### 6.4: Verify IPC Communication

#### Test IPC in DevTools
- [ ] Open DevTools (View → Toggle DevTools or Cmd+Option+I)
- [ ] Check console tab
- [ ] Look for "IPC test: pong" message
- [ ] In console, type: `window.electronAPI.ping()`
- [ ] Should return 'pong'

**Checkpoint:** IPC communication works ✓

### 6.5: Final Checks

#### Check for errors
- [ ] No errors in browser console
- [ ] No errors in terminal
- [ ] Window closes properly
- [ ] Can resize window
- [ ] Can quit and relaunch app

**Checkpoint:** No errors, app stable ✓

**Commit:** `test(pr01): verify application launches and IPC works`

---

## Phase 7: Documentation (30 minutes)

### 7.1: Create README (30 minutes)

#### Create README.md
- [ ] Create file
  ```bash
  touch README.md
  ```

#### Write README
- [ ] Add README content (see main specification for content)

- [ ] Save file

**Checkpoint:** README created ✓

**Commit:** `docs(pr01): add README with setup instructions`

---

## Final Verification Checklist

- [ ] All files created as specified
- [ ] All dependencies installed
- [ ] Webpack configuration working
- [ ] Electron launches successfully
- [ ] React app renders
- [ ] IPC communication works
- [ ] No console errors
- [ ] README complete
- [ ] Git repository committed

**Commit:** `feat(pr01): project setup complete`

---

## Post-Implementation

- [ ] Push branch to remote
  ```bash
  git push -u origin feat/project-setup
  ```

- [ ] Update PR_PARTY/README.md with PR #1 status
- [ ] Update memory-bank/activeContext.md
- [ ] Update memory-bank/progress.md

**PR #1 Complete! Ready for PR #2: File Import**

