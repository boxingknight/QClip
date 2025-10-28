# PR#12: Testing Guide

---

## Test Categories

### 1. Unit Tests

**Modal Component:**
- [ ] Test modal renders when isOpen=true
- [ ] Test modal doesn't render when isOpen=false
- [ ] Test ESC key closes modal
- [ ] Test click outside closes modal
- [ ] Test focus management (focus trap)
- [ ] Test focus restoration on close
- [ ] Test different sizes (small, medium, large)
- [ ] Test accessibility attributes (role, aria-modal, aria-labelledby)

**Toast Component:**
- [ ] Test toast renders with correct type and message
- [ ] Test toast auto-dismisses after duration
- [ ] Test manual close button works
- [ ] Test toast shows correct icon for type
- [ ] Test accessibility attributes (role="alert")

**ToastContainer Component:**
- [ ] Test renders multiple toasts
- [ ] Test toasts stack vertically
- [ ] Test toast removal from queue
- [ ] Test accessibility attributes (aria-live, aria-atomic)

**ContextMenu Component:**
- [ ] Test context menu appears at correct position
- [ ] Test keyboard navigation (arrow keys)
- [ ] Test Enter key executes selected item
- [ ] Test ESC key closes menu
- [ ] Test menu item clicks work
- [ ] Test accessibility attributes (role="menu")

**ContextMenuItem Component:**
- [ ] Test menu item renders with icon, text, shortcut
- [ ] Test menu item click handler
- [ ] Test hover state styling
- [ ] Test accessibility attributes (role="menuitem")

**Toolbar Component:**
- [ ] Test toolbar renders with all groups
- [ ] Test button clicks work
- [ ] Test disabled state styling
- [ ] Test tooltips show on hover
- [ ] Test accessibility attributes (role="toolbar")

**ToolbarGroup Component:**
- [ ] Test button group renders correctly
- [ ] Test buttons are properly grouped
- [ ] Test accessibility attributes (role="group")

**StatusBar Component:**
- [ ] Test status bar renders with all sections
- [ ] Test real-time updates (current time, duration)
- [ ] Test project name display
- [ ] Test saved indicator (✓ or *)
- [ ] Test recording indicator (🔴)
- [ ] Test zoom level display
- [ ] Test accessibility attributes (role="status")

**UIContext:**
- [ ] Test showModal action updates state
- [ ] Test hideModal action updates state
- [ ] Test showToast action adds to queue
- [ ] Test hideToast action removes from queue
- [ ] Test setLoading action updates state
- [ ] Test context provider renders without errors

---

### 2. Integration Tests

**Modal + UIContext Integration:**
- [ ] Test modal opens via UIContext.showModal
- [ ] Test modal closes via UIContext.hideModal
- [ ] Test modal data is passed correctly
- [ ] Test multiple modals can be open simultaneously
- [ ] Test modal state persists across component re-renders

**Toast + UIContext Integration:**
- [ ] Test toast shows via UIContext.showToast
- [ ] Test toast hides via UIContext.hideToast
- [ ] Test toast queue management
- [ ] Test toast auto-dismiss integration
- [ ] Test multiple toasts in queue

**ContextMenu + Event Integration:**
- [ ] Test context menu appears on right-click
- [ ] Test context menu positioning relative to click
- [ ] Test context menu closes on click outside
- [ ] Test context menu closes on ESC key
- [ ] Test context menu works with different trigger elements

**Toolbar + App Integration:**
- [ ] Test toolbar integrates with App layout
- [ ] Test toolbar buttons trigger correct actions
- [ ] Test toolbar responsive behavior
- [ ] Test toolbar accessibility with screen reader

**StatusBar + Context Integration:**
- [ ] Test status bar connects to TimelineContext
- [ ] Test status bar connects to ProjectContext
- [ ] Test status bar connects to RecordingContext
- [ ] Test status bar updates in real-time
- [ ] Test status bar shows correct information

**Component Interaction:**
- [ ] Test modal + toast interaction (modal with toast notification)
- [ ] Test toolbar + status bar interaction (button updates status)
- [ ] Test context menu + modal interaction (context menu opens modal)
- [ ] Test all components work together in App layout

