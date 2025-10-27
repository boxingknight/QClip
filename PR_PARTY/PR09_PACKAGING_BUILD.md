# PR#9: Packaging & Build

**Estimated Time:** 2-4 hours  
**Complexity:** MEDIUM  
**Priority:** CRITICAL - Day 2, Hours 35-36  
**Branch:** `feat/packaging`  
**Dependencies:** PR #1-8 (All core features must be complete)

---

## Overview

### What We're Building
Package ClipForge as a distributable desktop application for macOS using Electron Builder. This includes bundling FFmpeg binaries, configuring production paths, building DMG installer, and ensuring the packaged app works exactly like the development version.

### Why It Matters
Packaging is the **final validation** that all features work in production. A packaged app must work without dev dependencies, Node.js, or manual configuration. If packaging fails, the entire MVP fails. This is a CRITICAL checkpoint that must be tested on Day 2 (not Day 3) to allow time for fixes.

### Success in One Sentence
"This PR is successful when I can double-click the DMG file on a clean Mac, install ClipForge, launch it, import a video, play it, trim it, and export it successfully."

---

## Technical Design

### Architecture Decisions

#### Decision 1: Packaging Tool
**Options Considered:**
1. **Option A:** `electron-builder` (all-in-one solution)
   - Pros: Comprehensive, handles signing, updates, all platforms
   - Cons: Can be complex for first-time use

2. **Option B:** `electron-packager` (basic bundler)
   - Pros: Simple, straightforward
   - Cons: Manual signing, no auto-updates, limited customization

**Chosen:** Option A - `electron-builder`

**Rationale:**
- Already included in dependencies
- Handles code signing automatically
- Generates DMG installer
- Well-documented and widely used
- Can add auto-updates later
- Professional output

**Trade-offs:**
- ✅ Gain: Professional installer, code signing, future-proof
- ⚠️ Lose: Slightly more complex than packager

#### Decision 2: FFmpeg Binary Distribution
**Options Considered:**
1. **Option A:** Include binaries in app bundle (~60MB extra)
   - Pros: Works everywhere, no dependencies
   - Cons: Large app size

2. **Option B:** Require user to install FFmpeg separately
   - Pros: Smaller app bundle
   - Cons: Poor UX, installation friction

**Chosen:** Option A - Bundle FFmpeg binaries

**Rationale:**
- Better user experience (works out of box)
- No installation instructions needed
- Reliable in packaged app
- Worth the file size for MVP
- Users expect video editors to be self-contained

**Trade-offs:**
- ✅ Gain: Professional UX, zero setup
- ⚠️ Lose: ~60MB larger app (acceptable for video editor)

#### Decision 3: Code Signing
**Options Considered:**
1. **Option A:** Sign with Apple certificate ($99/year)
   - Pros: No Gatekeeper warnings, trusted
   - Cons: Cost, requires developer account

2. **Option B:** Skip signing (unsigned)
   - Pros: Free, no account needed
   - Cons: Gatekeeper warnings, looks unprofessional

3. **Option C:** Ad-hoc signing (free, temporary)
   - Pros: No warnings on this Mac
   - Cons: Only works for this Mac

**Chosen:** Option B - Unsigned for MVP

**Rationale:**
- MVP deadline doesn't justify $99 certificate
- Users can right-click → Open to bypass warning
- Document the bypass in README
- Can upgrade to signed later

**Trade-offs:**
- ⚠️ Gain: Free, fast to ship
- ⚠️ Lose: Gatekeeper warning, user friction

#### Decision 4: Production Path Resolution
**Options Considered:**
1. **Option A:** Hardcode paths for production
   - Pros: Simple
   - Cons: Breaks if moved

2. **Option B:** Use `app.getPath()` and detect environment
   - Pros: Works in dev and production
   - Cons: Slightly more complex

**Chosen:** Option B - Smart path resolution

**Rationale:**
- Works in both dev and production
- More robust
- Standard Electron practice
- Future-proof

**Trade-offs:**
- ✅ Gain: Works everywhere, maintainable
- ⚠️ Lose: Slightly more code

---

## Implementation Details

### File Structure

**New Files:**
```
No new files created (all configuration)
```

**Modified Files:**
- `package.json` - Add build scripts and metadata
- `electron-builder.yml` - Configure build settings
- `main.js` - Update FFmpeg paths for production
- `electron/ffmpeg/videoProcessing.js` - Smart path resolution

### Key Implementation Steps

#### Phase 1: Configuration (1 hour)
1. Configure `electron-builder.yml`
   - Set app ID: `com.clipforge.app`
   - Configure macOS target (dmg)
   - Set app name and version
   - Include FFmpeg binaries

