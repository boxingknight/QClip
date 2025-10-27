# PR#01: Project Setup - Quick Start

---

## TL;DR (30 seconds)

**What:** Initialize Electron + React project structure with all dependencies and configuration files.

**Why:** Foundation for entire ClipForge application. No other PRs can proceed without this.

**Time:** 4 hours estimated

**Complexity:** LOW - Standard setup, well-documented

**Status:** 📋 READY TO START

---

## Decision Framework (2 minutes)

### Should You Build This?

**Green Lights (Build it!):**
- ✅ First PR in the project (foundation work)
- ✅ Have 4 hours available
- ✅ Understand basics of npm, git, JavaScript
- ✅ Willing to follow setup checklist step-by-step

**Red Lights (Skip/defer it!):**
- ❌ Don't have Node.js 18+ installed
- ❌ Don't understand Electron or React basics
- ❌ Less than 4 hours available
- ❌ Want to skip to "fun" features (this PR is required first)

**Decision Aid:** This PR is **mandatory** and must be completed first. All other PRs depend on it.

---

## Prerequisites (5 minutes)

### Required
- [ ] Node.js 18+ installed
  ```bash
  node --version
  # Should show v18.x.x or higher
  ```
  
- [ ] npm or yarn installed
  ```bash
  npm --version
  ```

- [ ] Git installed
  ```bash
  git --version
  ```

- [ ] Terminal/command line access
- [ ] Code editor (VS Code recommended)

### Optional But Helpful
- [ ] Understanding of npm packages
- [ ] Basic knowledge of Electron architecture
- [ ] Familiarity with React basics
- [ ] Experience with webpack

