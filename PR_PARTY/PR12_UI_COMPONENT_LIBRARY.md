# PR#12: UI Component Library

**Estimated Time:** 4 hours  
**Complexity:** MEDIUM  
**Dependencies:** PR #11 (State Management Refactor)  
**Priority:** HIGH - Foundation for all V2 features

---

## Overview

### What We're Building
A comprehensive UI component library that provides reusable, accessible components for ClipForge V2. This includes modals, toasts, context menus, toolbar, and status bar components that will be used throughout the advanced V2 features.

### Why It Matters
V2 features require sophisticated UI interactions:
- **Modals** for export settings, text editing, transition selection
- **Toasts** for user feedback (success, error, progress)
- **Context menus** for clip operations (right-click menus)
- **Toolbar** for main application controls
- **Status bar** for real-time information display

Without these components, V2 features would have inconsistent, inaccessible UI patterns.

### Success in One Sentence
"This PR is successful when ClipForge has a complete, reusable UI component library that enables consistent, accessible user interactions across all V2 features."

---

## Technical Design

### Architecture Decisions

#### Decision 1: Component Library Structure
**Options Considered:**
1. Individual components in separate files - Simple but scattered
2. Component library with index exports - Organized but complex
3. Hybrid approach with grouped components - Balanced organization

**Chosen:** Hybrid approach with grouped components

**Rationale:**
- Groups related components (Modal, Toast in ui/ folder)
- Maintains clear file structure
- Easy to import specific components
- Scalable for future additions

**Trade-offs:**
- Gain: Clear organization and maintainability
- Lose: Slightly more complex import paths

#### Decision 2: State Management Integration
**Options Considered:**
1. Local state in each component - Simple but limited
2. UIContext for global UI state - Centralized but complex
3. Hybrid: Local state + UIContext for global UI - Flexible

**Chosen:** Hybrid approach

**Rationale:**
- Components manage their own internal state
- UIContext manages global UI state (modals, toasts)
- Provides flexibility for different use cases
- Follows React best practices

**Trade-offs:**
- Gain: Flexible state management
- Lose: Slightly more complex state patterns

#### Decision 3: Accessibility Implementation
**Options Considered:**
1. Basic accessibility - Minimal implementation
2. Full ARIA compliance - Comprehensive but time-consuming
3. Progressive accessibility - Core features first, enhance later

**Chosen:** Progressive accessibility

**Rationale:**
- Focus on core accessibility features (keyboard nav, focus management)
- Implement ARIA attributes for screen readers
- Add more advanced features in future PRs
- Balances accessibility with development time

**Trade-offs:**
- Gain: Good accessibility without excessive time
- Lose: Not fully WCAG compliant initially

### Component Hierarchy
```
UI Components/
├── Modal/
│   ├── Modal.js (main component)
│   ├── Modal.css (styling)
│   └── ModalPortal.js (portal wrapper)
├── Toast/
│   ├── Toast.js (individual toast)
│   ├── ToastContainer.js (toast manager)
│   └── Toast.css (styling)
├── ContextMenu/
│   ├── ContextMenu.js (main component)
│   ├── ContextMenuItem.js (menu item)
│   └── ContextMenu.css (styling)
├── Toolbar/
│   ├── Toolbar.js (main toolbar)
│   ├── ToolbarGroup.js (button groups)
│   └── Toolbar.css (styling)
└── StatusBar/
    ├── StatusBar.js (main component)
    └── StatusBar.css (styling)
```

### Data Model

**UIContext State:**
```javascript
const UIContext = {
  // Modal state
  modals: {
    exportSettings: { isOpen: false, data: null },
    textEditor: { isOpen: false, clipId: null },
    transitionSelector: { isOpen: false, clipId: null }
  },
  
  // Toast queue
  toasts: [
    { id: 'toast-1', type: 'success', message: 'Export complete', duration: 3000 }
  ],
  
  // Global UI state
  isLoading: false,
  loadingMessage: '',
  
  // Actions
  showModal: (modalType, data) => {},
  hideModal: (modalType) => {},
  showToast: (type, message, duration) => {},
  hideToast: (toastId) => {},
  setLoading: (isLoading, message) => {}
};
```

---

## Implementation Details

### File Structure
**New Files:**
```
src/
├── components/
│   └── ui/
│       ├── Modal.js (~150 lines)
│       ├── Modal.css (~100 lines)
│       ├── Toast.js (~80 lines)
│       ├── ToastContainer.js (~120 lines)
│       ├── Toast.css (~80 lines)
│       ├── ContextMenu.js (~150 lines)
│       ├── ContextMenuItem.js (~60 lines)
│       ├── ContextMenu.css (~100 lines)
│       ├── Toolbar.js (~200 lines)
│       ├── ToolbarGroup.js (~80 lines)
│       ├── Toolbar.css (~150 lines)
│       ├── StatusBar.js (~120 lines)
│       └── StatusBar.css (~80 lines)
├── context/
│   └── UIContext.js (~200 lines)
└── styles/
    └── ui-components.css (~50 lines)
```

