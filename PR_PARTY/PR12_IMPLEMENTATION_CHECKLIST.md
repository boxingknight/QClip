# PR#12: Implementation Checklist

**Use this as your daily todo list.** Check off items as you complete them.

---

## Pre-Implementation Setup (15 minutes)

- [ ] Read main planning document (~45 min)
- [ ] Prerequisites verified
  - [ ] PR #11 (State Management Refactor) complete
  - [ ] UIContext pattern established
  - [ ] App.js using Context API
- [ ] Dependencies installed
  ```bash
  # No new dependencies needed
  ```
- [ ] Environment configured
  ```bash
  # Verify React 18+ for createPortal
  ```
- [ ] Git branch created
  ```bash
  git checkout -b feat/ui-component-library
  ```

---

## Phase 1: UIContext Foundation (1 hour)

### 1.1: Create UIContext (30 minutes)

#### Create UIContext File
- [ ] Create `src/context/UIContext.js`

#### Define State Structure
- [ ] Add modals state object
  ```javascript
  modals: {
    exportSettings: { isOpen: false, data: null },
    textEditor: { isOpen: false, clipId: null },
    transitionSelector: { isOpen: false, clipId: null }
  }
  ```

#### Add Toast Queue State
- [ ] Add toasts array
  ```javascript
  toasts: [
    { id: 'toast-1', type: 'success', message: 'Export complete', duration: 3000 }
  ]
  ```

#### Add Loading State
- [ ] Add loading state
  ```javascript
  isLoading: false,
  loadingMessage: ''
  ```

#### Implement Reducer
- [ ] Create uiReducer function
  ```javascript
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
      // ... other cases
    }
  };
  ```

#### Create Actions
- [ ] Implement showModal action
  ```javascript
  const showModal = (modalType, data = null) => {
    dispatch({ type: 'SHOW_MODAL', modalType, data });
  };
  ```

- [ ] Implement hideModal action
  ```javascript
  const hideModal = (modalType) => {
    dispatch({ type: 'HIDE_MODAL', modalType });
  };
  ```

- [ ] Implement showToast action
  ```javascript
  const showToast = (toastType, message, duration) => {
    dispatch({ type: 'SHOW_TOAST', toastType, message, duration });
  };
  ```

- [ ] Implement hideToast action
  ```javascript
  const hideToast = (toastId) => {
    dispatch({ type: 'HIDE_TOAST', toastId });
  };
  ```

- [ ] Implement setLoading action
  ```javascript
  const setLoading = (isLoading, message = '') => {
    dispatch({ type: 'SET_LOADING', isLoading, message });
  };
  ```

#### Create Provider Component
- [ ] Create UIProvider component
  ```javascript
  export const UIProvider = ({ children }) => {
    const [state, dispatch] = useReducer(uiReducer, initialState);
    
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
  ```

#### Create useUI Hook
- [ ] Create useUI hook
  ```javascript
  export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) {
      throw new Error('useUI must be used within a UIProvider');
    }
    return context;
  };
  ```

#### Test UIContext
- [ ] Test context provider renders
- [ ] Test showModal action
- [ ] Test hideModal action
- [ ] Test showToast action
- [ ] Test hideToast action
- [ ] Test setLoading action

**Checkpoint:** UIContext working ✓

**Commit:** `feat(ui): create UIContext with modal and toast state management`

---

### 1.2: Integrate UIContext into App (30 minutes)

#### Wrap App with UIProvider
- [ ] Update `src/App.js`
  ```javascript
  import { UIProvider } from './context/UIContext';
  
  function App() {
    return (
      <UIProvider>
        <TimelineProvider>
          <ProjectProvider>
            {/* existing app content */}
          </ProjectProvider>
        </TimelineProvider>
      </UIProvider>
    );
  }
  ```

#### Test Integration
- [ ] Verify App renders without errors
- [ ] Verify UIContext is available in components
- [ ] Test context provider nesting

**Checkpoint:** UIContext integrated ✓

