# ClipForge - Desktop Video Editor MVP

A simple desktop video editor for quick clip trimming and export.

## Features (MVP)
- ✅ Import video files (MP4, MOV) - WORKING
- ✅ Preview videos with play/pause - WORKING
- ⏳ Timeline visualization - IN PROGRESS
- ⏳ Trim clips (set in/out points) - IN PROGRESS
- ✅ Export to MP4 - WORKING

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
npm install
```

### Development

**Terminal 1:** Start webpack dev server
```bash
npm run dev
```

**Terminal 2:** Start Electron
```bash
npm start
```

Or run both together:
```bash
npm start  # This runs both concurrently
```

### Build
```bash
npm run build
npm run package
```

## Project Structure
- `main.js` - Electron main process
- `preload.js` - IPC bridge
- `src/` - React application
- `src/components/` - UI components (to be added)
- `src/utils/` - Utility functions (to be added)

## Technologies
- Electron (desktop framework)
- React (UI framework)
- FFmpeg (video processing)
- Webpack (bundling)

## Timeline
- MVP Development: Oct 27-29, 2025
- Deadline: Oct 29, 10:59 PM CT

## Status

**Current:** PR #01-04 COMPLETE (Day 1 Foundation) ✅  
**Next:** PR #05 - Timeline Component (Day 2)
**Progress:** 4/10 PRs complete, 50% of MVP functional

## Contributing

This is an MVP project with a 72-hour timeline. PR documentation is located in `PR_PARTY/` directory.

