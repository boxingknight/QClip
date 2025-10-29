# ClipForge Export Test Suite

This directory contains test scripts to verify the export functionality of ClipForge.

## Test Files

### 1. `test-export.js`
**Basic export verification script**
- Checks if exported file exists
- Validates file size and readability
- Provides manual verification checklist

**Usage:**
```bash
node test-export.js
```

### 2. `test-export-advanced.js`
**Advanced export verification with metadata analysis**
- Uses FFprobe to analyze video metadata
- Validates resolution, codec, duration
- Falls back to basic validation if FFprobe unavailable

**Usage:**
```bash
node test-export-advanced.js
```

### 3. `open-exported-video.js`
**Opens exported video for manual verification**
- Automatically opens video in default player
- Cross-platform support (macOS, Windows, Linux)
- Provides detailed verification checklist

**Usage:**
```bash
node open-exported-video.js
```

### 4. `test-export-suite.js`
**Comprehensive test suite**
- Runs 10 different validation tests
- Checks file existence, size, permissions, age
- Validates export process and timeline configuration
- Provides detailed test results and success rate

**Usage:**
```bash
node test-export-suite.js
```

## Test Configuration

To test different exported files, update the file path in each script:

```javascript
const EXPORTED_FILE = '/path/to/your/exported/video.mp4';
```

## Expected Export Results

Based on the terminal logs, the current export should contain:
- **Clip 1:** `2videotirm.mp4` (trimmed to ~5.4 seconds)
- **Clip 2:** `3.mp4` (full duration ~4.0 seconds)
- **Total Duration:** ~9.4 seconds
- **Resolution:** 1920x1080 (Full HD)
- **File Size:** ~0.6 MB

## Manual Verification Checklist

When testing exports manually:

- [ ] Video plays without errors
- [ ] Video shows expected resolution (1920x1080)
- [ ] Audio is synchronized with video
- [ ] First clip shows trimmed content (~5.4s)
- [ ] Second clip plays after first clip ends (~4.0s)
- [ ] Total duration is approximately 9.4 seconds
- [ ] No black frames or gaps between clips
- [ ] Video quality looks good

## Troubleshooting

### FFprobe Not Found
If you see "ffprobe: command not found", the advanced metadata analysis will be skipped. This is normal and doesn't affect the basic validation.

### File Not Found
Make sure you have exported a video from ClipForge first. Update the `EXPORTED_FILE` path in the test scripts to match your exported file location.

### Permission Issues
Ensure the exported file has read permissions. The test scripts will check this automatically.

## Integration with CI/CD

These test scripts can be integrated into automated testing pipelines:

```bash
# Run all tests
node test-export-suite.js && echo "Export tests passed" || echo "Export tests failed"
```

## Test Results Interpretation

- **✅ PASSED:** Test completed successfully
- **❌ FAILED:** Test failed - needs investigation
- **⚠️ WARNING:** Test passed but with concerns

A 100% pass rate indicates the export functionality is working correctly.
