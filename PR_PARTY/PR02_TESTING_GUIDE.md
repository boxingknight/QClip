# PR#2: Testing Guide

**Purpose:** Comprehensive testing strategy for file import system  
**Scope:** Unit tests, integration tests, edge cases, and acceptance criteria  
**Time:** 30 minutes allocated for testing

---

## Test Categories

### 1. Unit Tests

**Test Suite: `src/utils/fileHelpers.js`**

#### Test 1.1: isValidVideoFile() - MP4
**Test:** Valid MP4 file passes validation  
**Input:** File object with name "test.mp4"  
**Expected:** Returns true  
**Code:**
```javascript
const file = new File(['test'], 'test.mp4');
expect(isValidVideoFile(file)).toBe(true);
```

#### Test 1.2: isValidVideoFile() - MOV
**Test:** Valid MOV file passes validation  
**Input:** File object with name "test.mov"  
**Expected:** Returns true  
**Code:**
```javascript
const file = new File(['test'], 'test.mov');
expect(isValidVideoFile(file)).toBe(true);
```

#### Test 1.3: isValidVideoFile() - Invalid Extension
**Test:** Invalid extension fails validation  
**Input:** File object with name "test.avi"  
**Expected:** Returns false  
**Code:**
```javascript
const file = new File(['test'], 'test.avi');
expect(isValidVideoFile(file)).toBe(false);
```

#### Test 1.4: isValidVideoFile() - Case Insensitive
**Test:** Uppercase extensions work  
**Input:** File object with name "TEST.MP4"  
**Expected:** Returns true  
**Code:**
```javascript
const file = new File(['test'], 'TEST.MP4');
expect(isValidVideoFile(file)).toBe(true);
```

#### Test 1.5: isFileSizeValid() - Valid Size
**Test:** File under limit passes  
**Input:** File with size 1024 * 1024 (1MB)  
**Expected:** Returns true  
**Code:**
```javascript
const file = { size: 1024 * 1024 };
expect(isFileSizeValid(file, 2048)).toBe(true);
```

#### Test 1.6: isFileSizeValid() - Too Large
**Test:** File over limit fails  
**Input:** File with size 3 * 1024 * 1024 * 1024 (3GB)  
**Expected:** Returns false  
**Code:**
```javascript
const file = { size: 3 * 1024 * 1024 * 1024 };
expect(isFileSizeValid(file, 2048)).toBe(false);
```

#### Test 1.7: validateFile() - Valid File
**Test:** Valid MP4 file passes all checks  
**Input:** Valid File object  
**Expected:** { valid: true, error: null }  
**Code:**
```javascript
const file = new File(['test'], 'test.mp4');
const result = validateFile(file);
expect(result.valid).toBe(true);
expect(result.error).toBeNull();
```

#### Test 1.8: validateFile() - Invalid Format
**Test:** Invalid format returns error  
**Input:** File with .avi extension  
**Expected:** { valid: false, error: "Unsupported format..." }  
**Code:**
```javascript
const file = new File(['test'], 'test.avi');
const result = validateFile(file);
expect(result.valid).toBe(false);
expect(result.error).toContain('Unsupported');
```

#### Test 1.9: validateFile() - File Too Large
**Test:** File exceeding limit returns error  
**Input:** File with 3GB size  
**Expected:** { valid: false, error: "File is too large..." }  
**Code:**
```javascript
const file = { name: 'test.mp4', size: 3 * 1024 * 1024 * 1024 };
const result = validateFile(file);
expect(result.valid).toBe(false);
expect(result.error).toContain('too large');
```

**Test Summary:**
- ✅ Valid formats pass validation
- ✅ Invalid formats fail with error
- ✅ Size limits enforced correctly
- ✅ Edge cases handled

---

### 2. Integration Tests

#### Test 2.1: Drag-and-Drop Import - Single MP4
**Scenario:** User drags single MP4 file onto import panel  
**Steps:**
1. Prepare test MP4 file (sample.mp4)
2. Open ClipForge in Electron
3. Drag file over import panel
4. Observe visual feedback (border highlight)
5. Drop file onto panel
6. Wait for import to complete

