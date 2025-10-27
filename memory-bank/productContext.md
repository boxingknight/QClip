# ClipForge - Product Context

**Why ClipForge Exists:** A desktop video editor enabling creators to quickly import, trim, and export video clips without switching to complex professional tools.

---

## Problem Statement

### The Gap
Content creators need a simple desktop tool to:
- Quickly trim video clips
- Avoid opening heavy professional video editors for simple edits
- Have a lightweight alternative to web-based editors

### Current Solutions
**Existing Options Have Issues:**
- Professional tools (Premiere, Final Cut) - Too complex for simple edits
- Web-based editors - Require upload/download, privacy concerns
- Built-in OS editors - Limited functionality

### Our Solution
ClipForge fills the gap with:
- **Desktop-native** application (no cloud upload required)
- **Simple interface** focused on core editing (trim)
- **Fast workflow** from import to export
- **Local processing** (privacy-focused)

---

## User Experience Goals

### What Users Should Feel
1. **Quick** - Open app → import → edit → export in minutes
2. **Confident** - No confusion about what the app does or how to use it
3. **Reliable** - Exports work every time
4. **Simple** - No learning curve for basic trimming

### Core User Journey (MVP)
```
1. Launch ClipForge desktop app
2. Drag-drop MP4 file onto app
3. Video appears in timeline, loads in player
4. Play video to find trim points
5. Click "Set In Point" at desired start
6. Click "Set Out Point" at desired end
7. Click "Export" button
8. Choose save location
9. Wait for export to complete
10. Open exported MP4 in VLC/QuickTime to verify
```

### User Interface Philosophy
- **Clear visual hierarchy** - What's clickable is obvious
- **Immediate feedback** - Actions have visible results
- **Forgiving** - Errors are informative, not blockers
- **Focused** - No feature bloat for MVP

---

## Product Functionality

### Core Features (MVP)

#### 1. Import System
**Why:** Users need to bring video files into the editor  
**How:** Drag-and-drop zone OR file picker button  
**Validation:** MP4/MOV only, show error for unsupported formats  
**UX Goal:** Intuitive file selection, clear error handling

#### 2. Video Preview Player
**Why:** Users need to see video before editing  
**How:** HTML5 video element with play/pause controls  
**Requirement:** Audio synced with video  
**UX Goal:** Responsive, simple controls

#### 3. Timeline Display
**Why:** Users need to understand video structure  
**How:** Horizontal bar showing clip(s) with names/duration  
**Requirement:** Click to select clip  
**UX Goal:** Clear visual representation

#### 4. Trim Controls
**Why:** Core editing capability  
**How:** Buttons to set current video time as in/out points  
**Requirement:** Visual indicators on timeline  
**UX Goal:** Easy to set precise trim points

#### 5. Export System
**Why:** Users need to save edited video  
**How:** Export button → FFmpeg processing → Save dialog  
**Requirement:** Valid MP4 output  
**UX Goal:** Progress feedback, error handling

---

## Technical Architecture Philosophy

### Keep It Simple (MVP)
1. **Single timeline track** - No multi-layer complexity
2. **Non-destructive editing** - Keep original clip, apply trim on export
3. **File-based workflow** - Store paths, not video data in memory
4. **Component-based UI** - Import → Player → Timeline → Trim → Export

### State Management Strategy
- **React state** in App.js for clips array
- **Selected clip** tracking for player/trim
- **Trim data** stored with clip (inPoint, outPoint)
- **Export state** (progress, success, error)

### Data Flow
```
Import → Add to clips array → Display in Timeline → 
Select clip → Load in Player → Set trim points → 
Export with trim → Save to file system
```

---

## Success Metrics (MVP)

### Functional Metrics
- ✅ Can import MP4/MOV
- ✅ Timeline displays clips
- ✅ Player plays with audio
- ✅ Can set trim points
- ✅ Exports valid MP4
- ✅ Packaged app launches

### Quality Metrics
- Export time < 2x video duration
- App doesn't crash on valid inputs
- Error messages are helpful
- UI is clearly labeled
- No breaking console errors

### User Satisfaction (Post-MVP Measurement)
- Task completion rate
- Time to first export
- Error rate
- User feedback

---

## Edge Cases to Handle

### File-Related
- Very large files (>500MB) - Don't load into memory
- Very small files (<1 second) - Handle gracefully
- Corrupt files - Show error, don't crash
- Unsupported formats - Clear error message

### Export-Related
- Insufficient disk space - Error before starting
- FFmpeg crashes - Graceful error, retry option
- Long export times - Progress feedback
- Invalid trim times - Prevent or warn

### Playback-Related
- Video won't play (codec issue) - Show error
- Missing file after import - Handle gracefully
- Audio sync issues - Note if detected
- Very long videos - Performance considerations

---

## Future Vision (Post-MVP)

### Phase 2 Features (Not in MVP)
- Split clips at playhead
- Delete clips from timeline
- Drag-and-drop clip rearrangement
- Multiple video tracks
- Zoom in/out on timeline
- Audio ducking/volume controls

### Phase 3 Features
- Record screen capture
- Record webcam
- Text overlays
- Simple transitions
- Audio track editing
- Export presets (resolution, quality)

### Ultimate Goal
- Become the go-to lightweight desktop video editor
- Support for more formats
- Cloud sync (optional)
- Plugin system
- Advanced editing features (gradually)

---

## Current Context

**Status:** Planning complete, ready for implementation  
**Files:** clipforge-prd.md (requirements), clipforge-task-list.md (tasks)  
**Next:** PR #1 - Project Setup

