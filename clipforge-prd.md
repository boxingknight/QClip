# ClipForge MVP - Product Requirements Document

**Project:** ClipForge Desktop Video Editor  
**Timeline:** 72 hours (MVP due Tuesday, October 28th at 10:59 PM CT)  
**Version:** 1.0 - MVP Scope  
**Last Updated:** October 27, 2025

---

## Executive Summary

ClipForge is a desktop video editor designed to enable creators to import video clips, arrange them on a timeline, perform basic editing operations, and export professional-looking videos. The MVP focuses on proving the fundamental video editing pipeline works in a desktop context within a 72-hour constraint.

**Core Value Proposition:** A working desktop app that can import, display, trim, and export video files.

---

## User Stories

### Primary User: Content Creator

**As a content creator, I want to:**

1. **Import Videos**
   - Import video files (MP4/MOV) into the application via drag-and-drop
   - Import video files using a file picker dialog
   - See my imported clips in a media library
   - *So that I can work with my existing video content*

2. **Preview Videos**
   - Play imported video clips in a preview player
   - See video playback with synchronized audio
   - Control playback (play/pause)
   - *So that I can review my content before editing*

3. **Arrange Clips on Timeline**
   - See my clips displayed on a visual timeline
   - Understand the sequence and duration of clips
   - *So that I can plan my video structure*

4. **Edit Video Content**
   - Trim a single clip by setting in/out points
   - Remove unwanted sections from the beginning or end
   - *So that I can refine my video content*

5. **Export Final Video**
   - Export my edited timeline to MP4 format
   - Save the exported file to my local file system
   - *So that I can share my finished video*

### Secondary User: QA Tester/Evaluator

**As a project evaluator, I want to:**

1. Launch a packaged desktop application (not just dev mode)
2. Test the complete editing workflow from import to export
3. Verify the app handles video files correctly
4. *So that I can assess whether the MVP requirements are met*

---

## Key Features Required for MVP

### 1. Desktop Application Framework
- **Requirement:** Native desktop app that launches successfully
- **Must Have:**
  - Packaged executable (not just running in dev mode)
  - Cross-platform compatibility (at minimum: macOS or Windows)
  - Launch time under 5 seconds
  - Stable window management

### 2. Video Import System
- **Requirement:** Accept video files into the application
- **Must Have:**
  - Drag-and-drop functionality for MP4/MOV files
  - File picker dialog as alternative import method
  - Basic file validation (format checking)
  - Error handling for unsupported formats

### 3. Timeline View
- **Requirement:** Visual representation of imported clips
- **Must Have:**
  - Display imported clips in chronological order
  - Show clip thumbnails or labels
  - Visual indication of clip duration
  - Simple, readable layout

### 4. Video Preview Player
- **Requirement:** Playback of imported video clips
- **Must Have:**
  - Play/pause controls
  - Display current video frame
  - Audio playback synchronized with video
  - Basic player UI (controls visible and functional)

### 5. Basic Trim Functionality
- **Requirement:** Set in/out points on a single clip
- **Must Have:**
  - UI to select start point (in-point)
  - UI to select end point (out-point)
  - Visual feedback showing trimmed region
  - Apply trim to clip on timeline

### 6. Export to MP4
- **Requirement:** Render timeline to MP4 file
- **Must Have:**
  - Export button/action
  - FFmpeg integration for encoding
  - Save dialog for choosing output location
  - Basic error handling (e.g., export failures)
  - Exported video plays correctly in standard media players

---

## Technical Stack

### Desktop Framework Decision

#### Option 1: Electron (Recommended for MVP)
**Pros:**
- Mature ecosystem with extensive documentation
- Large community and abundant resources/examples
- Easier integration with Node.js libraries (fluent-ffmpeg)
- Faster initial setup for web developers
- Better desktop API access (desktopCapturer for future features)

**Cons:**
- Larger bundle size (~150-200MB)
- Higher memory footprint
- Slower startup time compared to native apps

**Pitfalls to Watch:**
- Main process vs. renderer process communication can be confusing
- Context isolation and IPC require careful handling
- FFmpeg binary bundling adds complexity
- Memory leaks if video elements aren't properly cleaned up

#### Option 2: Tauri
**Pros:**
- Much smaller bundle size (~10-20MB)
- Better performance and lower memory usage
- Modern architecture (Rust backend)
- Growing ecosystem

