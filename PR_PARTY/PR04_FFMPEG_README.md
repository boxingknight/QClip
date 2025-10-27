# PR#4: FFmpeg Integration & Export - Quick Start

---

## TL;DR (30 seconds)

**What:** Set up FFmpeg integration and implement MP4 export functionality that enables exporting the current video clip to a playable MP4 file.

**Why:** Export is the most critical high-risk item in the MVP. Without working export, the entire editing workflow is useless. Must work by end of Day 1 or MVP is impossible.

**Time:** 4 hours estimated (Day 1, Hours 13-16)

**Complexity:** HIGH - Integrates FFmpeg with Electron IPC and React

**Status:** 📋 READY TO START

---

## Decision Framework (2 minutes)

### Should You Build This?

**Green Lights (Build it NOW!):**
- ✅ PR #1 (Project Setup) is complete
- ✅ PR #2 (File Import) is working (need clips to export)
- ✅ PR #3 (Video Player) is working (need to preview clips)
- ✅ You have 4 hours available
- ✅ Export is CRITICAL path feature

**Red Lights (Wait!):**
- ❌ No clips can be imported yet (blocked on PR #2)
- ❌ No video preview working (blocked on PR #3)
- ❌ No development environment set up (blocked on PR #1)
- ❌ Less than 4 hours available

**Decision Aid:**
If you have PRs #1, #2, and #3 complete, you MUST build this now. Export is the most important Day 1 feature and blocks everything downstream (trim, packaging, demo).

---

## Prerequisites (5 minutes)

### Required
- [ ] PR #1 complete: Electron + React project initialized
- [ ] PR #2 complete: File import working with drag-and-drop
- [ ] PR #3 complete: Video player working with play/pause
- [ ] Node.js 18+ installed
- [ ] Git branch ready: `feat/ffmpeg-export`

### Optional but Helpful
- [ ] Test MP4 video file ready for testing export
- [ ] VLC or QuickTime installed to verify exports

### Verification
```bash
# Check PRs are complete
git log --oneline | grep "feat\|fix" | head -10

# Verify dependencies installed
npm list fluent-ffmpeg ffmpeg-static ffprobe-static

# Check current branch
git branch --show
```

---

## Getting Started (First Hour)

### Step 1: Read Documentation (15 minutes)

**Read in this order:**
1. ✅ This quick start guide (2 min) - You're reading it now!
2. 📖 Main specification: `PR04_FFMPEG_EXPORT.md` (15 min)
   - Understand architecture decisions
   - Review FFmpeg integration approach
   - Check code examples
3. 📋 Implementation checklist: `PR04_FFMPEG_IMPLEMENTATION_CHECKLIST.md` (refer as you work)

### Step 2: Install Dependencies (5 minutes)

```bash
# In project root
npm install fluent-ffmpeg ffmpeg-static ffprobe-static
```

**Verify installation:**
```bash
npm list fluent-ffmpeg
# Should show version like: fluent-ffmpeg@2.1.2
```

### Step 3: Create Directory Structure (2 minutes)

```bash
# Create electron/ffmpeg directory
mkdir -p electron/ffmpeg

# Verify created
ls -la electron/ffmpeg
```

### Step 4: Start Phase 1 from Checklist (38 minutes)

Open `PR04_FFMPEG_IMPLEMENTATION_CHECKLIST.md` and follow Phase 1 step-by-step:

1. Install dependencies (already done)
2. Create video processing module
3. Test FFmpeg setup

---

## Daily Progress Template

### Hour 1: FFmpeg Setup
**Goal:** FFmpeg configured, basic export works

- [ ] Install fluent-ffmpeg dependencies
- [ ] Create `electron/ffmpeg/videoProcessing.js`
- [ ] Implement exportVideo function
- [ ] Test export with sample video
- [ ] Verify FFmpeg binaries load

**Checkpoint:** Can export video from Node.js script

---

### Hour 2: IPC Integration
**Goal:** IPC communication established

- [ ] Add IPC handlers in main.js
- [ ] Add save dialog handler
- [ ] Expose API in preload.js
- [ ] Test IPC calls work
- [ ] Verify error handling

**Checkpoint:** Can trigger export from renderer via IPC

---

### Hour 3: Export UI
**Goal:** Export UI renders and triggers export

- [ ] Create ExportPanel component
- [ ] Add styling for export panel
- [ ] Integrate into App.js
- [ ] Test export button triggers IPC
- [ ] Verify progress updates work

**Checkpoint:** Export button visible and functional

---

### Hour 4: Integration & Testing
**Goal:** Full workflow tested and working

- [ ] Test full export flow
- [ ] Verify exported file is valid
- [ ] Test error handling
- [ ] Test with different videos
- [ ] Performance check

**Checkpoint:** Can export MP4 that plays in VLC

---

## Common Issues & Solutions

### Issue 1: FFmpeg Binary Not Found

**Symptoms:**
```
Error: Cannot find ffmpeg executable
```

**Cause:** FFmpeg static binaries not installed or path not set

**Solution:**
```bash
# Reinstall static binaries
npm install ffmpeg-static ffprobe-static

# Check node_modules
ls node_modules/ffmpeg-static/bin/

# Should see ffmpeg binary there
```

**Verify in code:**
```javascript
const ffmpegPath = require('ffmpeg-static');
console.log('FFmpeg path:', ffmpegPath);
```

---

### Issue 2: IPC Not Working

**Symptoms:**
```
Uncaught TypeError: window.electronAPI.exportVideo is not a function
```

**Cause:** Preload API not exposed or app not using preload

**Solution:**
1. Check `preload.js` has exportVideo in contextBridge
2. Check `main.js` BrowserWindow uses preload:
   ```javascript
   new BrowserWindow({
     webPreferences: {
       preload: path.join(__dirname, 'preload.js'),
       contextIsolation: true,
       nodeIntegration: false
     }
   })
   ```
3. Restart dev server after changes

---

### Issue 3: Export Hangs or Never Completes

**Symptoms:**
- Export starts but never finishes
- No progress updates
- App frozen

**Cause:** FFmpeg command failing silently or infinite loop

**Solution:**
```javascript
// Add logging in videoProcessing.js
command.on('error', (err) => {
  console.error('FFmpeg error:', err);
  console.error('Command:', err.command);
});

// Check output file permissions
// Check disk space
// Check input file exists
```

**Debug:**
```javascript
// Log FFmpeg command
command.outputOptions(['-v', 'error']) // Reduce verbosity
// Or: ['-v', 'info'] for more details
```

---

### Issue 4: Exported Video Won't Play

**Symptoms:**
- Export completes but output file won't open
- Video file corrupted or invalid

**Cause:** Encoding settings or codec issues

**Solution:**
```javascript
// Use more compatible settings
command
  .videoCodec('libx264')
  .audioCodec('aac')
  .outputOptions([
    '-preset fast',
    '-crf 23',
    '-movflags +faststart' // Web-friendly
  ]);
```

**Alternative:** Use copy codec if no re-encoding needed
```javascript
.command.option('-c:v', 'copy') // Copy video without re-encoding
.command.option('-c:a', 'copy') // Copy audio
```

---

### Issue 5: Progress Updates Not Showing

**Symptoms:**
- Progress bar stays at 0%
- Status never updates

**Cause:** IPC not sending progress events correctly

**Solution:**
1. Check onProgress callback is being called
   ```javascript
   onProgress: (progress) => {
     console.log('Progress:', progress); // Debug
     event.sender.send('export-progress-update', progress);
   }
   ```

2. Check renderer is listening
   ```javascript
   useEffect(() => {
     const unsubscribe = window.electronAPI.onExportProgress((data) => {
       console.log('Received:', data); // Debug
       setProgress(data.percent);
     });
     return () => unsubscribe();
   }, []);
   ```

3. Verify IPC event names match exactly
   - Main: `'export-progress-update'`
   - Preload: `ipcRenderer.on('export-progress-update', ...)`

---

## Quick Reference

### Key Files
- `electron/ffmpeg/videoProcessing.js` - FFmpeg integration and export logic
- `main.js` - IPC handlers for export
- `preload.js` - API exposure for renderer
- `src/components/ExportPanel.js` - Export UI component
- `src/styles/ExportPanel.css` - Export styling

### Key Functions
```javascript
// Main process
exportVideo(inputPath, outputPath, options) // Do the actual export

// IPC handlers (main.js)
ipcMain.handle('export-video', async (event, data) => {...})
ipcMain.handle('show-save-dialog', async () => {...})

// Preload API
window.electronAPI.exportVideo(path, output, trimData)
window.electronAPI.showSaveDialog()
window.electronAPI.onExportProgress(callback)

// Renderer
handleExport() // Trigger export from UI
```

### Key Concepts
- **FFmpeg:** Video processing library - encodes/decodes video
- **fluent-ffmpeg:** Node.js wrapper that simplifies FFmpeg commands
- **IPC:** Inter-Process Communication between main and renderer processes
- **Context Bridge:** Secure way to expose APIs from preload to renderer
- **Progress Events:** Real-time updates during long-running operations

### Useful Commands
```bash
# Install dependencies
npm install fluent-ffmpeg ffmpeg-static ffprobe-static

# Start dev server
npm start

# Check FFmpeg installed
npm list ffmpeg-static

# Build app
npm run build

# Package app
npm run package
```

---

## Success Metrics

**You'll know it's working when:**
- ✅ Export button is clickable when clip is selected
- ✅ Clicking export opens save dialog
- ✅ Choosing location starts FFmpeg processing
- ✅ Progress bar animates (0% → 100%)
- ✅ Status shows "Exporting... X%"
- ✅ Success message appears when done
- ✅ Output file exists at chosen location
- ✅ Opening output file in VLC/QuickTime plays video correctly
- ✅ Audio is synchronized with video

**Performance Targets:**
- Export completes in <2x video duration
- No UI freezing during export
- Progress updates every 1-2 seconds

---

## Help & Support

### Stuck?

1. **Check main planning doc:** `PR04_FFMPEG_EXPORT.md`
   - Has detailed architecture decisions
   - Code examples for each phase
   - Comprehensive risk assessment

2. **Check implementation checklist:** `PR04_FFMPEG_IMPLEMENTATION_CHECKLIST.md`
   - Step-by-step instructions
   - Exact code snippets
   - Checkpoint verification

3. **Review similar implementations:**
   - Video editors: DaVinci Resolve, Premiere Pro export flow
   - Electron apps with heavy processing
   - fluent-ffmpeg examples on GitHub

4. **Debug step-by-step:**
   - Add console.logs everywhere
   - Check terminal for FFmpeg errors
   - Verify IPC messages are being sent/received
   - Test FFmpeg directly with command line

### Want to Skip Some Features?

**MUST have for MVP:**
- Basic export (no trim)
- Progress indicator (text is fine)
- Error handling

**Can defer to PR #6:**
- Trim support (start time, duration)
- Advanced encoding options
- Multiple export formats

### Running Out of Time?

**4 hours minimum:**
- 1h: FFmpeg setup (CRITICAL)
- 1h: IPC integration (CRITICAL)
- 1h: Export UI (needed for feature to work)
- 1h: Testing (needed to verify it works)

**Can't cut corners:**
- FFmpeg MUST work or nothing works
- IPC MUST work or renderer can't trigger export
- UI MUST exist or user can't export
- Testing MUST happen or you don't know if it works

---

## Motivation

**You've got this!** 💪

You've already completed the foundation (PR #1), import system (PR #2), and video player (PR #3). Now you're building the critical export functionality that brings it all together. This is the feature that makes all the editing work meaningful - the ability to save your edited video as a playable MP4 file.

The architecture is solid (FFmpeg + Electron IPC + React), the patterns are established (similar to import IPC), and you have a detailed step-by-step plan. Follow the checklist, test as you go, and you'll have working export in 4 hours.

**Remember:** If you get stuck, the progress callbacks and error handling will give you the debugging information you need. Don't give up - just add more logging and trace through the flow.

---

## Next Steps

**When ready:**
1. Run `npm install fluent-ffmpeg ffmpeg-static ffprobe-static` (2 min)
2. Read main spec: `PR04_FFMPEG_EXPORT.md` (15 min)
3. Open checklist: `PR04_FFMPEG_IMPLEMENTATION_CHECKLIST.md` (reference)
4. Start Phase 1, Step 1.1 (install dependencies)

**Status:** Ready to build! 🚀

---

*"Export is where your editing work becomes real. Make it count."*