2. Update `package.json`
   - Add `"build"` scripts
   - Set metadata (author, description, homepage)
   - Configure electron-builder

#### Phase 2: Path Resolution (30 minutes)
1. Update `main.js` for production paths
   - Detect if running in dev or production
   - Use `app.getPath()` for resources
   - Handle FFmpeg binary paths

2. Update `videoProcessing.js`
   - Smart path resolution for FFmpeg
   - Works in both dev and production
   - Handle binary not found gracefully

#### Phase 3: Build & Test (1 hour)
1. Build packaged app
   - Run `npm run package`
   - Wait for DMG generation
   - Verify file size (<200MB acceptable)

2. Test packaged app
   - Install from DMG
   - Launch app
   - Test all features
   - Verify FFmpeg works
   - Check console for errors

#### Phase 4: Fixes & Documentation (30 minutes)
1. Fix any packaging issues
   - Missing dependencies
   - Incorrect paths
   - FFmpeg not found
   - File access issues

2. Document build process
   - Add to README.md
   - Build instructions
   - Troubleshooting section

### Code Examples

**Example 1: electron-builder.yml Configuration**
```yaml
appId: com.clipforge.app
productName: ClipForge

mac:
  target:
    - dmg
  icon: public/icon.png
  category: public.app-category.utilities
  
files:
  - "dist/**/*"
  - "main.js"
  - "preload.js"
  - "electron/**/*"
  - "!electron/ffmpeg/videoProcessing.js.map"

extraResources:
  - from: "node_modules/ffmpeg-static/ffmpeg"
    to: "ffmpeg"
  - from: "node_modules/ffprobe-static/ffprobe"
    to: "ffprobe"

dmg:
  contents:
    - x: 110
      y: 150
    - x: 240
      y: 150
      type: link
      path: /Applications
```

**Example 2: Production Path Detection in main.js**
```javascript
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

// Determine if running in development or production
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Get FFmpeg binary paths
function getFFmpegPaths() {
  if (isDev) {
    // Development: use node_modules
    const ffmpegPath = path.join(__dirname, 'node_modules', 'ffmpeg-static', 'ffmpeg');
    const ffprobePath = path.join(__dirname, 'node_modules', 'ffprobe-static', 'ffprobe');
    return { ffmpegPath, ffprobePath };
  } else {
    // Production: use bundled binaries
    const resourcesPath = process.resourcesPath;
    const ffmpegPath = path.join(resourcesPath, 'ffmpeg');
    const ffprobePath = path.join(resourcesPath, 'ffprobe');
    return { ffmpegPath, ffprobePath };
  }
}
```

**Example 3: Smart Path Resolution in videoProcessing.js**
```javascript
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const { app } = require('electron');

function getFFmpegPaths() {
  const isDev = !app || !app.isPackaged;
  
  if (isDev) {
    const ffmpegStatic = require('ffmpeg-static');
    const ffprobeStatic = require('ffprobe-static');
    return {
      ffmpeg: ffmpegStatic,
      ffprobe: ffprobeStatic
    };
  } else {
    // Production paths
    const resourcesPath = process.resourcesPath;
    return {
      ffmpeg: path.join(resourcesPath, 'ffmpeg'),
      ffprobe: path.join(resourcesPath, 'ffprobe')
    };
  }
}

// Export video function with smart paths
function exportVideo(inputPath, outputPath, options = {}) {
  const paths = getFFmpegPaths();
  
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .setFfmpegPath(paths.ffmpeg)
      .setFfprobePath(paths.ffprobe)
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', reject)
      .run();
  });
}
```

---

## Testing Strategy

### Test Categories

**Build Tests:**
- `npm run package` completes without errors
- DMG file is created in dist/ folder
- File size is reasonable (<200MB)
- No missing dependencies

**Installation Tests:**
- DMG mounts without errors
- Can drag app to Applications folder
- App installs successfully

**Launch Tests:**
- App launches from Applications
- No console errors on startup
- No missing resource warnings

**Feature Tests (Critical):**
- Can import video file
- Can play video with audio
- Can set trim points
- Can export video
- Exported video is valid and playable

**FFmpeg Tests:**
- FFmpeg binaries are found
- Video processing works
- Export completes successfully
- No FFmpeg path errors

**Path Tests:**
- File picker works
- Save dialog works
- Relative paths resolve correctly
- Absolute paths work

**Edge Cases:**
- Works on macOS 11+ (Big Sur)
- Works on different Macs (if available)
- Handles long file paths
- Handles special characters in paths

---

## Success Criteria