**Cons:**
- Steeper learning curve if unfamiliar with Rust
- FFmpeg integration requires writing Rust commands
- Less mature than Electron (fewer examples/resources)
- More setup complexity for media processing

**Pitfalls to Watch:**
- Cross-platform screen capture requires platform-specific code
- Rust compilation can slow down development iteration
- Debugging across Rust/JS boundary is harder
- Time constraint makes learning curve risky

### Recommended Stack for MVP

**Desktop Framework:** Electron  
**Justification:** Given the 72-hour constraint, Electron's maturity and web-friendly environment will enable faster development.

**Frontend Framework:** React  
**Justification:** 
- Large ecosystem of UI components
- Good for complex state management (timeline state)
- Familiar to most developers

**Alternative:** Vue or Svelte if more familiar

**Media Processing:** fluent-ffmpeg (Node.js wrapper for FFmpeg)  
**Justification:**
- Well-documented API
- Handles encoding, trimming, concatenation
- Runs in main process (access to file system)

**Video Player:** HTML5 `<video>` element  
**Justification:**
- Native browser support
- Simple API for MVP needs
- Can upgrade to Video.js later if needed

**Timeline UI:** Custom CSS/DOM solution  
**Justification:**
- Faster to build for simple MVP timeline
- Canvas-based solutions add complexity

**Alternative:** Fabric.js or Konva.js if timeline becomes complex

### Development Dependencies
- Electron Builder (for packaging)
- FFmpeg static binaries (bundled with app)
- React DevTools
- Nodemon (for development hot reload)

---

## Explicitly Out of Scope for MVP

### Features NOT Included in MVP

1. **Recording Capabilities**
   - Screen recording
   - Webcam recording
   - Microphone audio capture
   - *Rationale:* Core editing pipeline is higher priority; recording adds significant complexity

2. **Advanced Timeline Features**
   - Multiple tracks
   - Drag-and-drop rearrangement of clips
   - Split functionality
   - Delete individual clips
   - Zoom in/out
   - Snap-to-grid
   - *Rationale:* Basic trim on single clip proves the pipeline works

3. **Media Management**
   - Thumbnail preview generation
   - Metadata display (duration, resolution, file size)
   - Media library panel organization
   - *Rationale:* File import is sufficient for MVP

4. **Advanced Playback**
   - Scrubbing (dragging playhead)
   - Playhead position indicator
   - Real-time timeline composition preview
   - *Rationale:* Simple play/pause is sufficient for MVP

5. **Export Options**
   - Resolution selection (720p, 1080p)
   - Progress indicator during export
   - Cloud upload integration
   - *Rationale:* Basic MP4 export proves encoding works

6. **Polish & UX**
   - Keyboard shortcuts
   - Undo/redo
   - Auto-save
   - Transitions or effects
   - Text overlays
   - Audio controls
   - *Rationale:* Time constraint requires focus on core functionality

7. **Cross-platform Testing**
   - Testing on both Mac and Windows
   - *Rationale:* Focus on one platform for MVP, ensure it works perfectly there

---

## Technical Considerations & Pitfalls

### FFmpeg Integration
**Challenge:** Bundling FFmpeg binaries and managing child processes  
**Mitigation Strategy:**
- Use `ffmpeg-static` npm package for pre-built binaries
- Test export functionality early (Day 1)
- Keep FFmpeg commands simple for MVP
- Handle process errors gracefully

### Video File Handling
**Challenge:** Large video files can cause memory issues  
**Mitigation Strategy:**
- Don't load entire video into memory
- Use file paths and streams where possible
- Test with realistic file sizes (100MB+ videos)
- Implement proper cleanup of video elements

### Timeline State Management
**Challenge:** Keeping timeline state in sync with player and clips  
**Mitigation Strategy:**
- Use React state or Context API
- Keep state structure simple for MVP
- Single source of truth for clip data

### Electron IPC Communication
**Challenge:** Passing video data between main and renderer processes  
**Mitigation Strategy:**
- Use IPC for file paths, not large binary data
- Preload scripts for secure context bridging
- Test early to avoid last-minute IPC debugging

### Build & Packaging
**Challenge:** Packaging can fail in unexpected ways  
**Mitigation Strategy:**
- Test packaging on Day 2, not Day 3
- Use Electron Builder with simple configuration
- Include FFmpeg binaries in packaged app
- Test packaged app, not just dev mode

