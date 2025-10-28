# PR#12: UI Component Library - Quick Start

---

## TL;DR (30 seconds)

**What:** Complete UI component library with Modal, Toast, ContextMenu, Toolbar, and StatusBar components for ClipForge V2.

**Why:** V2 features need sophisticated UI interactions - modals for settings, toasts for feedback, context menus for clip operations, toolbar for controls, status bar for real-time info.

**Time:** 4 hours estimated

**Complexity:** MEDIUM

**Status:** 📋 PLANNED

---

## Decision Framework (2 minutes)

### Should You Build This?

**Green Lights (Build it!):**
- ✅ PR #11 (State Management Refactor) complete
- ✅ UIContext pattern established
- ✅ Need reusable UI components for V2 features
- ✅ Want consistent, accessible UI patterns
- ✅ Have 4+ hours available

**Red Lights (Skip/defer it!):**
- ❌ PR #11 not complete (UIContext dependency)
- ❌ Time-constrained (<3 hours)
- ❌ Want to skip UI polish for MVP
- ❌ Prefer individual component implementation

**Decision Aid:** This is foundational for V2 - if you're building V2 features, you need these components. Skip only if you're staying with MVP functionality.

---

## Prerequisites (5 minutes)

### Required
- [ ] PR #11 (State Management Refactor) deployed and working
- [ ] UIContext pattern established
- [ ] App.js using Context API
- [ ] React 18+ (for createPortal)
- [ ] Knowledge: React Context API, Portal rendering, Focus management

### Setup Commands
```bash
# 1. Verify PR #11 complete
git log --oneline | grep "State Management"

# 2. Check React version
npm list react

# 3. Create branch
git checkout -b feat/ui-component-library

# 4. Verify UIContext exists
ls src/context/UIContext.js
```

---

## Getting Started (First Hour)

### Step 1: Read Documentation (45 minutes)
- [ ] Read this quick start (10 min)
- [ ] Read main specification (25 min)
- [ ] Read implementation checklist (10 min)
- [ ] Note any questions

### Step 2: Set Up Environment (15 minutes)
- [ ] Verify UIContext is working
- [ ] Test App renders without errors
- [ ] Open relevant files in editor
- [ ] Create ui/ folder structure

### Step 3: Start Phase 1
- [ ] Open implementation checklist
- [ ] Begin UIContext Foundation
- [ ] Commit when phase complete

---

## Daily Progress Template

### Day 1 Goals (4 hours)
- [ ] Phase 1: UIContext Foundation (1h)
  - [ ] Create UIContext with modal/toast state
  - [ ] Integrate into App component
- [ ] Phase 2: Core Components (2h)
  - [ ] Modal component with portal
  - [ ] Toast system with auto-dismiss
  - [ ] ContextMenu with keyboard nav
- [ ] Phase 3: Layout Components (1h)
  - [ ] Toolbar with grouped buttons
  - [ ] StatusBar with real-time updates

**Checkpoint:** Complete UI component library working

---

## Common Issues & Solutions

### Issue 1: Modal not rendering
**Symptoms:** Modal component renders but not visible  
**Cause:** Portal not working or z-index issues  
**Solution:** 
```javascript
// Ensure createPortal is imported
import { createPortal } from 'react-dom';

// Check z-index in CSS
.modal-overlay { z-index: 1000; }
```

### Issue 2: Toast not auto-dismissing
**Symptoms:** Toast shows but doesn't disappear  
**Cause:** useEffect cleanup not working  
**Solution:**
```javascript
useEffect(() => {
  const timer = setTimeout(onHide, duration);
  return () => clearTimeout(timer); // Important cleanup
}, [duration, onHide]);
```

### Issue 3: ContextMenu positioning wrong
**Symptoms:** Context menu appears in wrong location  
**Cause:** Position calculation incorrect  
**Solution:**
```javascript
// Use getBoundingClientRect for accurate positioning
const rect = triggerElement.getBoundingClientRect();
setPosition({
  x: rect.right + 10,
  y: rect.top
});
```

### Issue 4: Focus management broken
**Symptoms:** Focus not trapped in modal or restored  
**Cause:** Focus refs not set correctly  
**Solution:**
```javascript
// Store previous focus before opening
previousFocusRef.current = document.activeElement;

// Restore focus when closing
previousFocusRef.current?.focus();
```

