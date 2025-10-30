# PR#32: Picture-in-Picture Recording - Testing Guide

**Purpose:** Comprehensive testing strategy for PIP recording feature  
**Scope:** All functionality, edge cases, and integration points  
**Estimated Testing Time:** 2-3 hours

---

## Test Categories

### 1. Unit Tests

#### 1.1: PIP Position Calculation
**Function:** `calculatePIPPosition()`

- [ ] **Test Case 1.1.1:** Top-left position
  - Input: `position='top-left', canvasWidth=1920, canvasHeight=1080, pipWidth=480, pipHeight=270`
  - Expected: `{x: 20, y: 20}`
  - Actual: [Record result]

- [ ] **Test Case 1.1.2:** Top-right position
  - Input: `position='top-right', canvasWidth=1920, canvasHeight=1080, pipWidth=480, pipHeight=270`
  - Expected: `{x: 1420, y: 20}` (1920 - 480 - 20)
  - Actual: [Record result]

- [ ] **Test Case 1.1.3:** Bottom-left position
  - Input: `position='bottom-left', canvasWidth=1920, canvasHeight=1080, pipWidth=480, pipHeight=270`
  - Expected: `{x: 20, y: 790}` (1080 - 270 - 20)
  - Actual: [Record result]

- [ ] **Test Case 1.1.4:** Bottom-right position
  - Input: `position='bottom-right', canvasWidth=1920, canvasHeight=1080, pipWidth=480, pipHeight=270`
  - Expected: `{x: 1420, y: 790}`
  - Actual: [Record result]

#### 1.2: PIP Dimension Calculation
**Function:** `calculatePIPDimensions()`

- [ ] **Test Case 1.2.1:** Small size (15%)
  - Input: `sizePercent=15, screenWidth=1920, webcamAspectRatio=0.5625`
  - Expected: `{width: 288, height: 162}` (1920 * 0.15 = 288, 288 * 0.5625 = 162)
  - Actual: [Record result]

- [ ] **Test Case 1.2.2:** Medium size (25%)
  - Input: `sizePercent=25, screenWidth=1920, webcamAspectRatio=0.5625`
  - Expected: `{width: 480, height: 270}`
  - Actual: [Record result]

- [ ] **Test Case 1.2.3:** Large size (35%)
  - Input: `sizePercent=35, screenWidth=1920, webcamAspectRatio=0.5625`
  - Expected: `{width: 672, height: 378}`
  - Actual: [Record result]

- [ ] **Test Case 1.2.4:** Custom size (40%)
  - Input: `sizePercent=40, screenWidth=1920, webcamAspectRatio=0.5625`
  - Expected: `{width: 768, height: 432}`
  - Actual: [Record result]

#### 1.3: Audio Source Selection
**Function:** `selectAudioSource()`

- [ ] **Test Case 1.3.1:** Webcam audio only
  - Input: `audioSource='webcam', screenStream={no audio}, webcamStream={has audio}`
  - Expected: Returns webcam audio track
  - Actual: [Record result]

- [ ] **Test Case 1.3.2:** Screen audio only
  - Input: `audioSource='screen', screenStream={has audio}, webcamStream={no audio}`
  - Expected: Returns screen audio track
  - Actual: [Record result]

- [ ] **Test Case 1.3.3:** Both audio sources (mixing)
  - Input: `audioSource='both', screenStream={has audio}, webcamStream={has audio}`
  - Expected: Returns mixed audio track
  - Actual: [Record result]

- [ ] **Test Case 1.3.4:** Both audio sources (one missing)
  - Input: `audioSource='both', screenStream={no audio}, webcamStream={has audio}`
  - Expected: Returns webcam audio track (fallback)
  - Actual: [Record result]

- [ ] **Test Case 1.3.5:** No audio
  - Input: `audioSource='none', screenStream={has audio}, webcamStream={has audio}`
  - Expected: Returns null
  - Actual: [Record result]

---

### 2. Integration Tests

#### 2.1: Complete PIP Recording Workflow

