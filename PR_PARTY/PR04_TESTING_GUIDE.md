# PR#4: Testing Guide - FFmpeg Integration & Export

**Date:** October 27, 2025  
**Status:** 📋 READY FOR TESTING  
**Testing Time:** 1 hour allocated  
**Critical Path:** YES - Must pass for MVP

---

## Test Categories

### 1. Unit Tests

**Function:** `exportVideo()` in `electron/ffmpeg/videoProcessing.js`

#### Test Case 1: Basic Export
- [ ] **Input:** Valid input MP4 path, valid output path, no options
- [ ] **Expected:** Export completes successfully, output file created
- [ ] **Steps:**
  1. Call exportVideo with test.mp4 → output.mp4
  2. Wait for Promise to resolve
  3. Check output.mp4 exists
  4. Verify file size > 0
- [ ] **Actual:** [Record result]

#### Test Case 2: Invalid Input File
- [ ] **Input:** Nonexistent input path
- [ ] **Expected:** Rejects with error message
- [ ] **Steps:**
  1. Call exportVideo with 'fake.mp4' → output.mp4
  2. Wait for Promise to reject
  3. Check error message includes "not found"
- [ ] **Actual:** [Record result]

#### Test Case 3: Progress Callback
- [ ] **Input:** Valid video, progress callback provided
- [ ] **Expected:** Callback called multiple times with progress data
- [ ] **Steps:**
  1. Create progress callback that logs percent
  2. Call exportVideo with callback
  3. Verify callback called with increasing percentages
  4. Should see: 10%, 25%, 50%, 75%, 100%
- [ ] **Actual:** [Record result]

#### Test Case 4: With Trim Start Time
- [ ] **Input:** Start time = 5 seconds
- [ ] **Expected:** Exported video starts at 5 seconds mark
- [ ] **Steps:**
  1. Export with startTime: 5
  2. Open exported video
  3. Verify video content matches original 0:05+ mark
- [ ] **Actual:** [Record result]

#### Test Case 5: With Duration Limit
- [ ] **Input:** Duration = 10 seconds
- [ ] **Expected:** Exported video is max 10 seconds long
- [ ] **Steps:**
  1. Export with duration: 10
  2. Check exported video duration
  3. Verify <= 10 seconds (or exact if input longer than 10s)
- [ ] **Actual:** [Record result]

---

### 2. Integration Tests

#### Scenario 1: IPC Export Request
- [ ] **Steps:**
  1. Renderer calls `window.electronAPI.exportVideo(inputPath, outputPath, {})`
  2. Main process receives IPC event
  3. FFmpeg processing starts
  4. Progress events sent to renderer
  5. Export completes
  6. Success response sent to renderer
- [ ] **Expected:** Entire IPC flow works without errors
- [ ] **Actual:** [Record result]

#### Scenario 2: Save Dialog Flow
- [ ] **Steps:**
  1. Renderer calls `window.electronAPI.showSaveDialog()`
  2. Save dialog opens
  3. User selects location and filename
  4. Dialog returns file path
  5. Export uses that path
  6. File is saved to chosen location
- [ ] **Expected:** Save dialog opens, returns path, export uses it
- [ ] **Actual:** [Record result]

#### Scenario 3: Progress Updates During Export
- [ ] **Steps:**
  1. Click Export button
  2. Export starts
  3. Progress events emitted from main process
  4. Progress events received in renderer
  5. State updates with progress percentage
  6. UI updates progress bar
- [ ] **Expected:** Progress bar animates smoothly from 0% to 100%
- [ ] **Actual:** [Record result]

#### Scenario 4: Export Cancellation
- [ ] **Steps:**
  1. Click Export button
  2. Save dialog opens
  3. Click Cancel
  4. Export does not start
  5. UI remains unchanged (no error)
- [ ] **Expected:** Graceful cancellation, no export attempted
- [ ] **Actual:** [Record result]

---

### 3. End-to-End Tests