---

### 3. Accessibility Tests

**Screen Reader Compatibility:**
- [ ] Test modal announces as dialog
- [ ] Test modal title is announced
- [ ] Test toast announces as alert
- [ ] Test context menu announces as menu
- [ ] Test toolbar announces as toolbar
- [ ] Test status bar announces as status
- [ ] Test all ARIA labels are announced correctly

**Keyboard Navigation:**
- [ ] Test Tab key navigates through modal elements
- [ ] Test Tab key navigates through toolbar buttons
- [ ] Test Tab key navigates through context menu items
- [ ] Test Shift+Tab reverses navigation
- [ ] Test Enter key activates buttons and menu items
- [ ] Test Space key activates buttons
- [ ] Test ESC key closes modal and context menu
- [ ] Test arrow keys navigate context menu

**Focus Management:**
- [ ] Test focus is trapped in modal
- [ ] Test focus is restored when modal closes
- [ ] Test focus moves to first element when modal opens
- [ ] Test focus moves to close button when modal opens
- [ ] Test focus is not lost during component updates
- [ ] Test focus management works with multiple modals

**Color Contrast:**
- [ ] Test modal text meets WCAG AA contrast ratio (4.5:1)
- [ ] Test toast text meets WCAG AA contrast ratio
- [ ] Test context menu text meets WCAG AA contrast ratio
- [ ] Test toolbar text meets WCAG AA contrast ratio
- [ ] Test status bar text meets WCAG AA contrast ratio
- [ ] Test all interactive elements meet contrast requirements

---

### 4. Edge Cases

**Modal Edge Cases:**
- [ ] Test modal with very long title
- [ ] Test modal with very long content
- [ ] Test modal with no title
- [ ] Test modal with no content
- [ ] Test modal with custom size
- [ ] Test modal on very small screen
- [ ] Test modal on very large screen
- [ ] Test modal with multiple instances

**Toast Edge Cases:**
- [ ] Test toast with very long message
- [ ] Test toast with no message
- [ ] Test toast with very short duration (100ms)
- [ ] Test toast with very long duration (30s)
- [ ] Test maximum number of toasts (5)
- [ ] Test toast queue overflow
- [ ] Test toast with special characters
- [ ] Test toast with HTML content

**ContextMenu Edge Cases:**
- [ ] Test context menu at screen top edge
- [ ] Test context menu at screen bottom edge
- [ ] Test context menu at screen left edge
- [ ] Test context menu at screen right edge
- [ ] Test context menu with very long menu items
- [ ] Test context menu with no items
- [ ] Test context menu with disabled items
- [ ] Test context menu with submenus

**Toolbar Edge Cases:**
- [ ] Test toolbar with no buttons
- [ ] Test toolbar with many buttons (overflow)
- [ ] Test toolbar on very narrow screen
- [ ] Test toolbar with very long button labels
- [ ] Test toolbar with all buttons disabled
- [ ] Test toolbar with mixed enabled/disabled buttons

**StatusBar Edge Cases:**
- [ ] Test status bar with very long project name
- [ ] Test status bar with no project name
- [ ] Test status bar with very long duration
- [ ] Test status bar with zero duration
- [ ] Test status bar with negative time
- [ ] Test status bar with very high zoom level
- [ ] Test status bar with all indicators active

**UIContext Edge Cases:**
- [ ] Test UIContext with no provider
- [ ] Test UIContext with multiple providers
- [ ] Test UIContext state updates during render
- [ ] Test UIContext with invalid modal type
- [ ] Test UIContext with invalid toast type
- [ ] Test UIContext with very large state

---

### 5. Performance Tests

**Modal Performance:**
- [ ] Test modal opens in <100ms
- [ ] Test modal closes in <100ms
- [ ] Test modal renders without layout shift
- [ ] Test modal with large content doesn't lag
- [ ] Test modal memory usage doesn't increase over time