- [ ] **Test Case 2.1.1:** Happy Path - Full Recording Workflow
  - [ ] Step 1: Select screen source → Screen stream acquired ✅
  - [ ] Step 2: Select webcam device → Webcam stream acquired ✅
  - [ ] Step 3: Configure PIP settings (top-right, 25%, webcam audio) → Settings updated ✅
  - [ ] Step 4: Preview shows composited view → Preview renders correctly ✅
  - [ ] Step 5: Start recording → MediaRecorder starts, recording indicator shows ✅
  - [ ] Step 6: Record for 30 seconds → Chunks collected, duration increments ✅
  - [ ] Step 7: Stop recording → Blob created successfully ✅
  - [ ] Step 8: Save recording → File saved to Media Library ✅
  - [ ] Step 9: Verify saved video → Both screen and webcam visible, audio works ✅

- [ ] **Test Case 2.1.2:** All Four Corner Positions
  - [ ] Top-left: PIP appears in top-left corner ✅
  - [ ] Top-right: PIP appears in top-right corner ✅
  - [ ] Bottom-left: PIP appears in bottom-left corner ✅
  - [ ] Bottom-right: PIP appears in bottom-right corner ✅
  - [ ] Recorded video matches preview for all positions ✅

- [ ] **Test Case 2.1.3:** All Size Presets
  - [ ] Small (15%): PIP appears at 15% size ✅
  - [ ] Medium (25%): PIP appears at 25% size ✅
  - [ ] Large (35%): PIP appears at 35% size ✅
  - [ ] Custom (40%): PIP appears at 40% size ✅
  - [ ] Recorded video matches preview for all sizes ✅

- [ ] **Test Case 2.1.4:** All Audio Sources
  - [ ] Webcam audio: Only webcam microphone recorded ✅
  - [ ] Screen audio: Only system audio recorded ✅
  - [ ] Both audio: Both sources mixed and recorded ✅
  - [ ] None: No audio in recording (silent) ✅

#### 2.2: Preview Functionality

- [ ] **Test Case 2.2.1:** Preview Updates on Settings Change
  - [ ] Change position → Preview updates immediately ✅
  - [ ] Change size → Preview updates immediately ✅
  - [ ] Preview matches recorded output ✅

- [ ] **Test Case 2.2.2:** Preview Shows Both Streams
  - [ ] Screen content visible in preview ✅
  - [ ] Webcam overlay visible in preview ✅
  - [ ] Both streams synchronized ✅

#### 2.3: Integration with Existing Features

- [ ] **Test Case 2.3.1:** RecordingControls Mode Switching
  - [ ] Switch from Screen → PIP mode ✅
  - [ ] Switch from Webcam → PIP mode ✅
  - [ ] Switch from PIP → Screen mode ✅
  - [ ] Mode switching disabled during recording ✅

- [ ] **Test Case 2.3.2:** Media Library Integration
  - [ ] PIP recording appears in Media Library ✅
  - [ ] Metadata extracted correctly (duration, resolution, etc.) ✅
  - [ ] Thumbnail generated (first frame) ✅
  - [ ] PIP recording can be dragged to timeline ✅
  - [ ] PIP recording plays correctly in video player ✅

---

### 3. Edge Cases

#### 3.1: Permission Handling

- [ ] **Test Case 3.1.1:** Screen Permission Denied
  - [ ] Screen permission denied → Clear error message shown ✅
  - [ ] Recording cannot start ✅
  - [ ] User can try again after granting permission ✅

- [ ] **Test Case 3.1.2:** Webcam Permission Denied
  - [ ] Webcam permission denied → Clear error message shown ✅
  - [ ] Recording cannot start ✅
  - [ ] User can try again after granting permission ✅

- [ ] **Test Case 3.1.3:** Both Permissions Denied
  - [ ] Both permissions denied → Error messages shown ✅
  - [ ] Recording cannot start ✅

#### 3.2: Device Disconnection

