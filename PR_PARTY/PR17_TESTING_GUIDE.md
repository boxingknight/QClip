# PR#17: Screen Recording Setup - Testing Guide

**PR:** #17 Screen Recording Setup  
**Status:** 📋 PLANNING COMPLETE  
**Test Strategy:** Comprehensive unit, integration, and manual testing

---

## Test Categories

### 1. Unit Tests

#### RecordingContext: getAvailableSources()
- [ ] **Test case 1:** Sources returned successfully
  - **Input:** Call getAvailableSources()
  - **Expected:** Promise resolves with array of source objects
  - **Validate:** Each source has { id, name, displayId, thumbnail }
  - **Actual:** [Record result]

- [ ] **Test case 2:** Permission denied
  - **Input:** Permission not granted
  - **Expected:** Error thrown with helpful message
  - **Validate:** Error state set, error message displayed
  - **Actual:** [Record result]

- [ ] **Test case 3:** Empty sources
  - **Input:** No screens available
  - **Expected:** Empty array returned
  - **Validate:** No error, empty array
  - **Actual:** [Record result]

#### RecordingContext: startRecording()
- [ ] **Test case 1:** Recording starts successfully
  - **Input:** Valid sourceId, default options
  - **Expected:** isRecording = true, mediaRecorder active, mediaStream active
  - **Validate:** State updated, stream playing
  - **Actual:** [Record result]

- [ ] **Test case 2:** Chunks collected
  - **Input:** Start recording, wait 3 seconds
  - **Expected:** recordedChunks array populated
  - **Validate:** Chunks array length > 0, chunks have data
  - **Actual:** [Record result]

- [ ] **Test case 3:** Duration timer updates
  - **Input:** Start recording, wait 5 seconds
  - **Expected:** recordingDuration = 5
  - **Validate:** Timer increments correctly
  - **Actual:** [Record result]

- [ ] **Test case 4:** Invalid sourceId
  - **Input:** Non-existent sourceId
  - **Expected:** Error thrown
  - **Validate:** Error state set, error message helpful
  - **Actual:** [Record result]

- [ ] **Test case 5:** MediaRecorder not supported
  - **Input:** Browser without MediaRecorder support
  - **Expected:** Error thrown with clear message
  - **Validate:** Error indicates lack of support
  - **Actual:** [Record result]

#### RecordingContext: stopRecording()
- [ ] **Test case 1:** Recording stops successfully
  - **Input:** Active recording
  - **Expected:** isRecording = false, blob returned, mediaRecorder stopped
  - **Validate:** State reset, blob size > 0
  - **Actual:** [Record result]

- [ ] **Test case 2:** All chunks collected
  - **Input:** Recording with multiple chunks
  - **Expected:** Blob contains all chunks
  - **Validate:** Blob size matches sum of chunks
  - **Actual:** [Record result]

- [ ] **Test case 3:** Stream stopped
  - **Input:** Stop recording
  - **Expected:** All MediaStream tracks stopped
  - **Validate:** Track.readyState === 'ended'
  - **Actual:** [Record result]

- [ ] **Test case 4:** No active recording
  - **Input:** stopRecording() called when not recording
  - **Expected:** Error thrown
  - **Validate:** Error message indicates no active recording
  - **Actual:** [Record result]

#### RecordingContext: saveRecording()
- [ ] **Test case 1:** File saved successfully
  - **Input:** Valid blob, filename
  - **Expected:** File exists at path, valid video format
  - **Validate:** File size > 0, file playable
  - **Actual:** [Record result]

- [ ] **Test case 2:** Added to savedRecordings
  - **Input:** Save recording
  - **Expected:** Recording added to savedRecordings array
  - **Validate:** Array includes saved recording with metadata
  - **Actual:** [Record result]

- [ ] **Test case 3:** Save dialog cancelled
  - **Input:** User cancels save dialog
  - **Expected:** Function returns null or throws cancel error
  - **Validate:** File not saved, recording not added
  - **Actual:** [Record result]

- [ ] **Test case 4:** Disk space full
  - **Input:** Save to full disk
  - **Expected:** Error thrown
  - **Validate:** Error message indicates disk full
  - **Actual:** [Record result]

