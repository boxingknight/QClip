# ClipForge - Project Brief

**Project:** ClipForge Desktop Video Editor MVP  
**Timeline:** 72 hours (October 27-29, 2025)  
**MVP Deadline:** Tuesday, October 28th at 10:59 PM CT  
**Final Deadline:** Wednesday, October 29th at 10:59 PM CT  
**Version:** 1.0 MVP  
**Created:** October 27, 2025

---

## Core Mission

Build a working desktop video editor that enables creators to import, edit, and export video clips within a 72-hour constraint. The MVP focuses on proving the fundamental video editing pipeline works in a desktop context.

---

## Primary Goals

### Must Achieve (MVP Success Criteria)
1. **Desktop Application** - Launchable native app (packaged, not dev mode)
2. **Video Import** - Import MP4/MOV files via drag-drop or file picker
3. **Timeline Display** - Visual representation of imported clips
4. **Video Playback** - Play imported clips with synchronized audio
5. **Trim Functionality** - Set in/out points to trim a single clip
6. **Video Export** - Export edited timeline to valid MP4 file

### Quality Indicators
- App doesn't crash during normal usage
- Export completes in reasonable time (<2x video duration)
- UI is navigable and controls are clearly labeled
- No console errors that break functionality

---

## Scope Boundaries

### In Scope (MVP)
- Import video files (MP4/MOV)
- Display clips on timeline
- Preview playback with audio
- Trim single clip with in/out points
- Export to MP4 using FFmpeg
- Packaged desktop app for distribution

### Out of Scope (Post-MVP)
- Recording capabilities (screen/webcam)
- Advanced timeline features (multi-track, drag-drop rearrangement)
- Split functionality
- Scrubbing/playhead dragging
- Export options (resolution selection, cloud upload)
- Keyboard shortcuts, undo/redo
- Auto-save functionality
- Transitions or effects
- Text overlays
- Audio controls beyond play/pause

---

## Target Users

### Primary User: Content Creator
- Needs to edit video content quickly
- Works with existing video files
- Requires basic trimming capabilities
- Wants simple export process

### Secondary User: QA Tester/Evaluator
- Needs to verify MVP requirements are met
- Tests complete workflow from import to export
- Validates desktop app functionality

---

## Success Definition

**This project is successful when:**
- Desktop app launches when double-clicked
- Can import at least one MP4 or MOV file
- Timeline shows imported clip(s)
- Video player plays imported clip with audio
- Can set in/out points to trim clip
- Export produces a valid MP4 file
- Exported video plays correctly in VLC/QuickTime

---

## Constraints

### Time Constraint
- **72 total hours** (Oct 27-29)
- Must submit MVP by Oct 28 at 10:59 PM CT
- Final submission due Oct 29 at 10:59 PM CT

### Platform Priority
- Target macOS first (if developing on Mac)
- Windows support possible but optional for MVP

### Technical Constraints
- Must use desktop framework (Electron recommended)
- Must integrate FFmpeg for video processing
- Must package as distributable application
- Must handle large video files without memory issues

---

## Key Principles

1. **Focus on Core Pipeline** - Prove import → edit → export works
2. **Test Early** - Test critical features on Day 1 (export, packaging)
3. **Keep It Simple** - Basic trim functionality is sufficient
4. **Non-Destructive Editing** - Keep full clip, apply trim on export
5. **Error Handling** - Graceful failures, helpful error messages
6. **Desktop First** - Native app experience, not web app

---

## Risk Assessment

### High-Risk Items (Test Early)
1. FFmpeg export functionality
2. Video playback in Electron renderer
3. File import and validation
4. Building and packaging the app

### Lower-Risk Items (Can Refine Later)
1. UI styling and layout
2. Error messages
3. Loading states
4. Edge case handling

---

## Project Status

**Current Phase:** Planning Complete, Ready to Start  
**Next Action:** PR #1 - Project Setup (Initialize Electron + React)

