# PR#01: Testing Guide

**PR:** #01 - Project Setup & Boilerplate  
**Testing Time:** ~30 minutes  
**Test Category:** Setup Verification

---

## Test Categories

### 1. Setup Tests (Infrastructure)
**Purpose:** Verify project structure and dependencies

#### Test 1.1: Git Repository
```bash
# Run
git status

# Expected Result
On branch feat/project-setup
nothing to commit, working tree clean

# Verification
- [ ] Git repository exists
- [ ] .gitignore file exists
- [ ] .gitignore excludes node_modules/, dist/
```

#### Test 1.2: npm Project
```bash
# Run
cat package.json

# Expected Result
{
  "name": "clipforge",
  "version": "1.0.0",
  "main": "main.js",
  ...
}

# Verification
- [ ] package.json exists
- [ ] name is "clipforge"
- [ ] main is "main.js"
- [ ] scripts section exists
```

#### Test 1.3: Dependencies Installed
```bash
# Run
ls node_modules/ | grep electron
ls node_modules/ | grep react
ls node_modules/ | grep webpack

# Expected Result
electron, react, webpack directories exist

# Verification
- [ ] electron installed
- [ ] react installed
- [ ] react-dom installed
- [ ] webpack installed
- [ ] webpack-dev-server installed
- [ ] babel packages installed
- [ ] css-loaders installed
- [ ] electron-builder installed
- [ ] fluent-ffmpeg installed
- [ ] ffmpeg-static installed
```

---

### 2. Build System Tests
**Purpose:** Verify Webpack and build configuration

#### Test 2.1: Webpack Configuration
```bash
# Run
cat webpack.config.js

# Expected Result
Contains entry: './src/index.js'
Contains target: 'electron-renderer'
Contains output configuration

# Verification
- [ ] webpack.config.js exists
- [ ] Entry point is './src/index.js'
- [ ] Target is 'electron-renderer'
- [ ] CSS loader configured
- [ ] Babel loader configured
```

#### Test 2.2: Webpack Dev Server
```bash
# Run
npm run dev

# Expected Result
Webpack Dev Server running at http://localhost:3000

# Verification (Terminal)
- [ ] Dev server starts without errors
- [ ] Shows "webpack compiled successfully"
- [ ] Running on port 3000

# Verification (Browser)
- [ ] Navigate to http://localhost:3000
- [ ] See "Welcome to ClipForge" or React app loads
- [ ] No console errors
```

---

### 3. Electron Tests
**Purpose:** Verify Electron application setup

#### Test 3.1: Main Process File
```bash
# Run
cat main.js

# Expected Result
Contains createWindow() function
Contains BrowserWindow configuration
Loads preload.js
Has app.on('ready') handler

# Verification
- [ ] main.js exists
- [ ] BrowserWindow created with correct size (1200x800)
- [ ] Preload script path configured
- [ ] contextIsolation: true
- [ ] nodeIntegration: false
```

#### Test 3.2: Preload Script
```bash
# Run
cat preload.js

# Expected Result
Uses contextBridge
Exposes window.electronAPI
Contains ping() function

# Verification
- [ ] preload.js exists
- [ ] Uses contextBridge (security best practice)
- [ ] Exposes window.electronAPI
- [ ] Contains test function: ping()
```

#### Test 3.3: Electron Launch
```bash
# Run (Terminal 2)
npm start

# Expected Result
Electron window opens
Shows React application

# Verification
- [ ] Window opens without errors
- [ ] Window size is 1200x800
- [ ] Can resize window
- [ ] Can close window
- [ ] Can quit and relaunch
```

---

### 4. React Application Tests
**Purpose:** Verify React setup and rendering

#### Test 4.1: Source Files
```bash
# Run
ls src/
cat src/index.js
cat src/App.js

# Expected Result
src/ directory exists
index.js contains ReactDOM.createRoot
App.js contains React component
App.css exists
index.html exists

# Verification
- [ ] src/ directory exists
- [ ] src/index.js exists and imports React
- [ ] src/App.js exists and exports component
- [ ] src/App.css exists
- [ ] src/index.html exists
```

#### Test 4.2: React Rendering
```bash
# Run Electron app
npm start

# Expected Result (Visual)
# - Header shows "ClipForge"
# - Subtitle shows "Desktop Video Editor MVP"
# - Welcome message displays
# - Status items show green checkmarks

# Verification
- [ ] "ClipForge" header displays
- [ ] Subtitle displays
- [ ] "Welcome to ClipForge" message shows
- [ ] Status items show checkmarks (✓)
- [ ] Styling looks correct
```

---

### 5. IPC Communication Tests
**Purpose:** Verify inter-process communication

#### Test 5.1: IPC Setup
```bash
# Run Electron app
npm start

# In DevTools Console, run:
window.electronAPI

# Expected Result
Object with ping function

# Verification
- [ ] window.electronAPI exists
- [ ] window.electronAPI.ping is a function
- [ ] No "undefined" errors
```

#### Test 5.2: IPC Test Function
```bash
# In DevTools Console, run:
window.electronAPI.ping()

# Expected Result
"pong"

# Verification
- [ ] Returns 'pong'
- [ ] No errors thrown
- [ ] Communication works both ways
```

