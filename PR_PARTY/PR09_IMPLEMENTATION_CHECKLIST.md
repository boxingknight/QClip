# PR#9: Implementation Checklist

**Use this as your daily todo list.** Check off items as you complete them.

---

## Pre-Implementation Setup (15 minutes)

- [ ] Read PR#9 main specification (~30 min)
- [ ] Verify PRs #1-8 are complete
  - PR #1: Project Setup ✅
  - PR #2: File Import ✅
  - PR #3: Video Player ✅
  - PR #4: FFmpeg Export ✅
  - PR #5: Timeline ✅
  - PR #6: Trim Controls ✅
  - PR #7: UI Polish ✅ (recommended)
  - PR #8: Error Handling ✅ (recommended)
- [ ] Create git branch
  ```bash
  git checkout -b feat/packaging
  ```

---

## Phase 1: Configuration (1 hour)

### 1.1: Configure electron-builder.yml (20 minutes)

#### Create/Update Configuration File
- [ ] Open or create `electron-builder.yml`
- [ ] Set app ID: `com.clipforge.app`
- [ ] Set product name: `ClipForge`
- [ ] Configure macOS target
  ```yaml
  appId: com.clipforge.app
  productName: ClipForge
  
  mac:
    target:
      - dmg
    icon: public/icon.png
    category: public.app-category.utilities
  ```

#### Configure Files to Include
- [ ] Add build output files
  ```yaml
  files:
    - "dist/**/*"
    - "main.js"
    - "preload.js"
    - "electron/**/*"
    - "!electron/ffmpeg/videoProcessing.js.map"
  ```

#### Configure Extra Resources (FFmpeg)
- [ ] Add FFmpeg binaries to extraResources
  ```yaml
  extraResources:
    - from: "node_modules/ffmpeg-static/ffmpeg"
      to: "ffmpeg"
    - from: "node_modules/ffprobe-static/ffprobe"
      to: "ffprobe"
  ```

#### Configure DMG Layout
- [ ] Set DMG window layout
  ```yaml
  dmg:
    contents:
      - x: 110
        y: 150
      - x: 240
        y: 150
        type: link
        path: /Applications
  ```

**Checkpoint:** Configuration file complete ✓

**Commit:** `feat(packaging): configure electron-builder for macOS DMG`

---

### 1.2: Update package.json (15 minutes)

#### Add Build Scripts
- [ ] Add build script
  ```json
  "scripts": {
    "build:app": "webpack --mode production",
    "package": "electron-builder",
    "package:mac": "electron-builder --mac",
    "dist": "npm run build:app && npm run package"
  }
  ```

#### Add App Metadata
- [ ] Set app metadata
  ```json
  "name": "clipforge",
  "version": "1.0.0",
  "description": "Simple desktop video editor for quick trims",
  "author": "Your Name",
  "license": "MIT",
  "main": "main.js",
  "homepage": "https://github.com/yourusername/clipforge"
  ```

#### Configure Electron Builder
- [ ] Add electronBuilder configuration
  ```json
  "build": {
    "appId": "com.clipforge.app"
  }
  ```

**Checkpoint:** package.json configured ✓

**Commit:** `feat(packaging): add build scripts and metadata to package.json`

---

### 1.3: Test Configuration (15 minutes)

#### Verify electron-builder.yml
- [ ] Check file exists
- [ ] Verify YAML syntax is valid
- [ ] Review configuration values

#### Test Build Command
- [ ] Run build test (should fail gracefully, not error)
  ```bash
  npm run package
  # Will fail without webpack build, this is OK
  ```

**Checkpoint:** Configuration syntax valid ✓

---

## Phase 2: Path Resolution (30 minutes)

### 2.1: Update main.js for Production Paths (20 minutes)

#### Add Production Path Detection
- [ ] Import required modules
  ```javascript
  const path = require('path');
  const fs = require('fs');
  const { app } = require('electron');
  ```

#### Add Environment Detection
- [ ] Detect dev vs production
  ```javascript
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  
  function getFFmpegPaths() {
    if (isDev) {
      // Development paths
      const ffmpegPath = path.join(__dirname, 'node_modules', 'ffmpeg-static', 'ffmpeg');
      const ffprobePath = path.join(__dirname, 'node_modules', 'ffprobe-static', 'ffprobe');
      return { ffmpegPath, ffprobePath };
    } else {
      // Production paths
      const resourcesPath = process.resourcesPath;
      const ffmpegPath = path.join(resourcesPath, 'ffmpeg');
      const ffprobePath = path.join(resourcesPath, 'ffprobe');
      return { ffmpegPath, ffprobePath };
    }
  }
  ```