### What You DON'T Need
- ❌ Knowledge of FFmpeg (that comes in PR #4)
- ❌ Video editing experience
- ❌ Complex Electron expertise
- ❌ Advanced React patterns

---

## Getting Started (First Hour)

### Step 1: Read Documentation (15 minutes)
- [ ] Read this quick start (you're doing it now! ✓)
- [ ] Skim main specification (`PR_PARTY/PR01_PROJECT_SETUP.md`)
- [ ] Review implementation checklist (`PR_PARTY/PR01_IMPLEMENTATION_CHECKLIST.md`)
- [ ] Note any questions

### Step 2: Create Branch (2 minutes)
```bash
# Navigate to project directory
cd /Users/loganmay/QClip

# Create and checkout feature branch
git checkout -b feat/project-setup
```

### Step 3: Initialize Git (5 minutes)
```bash
# Initialize git repository
git init

# Create .gitignore
touch .gitignore

# Add ignore patterns (see checklist)

# Commit
git add .gitignore
git commit -m "chore: add .gitignore"
```

### Step 4: Initialize npm (5 minutes)
```bash
# Create package.json
npm init -y

# Edit package.json (see checklist for required fields)
# Update name, description, main, scripts

# Commit
git add package.json
git commit -m "chore: initialize npm project"
```

### Step 5: Install Dependencies (20 minutes)
```bash
# Core dependencies
npm install --save-dev electron
npm install react react-dom

# Build tools
npm install --save-dev webpack webpack-cli webpack-dev-server
npm install --save-dev @babel/core @babel/preset-react babel-loader
npm install --save-dev css-loader style-loader

# FFmpeg (for future)
npm install fluent-ffmpeg ffmpeg-static ffprobe-static

# Packaging
npm install --save-dev electron-builder nodemon
```

**Checkpoint:** All dependencies installed ✓

### Step 6: Create Configuration Files (15 minutes)

Create and configure:
- [ ] `webpack.config.js` (see checklist for content)
- [ ] `electron-builder.yml` (see checklist for content)

**Commit:** Save progress after each major step

---

## Daily Progress Template

### First Hour Goals
- [ ] Git repository initialized
- [ ] npm project created
- [ ] Dependencies installed
- [ ] Webpack configured

**Checkpoint:** Can run `npm run dev` without errors

### Second Hour Goals
- [ ] Electron main process created
- [ ] Preload script created
- [ ] React app structure created

**Checkpoint:** Can see Electron window (even if blank)

### Third Hour Goals
- [ ] React components created
- [ ] App renders correctly
- [ ] IPC communication verified

**Checkpoint:** App shows "Welcome to ClipForge"

### Fourth Hour Goals
- [ ] All testing passes
- [ ] README created
- [ ] Final commit and push
- [ ] PR ready for review

**Checkpoint:** PR #1 complete!

---

## Common Issues & Solutions

### Issue 1: "Command not found: npm"
**Symptoms:** Terminal says npm not found  
**Cause:** Node.js not installed or not in PATH  
**Solution:**
```bash
# Install Node.js from nodejs.org
# Or use nvm to install: nvm install 18
# Restart terminal after installation
```

### Issue 2: "Cannot find module 'electron'"
**Symptoms:** Error when running electron  
**Cause:** Dependencies not installed  
**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue 3: "Webpack not found"
**Symptoms:** Cannot run webpack commands  
**Cause:** Webpack not installed or not in PATH  
**Solution:**
```bash
# Install webpack as dev dependency
npm install --save-dev webpack webpack-cli

# Or use npx
npx webpack
```

### Issue 4: "Electron window opens but is blank"
**Symptoms:** Window opens but doesn't show React app  
**Cause:** Webpack dev server not running or wrong URL  
**Solution:**
```bash
# Run webpack dev server first (terminal 1)
npm run dev

# Then run electron (terminal 2)
npm start

# Or update start script to use concurrently
```

### Issue 5: "IPC communication not working"
**Symptoms:** Console shows undefined for window.electronAPI  
**Cause:** Preload script not loaded or context isolation issue  
**Solution:**
- [ ] Verify preload path in main.js
- [ ] Verify contextBridge in preload.js
- [ ] Check window.openDevTools() works
- [ ] Reload window after changes

### Issue 6: "Build fails with Babel errors"
**Symptoms:** Babel loader errors during webpack build  
**Cause:** Missing babel presets  
**Solution:**
```bash
# Install babel preset
npm install --save-dev @babel/preset-react

# Verify .babelrc or webpack babel-loader config
```

---

## Quick Reference

### Key Files Created
| File | Purpose |
|------|---------|
| `.gitignore` | Git ignore patterns |
| `package.json` | npm configuration, dependencies |
| `webpack.config.js` | Webpack bundling configuration |
| `electron-builder.yml` | Build/packaging configuration |
| `main.js` | Electron main process |
| `preload.js` | IPC bridge |
| `src/index.js` | React entry point |
| `src/App.js` | Main React component |
| `src/App.css` | App styles |
| `src/index.html` | HTML template |
| `README.md` | Project documentation |

### Key Commands
```bash
# Start development (terminal 1)
npm run dev

# Start Electron (terminal 2)
npm start

# Build for production
npm run build

# Package app
npm run package

# Install dependencies
npm install

# Clear and reinstall
rm -rf node_modules package-lock.json && npm install
```

### Key Concepts
- **Electron Main Process:** Runs Node.js, handles file operations
- **Renderer Process:** Runs React app (browser environment)
- **IPC:** Inter-process communication between main and renderer
- **Preload Script:** Secure bridge for IPC communication
- **Webpack:** Bundles React code for Electron renderer

### Project Structure
```
clipforge/
├── main.js              # Electron main
├── preload.js           # IPC bridge
├── package.json         # Dependencies
├── webpack.config.js    # Webpack config
├── electron-builder.yml # Build config
├── src/
│   ├── index.js         # React entry
│   ├── App.js           # Main component
│   ├── App.css          # Styles
│   └── index.html       # HTML
└── README.md            # Docs
```

---

## Success Metrics

**You'll know it's working when:**
- [ ] Running `npm start` opens Electron window
- [ ] Window shows "Welcome to ClipForge" message
- [ ] Console shows "IPC test: pong"
- [ ] No console errors
- [ ] Can close and reopen app without errors

**Performance Targets:**
- Electron window opens in <5 seconds
- React app renders immediately
- No memory leaks when opening/closing window

---

## Help & Support

### Stuck?
1. Check main specification (`PR01_PROJECT_SETUP.md`) for details
2. Review implementation checklist step-by-step
3. Check Common Issues section above
4. Look at Electron + React boilerplate examples online
5. Ask in team chat (if applicable)

### Want to Skip Details?
**Can't skip:** This PR is the foundation. Every file is needed.

### Running Out of Time?
**Focus on:**
1. Getting app to launch (main.js, index.js, App.js)
2. IPC working (preload.js)
3. Webpack config working

**Can skip/polish later:**
- Perfect styling
- Extensive README
- Advanced webpack optimization

---

## Motivation

**You've got this!** 💪

This is your foundation. Once this is done, you can start building the actual video editing features. Every minute you spend getting this setup right saves hours later.

**Remember:** The other 9 PRs depend on this one being solid.

---

## Next Steps

**When ready:**
1. Read implementation checklist
2. Start with Phase 1: Git & npm initialization
3. Follow checklist step-by-step
4. Commit after each phase
5. Test as you go
6. Celebrate when app launches! 🎉

**Status:** Ready to build! 🚀

**Expected Outcome:** Electron window with "Welcome to ClipForge" displaying all green checkmarks

**After Completion:** Move to PR #2: File Import (4 hours, Day 1, Hours 5-8)