**Commit:** `feat(ui): integrate UIContext into App component`

---

## Phase 2: Core Components (2 hours)

### 2.1: Modal Component (45 minutes)

#### Create Modal Component
- [ ] Create `src/components/ui/Modal.js`

#### Implement Portal Rendering
- [ ] Import createPortal from react-dom
  ```javascript
  import { createPortal } from 'react-dom';
  ```

#### Add Modal Structure
- [ ] Create modal overlay
  ```javascript
  <div className="modal-overlay" onClick={onClose}>
    <div className={`modal ${size}`} onClick={(e) => e.stopPropagation()}>
      {/* modal content */}
    </div>
  </div>
  ```

#### Implement Focus Management
- [ ] Add useRef for modal element
  ```javascript
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);
  ```

#### Add Focus Trap Effect
- [ ] Implement focus management useEffect
  ```javascript
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      modalRef.current?.focus();
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = 'unset';
        previousFocusRef.current?.focus();
      };
    }
  }, [isOpen]);
  ```

#### Add ESC Key Handling
- [ ] Add ESC key listener
  ```javascript
  const handleEsc = (e) => {
    if (e.key === 'Escape') onClose();
  };
  document.addEventListener('keydown', handleEsc);
  ```

#### Add Accessibility Attributes
- [ ] Add ARIA attributes
  ```javascript
  role="dialog"
  aria-modal="true"
  aria-labelledby={title ? "modal-title" : undefined}
  ```

#### Create Modal CSS
- [ ] Create `src/components/ui/Modal.css`
- [ ] Add overlay styles
  ```css
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  ```

- [ ] Add modal styles
  ```css
  .modal {
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    max-width: 90vw;
    max-height: 90vh;
    overflow: hidden;
  }
  
  .modal.small { width: 400px; }
  .modal.medium { width: 600px; }
  .modal.large { width: 800px; }
  ```

#### Test Modal Component
- [ ] Test modal opens and closes
- [ ] Test ESC key closes modal
- [ ] Test focus management
- [ ] Test click outside closes modal
- [ ] Test different sizes

**Checkpoint:** Modal component working ✓

**Commit:** `feat(ui): implement Modal component with portal and focus management`

---

### 2.2: Toast System (45 minutes)

#### Create Toast Component
- [ ] Create `src/components/ui/Toast.js`

#### Implement Toast Structure
- [ ] Add toast container
  ```javascript
  <div className={`toast ${type}`} role="alert">
    <div className="toast-content">
      <span className="toast-icon">{getIcon(type)}</span>
      <span className="toast-message">{message}</span>
    </div>
    <button className="toast-close" onClick={onHide}>×</button>
  </div>
  ```

#### Add Auto-Dismiss
- [ ] Implement auto-dismiss timer
  ```javascript
  useEffect(() => {
    const timer = setTimeout(onHide, duration);
    return () => clearTimeout(timer);
  }, [duration, onHide]);
  ```

#### Create ToastContainer Component
- [ ] Create `src/components/ui/ToastContainer.js`
- [ ] Implement toast queue rendering
  ```javascript
  <div className="toast-container" aria-live="polite" aria-atomic="true">
    {toasts.map(toast => (
      <Toast key={toast.id} {...toast} onHide={() => onHide(toast.id)} />
    ))}
  </div>
  ```

#### Create Toast CSS
- [ ] Create `src/components/ui/Toast.css`
- [ ] Add toast container styles
  ```css
  .toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1001;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  ```

- [ ] Add toast styles
  ```css
  .toast {
    background: var(--color-surface);
    border-radius: var(--radius-md);
    padding: 12px 16px;
    box-shadow: var(--shadow-md);
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 300px;
    animation: slideIn 0.3s ease-out;
  }
  
  .toast.success { border-left: 4px solid var(--color-success); }
  .toast.error { border-left: 4px solid var(--color-error); }
  .toast.warning { border-left: 4px solid var(--color-warning); }
  .toast.info { border-left: 4px solid var(--color-primary); }
  ```