- [ ] **Test Case 3.2.1:** Screen Source Disconnects During Recording
  - [ ] Screen source disconnects → Recording stops gracefully ✅
  - [ ] Error message shown ✅
  - [ ] Partial recording saved if possible ✅
  - [ ] Resources cleaned up ✅

- [ ] **Test Case 3.2.2:** Webcam Disconnects During Recording
  - [ ] Webcam disconnects → Recording stops gracefully ✅
  - [ ] Error message shown ✅
  - [ ] Partial recording saved if possible ✅
  - [ ] Resources cleaned up ✅

#### 3.3: Missing Audio Sources

- [ ] **Test Case 3.3.1:** Screen Stream Has No Audio
  - [ ] Select "Both" audio → Falls back to webcam audio ✅
  - [ ] Select "Screen" audio → No audio recorded (acceptable) ✅

- [ ] **Test Case 3.3.2:** Webcam Stream Has No Audio
  - [ ] Select "Both" audio → Falls back to screen audio ✅
  - [ ] Select "Webcam" audio → No audio recorded (acceptable) ✅

- [ ] **Test Case 3.3.3:** Both Streams Have No Audio
  - [ ] Select any audio source → No audio recorded (acceptable) ✅
  - [ ] Recording continues without audio ✅

#### 3.4: Performance & Stability

- [ ] **Test Case 3.4.1:** Long Recording (30+ minutes)
  - [ ] Record for 30+ minutes → No memory leaks ✅
  - [ ] Recording continues smoothly ✅
  - [ ] File saves successfully ✅

- [ ] **Test Case 3.4.2:** High Resolution Screen
  - [ ] 4K screen (3840x2160) → Performance acceptable ✅
  - [ ] PIP scales correctly ✅
  - [ ] Recording works ✅

- [ ] **Test Case 3.4.3:** Different Aspect Ratios
  - [ ] 16:9 screen, 4:3 webcam → PIP maintains webcam aspect ratio ✅
  - [ ] 16:10 screen, 16:9 webcam → PIP maintains webcam aspect ratio ✅

#### 3.5: Canvas Rendering

- [ ] **Test Case 3.5.1:** Canvas Rendering Loop
  - [ ] Rendering loop runs at ~30fps ✅
  - [ ] No dropped frames in normal operation ✅
  - [ ] CPU usage acceptable (< 30% on test machine) ✅

- [ ] **Test Case 3.5.2:** Canvas Stream Capture
  - [ ] Canvas stream has video track ✅
  - [ ] Canvas stream resolution matches screen ✅
  - [ ] Canvas stream frame rate is 30fps ✅

---

### 4. Manual Testing

#### 4.1: UI Testing

- [ ] **Test Case 4.1.1:** PIP Mode Selection
  - [ ] PIP mode button visible in RecordingControls ✅
  - [ ] Clicking PIP mode shows PIP controls ✅
  - [ ] Mode switching disabled during recording ✅

- [ ] **Test Case 4.1.2:** Source Selection
  - [ ] Screen source picker shows available sources ✅
  - [ ] Webcam device selector shows available devices ✅
  - [ ] Both selections required before recording ✅

- [ ] **Test Case 4.1.3:** Settings Panel
  - [ ] Position dropdown works (all 4 corners) ✅
  - [ ] Size presets work (Small/Medium/Large) ✅
  - [ ] Size slider works (10-50%) ✅
  - [ ] Audio source dropdown works (all 4 options) ✅

- [ ] **Test Case 4.1.4:** Preview Window
  - [ ] Preview shows when both sources selected ✅
  - [ ] Preview updates when settings change ✅
  - [ ] Preview shows recording indicator during recording ✅

- [ ] **Test Case 4.1.5:** Recording Controls
  - [ ] Start button disabled until sources selected ✅
  - [ ] Start button works → Recording starts ✅
  - [ ] Stop button works → Recording stops ✅
  - [ ] Recording indicator shows duration ✅

#### 4.2: Visual Testing

- [ ] **Test Case 4.2.1:** PIP Appearance
  - [ ] PIP appears in correct corner ✅
  - [ ] PIP size matches settings ✅
  - [ ] PIP maintains aspect ratio ✅
  - [ ] PIP has padding from edges (20px) ✅