### Issue 5: UIContext not available
**Symptoms:** "useUI must be used within UIProvider" error  
**Cause:** Component not wrapped with UIProvider  
**Solution:**
```javascript
// Ensure App is wrapped
<UIProvider>
  <TimelineProvider>
    <ProjectProvider>
      {/* app content */}
    </ProjectProvider>
  </TimelineProvider>
</UIProvider>
```

---

## Quick Reference

### Key Files
- `src/context/UIContext.js` - Global UI state management
- `src/components/ui/Modal.js` - Modal component with portal
- `src/components/ui/Toast.js` - Toast component with auto-dismiss
- `src/components/ui/ContextMenu.js` - Context menu with keyboard nav
- `src/components/ui/Toolbar.js` - Main toolbar component
- `src/components/ui/StatusBar.js` - Status bar with real-time updates

### Key Functions
- `showModal(modalType, data)` - Open modal with data
- `hideModal(modalType)` - Close specific modal
- `showToast(type, message, duration)` - Show toast notification
- `hideToast(toastId)` - Hide specific toast
- `setLoading(isLoading, message)` - Set global loading state

### Key Concepts
- **Portal Rendering:** Modal renders outside React tree using createPortal
- **Focus Management:** Trap focus in modal, restore on close
- **Toast Queue:** Array of toasts with auto-dismiss timers
- **Context Menu:** Right-click menu with keyboard navigation
- **Toolbar Groups:** Organized button groups (File, Edit, View)

### Useful Commands
```bash
# Test modal component
npm test -- --testNamePattern="Modal"

# Test toast system
npm test -- --testNamePattern="Toast"

# Test accessibility
npm run test:a11y

# Build and test
npm run build && npm start
```

---

## Success Metrics

**You'll know it's working when:**
- [ ] Modal opens/closes with ESC key and focus management
- [ ] Toast shows, auto-dismisses, and stacks multiple toasts
- [ ] Context menu appears on right-click with keyboard nav
- [ ] Toolbar shows grouped buttons with tooltips
- [ ] StatusBar displays real-time project info
- [ ] All components are keyboard accessible
- [ ] No console errors or accessibility violations

**Performance Targets:**
- Modal open/close: <100ms
- Toast animation: Smooth 300ms transition
- Context menu positioning: <50ms
- Memory usage: No leaks from event listeners

---

## Help & Support

### Stuck?
1. Check main planning doc for detailed architecture
2. Review implementation checklist for step-by-step guidance
3. Check UIContext integration in App.js
4. Verify React version supports createPortal
5. Test components individually before integration

### Want to Skip a Feature?
**Can Skip:**
- Advanced accessibility features (basic is sufficient)
- Complex animations (simple transitions work)
- Custom toolbar layouts (fixed layout is fine)

**Cannot Skip:**
- Modal component (needed for V2 features)
- Toast system (needed for user feedback)
- UIContext integration (foundation for all UI)

### Running Out of Time?
**Priority Order:**
1. UIContext (30 min) - Foundation
2. Modal (45 min) - Most important
3. Toast (30 min) - User feedback
4. Toolbar (30 min) - Main controls
5. StatusBar (15 min) - Nice to have
6. ContextMenu (30 min) - Can defer to next PR

---

## Motivation

**You've got this!** 💪

This PR creates the foundation for all V2 features. Every advanced feature (recording, multi-track, effects) will use these components. Building them now means consistent, professional UI across the entire application.

The components you're building are:
- **Modal**: Used for export settings, text editing, transition selection
- **Toast**: Used for recording feedback, export progress, error messages
- **ContextMenu**: Used for clip operations (right-click menus)
- **Toolbar**: Used for main application controls
- **StatusBar**: Used for real-time project information

---

## Next Steps

**When ready:**
1. Run prerequisites (5 min)
2. Read main spec (25 min)
3. Start Phase 1 from checklist (1h)
4. Commit early and often

**Status:** Ready to build! 🚀

**Next PR:** PR #13 - Multi-Track Timeline UI (will use Modal and ContextMenu components)