#### Add Toast Animations
- [ ] Add slide-in animation
  ```css
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  ```

#### Test Toast System
- [ ] Test toast shows and auto-dismisses
- [ ] Test manual close button
- [ ] Test multiple toasts stack
- [ ] Test different toast types
- [ ] Test animations

**Checkpoint:** Toast system working ✓

**Commit:** `feat(ui): implement Toast system with auto-dismiss and animations`

---

### 2.3: ContextMenu Component (30 minutes)

#### Create ContextMenu Component
- [ ] Create `src/components/ui/ContextMenu.js`

#### Implement Context Menu Structure
- [ ] Add context menu container
  ```javascript
  <div 
    className="context-menu"
    style={{ left: x, top: y }}
    role="menu"
    aria-orientation="vertical"
  >
    {items.map(item => (
      <ContextMenuItem key={item.id} {...item} />
    ))}
  </div>
  ```

#### Add Positioning Logic
- [ ] Implement position calculation
  ```javascript
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const rect = triggerElement.getBoundingClientRect();
    setPosition({
      x: rect.right + 10,
      y: rect.top
    });
  }, [triggerElement]);
  ```

#### Create ContextMenuItem Component
- [ ] Create `src/components/ui/ContextMenuItem.js`
- [ ] Implement menu item structure
  ```javascript
  <div 
    className="context-menu-item"
    onClick={onClick}
    role="menuitem"
    tabIndex={0}
  >
    {icon && <span className="menu-item-icon">{icon}</span>}
    <span className="menu-item-text">{text}</span>
    {shortcut && <span className="menu-item-shortcut">{shortcut}</span>}
  </div>
  ```

#### Add Keyboard Navigation
- [ ] Implement arrow key navigation
  ```javascript
  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        focusNextItem();
        break;
      case 'ArrowUp':
        e.preventDefault();
        focusPreviousItem();
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        executeSelectedItem();
        break;
      case 'Escape':
        onClose();
        break;
    }
  };
  ```

#### Create ContextMenu CSS
- [ ] Create `src/components/ui/ContextMenu.css`
- [ ] Add context menu styles
  ```css
  .context-menu {
    position: fixed;
    background: var(--color-surface);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    padding: 8px 0;
    min-width: 200px;
    z-index: 1000;
  }
  
  .context-menu-item {
    padding: 8px 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .context-menu-item:hover {
    background: var(--color-surface-hover);
  }
  ```

#### Test ContextMenu Component
- [ ] Test context menu appears on right-click
- [ ] Test keyboard navigation
- [ ] Test menu item clicks
- [ ] Test ESC key closes menu
- [ ] Test positioning at screen edges

**Checkpoint:** ContextMenu component working ✓

**Commit:** `feat(ui): implement ContextMenu with keyboard navigation`

---

## Phase 3: Layout Components (1 hour)

### 3.1: Toolbar Component (30 minutes)

#### Create Toolbar Component
- [ ] Create `src/components/ui/Toolbar.js`

#### Implement Toolbar Structure
- [ ] Add toolbar container
  ```javascript
  <div className="toolbar" role="toolbar" aria-label="Main toolbar">
    <ToolbarGroup name="File" items={fileItems} />
    <ToolbarGroup name="Edit" items={editItems} />
    <ToolbarGroup name="View" items={viewItems} />
  </div>
  ```

#### Create ToolbarGroup Component
- [ ] Create `src/components/ui/ToolbarGroup.js`
- [ ] Implement button group
  ```javascript
  <div className="toolbar-group" role="group" aria-label={name}>
    {items.map(item => (
      <button
        key={item.id}
        className={`toolbar-button ${item.disabled ? 'disabled' : ''}`}
        onClick={item.onClick}
        disabled={item.disabled}
        title={item.tooltip}
        aria-label={item.label}
      >
        {item.icon}
      </button>
    ))}
  </div>
  ```