#### Test 1: Full Export Workflow
- [ ] **Test Case:** Happy path from UI click to file creation
- [ ] **Steps:**
  1. Launch app (`npm start`)
  2. Import test MP4 file
  3. Verify clip appears in timeline
  4. Click "Export Video" button
  5. Save dialog appears
  6. Choose output location (e.g., Desktop)
  7. Click Save
  8. Progress bar shows progress
  9. Status shows "Exporting... X%"
  10. Wait for export to complete
  11. Success message appears
  12. Navigate to output location
  13. Verify exported MP4 file exists
- [ ] **Expected:** Exported file created at chosen location
- [ ] **Actual:** [Record result]

#### Test 2: Exported Video Plays Correctly
- [ ] **Test Case:** Verify exported file is valid MP4
- [ ] **Steps:**
  1. Complete Test 1 (create exported file)
  2. Open exported MP4 in VLC or QuickTime
  3. Click play
  4. Verify video plays
  5. Verify audio plays
  6. Verify audio is synchronized
  7. Check video duration matches expectation
- [ ] **Expected:** Video plays correctly with synchronized audio
- [ ] **Actual:** [Record result]

#### Test 3: Multiple Exports
- [ ] **Test Case:** Export same clip multiple times
- [ ] **Steps:**
  1. Import video
  2. Export to output1.mp4
  3. Wait for completion
  4. Export again to output2.mp4
  5. Wait for completion
  6. Verify both files created
  7. Verify both files are playable
- [ ] **Expected:** Can export multiple times without errors
- [ ] **Actual:** [Record result]

#### Test 4: Export Different Video Formats
- [ ] **Test Case:** Export MP4 and MOV inputs
- [ ] **Steps:**
  1. Import MP4 file, export → verify works
  2. Import MOV file, export → verify works
  3. Compare exported file sizes
- [ ] **Expected:** Both formats export successfully
- [ ] **Actual:** [Record result]

---

### 4. Edge Cases

#### Edge Case 1: Very Short Video (<1 second)
- [ ] **Input:** Video of 0.5 seconds
- [ ] **Expected:** Export completes without error
- [ ] **Steps:**
  1. Import very short video
  2. Export it
  3. Verify output is valid
- [ ] **Actual:** [Record result]

#### Edge Case 2: Very Long Video (>10 minutes)
- [ ] **Input:** Video of 15 minutes
- [ ] **Expected:** Export completes in reasonable time
- [ ] **Steps:**
  1. Import long video
  2. Export it
  3. Note export time
  4. Verify time < 2x video duration
- [ ] **Actual:** [Record result]
- **Notes:** Export time: ___ seconds (target: ___ seconds)

#### Edge Case 3: Large File Size (>500MB)
- [ ] **Input:** Video file > 500MB
- [ ] **Expected:** No memory errors, export completes
- [ ] **Steps:**
  1. Import large video
  2. Monitor memory usage
  3. Export it
  4. Verify no crashes or memory errors
- [ ] **Actual:** [Record result]
- **Memory Usage:** ___ MB peak

#### Edge Case 4: Different Resolutions
- [ ] **Input:** 720p, 1080p, 4K videos (if available)
- [ ] **Expected:** All export successfully
- [ ] **Steps:**
  1. Import 720p video, export → verify
  2. Import 1080p video, export → verify
  3. Import 4K video, export → verify
- [ ] **Actual:** [Record result]

#### Edge Case 5: Video Without Audio Track
- [ ] **Input:** Video with no audio
- [ ] **Expected:** Export completes, exported video has no audio
- [ ] **Steps:**
  1. Import video with no audio
  2. Export it
  3. Open exported file
  4. Verify no audio (expected, not an error)
- [ ] **Actual:** [Record result]

---

### 5. Error Handling Tests

#### Error Test 1: No Clip Selected
- [ ] **Input:** Click Export with no clip imported
- [ ] **Expected:** Button disabled or error message shown
- [ ] **Steps:**
  1. Don't import any clip
  2. Try to click Export
  3. Verify button is disabled OR error shown
- [ ] **Actual:** [Record result]

#### Error Test 2: Disk Full
- [ ] **Input:** Not enough disk space for export
- [ ] **Expected:** Error message about disk space
- [ ] **Steps:**
  1. Fill disk to near capacity
  2. Try to export large video
  3. Verify error message is helpful
- [ ] **Actual:** [Record result]
- **Note:** Skip if can't simulate

