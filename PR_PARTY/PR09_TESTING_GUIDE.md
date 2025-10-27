# PR#9: Testing Guide - Packaging & Build

---

## Test Philosophy

**Critical Principle:** The packaged app must work EXACTLY like the dev version. Any discrepancy indicates a packaging issue that must be fixed.

**Testing Order:** Test export feature FIRST (most likely to fail)

---

## Pre-Build Tests

### Test 1: Verify Dev App Works
**Objective:** Ensure all features work before packaging

- [ ] Launch app in dev mode: `npm start`
- [ ] Test import video
  - Browse Files button works
  - Video imports successfully
  - File appears in clips list
- [ ] Test video player
  - Video plays with audio
  - Play/pause works
  - Time display updates
- [ ] Test trim controls
  - Set in-point works
  - Set out-point works
  - Trim indicators appear
- [ ] Test export (CRITICAL)
  - Export button works
  - Export completes successfully
  - Exported video is valid
  - Exported video plays correctly

**Pass Criteria:** All features work perfectly in dev mode

---

## Build Tests

### Test 2: Webpack Build
**Objective:** Verify production bundle builds correctly

**Procedure:**
```bash
npm run build:app
# or
webpack --mode production
```

**Verify:**
- [ ] Build completes without errors
- [ ] dist/bundle.js exists
- [ ] dist/index.html exists
- [ ] File sizes are reasonable
- [ ] No console errors during build

**Pass Criteria:** Clean build, no errors

---

### Test 3: electron-builder Configuration
**Objective:** Verify configuration is valid

**Procedure:**
```bash
# This will fail without webpack build, which is OK
npm run package
# Should fail gracefully with "no webpack build" type error
```

**Verify:**
- [ ] electron-builder.yml syntax is valid
- [ ] Configuration loads without errors
- [ ] No missing required fields

**Pass Criteria:** Configuration is valid YAML

---

### Test 4: Package Build
**Objective:** Generate DMG file

**Procedure:**
```bash
npm run build:app  # Build webpack bundle first
npm run package    # Build DMG
```

**Verify:**
- [ ] Build completes in <5 minutes
- [ ] DMG file created: `dist/ClipForge-1.0.0.dmg`
- [ ] File size is reasonable (<200MB acceptable)
- [ ] No error messages in console
- [ ] Build logs show all files copied

**Expected Output:**
```
✓ Building DMG
✓ Building DMG layout
✓ DMG created: dist/ClipForge-1.0.0.dmg
```

**Pass Criteria:** DMG file exists and is reasonable size

---

## Installation Tests

### Test 5: DMG Mount
**Objective:** Verify DMG can be opened

**Procedure:**
1. Double-click DMG file
2. Observe DMG window

**Verify:**
- [ ] DMG mounts successfully
- [ ] Window shows app icon
- [ ] "Applications" link visible
- [ ] Can drag app to Applications
- [ ] No error messages

**Pass Criteria:** DMG opens and displays correctly

---

### Test 6: App Installation
**Objective:** Verify app installs correctly

**Procedure:**
1. Drag ClipForge app to Applications folder
2. Wait for copy to complete
3. Check Applications folder

**Verify:**
- [ ] App appears in Applications
- [ ] App file size >50MB (has FFmpeg bundles)
- [ ] No error during installation

**Pass Criteria:** App installs successfully

---

## Launch Tests

### Test 7: App Launch
**Objective:** Verify app launches without errors

**Procedure:**
1. Navigate to Applications
2. Double-click ClipForge
3. Handle Gatekeeper if needed:
   - Right-click → Open (first time)
   - Click "Open" in dialog

**Verify:**
- [ ] App launches
- [ ] Window opens
- [ ] No immediate crashes
- [ ] UI renders correctly
- [ ] Window size is correct

**Expected Issues (Acceptable):**
- Gatekeeper warning (expected for unsigned app)
- Right-click → Open bypasses it

**Pass Criteria:** App launches and displays UI

---

### Test 8: Console Error Check
**Objective:** Verify no console errors on startup

**Procedure:**
1. Launch app
2. Open Console.app (macOS)
3. Search for ClipForge
4. Review error messages

**Verify:**
- [ ] No "file not found" errors
- [ ] No "FFmpeg not found" errors
- [ ] No missing dependency errors
- [ ] Paths resolve correctly

**Pass Criteria:** No critical console errors

---

## Feature Tests (CRITICAL)

### Test 9: Import Feature
**Objective:** Test import in packaged app