**Expected Results:**
- ✅ Visual feedback during drag (border color changes)
- ✅ File imports successfully
- ✅ Clip appears in clips array
- ✅ UI displays imported file
- ✅ No console errors
- ✅ No crashes

**Verification:**
```javascript
// In App.js, after import
console.log('Clips:', clips);
// Should show: [{ id: '...', name: 'sample.mp4', ... }]
```

#### Test 2.2: File Picker Import - Multiple Files
**Scenario:** User clicks "Browse Files" and selects multiple files  
**Steps:**
1. Open ClipForge
2. Click "Browse Files" button
3. File dialog opens
4. Select 3 MP4 files using Ctrl/Cmd+Click
5. Click "Open"
6. Wait for import

**Expected Results:**
- ✅ File dialog opens
- ✅ Can select multiple files
- ✅ All valid files imported
- ✅ All files appear in UI
- ✅ Import completes in <2 seconds

**Verification:**
```javascript
console.log('Clips count:', clips.length);
// Should be: 3
```

#### Test 2.3: Drag Invalid File
**Scenario:** User drags .avi file (unsupported)  
**Steps:**
1. Prepare test AVI file
2. Drag file onto panel
3. Drop file

**Expected Results:**
- ✅ File rejected
- ✅ Error message displayed: "Unsupported format..."
- ✅ File NOT added to clips
- ✅ App doesn't crash
- ✅ Can still import valid files after error

**Verification:**
```javascript
// Error should be displayed in UI
// Clips array should be empty or unchanged
```

#### Test 2.4: Import Large File
**Scenario:** User imports large video file (>500MB)  
**Steps:**
1. Prepare large MP4 file (500MB+)
2. Drag file onto panel
3. Drop and wait for import

**Expected Results:**
- ✅ File imports successfully
- ✅ Import completes without memory issues
- ✅ Clip appears in UI
- ✅ Performance acceptable (<5 seconds)
- ✅ No lag in UI

**Verification:**
```javascript
// Monitor memory usage in DevTools
// Should not spike dramatically
```

#### Test 2.5: Multiple Imports
**Scenario:** User imports files multiple times  
**Steps:**
1. Import 2 files
2. Import 1 more file
3. Import 1 more file

**Expected Results:**
- ✅ All files added to array
- ✅ No duplicates removed
- ✅ UI updates with each import
- ✅ Clips count: 4
- ✅ State persists correctly

**Verification:**
```javascript
console.log('Total clips:', clips.length);
// Should be: 4
```

---

### 3. Edge Cases

#### Edge Case 1: Empty File Upload
**Test:** Attempt to upload with no file selected  
**Input:** Empty file selection  
**Expected:** No error, no crash, graceful handling  
**Code:**
```javascript
// File input onChange with no files
// Should not crash
```

#### Edge Case 2: Very Long Filename
**Test:** File with very long name (100+ characters)  
**Input:** File named "a".repeat(100) + ".mp4"  
**Expected:** File imports, name displayed (truncated if needed)  
**Verification:**
```javascript
console.log(clip.name);
// Should not crash or overflow UI
```

#### Edge Case 3: Special Characters in Filename
**Test:** File with special characters  
**Input:** "test (2024).mp4" or "test_file-v2.mp4"  
**Expected:** File imports successfully  
**Verification:**
```javascript
// No encoding issues, path works correctly
```

#### Edge Case 4: File Deleted After Import
**Test:** Delete file from filesystem after import  
**Input:** Import file, then delete from filesystem  
**Expected:** File already imported, no immediate error  
**Note:** Error will occur during playback (acceptable)

#### Edge Case 5: Corrupted File
**Test:** File with correct extension but corrupted data  
**Input:** .mp4 file with invalid video data  
**Expected:** File imports, error occurs during playback  
**Note:** Don't validate file contents on import (too slow)

---

### 4. Performance Tests

#### Performance Test 1: Import Speed
**Test:** Measure time for import operation  
**Target:** <1 second for single file  
**Method:**
```javascript
const startTime = performance.now();
// Trigger import
const endTime = performance.now();
console.log('Import time:', endTime - startTime);
```