**Modified Files:**
- `src/App.js` (+50/-10 lines) - UIContext integration, component layout
- `src/App.css` (+30/-5 lines) - Layout adjustments for toolbar/status bar

### Key Implementation Steps

#### Phase 1: UIContext Foundation (1 hour)
1. Create UIContext with modal and toast state
2. Implement showModal, hideModal actions
3. Implement showToast, hideToast actions
4. Add loading state management
5. Test context provider integration

#### Phase 2: Core Components (2 hours)
1. Create Modal component with portal rendering
2. Create Toast and ToastContainer components
3. Create ContextMenu component
4. Implement keyboard navigation
5. Add focus management

#### Phase 3: Layout Components (1 hour)
1. Create Toolbar component with button groups
2. Create StatusBar component
3. Integrate components into App layout
4. Test responsive behavior
5. Add accessibility features

### Code Examples

**Example 1: Modal Component**
```javascript
// Modal.js
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

const Modal = ({ isOpen, onClose, title, children, size = 'medium' }) => {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Store previous focus
      previousFocusRef.current = document.activeElement;
      
      // Focus modal
      modalRef.current?.focus();
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Handle ESC key
      const handleEsc = (e) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleEsc);
      
      return () => {
        document.removeEventListener('keydown', handleEsc);
        document.body.style.overflow = 'unset';
        previousFocusRef.current?.focus();
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`modal ${size}`}
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {title && (
          <div className="modal-header">
            <h2 id="modal-title">{title}</h2>
            <button 
              className="modal-close"
              onClick={onClose}
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
        )}
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
```

**Example 2: Toast System**
```javascript
// ToastContainer.js
import React from 'react';
import Toast from './Toast';
import './Toast.css';

const ToastContainer = ({ toasts, onHide }) => {
  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          {...toast}
          onHide={() => onHide(toast.id)}
        />
      ))}
    </div>
  );
};

// Toast.js
const Toast = ({ type, message, duration = 3000, onHide }) => {
  useEffect(() => {
    const timer = setTimeout(onHide, duration);
    return () => clearTimeout(timer);
  }, [duration, onHide]);

  return (
    <div className={`toast ${type}`} role="alert">
      <div className="toast-content">
        <span className="toast-icon">{getIcon(type)}</span>
        <span className="toast-message">{message}</span>
      </div>
      <button 
        className="toast-close"
        onClick={onHide}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
};
```

**Example 3: UIContext Integration**
```javascript
// UIContext.js
import React, { createContext, useContext, useReducer } from 'react';

const UIContext = createContext();

const uiReducer = (state, action) => {
  switch (action.type) {
    case 'SHOW_MODAL':
      return {
        ...state,
        modals: {
          ...state.modals,
          [action.modalType]: {
            isOpen: true,
            data: action.data
          }
        }
      };
    
    case 'HIDE_MODAL':
      return {
        ...state,
        modals: {
          ...state.modals,
          [action.modalType]: {
            isOpen: false,
            data: null
          }
        }
      };
    
    case 'SHOW_TOAST':
      const newToast = {
        id: `toast-${Date.now()}`,
        type: action.toastType,
        message: action.message,
        duration: action.duration || 3000
      };
      return {
        ...state,
        toasts: [...state.toasts, newToast]
      };
    
    case 'HIDE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter(toast => toast.id !== action.toastId)
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.isLoading,
        loadingMessage: action.message || ''
      };
    
    default:
      return state;
  }
};

export const UIProvider = ({ children }) => {
  const [state, dispatch] = useReducer(uiReducer, {
    modals: {},
    toasts: [],
    isLoading: false,
    loadingMessage: ''
  });

  const showModal = (modalType, data = null) => {
    dispatch({ type: 'SHOW_MODAL', modalType, data });
  };

  const hideModal = (modalType) => {
    dispatch({ type: 'HIDE_MODAL', modalType });
  };

  const showToast = (toastType, message, duration) => {
    dispatch({ type: 'SHOW_TOAST', toastType, message, duration });
  };

  const hideToast = (toastId) => {
    dispatch({ type: 'HIDE_TOAST', toastId });
  };

  const setLoading = (isLoading, message = '') => {
    dispatch({ type: 'SET_LOADING', isLoading, message });
  };

  return (
    <UIContext.Provider value={{
      ...state,
      showModal,
      hideModal,
      showToast,
      hideToast,
      setLoading
    }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
```