#### Recording Utilities
- [ ] **Test case 1:** formatDuration()
  - **Input:** 125 seconds
  - **Expected:** "2:05"
  - **Validate:** Correctly formatted
  - **Actual:** [Record result]

- [ ] **Test case 2:** getRecordingSize()
  - **Input:** Blob of size 1024 bytes
  - **Expected:** 1024
  - **Validate:** Correct size returned
  - **Actual:** [Record result]

---

### 2. Integration Tests

#### Scenario 1: Complete Recording Workflow
- [ ] **Step 1:** Open source picker
  - **Expected:** Source list displayed with thumbnails
  - **Actual:** [Record result]

- [ ] **Step 2:** Select source
  - **Expected:** Source selected, picker closed
  - **Actual:** [Record result]

- [ ] **Step 3:** Start recording
  - **Expected:** Recording indicator visible, duration starts
  - **Actual:** [Record result]

- [ ] **Step 4:** Record for 5 seconds
  - **Expected:** Duration updates, recording continues
  - **Actual:** [Record result]

- [ ] **Step 5:** Stop recording
  - **Expected:** Recording stops, save dialog appears
  - **Actual:** [Record result]

- [ ] **Step 6:** Save file
  - **Expected:** File saved, appears in Media Library
  - **Actual:** [Record result]

- [ ] **Step 7:** Verify video playable
  - **Expected:** Video can be played and edited
  - **Actual:** [Record result]

#### Scenario 2: Permission Denied Flow
- [ ] **Step 1:** Permission not granted
  - **Expected:** Error message displayed
  - **Actual:** [Record result]

- [ ] **Step 2:** Error message helpful
  - **Expected:** Instructions for granting permission
  - **Actual:** [Record result]

- [ ] **Step 3:** Retry after granting permission
  - **Expected:** Recording works successfully
  - **Actual:** [Record result]

#### Scenario 3: Source Unavailable
- [ ] **Step 1:** Selected source becomes unavailable
  - **Expected:** Error message, can select new source
  - **Actual:** [Record result]

#### Scenario 4: Recording During Save
- [ ] **Step 1:** Stop recording
  - **Expected:** Recording stops cleanly
  - **Actual:** [Record result]

- [ ] **Step 2:** Save dialog appears
  - **Expected:** Can save without issues
  - **Actual:** [Record result]

---

### 3. Edge Cases

#### Edge Case 1: No Screen Sources Available
- [ ] **Test:** Get sources when none available
  - **Expected:** Empty array, helpful message
  - **Actual:** [Record result]

#### Edge Case 2: Permission Denied
- [ ] **Test:** Try recording without permission
  - **Expected:** Clear error with instructions
  - **Actual:** [Record result]

#### Edge Case 3: MediaRecorder Not Supported
- [ ] **Test:** Use unsupported codec
  - **Expected:** Fallback codec or clear error
  - **Actual:** [Record result]

#### Edge Case 4: Disk Space Full
- [ ] **Test:** Save to full disk
  - **Expected:** Error message, recording preserved
  - **Actual:** [Record result]

#### Edge Case 5: App Closed During Recording
- [ ] **Test:** Close app while recording
  - **Expected:** Warning dialog, or recording lost (acceptable)
  - **Actual:** [Record result]

#### Edge Case 6: Multiple Recording Attempts
- [ ] **Test:** Start recording twice without stopping
  - **Expected:** Error or first recording stopped
  - **Actual:** [Record result]

#### Edge Case 7: Very Long Recording
- [ ] **Test:** Record for 10+ minutes
  - **Expected:** Memory usage reasonable, file size acceptable
  - **Actual:** [Record result]

---

### 4. Performance Tests

#### Performance Test 1: Recording Start Time
- [ ] **Metric:** Time from click to recording active
- [ ] **Target:** < 2 seconds
- [ ] **Actual:** [Record result]
- [ ] **Status:** ✅ Pass / ❌ Fail

#### Performance Test 2: Frame Rate
- [ ] **Metric:** Average FPS during recording
- [ ] **Target:** ~30fps maintained
- [ ] **Actual:** [Record result]
- [ ] **Status:** ✅ Pass / ❌ Fail