- [ ] **Test Case 4.2.2:** Preview vs Output
  - [ ] Preview matches recorded output exactly ✅
  - [ ] Same corner position ✅
  - [ ] Same size ✅
  - [ ] Same composition ✅

- [ ] **Test Case 4.2.3:** Recording Indicator
  - [ ] Indicator visible during recording ✅
  - [ ] Duration updates every second ✅
  - [ ] Visual feedback clear ✅

#### 4.3: Error States

- [ ] **Test Case 4.3.1:** Error Messages
  - [ ] Permission errors show clear messages ✅
  - [ ] Device errors show clear messages ✅
  - [ ] Recording errors show clear messages ✅

- [ ] **Test Case 4.3.2:** Graceful Degradation
  - [ ] App doesn't crash on errors ✅
  - [ ] User can retry after errors ✅
  - [ ] State resets properly after errors ✅

---

### 5. Performance Tests

#### 5.1: Frame Rate

- [ ] **Test Case 5.1.1:** Canvas Rendering FPS
  - [ ] Rendering maintains 30fps (±1fps) ✅
  - [ ] No frame drops during normal operation ✅
  - [ ] FPS monitor shows consistent 30fps ✅

#### 5.2: Memory Usage

- [ ] **Test Case 5.2.1:** Memory During Recording
  - [ ] Memory usage < 800MB during recording ✅
  - [ ] No memory leaks during 10+ minute recording ✅
  - [ ] Memory freed after recording stops ✅

#### 5.3: CPU Usage

- [ ] **Test Case 5.3.1:** CPU During Recording
  - [ ] CPU usage acceptable (< 30% on test machine) ✅
  - [ ] Canvas compositing doesn't spike CPU ✅

#### 5.4: File Size

- [ ] **Test Case 5.4.1:** Recorded File Size
  - [ ] File size ~3-4MB per minute ✅
  - [ ] Size consistent across recordings ✅
  - [ ] Size matches expectations (VP9 codec) ✅

---

## Acceptance Criteria

**Feature is complete when all of these pass:**

### Functional Requirements
- [ ] Can select both screen source and webcam device
- [ ] Can configure PIP position (4 corners)
- [ ] Can configure PIP size (15%-50%)
- [ ] Can select audio source (webcam/screen/both/none)
- [ ] Can preview composited view
- [ ] Can start PIP recording
- [ ] Can stop PIP recording
- [ ] Recording saves to Media Library
- [ ] Saved video shows both sources correctly composited
- [ ] Audio from selected source works

### Quality Requirements
- [ ] Preview matches recorded output exactly
- [ ] PIP appears in correct corner with correct size
- [ ] All corner positions work
- [ ] All size presets work
- [ ] All audio source options work
- [ ] Performance acceptable (30fps, < 800MB memory)
- [ ] Error handling comprehensive

### User Experience Requirements
- [ ] UI is intuitive and easy to use
- [ ] Error messages are clear and helpful
- [ ] Recording workflow is smooth
- [ ] Settings changes update preview immediately

---

## Test Results Template

### Test Session: [Date]

**Environment:**
- OS: [macOS/Windows/Linux]
- Electron Version: [version]
- Screen Resolution: [resolution]
- Webcam: [device/model]

**Results:**
- Total Tests: X
- Passed: Y
- Failed: Z
- Skipped: W

**Failed Tests:**
- Test Case X.Y.Z: [Description of failure]

**Notes:**
- [Any observations or issues]

---

## Regression Tests

**After completing PR#32, verify these still work:**

- [ ] Screen recording (PR#17) still works ✅
- [ ] Webcam recording (PR#18) still works ✅
- [ ] Media Library import still works ✅
- [ ] Timeline editing still works ✅
- [ ] Video export still works ✅

---

**Testing Status:** ⏳ READY TO TEST

**Next Step:** Run tests during implementation (after each phase) and complete testing guide after feature is complete.

