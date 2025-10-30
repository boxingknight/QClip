# PR#23: Testing Guide

**Testing Strategy:** Comprehensive unit, integration, and manual testing  
**Focus Areas:** Settings management, FFmpeg integration, UI components, validation

---

## Test Categories

### 1. Unit Tests

#### Export Settings Context
**Function:** `ExportContext`  
**Test Cases:**
- [ ] **Default settings loaded correctly**
  - Input: New context instance
  - Expected: Default settings object with all required fields
  - Actual: [Record result]

- [ ] **Settings update works**
  - Input: `updateSettings({ format: 'mov' })`
  - Expected: Settings format changed to 'mov'
  - Actual: [Record result]

- [ ] **Preset loading works**
  - Input: `loadPreset('web')`
  - Expected: Settings match web preset configuration
  - Actual: [Record result]

- [ ] **Settings reset works**
  - Input: `resetToDefaults()`
  - Expected: Settings return to default values
  - Actual: [Record result]

#### File Size Estimation
**Function:** `estimateFileSize(duration, settings)`  
**Test Cases:**
- [ ] **Basic calculation works**
  - Input: 60 seconds, 2000k video bitrate, 128k audio bitrate
  - Expected: ~16MB (approximately)
  - Actual: [Record result]

- [ ] **Bitrate parsing works**
  - Input: '5000k' bitrate string
  - Expected: 5000 converted to bytes correctly
  - Actual: [Record result]

- [ ] **Format conversion works**
  - Input: Large size in bytes
  - Expected: Correct MB/GB formatting
  - Actual: [Record result]

#### Settings Validation
**Function:** `validateExportSettings(settings)`  
**Test Cases:**
- [ ] **Valid settings pass**
  - Input: Valid settings object
  - Expected: `{ valid: true, errors: [] }`
  - Actual: [Record result]

- [ ] **Invalid resolution detected**
  - Input: Custom resolution with negative dimensions
  - Expected: Error in errors array
  - Actual: [Record result]

- [ ] **Invalid bitrate detected**
  - Input: Video bitrate too low (< 100k)
  - Expected: Error in errors array
  - Actual: [Record result]

- [ ] **Codec format mismatch detected**
  - Input: WebM format with H.264 codec
  - Expected: Error in errors array
  - Actual: [Record result]

---

### 2. Integration Tests

#### Settings Persistence
**Scenario:** Settings save and load correctly
- [ ] **Test localStorage persistence**
  - Step 1: Update settings
  - Step 2: Refresh app
  - Step 3: Check settings loaded
  - Expected: Settings match previous values
  - Actual: [Record result]

- [ ] **Test settings reset doesn't persist**
  - Step 1: Reset to defaults
  - Step 2: Refresh app
  - Step 3: Check settings
  - Expected: Settings remain at defaults
  - Actual: [Record result]

#### Modal Integration
**Scenario:** Settings modal works with UIContext
- [ ] **Test modal opening**
  - Step 1: Click settings button in ExportPanel
  - Step 2: Verify modal opens
  - Expected: Modal visible with settings
  - Actual: [Record result]

- [ ] **Test modal closing**
  - Step 1: Open modal
  - Step 2: Click cancel
  - Step 3: Verify modal closes
  - Expected: Modal closed, settings unchanged
  - Actual: [Record result]

- [ ] **Test settings apply**
  - Step 1: Open modal
  - Step 2: Change settings
  - Step 3: Click apply
  - Expected: Settings saved, modal closed
  - Actual: [Record result]

#### Export Workflow
**Scenario:** Export with different preset configurations
- [ ] **Test Web preset export**
  - Step 1: Select Web preset
  - Step 2: Export video
  - Step 3: Verify output file
  - Expected: MP4 file with 1080p, 2000k bitrate
  - Actual: [Record result]