#### Add Toolbar Items
- [ ] Define file group items
  ```javascript
  const fileItems = [
    { id: 'new', icon: '📄', label: 'New Project', onClick: handleNew },
    { id: 'open', icon: '📁', label: 'Open Project', onClick: handleOpen },
    { id: 'save', icon: '💾', label: 'Save Project', onClick: handleSave }
  ];
  ```

- [ ] Define edit group items
  ```javascript
  const editItems = [
    { id: 'undo', icon: '↶', label: 'Undo', onClick: handleUndo, disabled: !canUndo },
    { id: 'redo', icon: '↷', label: 'Redo', onClick: handleRedo, disabled: !canRedo },
    { id: 'split', icon: '✂️', label: 'Split', onClick: handleSplit, disabled: !canSplit }
  ];
  ```

#### Create Toolbar CSS
- [ ] Create `src/components/ui/Toolbar.css`
- [ ] Add toolbar styles
  ```css
  .toolbar {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 16px;
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
  }
  
  .toolbar-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .toolbar-button {
    padding: 8px 12px;
    border: none;
    background: transparent;
    border-radius: var(--radius-md);
    cursor: pointer;
    color: var(--color-text-primary);
  }
  
  .toolbar-button:hover:not(.disabled) {
    background: var(--color-surface-hover);
  }
  
  .toolbar-button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  ```

#### Test Toolbar Component
- [ ] Test toolbar renders correctly
- [ ] Test button clicks work
- [ ] Test disabled state
- [ ] Test tooltips show on hover
- [ ] Test responsive layout

**Checkpoint:** Toolbar component working ✓

**Commit:** `feat(ui): implement Toolbar with grouped buttons`

---

### 3.2: StatusBar Component (30 minutes)

#### Create StatusBar Component
- [ ] Create `src/components/ui/StatusBar.js`

#### Implement StatusBar Structure
- [ ] Add status bar container
  ```javascript
  <div className="status-bar" role="status" aria-live="polite">
    <div className="status-left">
      <span className="project-name">{projectName}</span>
      <span className="saved-indicator">{isSaved ? '✓' : '*'}</span>
    </div>
    <div className="status-center">
      <span className="current-time">{formatTime(currentTime)}</span>
      <span className="duration">{formatTime(duration)}</span>
    </div>
    <div className="status-right">
      <span className="zoom-level">{zoomLevel}x</span>
      <span className="recording-indicator">{isRecording ? '🔴' : ''}</span>
    </div>
  </div>
  ```

#### Add Real-Time Updates
- [ ] Connect to TimelineContext for current time
  ```javascript
  const { currentTime, duration, zoom } = useTimeline();
  ```

- [ ] Connect to ProjectContext for project info
  ```javascript
  const { projectName, isSaved } = useProject();
  ```

- [ ] Connect to RecordingContext for recording status
  ```javascript
  const { isRecording } = useRecording();
  ```

#### Create StatusBar CSS
- [ ] Create `src/components/ui/StatusBar.css`
- [ ] Add status bar styles
  ```css
  .status-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    background: var(--color-surface);
    border-top: 1px solid var(--color-border);
    font-size: 14px;
    color: var(--color-text-secondary);
  }
  
  .status-left,
  .status-center,
  .status-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .saved-indicator {
    color: var(--color-success);
  }
  
  .recording-indicator {
    color: var(--color-error);
    animation: pulse 1s infinite;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  ```

#### Test StatusBar Component
- [ ] Test status bar renders correctly
- [ ] Test real-time updates
- [ ] Test project name display
- [ ] Test saved indicator
- [ ] Test recording indicator
- [ ] Test responsive layout

**Checkpoint:** StatusBar component working ✓

**Commit:** `feat(ui): implement StatusBar with real-time updates`

---

## Integration Phase (30 minutes)

### 4.1: Integrate Components into App

#### Update App Layout
- [ ] Update `src/App.js`
  ```javascript
  return (
    <div className="app">
      <Toolbar />
      <div className="app-content">
        {/* existing content */}
      </div>
      <StatusBar />
      <ToastContainer toasts={toasts} onHide={hideToast} />
    </div>
  );
  ```