**Expected:** <1000ms

#### Performance Test 2: Multiple File Import
**Test:** Import 10 files simultaneously  
**Target:** <3 seconds total  
**Expected:** All files import within reasonable time

#### Performance Test 3: Memory Usage
**Test:** Monitor memory during import  
**Target:** No memory leaks  
**Method:**
```javascript
// Use Chrome DevTools Memory Profiler
// Import 10 files
// Check for memory leaks
```

**Expected:** Memory returns to baseline

#### Performance Test 4: UI Responsiveness
**Test:** UI remains responsive during import  
**Target:** No lag or freeze  
**Method:** Try to interact with UI during import

**Expected:** UI stays responsive, no freezing

---

### 5. Accessibility Tests

#### A11y Test 1: Keyboard Navigation
**Test:** Can navigate import panel with keyboard  
**Steps:**
1. Tab to "Browse Files" button
2. Press Enter to activate
3. Use keyboard to select file in dialog

**Expected:** All interactions work with keyboard

#### A11y Test 2: Screen Reader
**Test:** Screen reader announces import actions  
**Expected:** "Browse Files" button announced  
**Expected:** "Drag video files here" text announced

#### A11y Test 3: Error Messages
**Test:** Error messages are announced  
**Expected:** Screen reader announces error message  
**Expected:** Error message is descriptive

---

## Acceptance Criteria

### Feature is complete when:

- [ ] ✅ Can import MP4 files via drag-and-drop
- [ ] ✅ Can import MOV files via file picker
- [ ] ✅ Can import multiple files
- [ ] ✅ Unsupported formats show helpful error
- [ ] ✅ Files too large show helpful error
- [ ] ✅ Imported files appear in UI
- [ ] ✅ Clips stored in app state correctly
- [ ] ✅ No crashes on invalid files
- [ ] ✅ Visual feedback during drag-over
- [ ] ✅ Loading state during import
- [ ] ✅ Performance acceptable (<1s)
- [ ] ✅ Memory usage stable
- [ ] ✅ Console clean (no errors)
- [ ] ✅ All unit tests pass
- [ ] ✅ All integration tests pass
- [ ] ✅ Edge cases handled gracefully

---

## Manual Test Checklist

**Before committing PR #2, verify:**

- [ ] Drag MP4 file onto app → imports successfully
- [ ] Drag MOV file onto app → imports successfully
- [ ] Click "Browse Files" → file dialog opens
- [ ] Select MP4 file → imports successfully
- [ ] Drag .avi file → error message displayed
- [ ] Drag multiple files → all valid files imported
- [ ] Drag large file (>100MB) → imports without issues
- [ ] Imported files displayed in UI
- [ ] Can import files multiple times
- [ ] Visual feedback works (border highlight)
- [ ] Error messages are clear
- [ ] No console errors
- [ ] App doesn't crash on invalid input
- [ ] Performance is responsive
- [ ] Memory usage is stable

---

## Debugging Guide

### Issue: File Won't Import
**Symptoms:** No file appears after drag-drop  
**Debug:**
```javascript
// Add console.log in processFiles()
console.log('Files:', files);
console.log('Validation:', validateFile(file));
console.log('File path:', filePath);
```

### Issue: IPC Communication Failed
**Symptoms:** window.electronAPI is undefined  
**Debug:**
```javascript
console.log(window.electronAPI);
// Check preload.js is loaded
```

### Issue: Error Message Not Displayed
**Symptoms:** Invalid file imported without error  
**Debug:**
```javascript
// Check error state
console.log('Error state:', error);
// Verify setError() is called
```

---

## Next Steps

After all tests pass:

1. **Commit code:** `git commit -m "feat(import): complete file import system"`
2. **Run final checks:** No console errors, no memory leaks
3. **Update checklist:** Mark all items complete
4. **Proceed to PR #3:** Video Player component

**Testing Time:** ~30 minutes  
**Quality Gates:** All acceptance criteria met

---

**Remember:** Tests are documentation that the feature works. If tests pass, you can confidently move to the next feature! ✅