**Procedure:**
1. Click Browse Files button
2. Select a video file (MP4 or MOV)
3. Wait for import

**Verify:**
- [ ] File picker opens
- [ ] Video imports successfully
- [ ] File appears in clips list
- [ ] File name and size displayed
- [ ] No error messages

**Pass Criteria:** Import works exactly like dev version

---

### Test 10: Video Player
**Objective:** Test playback in packaged app

**Procedure:**
1. Click on imported clip
2. Click play button
3. Watch video playback

**Verify:**
- [ ] Video plays correctly
- [ ] Audio plays in sync
- [ ] Play/pause button works
- [ ] Time display updates
- [ ] No playback errors

**Pass Criteria:** Video playback matches dev version

---

### Test 11: Trim Controls
**Objective:** Test trim functionality in packaged app

**Procedure:**
1. Play video
2. Click "Set In Point" at start of desired segment
3. Click "Set Out Point" at end of desired segment

**Verify:**
- [ ] Trim controls respond
- [ ] In-point and out-point set correctly
- [ ] Trim indicators appear on timeline
- [ ] Times display correctly

**Pass Criteria:** Trim controls work like dev version

---

### Test 12: Export Feature (CRITICAL)
**Objective:** MOST IMPORTANT TEST - Export in packaged app

**Procedure:**
1. Set trim points (optional)
2. Click Export button
3. Choose save location
4. Wait for export to complete

**Verify:**
- [ ] Export button triggers FFmpeg
- [ ] Save dialog appears
- [ ] Progress bar shows during export
- [ ] Export completes successfully
- [ ] Success message displays
- [ ] No FFmpeg errors

**Output Verification:**
5. Navigate to exported file
6. Open in VLC or QuickTime
7. Verify video plays
8. Verify video is trimmed correctly (if trims set)

**CRITICAL:** This test MUST pass. If export fails, packaging is broken.

**Pass Criteria:** Export works and produces valid, playable video

---

## FFmpeg Tests

### Test 13: FFmpeg Binary Detection
**Objective:** Verify FFmpeg binaries are found

**Procedure:**
1. Launch app
2. Check console logs for FFmpeg paths
3. Try to export a video

**Verify:**
- [ ] FFmpeg path logged: `process.resourcesPath/ffmpeg`
- [ ] FFprobe path logged: `process.resourcesPath/ffprobe`
- [ ] Paths point to bundled binaries
- [ ] No "not found" errors

**Pass Criteria:** FFmpeg binaries are detected and accessible

---

### Test 14: FFmpeg Processing
**Objective:** Verify FFmpeg can process videos

**Procedure:**
1. Import a video
2. Export without trimming
3. Export with trimming

**Verify:**
- [ ] Export without trim produces full video
- [ ] Export with trim produces trimmed segment
- [ ] Both exports complete successfully
- [ ] Exported videos are valid
- [ ] Exported videos play correctly

**Pass Criteria:** FFmpeg processes videos correctly

---

### Test 15: Video Format Support
**Objective:** Test different video formats

**Test Cases:**
- [ ] Test MP4 file
- [ ] Test MOV file
- [ ] Test different resolutions (720p, 1080p)
- [ ] Test different durations (short, long)

**Verify:**
- [ ] All formats import correctly
- [ ] All formats play correctly
- [ ] All formats export correctly
- [ ] No format-specific errors

**Pass Criteria:** Video format support works

---

## Path Tests

### Test 16: File Path Resolution
**Objective:** Verify paths resolve correctly

**Procedure:**
1. Import a video from different locations
2. Export to different locations
3. Check for path-related errors

**Verify:**
- [ ] Absolute paths work
- [ ] Relative paths work
- [ ] File picker returns correct paths
- [ ] Save dialog saves to correct location
- [ ] No path-related errors

**Pass Criteria:** All path operations work correctly

---

### Test 17: Resource Path Access
**Objective:** Verify extraResources accessible

**Procedure:**
1. Import and export video
2. Check console for resource access

**Verify:**
- [ ] FFmpeg binary accessed from extraResources
- [ ] FFprobe binary accessed from extraResources
- [ ] No "resource not found" errors
- [ ] All resources load correctly

**Pass Criteria:** Bundled resources are accessible

---

## Performance Tests

### Test 18: App Launch Time
**Objective:** Verify app launches quickly

**Procedure:**
1. Close app completely
2. Launch app from Applications
3. Measure time to UI display

**Measure:**
- Launch time <3 seconds
- UI renders within 2 seconds
- No long pauses