#### Error Test 3: Permission Denied
- [ ] **Input:** Try to save to protected location
- [ ] **Expected:** Error message about permissions
- [ ] **Steps:**
  1. Try to save to System directory (e.g., /System)
  2. Or save to read-only location
  3. Verify error message
- [ ] **Actual:** [Record result]

#### Error Test 4: Corrupted Input File
- [ ] **Input:** Imported video file becomes corrupted
- [ ] **Expected:** Export fails with helpful error
- [ ] **Steps:**
  1. Import valid video
  2. Manually corrupt the source file
  3. Try to export
  4. Verify error message
- [ ] **Actual:** [Record result]
- **Note:** May need to manually corrupt file

#### Error Test 5: Invalid FFmpeg Binary
- [ ] **Input:** FFmpeg binary missing or broken
- [ ] **Expected:** Clear error message about FFmpeg
- [ ] **Steps:**
  1. Temporarily rename FFmpeg binary (simulate missing)
  2. Try to export
  3. Verify error message mentions FFmpeg
- [ ] **Actual:** [Record result]
- **Note:** Critical test - ensure this works

---

### 6. Performance Tests

#### Performance Test 1: Export Speed
- [ ] **Metric:** Export time vs video duration
- [ ] **Target:** Export completes in <2x video duration
- [ ] **Steps:**
  1. Note input video duration
  2. Start timer
  3. Export video
  4. Note export time
  5. Calculate ratio: export_time / video_duration
- [ ] **Video Duration:** ___ seconds
- [ ] **Export Time:** ___ seconds
- [ ] **Ratio:** ___:1 (target: <2:1)
- [ ] **Status:** ✅ PASS / ❌ FAIL

#### Performance Test 2: UI Responsiveness
- [ ] **Metric:** UI remains responsive during export
- [ ] **Target:** No UI freezing, progress updates visible
- [ ] **Steps:**
  1. Start export
  2. Try to interact with UI during export
  3. Verify UI doesn't freeze
  4. Verify progress bar updates smoothly
- [ ] **Status:** ✅ PASS / ❌ FAIL
- [ ] **Notes:** [Any UI freezes?]

#### Performance Test 3: Memory Usage
- [ ] **Metric:** Memory doesn't increase drastically
- [ ] **Target:** Stable memory during export
- [ ] **Steps:**
  1. Note baseline memory usage
  2. Start export
  3. Monitor memory during export
  4. Note peak memory
  5. Check memory after export completes
- [ ] **Baseline:** ___ MB
- [ ] **Peak:** ___ MB
- [ ] **After:** ___ MB
- [ ] **Increase:** ___ MB (target: <100MB increase)
- [ ] **Status:** ✅ PASS / ❌ FAIL

---

### 7. UI/UX Tests

#### UI Test 1: Export Button Visibility
- [ ] **Expected:** Export button clearly visible and labeled
- [ ] **Steps:**
  1. Import video
  2. Look for Export button
  3. Verify button text is clear ("Export Video")
- [ ] **Status:** ✅ PASS / ❌ FAIL

#### UI Test 2: Disabled State
- [ ] **Expected:** Button disabled when no clip selected
- [ ] **Steps:**
  1. Don't import any clip
  2. Check Export button
  3. Verify it's disabled/grayed out
- [ ] **Status:** ✅ PASS / ❌ FAIL

#### UI Test 3: Progress Bar Animation
- [ ] **Expected:** Smooth progress bar animation
- [ ] **Steps:**
  1. Start export
  2. Watch progress bar
  3. Verify it animates smoothly
  4. Verify it fills 0% → 100%
- [ ] **Status:** ✅ PASS / ❌ FAIL

#### UI Test 4: Status Messages
- [ ] **Expected:** Clear status messages during export
- [ ] **Steps:**
  1. Start export
  2. Watch status text
  3. Verify shows: "Preparing export...", "Exporting... X%", "Exported successfully"
- [ ] **Status:** ✅ PASS / ❌ FAIL

#### UI Test 5: Error Message Display
- [ ] **Expected:** Errors show clear, helpful messages
- [ ] **Steps:**
  1. Trigger error (e.g., invalid file)
  2. Verify error message appears
  3. Verify message is helpful, not technical