#### Test Path Resolution
- [ ] Add console log to verify paths
  ```javascript
  const paths = getFFmpegPaths();
  console.log('FFmpeg paths:', paths);
  ```

**Checkpoint:** Path detection working in dev ✓

**Commit:** `feat(packaging): add production path detection in main.js`

---

### 2.2: Update videoProcessing.js (10 minutes)

#### Update FFmpeg Path Resolution
- [ ] Modify getFFmpegPaths function
  ```javascript
  const ffmpeg = require('fluent-ffmpeg');
  const path = require('path');
  const { app } = require('electron');
  
  function getFFmpegPaths() {
    // Detect environment
    const isDev = !app || !app.isPackaged;
    
    if (isDev) {
      // Development: use node_modules
      const ffmpegStatic = require('ffmpeg-static');
      const ffprobeStatic = require('ffprobe-static');
      return {
        ffmpeg: ffmpegStatic,
        ffprobe: ffprobeStatic.path
      };
    } else {
      // Production: use bundled binaries
      const resourcesPath = process.resourcesPath;
      return {
        ffmpeg: path.join(resourcesPath, 'ffmpeg'),
        ffprobe: path.join(resourcesPath, 'ffprobe')
      };
    }
  }
  ```

#### Update Export Function
- [ ] Use getFFmpegPaths in export function
  ```javascript
  function exportVideo(inputPath, outputPath, options = {}) {
    const paths = getFFmpegPaths();
    
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .setFfmpegPath(paths.ffmpeg)
        .setFfprobePath(paths.ffprobe)
        .output(outputPath)
        .on('end', () => resolve(outputPath))
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          console.error('FFmpeg path:', paths.ffmpeg);
          console.error('FFprobe path:', paths.ffprobe);
          reject(err);
        })
        .run();
    });
  }
  ```

**Checkpoint:** VideoProcessing updated for production ✓

**Commit:** `feat(packaging): update FFmpeg path resolution for production`

---

## Phase 3: Build & Test (1 hour)

### 3.1: Build Packaged App (30 minutes)

#### Build Webpack Bundle
- [ ] Run webpack build
  ```bash
  npm run build:app
  # or
  webpack --mode production
  ```

#### Verify Build Output
- [ ] Check dist/ folder exists
- [ ] Verify bundle.js is created
- [ ] Verify index.html is in dist/
- [ ] Check file sizes (should be reasonable)

#### Run electron-builder
- [ ] Run package command
  ```bash
  npm run package
  ```
- [ ] Wait for build to complete (~2-3 minutes)
- [ ] Watch for errors in console

#### Verify Output
- [ ] Check dist/ folder for DMG file
- [ ] Verify DMG file size (<200MB)
- [ ] Check file name: `ClipForge-1.0.0.dmg`

**Checkpoint:** DMG file created successfully ✓

**Commit:** `feat(packaging): build macOS DMG installer`

---

### 3.2: Test Packaged App (30 minutes)

#### Install App
- [ ] Open DMG file
- [ ] Verify DMG displays correctly
- [ ] Drag ClipForge to Applications folder
- [ ] Wait for copy to complete

#### Launch App
- [ ] Navigate to Applications folder
- [ ] Double-click ClipForge app
- [ ] Handle Gatekeeper warning if it appears:
  - Right-click app → Open (first time)
  - Click "Open" when prompted

#### Test App Launch
- [ ] App window opens
- [ ] No console errors visible
- [ ] UI renders correctly
- [ ] Check for "FFmpeg path not found" errors

**Checkpoint:** App launches from Applications ✓

---

### 3.3: Feature Testing in Packaged App

#### Test Import Feature
- [ ] Click Browse Files button
- [ ] Select a video file (MP4 or MOV)
- [ ] Verify file imports successfully
- [ ] Check imported clip appears in list

#### Test Video Player
- [ ] Click to select imported clip
- [ ] Verify video plays in player
- [ ] Test play/pause functionality
- [ ] Verify audio works
- [ ] Check time display updates

#### Test Trim Controls
- [ ] Set in-point during playback
- [ ] Set out-point during playback
- [ ] Verify trim indicators appear
- [ ] Check trim times display correctly

#### Test Export Feature (CRITICAL)
- [ ] Click Export button
- [ ] Choose save location
- [ ] Verify export progress bar appears
- [ ] Wait for export to complete
- [ ] Check export completes without errors
- [ ] Open exported file in VLC/QuickTime
- [ ] Verify exported video plays correctly
- [ ] Verify exported video is trimmed correctly

**Checkpoint:** All features work in packaged app ✓

---

## Phase 4: Fixes & Documentation (30 minutes)

### 4.1: Fix Packaging Issues (If Any) (20 minutes)