**Toast Performance:**
- [ ] Test toast animation is smooth (60fps)
- [ ] Test toast transition completes in 300ms
- [ ] Test multiple toasts don't cause lag
- [ ] Test toast cleanup doesn't leak memory
- [ ] Test toast queue doesn't grow indefinitely

**ContextMenu Performance:**
- [ ] Test context menu positions in <50ms
- [ ] Test context menu renders without lag
- [ ] Test context menu with many items doesn't lag
- [ ] Test context menu cleanup doesn't leak memory
- [ ] Test context menu keyboard navigation is responsive

**Toolbar Performance:**
- [ ] Test toolbar renders in <50ms
- [ ] Test toolbar button clicks are responsive
- [ ] Test toolbar hover states are smooth
- [ ] Test toolbar doesn't cause layout shifts
- [ ] Test toolbar memory usage is stable

**StatusBar Performance:**
- [ ] Test status bar updates in <16ms (60fps)
- [ ] Test status bar doesn't cause layout shifts
- [ ] Test status bar with frequent updates doesn't lag
- [ ] Test status bar memory usage is stable
- [ ] Test status bar cleanup doesn't leak memory

**Overall Performance:**
- [ ] Test all components render together without lag
- [ ] Test memory usage doesn't increase over time
- [ ] Test no memory leaks from event listeners
- [ ] Test no memory leaks from timers
- [ ] Test no memory leaks from DOM references

---

## Acceptance Criteria

**Feature is complete when:**
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All accessibility tests pass
- [ ] All edge cases handled gracefully
- [ ] All performance targets met
- [ ] No console errors or warnings
- [ ] No accessibility violations
- [ ] Components integrate seamlessly into App
- [ ] Components are reusable across V2 features
- [ ] Documentation is complete and accurate

**Performance Targets:**
- Modal open/close: <100ms
- Toast animation: Smooth 300ms transition
- Context menu positioning: <50ms
- Memory usage: No leaks from event listeners
- Overall performance: No lag with all components active

**Quality Gates:**
- Zero accessibility violations
- All components keyboard navigable
- No console errors
- Responsive design works on all screen sizes
- Components reusable and maintainable

---

## Test Data

**Modal Test Data:**
```javascript
const modalTestData = {
  small: { size: 'small', title: 'Small Modal', content: 'Short content' },
  medium: { size: 'medium', title: 'Medium Modal', content: 'Medium length content with more text' },
  large: { size: 'large', title: 'Large Modal', content: 'Very long content that should wrap and test the modal layout' },
  noTitle: { size: 'medium', title: null, content: 'Modal without title' },
  noContent: { size: 'medium', title: 'Empty Modal', content: null }
};
```

**Toast Test Data:**
```javascript
const toastTestData = {
  success: { type: 'success', message: 'Operation completed successfully', duration: 3000 },
  error: { type: 'error', message: 'An error occurred', duration: 5000 },
  warning: { type: 'warning', message: 'Warning message', duration: 4000 },
  info: { type: 'info', message: 'Information message', duration: 3000 },
  longMessage: { type: 'info', message: 'This is a very long message that should test the toast layout and wrapping behavior', duration: 3000 },
  shortDuration: { type: 'info', message: 'Quick message', duration: 100 },
  longDuration: { type: 'info', message: 'Long duration message', duration: 30000 }
};
```

**ContextMenu Test Data:**
```javascript
const contextMenuTestData = {
  basic: [
    { id: 'cut', text: 'Cut', icon: '✂️', shortcut: 'Ctrl+X' },
    { id: 'copy', text: 'Copy', icon: '📋', shortcut: 'Ctrl+C' },
    { id: 'paste', text: 'Paste', icon: '📄', shortcut: 'Ctrl+V' }
  ],
  withDisabled: [
    { id: 'cut', text: 'Cut', icon: '✂️', shortcut: 'Ctrl+X', disabled: true },
    { id: 'copy', text: 'Copy', icon: '📋', shortcut: 'Ctrl+C' },
    { id: 'paste', text: 'Paste', icon: '📄', shortcut: 'Ctrl+V', disabled: true }
  ],
  longItems: [
    { id: 'long1', text: 'This is a very long menu item that should test the layout', icon: '📝' },
    { id: 'long2', text: 'Another very long menu item with different content', icon: '📝' }
  ]
};
```