- [ ] **Test Broadcast preset export**
  - Step 1: Select Broadcast preset
  - Step 2: Export video
  - Step 3: Verify output file
  - Expected: MOV file with 1080p, 50000k bitrate
  - Actual: [Record result]

- [ ] **Test Archival preset export**
  - Step 1: Select Archival preset
  - Step 2: Export video
  - Step 3: Verify output file
  - Expected: MOV file with 4K, 100000k bitrate
  - Actual: [Record result]

- [ ] **Test custom settings export**
  - Step 1: Set custom settings
  - Step 2: Export video
  - Step 3: Verify output file matches settings
  - Expected: Output matches custom settings
  - Actual: [Record result]

---

### 3. Edge Cases

#### Resolution Edge Cases
- [ ] **Minimum resolution (1x1)**
  - Input: Custom resolution 1x1
  - Expected: Validation error or warning
  - Actual: [Record result]

- [ ] **Maximum resolution (8K)**
  - Input: Custom resolution 7680x4320
  - Expected: Validation error (too high)
  - Actual: [Record result]

- [ ] **Odd dimensions**
  - Input: Custom resolution 1921x1081
  - Expected: Validation error (must be even)
  - Actual: [Record result]

#### Bitrate Edge Cases
- [ ] **Very low bitrate**
  - Input: Video bitrate 50k
  - Expected: Validation error (too low)
  - Actual: [Record result]

- [ ] **Very high bitrate**
  - Input: Video bitrate 200000k
  - Expected: Validation error (too high)
  - Actual: [Record result]

- [ ] **Invalid bitrate format**
  - Input: Video bitrate 'invalid'
  - Expected: Validation error or default
  - Actual: [Record result]

#### Framerate Edge Cases
- [ ] **Very low framerate**
  - Input: Custom framerate 0.5
  - Expected: Validation error
  - Actual: [Record result]

- [ ] **Very high framerate**
  - Input: Custom framerate 200
  - Expected: Validation error (max 120)
  - Actual: [Record result]

- [ ] **Source framerate with trimmed video**
  - Input: Source framerate, trimmed video
  - Expected: Original framerate preserved
  - Actual: [Record result]

#### Codec Format Combinations
- [ ] **WebM with H.264 codec**
  - Input: WebM format, libx264 codec
  - Expected: Validation error
  - Actual: [Record result]

- [ ] **WebM with AAC audio**
  - Input: WebM format, AAC audio codec
  - Expected: Validation error
  - Actual: [Record result]

- [ ] **MP4 with VP9 codec**
  - Input: MP4 format, libvpx-vp9 codec
  - Expected: Validation error or warning
  - Actual: [Record result]

---

### 4. Performance Tests

#### Modal Performance
- [ ] **Modal open time**
  - Test: Measure time from button click to modal visible
  - Target: < 200ms
  - Actual: [Record result]

- [ ] **Settings update time**
  - Test: Measure time from setting change to UI update
  - Target: < 50ms
  - Actual: [Record result]

- [ ] **File size calculation time**
  - Test: Measure time to calculate file size
  - Target: < 10ms
  - Actual: [Record result]

#### Export Performance
- [ ] **Export with Web preset**
  - Test: Export 60s video with Web preset
  - Target: < 2x video duration
  - Actual: [Record result]

- [ ] **Export with Broadcast preset**
  - Test: Export 60s video with Broadcast preset
  - Target: < 3x video duration
  - Actual: [Record result]

- [ ] **Export with Archival preset**
  - Test: Export 60s video with Archival preset
  - Target: < 5x video duration
  - Actual: [Record result]

- [ ] **Export with custom settings**
  - Test: Export 60s video with custom settings
  - Target: < 3x video duration
  - Actual: [Record result]

---

### 5. UI/UX Tests

#### Modal Usability
- [ ] **Basic settings visible first**
  - Test: Open modal, check basic settings visible
  - Expected: Format, resolution, quality visible
  - Actual: [Record result]

- [ ] **Advanced settings collapsible**
  - Test: Toggle advanced settings
  - Expected: Advanced section expands/collapses
  - Actual: [Record result]

