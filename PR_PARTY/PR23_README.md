# PR#23: Advanced Export Settings - Quick Start

---

## TL;DR (30 seconds)

**What:** Professional export settings with format, resolution, quality, and encoding controls for ClipForge video exports.

**Why:** Transform ClipForge from basic "export MP4" to professional video editor with customizable output quality and format options.

**Time:** 4-6 hours estimated

**Complexity:** MEDIUM

**Status:** 📋 PLANNING COMPLETE

---

## Decision Framework (2 minutes)

### Should You Build This?

**Green Lights (Build it!):**
- ✅ PRs #11-16 complete (State Management, UI Components, Timeline, Drag & Drop, Split & Delete, Undo/Redo)
- ✅ Have 4-6 hours available
- ✅ Want professional export capabilities
- ✅ Users need quality control over video output

**Red Lights (Skip/defer it!):**
- ❌ Previous PRs not complete (missing foundation)
- ❌ Time-constrained (<4 hours)
- ❌ Basic export is sufficient for current needs
- ❌ Not interested in advanced video processing

**Decision Aid:** If you have a working video editor with basic export and want to make it professional-grade, this is essential. If you're still building core features, defer until later.

---

## Prerequisites (5 minutes)

### Required
- [ ] PR #11 (State Management Refactor) complete
- [ ] PR #12 (UI Component Library) complete  
- [ ] PR #13 (Professional Timeline) complete
- [ ] PR #14 (Drag & Drop) complete
- [ ] PR #15 (Split & Delete) complete
- [ ] PR #16 (Undo/Redo) complete
- [ ] FFmpeg working in current setup
- [ ] Modal system working (from PR #12)

### Setup Commands
```bash
# 1. Verify FFmpeg is working
npm run test-export

# 2. Check current export functionality
# Import a video, trim it, export it

# 3. Create branch
git checkout -b feature/pr23-advanced-export-settings
```

---

## Getting Started (First Hour)

### Step 1: Read Documentation (45 minutes)
- [ ] Read this quick start (10 min)
- [ ] Read main specification (25 min)
- [ ] Review implementation checklist (10 min)
- [ ] Note any questions

### Step 2: Set Up Environment (15 minutes)
- [ ] Verify all prerequisites complete
- [ ] Test current export functionality
- [ ] Open relevant files in editor
- [ ] Create implementation branch

### Step 3: Start Phase 1
- [ ] Open implementation checklist
- [ ] Begin Phase 1: Export Settings Foundation
- [ ] Create ExportContext
- [ ] Commit when Phase 1 complete

---

## Daily Progress Template

### Day 1 Goals (4-6 hours)
- [ ] Phase 1: Export Settings Foundation (1.5h)
  - [ ] Create ExportContext with settings state
  - [ ] Add localStorage persistence
  - [ ] Create settings utilities
- [ ] Phase 2: UI Components (2h)
  - [ ] Create ExportSettingsModal
  - [ ] Implement BasicSettings
  - [ ] Add PresetSelector
- [ ] Phase 3: Advanced Settings (1.5h)
  - [ ] Create AdvancedSettings component
  - [ ] Integrate with ExportPanel
- [ ] Phase 4: FFmpeg Integration (1h)
  - [ ] Enhance video processing
  - [ ] Add settings validation

**Checkpoint:** Professional export settings working with all presets

---

## Common Issues & Solutions

### Issue 1: Settings Not Persisting
**Symptoms:** Settings reset when app restarts  
**Cause:** localStorage not being called correctly  
**Solution:** Check updateSettings function calls localStorage.setItem
```javascript
const updateSettings = (newSettings) => {
  dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
  localStorage.setItem('exportSettings', JSON.stringify(newSettings));
};
```

### Issue 2: FFmpeg Command Fails
**Symptoms:** Export fails with custom settings  
**Cause:** Invalid FFmpeg parameters or codec combinations  
**Solution:** Use preset system, validate settings before export
```javascript
const validation = validateExportSettings(settings);
if (!validation.valid) {
  // Show errors, don't export
}
```

### Issue 3: File Size Estimation Wrong
**Symptoms:** Estimated size very different from actual  
**Cause:** Bitrate parsing or calculation error  
**Solution:** Check parseBitrate function, test with known values
```javascript
// Test with 1000k bitrate, 60s video
// Should be ~7.5MB
```

### Issue 4: Modal Not Opening
**Symptoms:** Settings button doesn't open modal  
**Cause:** UIContext modal system not integrated  
**Solution:** Check showModal call, ensure modal is registered
```javascript
const handleOpenSettings = () => {
  showModal('exportSettings');
};
```

---

## Quick Reference

### Key Files
- `src/context/ExportContext.js` - Settings state management
- `src/components/export/ExportSettingsModal.js` - Main modal component
- `src/utils/exportSettings.js` - Settings utilities and presets
- `electron/ffmpeg/videoProcessing.js` - Enhanced FFmpeg integration

### Key Functions
- `getDefaultSettings()` - Get default export settings
- `updateExportSettings(settings)` - Update and persist settings
- `buildFFmpegCommand(input, output, settings)` - Build FFmpeg command
- `estimateFileSize(duration, settings)` - Calculate file size

### Key Concepts
- **Export Presets:** Pre-configured settings for common use cases
- **Settings Validation:** Prevent invalid FFmpeg parameters
- **File Size Estimation:** Real-time size calculation based on bitrate
- **Modal Integration:** Professional settings UI with UIContext

### Useful Commands
```bash
# Test export with current settings
npm run test-export

# Build and package app
npm run build && npm run package

# Check FFmpeg version
npx ffmpeg -version
```

---

## Success Metrics

**You'll know it's working when:**
- [ ] Export settings modal opens from ExportPanel
- [ ] All presets (Web, Broadcast, Archival) work
- [ ] Custom settings save and persist
- [ ] File size estimation is accurate (±10%)
- [ ] Export produces videos with correct settings
- [ ] Settings validation prevents invalid configurations

**Performance Targets:**
- Modal open time: < 200ms
- Settings update: < 50ms
- File size calculation: < 10ms
- Export with custom settings: < 2x video duration

---

## Help & Support

### Stuck?
1. Check main planning doc for detailed architecture
2. Review implementation checklist for step-by-step guidance
3. Check similar UI patterns from PR #12 (Modal system)
4. Test FFmpeg commands manually first

### Want to Skip a Feature?
**Can Skip:**
- Custom FFmpeg filters (advanced feature)
- More than 3 presets (start simple)
- Complex validation rules (basic validation sufficient)

**Cannot Skip:**
- Basic settings (format, resolution, quality)
- Preset system (core functionality)
- Settings persistence (user experience)
- FFmpeg integration (core functionality)

### Running Out of Time?
**Priority Order:**
1. Basic settings (format, resolution, quality) - Essential
2. Preset system (Web, Broadcast, Archival) - High value
3. Settings persistence - User experience
4. Advanced settings (codec, bitrate) - Nice to have
5. File size estimation - Polish

---

## Motivation

**You've got this!** 💪

ClipForge already has a solid foundation with professional timeline, drag & drop, and split/delete functionality. Adding advanced export settings transforms it from a basic video editor into a professional tool that rivals Premiere Pro and Final Cut Pro. Users will be able to:

- Export videos optimized for different platforms (web, broadcast, archival)
- Control file size vs quality trade-offs
- Use professional encoding presets
- Customize output format and resolution

This is the feature that makes ClipForge truly professional-grade!

---

## Next Steps

**When ready:**
1. Run prerequisites (5 min)
2. Read main spec (25 min)
3. Start Phase 1 from checklist
4. Commit early and often

**Status:** Ready to build! 🚀

---

## Related PRs

- **PR #24:** Export Presets (builds on this)
- **PR #25:** Cloud Upload Integration (uses export settings)
- **PR #12:** UI Component Library (provides modal system)
- **PR #11:** State Management Refactor (provides context system)