- [ ] **Status:** ✅ PASS / ❌ FAIL

#### UI Test 6: Success Feedback
- [ ] **Expected:** Clear success message after export
- [ ] **Steps:**
  1. Complete successful export
  2. Verify success message appears
  3. Verify message includes output path or confirms completion
- [ ] **Status:** ✅ PASS / ❌ FAIL

---

### 8. Cross-Platform Tests (if applicable)

#### macOS Test
- [ ] **Platform:** macOS
- [ ] **Expected:** Export works on macOS
- [ ] **Steps:**
  1. Run full export workflow
  2. Verify exported file works
  3. Check file in Finder
- [ ] **Status:** ✅ PASS / ⏸ SKIP

#### Windows Test (if building for Windows)
- [ ] **Platform:** Windows
- [ ] **Expected:** Export works on Windows
- [ ] **Steps:**
  1. Run full export workflow
  2. Verify exported file works
  3. Check file in Explorer
- [ ] **Status:** ✅ PASS / ⏸ SKIP

---

## Acceptance Criteria

**Feature is complete when:**
- [ ] All unit tests pass (Test Category 1)
- [ ] All integration tests pass (Test Category 2)
- [ ] All E2E tests pass (Test Category 3)
- [ ] Edge cases handled (Test Category 4)
- [ ] Error handling works (Test Category 5)
- [ ] Performance acceptable (Test Category 6)
- [ ] UI/UX acceptable (Test Category 7)
- [ ] Exported files play in VLC/QuickTime
- [ ] No console errors during normal export
- [ ] Progress bar updates smoothly

**Performance Targets:**
- [ ] Export completes in <2x video duration
- [ ] Memory usage stable during export
- [ ] UI remains responsive during export
- [ ] Progress updates every 1-2 seconds

**Quality Gates:**
- [ ] Zero critical bugs in export flow
- [ ] Error messages are user-friendly
- [ ] No console errors during normal operation
- [ ] All tests above pass

---

## Testing Checklist

### Pre-Testing Setup
- [ ] Test MP4 file prepared
- [ ] VLC or QuickTime installed (to verify exports)
- [ ] Dev server running (`npm start`)
- [ ] Console open for error checking
- [ ] This testing guide open for reference

### During Testing
- [ ] Run each test case systematically
- [ ] Record results for each test
- [ ] Note any issues or unexpected behavior
- [ ] Take screenshots of errors (if any)
- [ ] Monitor console for errors

### Post-Testing
- [ ] Review all test results
- [ ] Identify any failures
- [ ] Document bugs in bug log
- [ ] Fix critical issues before moving on
- [ ] Update this guide with actual results

---

## Bug Tracking

### Bug #1: [Title]
**Severity:** CRITICAL / HIGH / MEDIUM / LOW  
**Test Case:** [Which test failed]  
**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]

**Expected:** [What should happen]  
**Actual:** [What actually happened]  
**Fix:** [How to fix / Status]  

**Status:** 🐛 OPEN / ✅ FIXED

---

## Test Results Summary

### Overall Status
- **Total Tests:** ___ tests
- **Passed:** ___ tests
- **Failed:** ___ tests
- **Skipped:** ___ tests
- **Pass Rate:** ___%

### Critical Path
- [ ] Basic export works ✅ / ❌
- [ ] Exported file plays ✅ / ❌
- [ ] Progress updates work ✅ / ❌
- [ ] Error handling works ✅ / ❌
- [ ] Performance acceptable ✅ / ❌

### Issues Found
- [List any issues here]

---

## Next Steps After Testing

### If All Tests Pass ✅
1. Commit changes
2. Update PR_PARTY README
3. Move to next PR (PR #5: Timeline)

### If Tests Fail ❌
1. Document failures in bug tracking section
2. Prioritize critical failures
3. Fix issues
4. Re-run tests
5. Don't move on until critical tests pass

---

**Testing Status:** ⏳ NOT STARTED / 🚧 IN PROGRESS / ✅ COMPLETE

---

*"Comprehensive testing ensures export works reliably for users. Don't skip it."* 🧪