---

## Testing Strategy

### Test Categories

**Unit Tests:**
- Modal: Renders correctly, handles ESC key, manages focus
- Toast: Auto-dismisses, shows correct type, handles close
- ContextMenu: Positions correctly, handles keyboard nav
- Toolbar: Renders buttons, handles disabled state
- StatusBar: Shows real-time data, updates correctly

**Integration Tests:**
- UIContext: Modal state management, toast queue
- Component interaction: Modal + Toast, Toolbar + StatusBar
- Keyboard navigation: Tab order, ESC handling
- Focus management: Focus trap in modal, restore focus

**Accessibility Tests:**
- Screen reader: ARIA labels, role attributes
- Keyboard navigation: All components accessible via keyboard
- Focus management: Focus trap, focus restoration
- Color contrast: Meets WCAG guidelines

**Edge Cases:**
- Multiple modals open simultaneously
- Toast queue overflow (max 5 toasts)
- Context menu positioning at screen edges
- Toolbar responsive behavior
- StatusBar with long text content

**Performance Tests:**
- Modal rendering: <100ms to show
- Toast animation: Smooth 300ms transition
- Context menu: <50ms to position
- Memory usage: No leaks from event listeners

---

## Success Criteria

**Feature is complete when:**
- [ ] Modal component renders with portal, handles ESC, manages focus
- [ ] Toast system shows/hides toasts with auto-dismiss
- [ ] ContextMenu positions correctly and handles keyboard nav
- [ ] Toolbar integrates with App layout and shows tool groups
- [ ] StatusBar displays real-time data and updates
- [ ] UIContext manages all UI state consistently
- [ ] All components are keyboard accessible
- [ ] Components integrate seamlessly into App layout
- [ ] No console errors or accessibility violations
- [ ] Components are reusable across V2 features

**Performance Targets:**
- Modal open/close: <100ms
- Toast animation: Smooth 300ms transition
- Context menu positioning: <50ms
- Memory usage: No leaks from event listeners

**Quality Gates:**
- Zero accessibility violations
- All components keyboard navigable
- No console errors
- Responsive design works
- Components reusable

---

## Risk Assessment

### Risk 1: Portal Rendering Issues
**Likelihood:** MEDIUM  
**Impact:** HIGH  
**Mitigation:** Test portal rendering early, use React.createPortal correctly  
**Status:** 🟡 MEDIUM

### Risk 2: Focus Management Complexity
**Likelihood:** MEDIUM  
**Impact:** MEDIUM  
**Mitigation:** Implement focus trap utility, test thoroughly  
**Status:** 🟡 MEDIUM

### Risk 3: Context Menu Positioning Edge Cases
**Likelihood:** HIGH  
**Impact:** MEDIUM  
**Mitigation:** Handle screen edge cases, test on different screen sizes  
**Status:** 🟡 MEDIUM

### Risk 4: Toast Queue Performance
**Likelihood:** LOW  
**Impact:** LOW  
**Mitigation:** Limit toast count, implement cleanup  
**Status:** 🟢 LOW

---

## Open Questions

1. **Modal Size Variants:** How many size variants (small, medium, large, fullscreen)?
   - Decision: Start with 3 (small, medium, large), add fullscreen later

2. **Toast Animation Library:** Use CSS transitions or animation library?
   - Decision: CSS transitions for simplicity and performance

3. **Context Menu Trigger:** Right-click only or also long-press on mobile?
   - Decision: Right-click for MVP, add long-press in future

4. **Toolbar Customization:** Allow user to customize toolbar layout?
   - Decision: Fixed layout for MVP, add customization in future

---

## Timeline

**Total Estimate:** 4 hours

| Phase | Task | Time | Status |
|-------|------|------|--------|
| 1 | UIContext Foundation | 1h | ⏳ |
| 2 | Core Components | 2h | ⏳ |
| 3 | Layout Components | 1h | ⏳ |

---

## Dependencies

**Requires:**
- [ ] PR #11 complete (State Management Refactor)
- [ ] UIContext pattern established
- [ ] App.js refactored to use Context API

**Blocks:**
- PR #13 (Multi-Track Timeline UI) - needs Modal and ContextMenu
- PR #17 (Screen Recording) - needs Toast for feedback
- PR #20 (Text Overlays) - needs Modal for text editor
- PR #23 (Export Settings) - needs Modal for settings

---

## References

- Related PR: [#11] (State Management Refactor)
- Design system: ClipForge dark theme established
- Accessibility: WCAG 2.1 AA guidelines
- React patterns: Context API, Portal rendering, Focus management