**Toolbar Test Data:**
```javascript
const toolbarTestData = {
  fileItems: [
    { id: 'new', icon: '📄', label: 'New Project', onClick: () => {} },
    { id: 'open', icon: '📁', label: 'Open Project', onClick: () => {} },
    { id: 'save', icon: '💾', label: 'Save Project', onClick: () => {} }
  ],
  editItems: [
    { id: 'undo', icon: '↶', label: 'Undo', onClick: () => {}, disabled: false },
    { id: 'redo', icon: '↷', label: 'Redo', onClick: () => {}, disabled: true },
    { id: 'split', icon: '✂️', label: 'Split', onClick: () => {}, disabled: false }
  ],
  viewItems: [
    { id: 'zoom-in', icon: '🔍+', label: 'Zoom In', onClick: () => {} },
    { id: 'zoom-out', icon: '🔍-', label: 'Zoom Out', onClick: () => {} },
    { id: 'fit', icon: '📐', label: 'Fit to Screen', onClick: () => {} }
  ]
};
```

**StatusBar Test Data:**
```javascript
const statusBarTestData = {
  normal: {
    projectName: 'My Video Project',
    isSaved: true,
    currentTime: 125.5,
    duration: 300.0,
    zoomLevel: 1.0,
    isRecording: false
  },
  unsaved: {
    projectName: 'Unsaved Project',
    isSaved: false,
    currentTime: 0,
    duration: 0,
    zoomLevel: 1.0,
    isRecording: false
  },
  recording: {
    projectName: 'Recording Project',
    isSaved: true,
    currentTime: 45.2,
    duration: 120.0,
    zoomLevel: 2.0,
    isRecording: true
  },
  longName: {
    projectName: 'This is a very long project name that should test the status bar layout',
    isSaved: true,
    currentTime: 999.9,
    duration: 9999.9,
    zoomLevel: 10.0,
    isRecording: false
  }
};
```

---

## Test Environment Setup

**Required Tools:**
- Jest for unit testing
- React Testing Library for component testing
- Jest-axe for accessibility testing
- Chrome DevTools for performance testing
- Screen reader (NVDA, JAWS, or VoiceOver) for accessibility testing

**Test Commands:**
```bash
# Run all tests
npm test

# Run specific test file
npm test -- Modal.test.js

# Run tests with coverage
npm test -- --coverage

# Run accessibility tests
npm test -- --testNamePattern="accessibility"

# Run performance tests
npm test -- --testNamePattern="performance"

# Run tests in watch mode
npm test -- --watch
```

**Test File Structure:**
```
src/
├── components/
│   └── ui/
│       ├── Modal.js
│       ├── Modal.test.js
│       ├── Toast.js
│       ├── Toast.test.js
│       ├── ContextMenu.js
│       ├── ContextMenu.test.js
│       ├── Toolbar.js
│       ├── Toolbar.test.js
│       ├── StatusBar.js
│       └── StatusBar.test.js
├── context/
│   ├── UIContext.js
│   └── UIContext.test.js
└── __tests__/
    ├── integration/
    │   ├── ModalIntegration.test.js
    │   ├── ToastIntegration.test.js
    │   └── AllComponents.test.js
    ├── accessibility/
    │   ├── Accessibility.test.js
    │   └── ScreenReader.test.js
    └── performance/
        ├── Performance.test.js
        └── MemoryLeaks.test.js
```

---

## Manual Testing Checklist

**Before Automated Testing:**
- [ ] All components render without errors
- [ ] All components are visually correct
- [ ] All interactions work as expected
- [ ] All animations are smooth
- [ ] All components are responsive
- [ ] All components work together
- [ ] No console errors or warnings
- [ ] No accessibility violations
- [ ] Performance is acceptable
- [ ] Memory usage is stable

**After Automated Testing:**
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All accessibility tests pass
- [ ] All performance tests pass
- [ ] All edge cases handled
- [ ] Documentation is accurate
- [ ] Components are ready for V2 features