- [ ] **Preset selection clear**
  - Test: Click preset card
  - Expected: Settings update, preset visual feedback
  - Actual: [Record result]

- [ ] **File size updates in real-time**
  - Test: Change quality setting
  - Expected: File size estimate updates immediately
  - Actual: [Record result]

#### Responsive Design
- [ ] **Modal fits on small screens**
  - Test: Resize window to 800px width
  - Expected: Modal responsive, no overflow
  - Actual: [Record result]

- [ ] **Settings grid responsive**
  - Test: Resize window, check settings grid
  - Expected: Grid adapts to screen size
  - Actual: [Record result]

#### Error Display
- [ ] **Validation errors visible**
  - Test: Enter invalid settings
  - Expected: Errors displayed clearly
  - Actual: [Record result]

- [ ] **Error messages helpful**
  - Test: Read error messages
  - Expected: Messages explain what's wrong and how to fix
  - Actual: [Record result]

- [ ] **Apply button disabled with errors**
  - Test: Enter invalid settings
  - Expected: Apply button disabled
  - Actual: [Record result]

---

## Acceptance Criteria

Feature is complete when:

### Functional Criteria
- [ ] Export settings modal opens from ExportPanel
- [ ] Basic settings (format, resolution, quality) work correctly
- [ ] Preset system loads and applies correctly
- [ ] Advanced settings (codec, bitrate) are functional
- [ ] Settings persist between app sessions
- [ ] File size estimation is accurate (±10%)
- [ ] FFmpeg commands use custom settings
- [ ] All presets produce valid exports
- [ ] Settings validation prevents invalid configurations

### Quality Criteria
- [ ] Modal open time < 200ms
- [ ] Settings update < 50ms
- [ ] File size calculation < 10ms
- [ ] Export with custom settings < 2x video duration
- [ ] Zero critical bugs
- [ ] UI matches professional video editor standards
- [ ] Error messages are helpful and actionable

### UX Criteria
- [ ] Settings UI is intuitive
- [ ] Presets meet common use case needs
- [ ] File size estimates help users make decisions
- [ ] Workflow feels smooth and professional
- [ ] Advanced settings don't overwhelm basic users

---

## Test Data

### Test Videos
- **Short video:** 10 seconds, 1080p, MP4
- **Medium video:** 60 seconds, 1080p, MP4
- **Long video:** 5 minutes, 1080p, MP4
- **4K video:** 30 seconds, 4K, MOV
- **Low quality:** 60 seconds, 720p, MP4

### Test Settings Combinations
- Web preset with short video
- Broadcast preset with medium video
- Archival preset with 4K video
- Custom settings with various combinations

---

## Bug Reporting Template

### Bug #X: [Title]
**Severity:** CRITICAL/HIGH/MEDIUM/LOW  
**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected:** [Expected behavior]  
**Actual:** [Actual behavior]  
**Screenshot:** [If applicable]  
**Console Errors:** [If applicable]

---

## Testing Checklist

### Before Testing
- [ ] All prerequisites complete
- [ ] FFmpeg working correctly
- [ ] Test videos prepared
- [ ] Development environment set up

### During Testing
- [ ] Follow test cases systematically
- [ ] Record actual results for each test
- [ ] Note any bugs encountered
- [ ] Test edge cases thoroughly

### After Testing
- [ ] All acceptance criteria met
- [ ] Performance targets achieved
- [ ] Bugs documented and fixed
- [ ] Test results documented

---

## Success Criteria Summary

**Feature is ready when:**
- ✅ All unit tests pass
- ✅ All integration tests pass
- ✅ All edge cases handled
- ✅ Performance targets met
- ✅ UI/UX criteria satisfied
- ✅ Zero critical bugs
- ✅ Documentation complete

**Status:** 🟡 IN PROGRESS → 🟢 READY FOR PRODUCTION