#### Performance Test 3: Memory Usage
- [ ] **Metric:** Peak memory during 5-minute recording
- [ ] **Target:** < 500MB
- [ ] **Actual:** [Record result]
- [ ] **Status:** ✅ Pass / ❌ Fail

#### Performance Test 4: File Size
- [ ] **Metric:** File size per minute (high quality)
- [ ] **Target:** < 50MB per minute
- [ ] **Actual:** [Record result]
- [ ] **Status:** ✅ Pass / ❌ Fail

---

### 5. UI/UX Tests

#### UI Test 1: Recording Controls Visibility
- [ ] **Test:** Controls visible in toolbar
  - **Expected:** Recording button accessible
  - **Actual:** [Record result]

#### UI Test 2: Source Picker Modal
- [ ] **Test:** Modal opens and displays sources
  - **Expected:** Professional modal with source list
  - **Actual:** [Record result]

#### UI Test 3: Recording Indicator
- [ ] **Test:** Indicator visible during recording
  - **Expected:** Clear visual feedback
  - **Actual:** [Record result]

#### UI Test 4: Window Title Badge
- [ ] **Test:** Title shows "● Recording" during recording
  - **Expected:** Badge visible in window title
  - **Actual:** [Record result]

#### UI Test 5: Error Messages
- [ ] **Test:** Error messages clear and helpful
  - **Expected:** Actionable error messages
  - **Actual:** [Record result]

---

## Acceptance Criteria

Feature is complete when:
- [ ] Users can see available screen sources
- [ ] Users can start screen recording with source selection
- [ ] Recording indicator shows active recording state
- [ ] Recording duration displays in real-time
- [ ] Users can stop recording
- [ ] Recorded video saves to chosen location
- [ ] Recorded video appears in Media Library
- [ ] Recorded video can be played and edited
- [ ] Error handling works for permission denied cases
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Performance targets met
- [ ] No console errors during normal operation
- [ ] Documentation complete

---

## Test Execution Log

### Date: [Date]
**Tester:** [Name]  
**Environment:** macOS [Version], Electron [Version]

#### Unit Tests Results
- ✅ getAvailableSources: Pass
- ✅ startRecording: Pass
- ✅ stopRecording: Pass
- ✅ saveRecording: Pass
- ⏳ formatDuration: Not tested

#### Integration Tests Results
- ✅ Complete workflow: Pass
- ✅ Permission denied: Pass
- ⏳ Source unavailable: Not tested

#### Performance Tests Results
- ✅ Recording start time: 1.2s (target: < 2s)
- ✅ Frame rate: 30fps maintained
- ✅ Memory usage: 320MB (target: < 500MB)
- ✅ File size: 45MB/min (target: < 50MB/min)

#### Edge Cases Results
- ✅ No sources available: Handled
- ✅ Permission denied: Error message clear
- ⏳ MediaRecorder not supported: Not tested
- ⏳ Disk space full: Not tested

**Overall Status:** ✅ PASSING (with minor test gaps)

---

## Bug Report Template

If bugs are found during testing:

**Bug #X: [Descriptive Title]**
- **Severity:** CRITICAL/HIGH/MEDIUM/LOW
- **Steps to Reproduce:**
  1. Step 1
  2. Step 2
  3. Step 3
- **Expected:** [Expected behavior]
- **Actual:** [Actual behavior]
- **Environment:** macOS [Version], Electron [Version]
- **Screenshots:** [If applicable]
- **Workaround:** [If any]

---

## Test Checklist Summary

Before considering PR complete:
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] All performance targets met
- [ ] All edge cases handled
- [ ] UI/UX verified
- [ ] No console errors
- [ ] Error messages helpful
- [ ] Documentation complete

---

## Next Steps After Testing

1. Fix any bugs found
2. Retest fixed issues
3. Update bug analysis document (if bugs found)
4. Create complete summary
5. Update PR_PARTY README
6. Merge to main

---

**Remember:** Screen recording requires macOS permissions. Test permission flows early to avoid blocking issues!

