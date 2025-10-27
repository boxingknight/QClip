# PR#9: Packaging & Build - Quick Start

---

## TL;DR (30 seconds)

**What:** Package ClipForge as a distributable macOS DMG installer with bundled FFmpeg binaries.

**Why:** Critical validation that the app works in production. Must be done on Day 2 (not Day 3) to allow time for fixes.

**Time:** 2-4 hours estimated

**Complexity:** MEDIUM

**Status:** 📋 READY TO IMPLEMENT

---

## Decision Framework (2 minutes)

### Should You Build This?

**Green Lights (Build it!):**
- ✅ PRs #1-8 are complete (all features working in dev)
- ✅ You have 2+ hours available
- ✅ App works flawlessly in development
- ✅ Ready to validate production build
- ✅ Excited to test packaged app

**Red Lights (Skip/defer it!):**
- ❌ Core features don't work in dev (fix those first)
- ❌ Less than 1 hour available (won't finish)
- ❌ Behind schedule (this is critical, prioritize it)
- ❌ Haven't tested export in dev yet (must work first)

**Decision Aid:** If you're at this point and dev version works, you MUST do this PR. It's the critical validation checkpoint. If dev doesn't work, fix that first.

---

## Prerequisites (5 minutes)

### Required
- [ ] PRs #1-8 complete (all core features working in dev)
- [ ] App works perfectly in development mode
- [ ] Can import, play, trim, and export videos successfully
- [ ] No critical bugs in dev version
- [ ] Webpack build working: `npm run build` succeeds
- [ ] Electron app launches in dev mode without errors

### Optional But Recommended
- [ ] PR #7 (UI Polish) complete - looks professional
- [ ] PR #8 (Error Handling) complete - robust error handling

### Pre-Flight Checks
```bash
# 1. Verify dependencies installed
npm install

# 2. Test dev version works
npm start
# Import a video, test all features

# 3. Create branch
git checkout -b feat/packaging
```

---

## Getting Started (First Hour)

### Step 1: Read Documentation (30 minutes)
- [ ] Read this quick start (10 min)
- [ ] Read main specification: `PR09_PACKAGING_BUILD.md` (20 min)
- [ ] Note any questions or concerns

### Step 2: Configure electron-builder (30 minutes)
- [ ] Open or create `electron-builder.yml`
- [ ] Configure app ID: `com.clipforge.app`
- [ ] Configure macOS DMG target
- [ ] Include FFmpeg binaries in extraResources
- [ ] Configure DMG layout (Applications link)
- [ ] Update package.json with build scripts
- [ ] Test configuration syntax

### Step 3: Start Path Resolution
- [ ] Update main.js with production path detection
- [ ] Test paths work in dev mode first
- [ ] Add console logging to verify

**Checkpoint:** Configuration files created and paths detected ✓

---

## Daily Progress Template

### Hour 1 Goals (2 hours)
- [ ] Read main specification (30 min)
- [ ] Configure electron-builder.yml (20 min)
- [ ] Update package.json scripts (15 min)
- [ ] Update main.js for production paths (20 min)
- [ ] Update videoProcessing.js (15 min)
- [ ] Test configuration (20 min)

**Checkpoint:** Ready to build

### Hour 2 Goals (Build & Test)
- [ ] Build webpack bundle (5 min)
- [ ] Run electron-builder (3-5 min wait)
- [ ] Verify DMG created (2 min)
- [ ] Install app from DMG (5 min)
- [ ] Test all features in packaged app (30 min)
- [ ] Fix any issues found (variable)
- [ ] Document installation instructions (15 min)

**Checkpoint:** Packaged app working perfectly

---

## Common Issues & Solutions

### Issue 1: "FFmpeg binary not found"
**Symptoms:** Export fails with FFmpeg error  
**Cause:** Incorrect path to FFmpeg in production  
**Solution:**
```javascript
// In videoProcessing.js, ensure correct paths:
const paths = getFFmpegPaths();
console.log('Paths:', paths); // Debug

// For production, should be:
// process.resourcesPath/ffmpeg
```

### Issue 2: "electron-builder failed"
**Symptoms:** Build stops with error  
**Cause:** Missing files or incorrect configuration  
**Solution:**
- Check electron-builder.yml syntax
- Verify dist/ folder exists
- Run `npm run build:app` first
- Check files array includes all needed files

### Issue 3: "App won't launch"
**Symptoms:** App crashes on startup  
**Cause:** Missing dependencies or path issues  
**Solution:**
- Check console logs: `./ClipForge 2>&1 | tee output.log`
- Verify all files in files array
- Check that FFmpeg binaries exist
- Test paths are correct

### Issue 4: "Gatekeeper won't allow app"
**Symptoms:** "App is damaged" message on launch  
**Cause:** App isn't code signed  
**Solution:**
- Right-click app → Open
- Click "Open" in dialog
- This is normal for unsigned apps in MVP
- Document this in README

### Issue 5: "DMG file is 500MB+"
**Symptoms:** DMG is larger than expected  
**Cause:** Including unnecessary files  
**Solution:**
- Check files array in electron-builder.yml
- Add exclusions for large files
- Strip source maps in production build
- Normal size: ~100-200MB

---

## Quick Reference

### Key Files
- `electron-builder.yml` - Build configuration
- `package.json` - Build scripts
- `main.js` - Path detection logic
- `electron/ffmpeg/videoProcessing.js` - FFmpeg path resolution
- `dist/ClipForge-1.0.0.dmg` - Output DMG file

### Key Functions
- `getFFmpegPaths()` - Returns FFmpeg binary paths for dev/production
- `app.isPackaged` - Detects if running in production
- `process.resourcesPath` - Points to bundled resources

### Key Concepts
- **Development:** App runs from source, uses node_modules
- **Production:** App runs from bundle, uses extraResources
- **Path Resolution:** Must detect environment and use correct paths
- **Code Signing:** Skipped for MVP (acceptable)

### Useful Commands
```bash
# Build webpack bundle
npm run build:app

# Package app
npm run package

# Build for macOS only
npm run package:mac

# Full build and package
npm run dist
```

---

## Success Metrics

**You'll know it's working when:**
- [ ] `npm run package` completes successfully
- [ ] DMG file appears in dist/ folder
- [ ] Can install app from DMG
- [ ] App launches from Applications
- [ ] All features work: Import, Play, Trim, Export
- [ ] Export works correctly
- [ ] Exported video is valid and playable

**Critical Tests:**
- Import video file ✅
- Play video with audio ✅
- Set trim points ✅
- Export video ✅
- Exported video plays correctly ✅

---

## Help & Support

### Stuck?
1. Check electron-builder.yml syntax
2. Verify FFmpeg binaries exist in node_modules/
3. Test paths with console.log in dev mode
4. Check console logs from packaged app
5. Review main specification for details

### Want to Skip Parts?
**Cannot skip:**
- Configuration (required)
- Path resolution (required)
- Export test (critical validation)

**Can simplify:**
- DMG custom layout (use defaults)
- Icon customization (use default)
- Code signing (skip for MVP)

### Running Out of Time?
1. Test export feature FIRST (most likely to fail)
2. Fix export issues before other features
3. Document Gatekeeper bypass
4. Get basic package working, polish later

---

## Motivation

**You've got this!** 💪

This PR is the moment of truth. You've built an amazing video editor, and now it's time to package it up and see it run as a real desktop app. It's incredibly satisfying to double-click your own app and have it just work.

---

## Next Steps

**When ready:**
1. Verify PRs #1-8 complete (5 min)
2. Read main specification (30 min)
3. Start Phase 1: Configuration (1 hour)
4. Build and test (1 hour)
5. Fix issues if needed
6. Document installation

**Status:** Ready to build! 🚀

---

## Critical Reminders

1. **Test Export FIRST** - Most likely failure point
2. **Test on Day 2** - Not Day 3 - Leave time for fixes
3. **Document Gatekeeper Bypass** - Users will need this
4. **Keep It Simple** - MVP doesn't need fancy code signing
5. **Test Everything** - Packaged app must work perfectly

---

*"The moment you see your app running as a packaged DMG for the first time is magical. Ship it!"*