**Pass Criteria:** App launches in <3 seconds

---

### Test 19: Export Performance
**Objective:** Verify export doesn't take excessive time

**Procedure:**
1. Import a 30-second video
2. Export it (no trimming)

**Measure:**
- Export time <1 minute for 30-second video
- 2x video duration is acceptable
- No excessive processing time

**Pass Criteria:** Export completes in reasonable time

---

## Edge Case Tests

### Test 20: Long File Paths
**Objective:** Handle long directory paths

**Procedure:**
1. Import video from deeply nested folder
2. Export to deeply nested location

**Verify:**
- [ ] Import works with long paths
- [ ] Export works with long paths
- [ ] No path truncation errors
- [ ] File operations succeed

**Pass Criteria:** Long paths handled correctly

---

### Test 21: Special Characters
**Objective:** Handle special characters in paths

**Procedure:**
1. Import video from folder with special chars
2. Export to folder with special chars

**Verify:**
- [ ] Import works with special chars
- [ ] Export works with special chars
- [ ] No path encoding errors
- [ ] File operations succeed

**Pass Criteria:** Special characters handled correctly

---

### Test 22: Multiple Instances
**Objective:** Verify app handles multiple imports

**Procedure:**
1. Import 3-5 videos
2. Switch between clips
3. Trim and export different clips

**Verify:**
- [ ] Multiple imports work
- [ ] Switching clips works
- [ ] Multiple exports work
- [ ] No memory leaks
- [ ] App remains responsive

**Pass Criteria:** Multiple clips handled correctly

---

## User Experience Tests

### Test 23: UI Responsiveness
**Objective:** Verify UI remains responsive

**Procedure:**
1. Import videos
2. Switch clips rapidly
3. Set trim points quickly
4. Export a video

**Verify:**
- [ ] UI remains responsive during operations
- [ ] No freezing or hanging
- [ ] Smooth transitions
- [ ] No lag in button clicks

**Pass Criteria:** UI remains responsive

---

### Test 24: Error Messages
**Objective:** Verify error handling

**Procedure:**
1. Try to export without importing
2. Try invalid operations

**Verify:**
- [ ] Helpful error messages displayed
- [ ] Errors don't crash app
- [ ] Users can recover from errors
- [ ] Console logs useful errors

**Pass Criteria:** Errors handled gracefully

---

## Acceptance Criteria

**This PR is complete when:**

### Must Have (All Required)
- [ ] DMG builds successfully
- [ ] App installs without errors
- [ ] App launches from Applications
- [ ] Import works in packaged app
- [ ] Video playback works
- [ ] Trim controls work
- [ ] Export works in packaged app
- [ ] Exported video is valid and playable
- [ ] No critical console errors
- [ ] FFmpeg binaries found and accessible

### Should Have (Recommended)
- [ ] File size <200MB
- [ ] Launch time <3 seconds
- [ ] UI looks professional
- [ ] Loading states work
- [ ] Error messages are helpful

### Nice to Have (Optional)
- [ ] DMG has custom layout
- [ ] App icon is customized
- [ ] Auto-update configured (future)
- [ ] Notarized (post-MVP)

---

## Test Report Template

**After completing all tests, create a test report:**

```markdown
# PR#9 Testing Report

## Build Tests
- ✅ Webpack build: Pass
- ✅ electron-builder config: Pass
- ✅ DMG generation: Pass
- ✅ File size: 150MB (acceptable)

## Installation Tests
- ✅ DMG mount: Pass
- ✅ App installation: Pass

## Launch Tests
- ✅ App launch: Pass
- ✅ Console errors: None critical
- ✅ UI rendering: Pass

## Feature Tests
- ✅ Import: Pass
- ✅ Video Player: Pass
- ✅ Trim Controls: Pass
- ✅ Export: **PASS (CRITICAL)**

## FFmpeg Tests
- ✅ Binary detection: Pass
- ✅ Video processing: Pass
- ✅ Format support: Pass

## Path Tests
- ✅ Path resolution: Pass
- ✅ Resource access: Pass

## Performance Tests
- ✅ Launch time: <3 seconds
- ✅ Export performance: Acceptable

## Edge Cases
- ✅ Long paths: Pass
- ✅ Special chars: Pass
- ✅ Multiple clips: Pass

## Overall Status
**Result:** ✅ ALL TESTS PASSING
**Packaged App:** Ready for distribution
**Recommendation:** Proceed to documentation
```

---

**Remember:** Test export FIRST. If export works, everything works.