#### Common Issues to Check
- [ ] FFmpeg binary not found
  - **Symptom:** Export fails, error about FFmpeg
  - **Fix:** Check extraResources paths in electron-builder.yml
  - **Fix:** Verify binary exists in node_modules/
  - **Fix:** Check path resolution in videoProcessing.js

- [ ] Missing files error
  - **Symptom:** Build fails with "file not found"
  - **Fix:** Check files array in electron-builder.yml
  - **Fix:** Verify dist/ folder has all files

- [ ] App won't launch
  - **Symptom:** App crashes immediately
  - **Fix:** Check console logs for errors
  - **Fix:** Verify all dependencies included

- [ ] Path issues
  - **Symptom:** File picker or save dialog fails
  - **Fix:** Check production path detection
  - **Fix:** Use app.getPath() for all paths

**If Issues Found:**
- [ ] Document issue in notes
- [ ] Fix issue
- [ ] Rebuild: `npm run package`
- [ ] Retest everything
- [ ] Verify fix works

**Checkpoint:** No packaging errors ✓

---

### 4.2: Document Build Process (10 minutes)

#### Update README.md
- [ ] Add build instructions section
  ```markdown
  ## Building for Production
  
  ### Prerequisites
  - Node.js 18+
  - npm or yarn
  
  ### Build Steps
  1. Install dependencies: `npm install`
  2. Build webpack bundle: `npm run build:app`
  3. Package app: `npm run package`
  
  Output: `dist/ClipForge-1.0.0.dmg`
  ```

#### Add Installation Instructions
- [ ] Add installation section
  ```markdown
  ## Installation
  
  ### macOS
  1. Download `ClipForge-1.0.0.dmg`
  2. Open the DMG file
  3. Drag ClipForge to Applications folder
  4. Double-click ClipForge in Applications
  5. If you see "App is damaged" warning:
     - Right-click app → Open
     - Click "Open" when prompted
     - This is normal for unsigned apps
  ```

#### Add Troubleshooting Section
- [ ] Add troubleshooting
  ```markdown
  ## Troubleshooting
  
  ### "App is damaged" Warning
  The app isn't code signed, so macOS warns you. To bypass:
  1. Right-click the app
  2. Select "Open"
  3. Click "Open" in the dialog
  
  ### FFmpeg Not Found
  If export fails with "FFmpeg not found":
  - Check that binaries are in the app bundle
  - Reinstall the app
  
  ### App Won't Launch
  - Check Console.app for error messages
  - Verify you're on macOS 11+ (Big Sur)
  ```

**Checkpoint:** README updated ✓

**Commit:** `docs(packaging): add build and installation instructions`

---

## Testing Checklist

### Build Tests
- [ ] `npm run package` completes successfully
- [ ] DMG file created in dist/
- [ ] File size <200MB
- [ ] No missing dependency errors
- [ ] Build logs show all files copied

### Installation Tests
- [ ] DMG mounts successfully
- [ ] Can drag app to Applications
- [ ] App installs without errors
- [ ] App appears in Applications folder

### Launch Tests
- [ ] App launches from Applications
- [ ] Window opens correctly
- [ ] No console errors on startup
- [ ] UI renders properly
- [ ] Window size is correct

### Feature Tests (CRITICAL)
- [ ] Can import video file
- [ ] Can select clip
- [ ] Can play video
- [ ] Audio sync works
- [ ] Can set trim points
- [ ] Trim indicators appear
- [ ] Can export video
- [ ] Export completes successfully
- [ ] Exported video is valid
- [ ] Exported video plays correctly

### FFmpeg Tests
- [ ] FFmpeg binary found
- [ ] FFprobe binary found
- [ ] Export processes video
- [ ] Export shows progress
- [ ] Export completes without errors

### Path Tests
- [ ] File picker works
- [ ] Save dialog works
- [ ] File paths resolve correctly
- [ ] Video file loads correctly

**Checkpoint:** All tests passing ✓

---

## Completion Checklist

- [ ] All build configuration complete
- [ ] Path resolution working in dev
- [ ] Packaged app builds successfully
- [ ] App installs from DMG
- [ ] App launches without errors
- [ ] All features work in packaged app
- [ ] Export works correctly
- [ ] No critical bugs
- [ ] README updated with instructions
- [ ] Documented troubleshooting steps
- [ ] All commits pushed

**Final Status:** ✅ PR #9 COMPLETE

---

## Time Tracking

**Estimated:** 2-4 hours  
**Actual:** ___ hours

| Phase | Estimated | Actual | Notes |
|-------|-----------|--------|-------|
| Configuration | 1h | __ | |
| Path Resolution | 30min | __ | |
| Build & Test | 1h | __ | |
| Fixes & Docs | 30min | __ | |
| **Total** | **2-4h** | **__** | |

---

**Status:** Ready to implement! 🚀