### Time Management Risks
**High-Risk Items (test early):**
1. FFmpeg export functionality
2. Video playback in Electron renderer
3. File import and validation
4. Building and packaging the app

**Lower-Risk Items (can be refined later):**
1. UI styling and layout
2. Error messages
3. Loading states
4. Edge case handling

---

## Success Criteria for MVP

### Hard Requirements (Must Pass)
- ✅ Desktop app launches when double-clicked
- ✅ Can import at least one MP4 or MOV file
- ✅ Timeline shows imported clip
- ✅ Video player plays the imported clip with audio
- ✅ Can set in/out points to trim clip
- ✅ Export produces a valid MP4 file
- ✅ Exported video plays correctly in VLC/QuickTime

### Quality Indicators (Should Pass)
- App doesn't crash during normal usage
- Export completes in reasonable time (<2x video duration)
- UI is navigable and controls are clearly labeled
- No console errors that break functionality

---

## Development Phases (72-Hour Plan)

### Day 1 (Monday, Oct 27): Foundation
- **Hours 1-4:** Project setup (Electron + React boilerplate)
- **Hours 5-8:** Video import (drag-drop + file picker)
- **Hours 9-12:** Video player component (play/pause)
- **Hours 13-16:** FFmpeg integration and test export with single clip

**End of Day 1 Goal:** Can import and play a video, export works

### Day 2 (Tuesday, Oct 28): Timeline & Trim - MVP DEADLINE
- **Hours 17-20:** Timeline UI (display clip)
- **Hours 21-26:** Trim functionality (in/out points)
- **Hours 27-30:** Connect trim to export
- **Hours 31-32:** Testing and bug fixes
- **Hours 32-34:** Package app and test packaged version

**End of Day 2 Goal:** MVP checkpoint passed

### Day 3 (Wednesday, Oct 29): Polish & Final Submission
- **Hours 35-40:** Bug fixes and edge cases
- **Hours 41-44:** UI improvements and error handling
- **Hours 45-48:** Documentation (README, setup instructions)
- **Hours 49-52:** Demo video recording
- **Hours 53-54:** Final testing and submission

**End of Day 3 Goal:** Final submission delivered

---

## Open Questions for Review

1. **Platform Priority:** Should we target macOS or Windows first? (Recommend macOS if you're developing on Mac)

2. **Trim UI Pattern:** Should trim be:
   - A. Two input fields (start time, end time)
   - B. Draggable handles on timeline
   - C. Buttons to set current time as in/out point

   *Recommendation: Option C (buttons) - simplest for MVP*

3. **Export Behavior:** Should export:
   - A. Always export entire timeline (all clips)
   - B. Export only the currently selected clip
   
   *Recommendation: Option B for MVP (simpler)*

4. **Error Handling:** How detailed should error messages be?
   *Recommendation: Basic alerts for MVP, improve later*

---

## Next Steps

1. **Review this PRD** - Confirm scope and technical decisions
2. **Setup Development Environment** - Initialize Electron + React project
3. **Create GitHub Repository** - Version control from Day 1
4. **Build Feature by Feature** - Follow Day 1-3 plan
5. **Test Continuously** - Don't wait until Day 3 to test packaging

---

## Appendix: MVP Feature Checklist

**Import System:**
- [ ] Drag-and-drop video files onto app window
- [ ] File picker button to browse for videos
- [ ] Validate file format (MP4/MOV only)
- [ ] Display error for unsupported formats

**Timeline:**
- [ ] Show imported clip on timeline
- [ ] Display clip name or thumbnail
- [ ] Show clip duration

**Player:**
- [ ] Video element displays video
- [ ] Play button works
- [ ] Pause button works
- [ ] Audio plays in sync with video

**Trim:**
- [ ] UI to set in-point (start time)
- [ ] UI to set out-point (end time)
- [ ] Visual indication of trimmed region
- [ ] Trim affects export output

**Export:**
- [ ] Export button in UI
- [ ] Save dialog to choose output location
- [ ] FFmpeg encodes video to MP4
- [ ] Exported file is valid and playable

**Packaging:**
- [ ] App builds without errors
- [ ] Packaged app launches
- [ ] All features work in packaged app
- [ ] FFmpeg binary included in package

---

**Document Status:** Draft for Review  
**Next Action:** Review and confirm technical stack + scope decisions