**Feature is complete when:**
- [ ] Packaged app builds successfully
- [ ] DMG installer is created
- [ ] App launches from Applications
- [ ] All features work in packaged app
- [ ] FFmpeg export works in packaged app
- [ ] No console errors
- [ ] File size <200MB
- [ ] Build process documented

**Performance Targets:**
- Build time: <5 minutes
- App launch time: <3 seconds
- No slowdown vs dev version

**Quality Gates:**
- Zero critical bugs in packaged app
- All tests pass from checklist
- Gatekeeper bypass documented
- README has installation instructions

---

## Risk Assessment

### Risk 1: FFmpeg Binaries Not Found 🔴 HIGH
**Likelihood:** MEDIUM  
**Impact:** CRITICAL  
**Mitigation:** 
- Test path resolution in dev first
- Use absolute paths in production
- Log paths for debugging
- Verify binaries exist in extraResources
- Add error handling for missing binaries

**Status:** 🔴 Needs careful testing

### Risk 2: Build Fails Due to Missing Files 🟡 MEDIUM
**Likelihood:** MEDIUM  
**Impact:** HIGH  
**Mitigation:**
- Use glob patterns for files
- Include all required files in build
- Test build early (Day 2, not Day 3)
- Check dist/ folder before packaging

**Status:** 🟡 Test early

### Risk 3: Path Issues in Production 🟡 MEDIUM
**Likelihood:** MEDIUM  
**Impact:** HIGH  
**Mitigation:**
- Use `app.getPath()` for dynamic paths
- Test both dev and production
- Log paths during execution
- Add error handling

**Status:** 🟡 Need to test thoroughly

### Risk 4: Gatekeeper Warnings 🟢 LOW
**Likelihood:** HIGH  
**Impact:** LOW  
**Mitigation:**
- Document bypass in README
- This is acceptable for MVP
- Can upgrade to signing later

**Status:** 🟢 Acceptable for MVP

### Risk 5: Build Takes Too Long 🟢 LOW
**Likelihood:** LOW  
**Impact:** LOW  
**Mitigation:**
- Electron Builder is optimized
- ~2-3 minutes is normal
- Can run in background

**Status:** 🟢 Not a concern

---

## Open Questions

**None currently** - Packaging is straightforward with electron-builder

---

## Timeline

**Total Estimate:** 2-4 hours

| Phase | Task | Time | Status |
|-------|------|------|--------|
| 1 | Configuration & Setup | 1h | ⏳ |
| 2 | Path Resolution | 30min | ⏳ |
| 3 | Build & Test | 1h | ⏳ |
| 4 | Fixes & Documentation | 30min | ⏳ |

---

## Dependencies

**Requires:**
- [ ] PR #1 complete (Project Setup)
- [ ] PR #2 complete (File Import)
- [ ] PR #3 complete (Video Player)
- [ ] PR #4 complete (FFmpeg Export)
- [ ] PR #5 complete (Timeline)
- [ ] PR #6 complete (Trim Controls)
- [ ] PR #7 complete (UI Polish) - optional but recommended
- [ ] PR #8 complete (Error Handling) - optional

**Blocks:**
- PR #10 (Documentation) - Must have packaged app before recording demo

---

## Critical Success Factors

1. **Test Early (Day 2, not Day 3):** If packaging fails, you need time to fix it
2. **FFmpeg Paths:** Most likely failure point - test thoroughly
3. **All Features Work:** Package app must work exactly like dev version
4. **Document Bypass:** Users will hit Gatekeeper warning - document the fix

---

## Troubleshooting

### Issue 1: "FFmpeg binary not found"
**Symptoms:** Error when trying to export  
**Cause:** Incorrect path to FFmpeg in production  
**Fix:** Update videoProcessing.js to use correct production paths

### Issue 2: "Build failed - missing files"
**Symptoms:** electron-builder fails  
**Cause:** Files not in dist/ or not in files list  
**Fix:** Check electron-builder.yml, verify dist/ contents

### Issue 3: "App won't launch"
**Symptoms:** App crashes on startup  
**Cause:** Missing dependencies or path issues  
**Fix:** Check console logs, verify all files bundled

### Issue 4: "Gatekeeper won't allow app to run"
**Symptoms:** "App is damaged" message  
**Cause:** Unsigned app  
**Fix:** Right-click → Open, document in README

### Issue 5: "Export button doesn't work"
**Symptoms:** Click does nothing  
**Cause:** FFmpeg paths wrong in production  
**Fix:** Update path resolution logic

---

## References

- electron-builder docs: https://www.electron.build/
- FFmpeg static binaries: https://github.com/eugeneware/ffmpeg-static
- Apple code signing: https://developer.apple.com/developer-id/

---

**Status:** ✅ Ready to implement after PRs #1-8 complete