#### Add App Layout CSS
- [ ] Update `src/App.css`
  ```css
  .app {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }
  
  .app-content {
    flex: 1;
    overflow: hidden;
  }
  ```

#### Test Integration
- [ ] Test all components render together
- [ ] Test layout is responsive
- [ ] Test no layout conflicts
- [ ] Test components work together

**Checkpoint:** All components integrated ✓

**Commit:** `feat(ui): integrate all UI components into App layout`

---

## Testing Phase (30 minutes)

### 5.1: Component Testing

#### Test Modal Component
- [ ] Test modal opens and closes
- [ ] Test ESC key closes modal
- [ ] Test focus management
- [ ] Test click outside closes modal
- [ ] Test different sizes
- [ ] Test accessibility attributes

#### Test Toast System
- [ ] Test toast shows and auto-dismisses
- [ ] Test manual close button
- [ ] Test multiple toasts stack
- [ ] Test different toast types
- [ ] Test animations
- [ ] Test accessibility

#### Test ContextMenu Component
- [ ] Test context menu appears on right-click
- [ ] Test keyboard navigation
- [ ] Test menu item clicks
- [ ] Test ESC key closes menu
- [ ] Test positioning at screen edges
- [ ] Test accessibility

#### Test Toolbar Component
- [ ] Test toolbar renders correctly
- [ ] Test button clicks work
- [ ] Test disabled state
- [ ] Test tooltips show on hover
- [ ] Test responsive layout
- [ ] Test accessibility

#### Test StatusBar Component
- [ ] Test status bar renders correctly
- [ ] Test real-time updates
- [ ] Test project name display
- [ ] Test saved indicator
- [ ] Test recording indicator
- [ ] Test responsive layout

### 5.2: Integration Testing

#### Test UIContext Integration
- [ ] Test modal state management
- [ ] Test toast queue management
- [ ] Test loading state
- [ ] Test context provider nesting

#### Test Component Interaction
- [ ] Test modal + toast interaction
- [ ] Test toolbar + status bar interaction
- [ ] Test context menu + modal interaction
- [ ] Test keyboard navigation across components

#### Test Accessibility
- [ ] Test screen reader compatibility
- [ ] Test keyboard navigation
- [ ] Test focus management
- [ ] Test ARIA attributes

#### Test Performance
- [ ] Test modal rendering performance
- [ ] Test toast animation performance
- [ ] Test context menu positioning performance
- [ ] Test memory usage

**Checkpoint:** All tests passing ✓

**Commit:** `test(ui): comprehensive testing of all UI components`

---

## Documentation Phase (15 minutes)

### 6.1: Update Documentation

#### Update Component Documentation
- [ ] Add JSDoc comments to all components
- [ ] Document component props
- [ ] Document usage examples
- [ ] Document accessibility features

#### Update README
- [ ] Add UI component library section
- [ ] Document component usage
- [ ] Add examples
- [ ] Update architecture section

#### Create Component Examples
- [ ] Create usage examples for each component
- [ ] Document best practices
- [ ] Document common patterns

**Checkpoint:** Documentation complete ✓

**Commit:** `docs(ui): add comprehensive documentation for UI components`

---

## Completion Checklist

- [ ] All components created and working
- [ ] UIContext integrated and tested
- [ ] Modal component with portal and focus management
- [ ] Toast system with auto-dismiss and animations
- [ ] ContextMenu with keyboard navigation
- [ ] Toolbar with grouped buttons
- [ ] StatusBar with real-time updates
- [ ] All components integrated into App layout
- [ ] Accessibility features implemented
- [ ] Performance acceptable
- [ ] No console errors
- [ ] Documentation complete
- [ ] All tests passing

**Total Time:** 4 hours  
**Result:** Complete UI component library ready for V2 features

**Next:** PR #13 - Multi-Track Timeline UI