#### Test 5.3: Console Test
```bash
# Open DevTools (Cmd+Option+I or View → Toggle DevTools)

# Check Console tab
# Look for:
"IPC test: pong"

# Verification
- [ ] See "IPC test: pong" in console on app load
- [ ] Message appears automatically (from App.js useEffect)
```

---

### 6. Edge Cases & Error Handling
**Purpose:** Verify app stability

#### Test 6.1: Multiple Launches
```bash
# Action
Launch app, close it, launch again

# Verification
- [ ] Can launch multiple times
- [ ] No duplicate windows
- [ ] Each launch is clean
```

#### Test 6.2: Window Resize
```bash
# Action
Launch app, resize window to various sizes

# Verification
- [ ] Can resize window
- [ ] Content displays correctly at different sizes
- [ ] No layout breakage
- [ ] Min size enforced (800x600)
```

#### Test 6.3: Quit and Relaunch
```bash
# Action
Launch app → Quit app → Launch app again

# Verification
- [ ] Can quit properly
- [ ] Can relaunch successfully
- [ ] State is fresh each time
```

#### Test 6.4: Missing Files
```bash
# Action
Delete src/App.js temporarily, try to launch

# Expected Result
Build error or graceful error message

# Verification
- [ ] Error is informative
- [ ] Easy to diagnose
- [ ] Points to missing file
```

---

## Acceptance Criteria

**PR #1 is complete when:**

### Infrastructure ✅
- [ ] Git repository initialized
- [ ] .gitignore configured correctly
- [ ] npm project created
- [ ] package.json has correct name and scripts
- [ ] All dependencies installed

### Build System ✅
- [ ] Webpack configuration exists
- [ ] Can run `npm run dev` successfully
- [ ] Dev server starts on localhost:3000
- [ ] No build errors

### Electron Setup ✅
- [ ] main.js created with BrowserWindow
- [ ] preload.js created with contextBridge
- [ ] App launches with `npm start`
- [ ] Window size is 1200x800
- [ ] contextIsolation enabled
- [ ] nodeIntegration disabled

### React Application ✅
- [ ] src/ directory structure exists
- [ ] src/index.js exists and imports React
- [ ] src/App.js exists and exports component
- [ ] src/App.css exists with styles
- [ ] src/index.html exists
- [ ] App renders "Welcome to ClipForge"

### IPC Communication ✅
- [ ] window.electronAPI exists in renderer
- [ ] ping() function returns 'pong'
- [ ] Console shows "IPC test: pong" on load
- [ ] No IPC errors

### Documentation ✅
- [ ] README.md exists
- [ ] README contains setup instructions
- [ ] README contains development commands
- [ ] README contains project structure

### Quality Gates ✅
- [ ] Zero console errors
- [ ] Zero build warnings
- [ ] App launches in <5 seconds
- [ ] No memory leaks
- [ ] Follows Electron best practices

---

## Performance Targets

### Launch Time
**Target:** <5 seconds  
**Test:** Time from `npm start` to window visible  
**Measurement:** Manual observation

### Build Time
**Target:** <30 seconds  
**Test:** `npm run dev` time to "compiled successfully"  
**Measurement:** Terminal output

### Memory Usage
**Target:** <200 MB (just for setup)  
**Test:** Activity Monitor / Task Manager  
**Measurement:** Process memory usage

---

## Test Execution Log

**Date:** _[Fill in after testing]_  
**Tester:** _[Fill in your name]_  
**PR:** #01 - Project Setup

### Results
- [ ] Test 1.1: Git Repository - PASS/FAIL
- [ ] Test 1.2: npm Project - PASS/FAIL
- [ ] Test 1.3: Dependencies - PASS/FAIL
- [ ] Test 2.1: Webpack Config - PASS/FAIL
- [ ] Test 2.2: Webpack Dev Server - PASS/FAIL
- [ ] Test 3.1: Main Process - PASS/FAIL
- [ ] Test 3.2: Preload Script - PASS/FAIL
- [ ] Test 3.3: Electron Launch - PASS/FAIL
- [ ] Test 4.1: Source Files - PASS/FAIL
- [ ] Test 4.2: React Rendering - PASS/FAIL
- [ ] Test 5.1: IPC Setup - PASS/FAIL
- [ ] Test 5.2: IPC Test Function - PASS/FAIL
- [ ] Test 5.3: Console Test - PASS/FAIL
- [ ] Test 6.1: Multiple Launches - PASS/FAIL
- [ ] Test 6.2: Window Resize - PASS/FAIL
- [ ] Test 6.3: Quit and Relaunch - PASS/FAIL
- [ ] Test 6.4: Missing Files - PASS/FAIL

**Overall Status:** PASS/FAIL  
**Notes:** _[Any issues or observations]_

---

## Next Steps After Testing

### If All Tests Pass ✅
1. Update PR_PARTY/README.md with PR#1 status
2. Commit final changes
3. Update memory-bank files
4. Proceed to PR #2: File Import

### If Tests Fail ❌
1. Identify failing tests
2. Check Common Issues in Quick Start Guide
3. Review implementation checklist
4. Fix issues
5. Re-test
6. Update test log

---

**Test Thoroughly, Ship Confidently!** 🚀

