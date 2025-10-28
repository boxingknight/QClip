// src/context/LayoutContext.js
/**
 * Layout Context for managing resizable panel sizes
 * Inspired by CapCut and iMovie professional layouts
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Default layout configuration optimized for timeline editing
const DEFAULT_LAYOUT = {
  // Panel sizes as percentages of viewport
  sidebar: 20,        // Left sidebar (Import) - 20% of width
  main: 45,          // Main area (Video Player) - 45% of width  
  controls: 35,      // Right sidebar (Export) - 35% of width
  timeline: 35,      // Timeline height - 35% of height
  
  // Minimum sizes to prevent panels from becoming unusable
  minSidebar: 200,   // Minimum 200px width
  minMain: 300,     // Minimum 300px width
  minControls: 250,  // Minimum 250px width
  minTimeline: 150,  // Minimum 150px height
  
  // Maximum sizes to prevent panels from taking over
  maxSidebar: 40,    // Maximum 40% of width
  maxMain: 70,       // Maximum 70% of width
  maxControls: 50,   // Maximum 50% of width
  maxTimeline: 60,   // Maximum 60% of height
};

const initialState = {
  // Current panel sizes
  sidebar: DEFAULT_LAYOUT.sidebar,
  main: DEFAULT_LAYOUT.main,
  controls: DEFAULT_LAYOUT.controls,
  timeline: DEFAULT_LAYOUT.timeline,
  
  // Resize state
  isResizing: false,
  resizeDirection: null, // 'horizontal' or 'vertical'
  resizeStart: { x: 0, y: 0 },
  
  // Layout presets
  presets: {
    default: DEFAULT_LAYOUT,
    timeline: { ...DEFAULT_LAYOUT, timeline: 50, main: 40 }, // Timeline-focused
    player: { ...DEFAULT_LAYOUT, main: 60, timeline: 25 },   // Player-focused
    compact: { ...DEFAULT_LAYOUT, sidebar: 15, controls: 25, timeline: 30 }, // Compact
  },
  
  // Current preset
  currentPreset: 'default',
  
  // Auto-save settings
  autoSave: true,
};

const layoutReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PANEL_SIZE':
      const { panel, size } = action;
      const minSize = DEFAULT_LAYOUT[`min${panel.charAt(0).toUpperCase() + panel.slice(1)}`];
      const maxSize = DEFAULT_LAYOUT[`max${panel.charAt(0).toUpperCase() + panel.slice(1)}`];
      
      // Clamp size between min and max
      const clampedSize = Math.max(minSize, Math.min(maxSize, size));
      
      return {
        ...state,
        [panel]: clampedSize,
        currentPreset: 'custom', // Mark as custom when manually adjusted
      };

    case 'START_RESIZE':
      return {
        ...state,
        isResizing: true,
        resizeDirection: action.direction,
        resizeStart: action.start,
      };

    case 'UPDATE_RESIZE':
      if (!state.isResizing) return state;
      
      const deltaX = action.current.x - state.resizeStart.x;
      const deltaY = action.current.y - state.resizeStart.y;
      
      // Calculate new sizes based on resize direction
      let newState = { ...state };
      
      if (state.resizeDirection === 'horizontal') {
        // Horizontal resize affects sidebar/main/controls
        const totalWidth = state.sidebar + state.main + state.controls;
        const deltaPercent = (deltaX / window.innerWidth) * 100;
        
        // Adjust panels proportionally
        newState.sidebar = Math.max(
          DEFAULT_LAYOUT.minSidebar / window.innerWidth * 100,
          Math.min(DEFAULT_LAYOUT.maxSidebar, state.sidebar + deltaPercent)
        );
        newState.main = Math.max(
          DEFAULT_LAYOUT.minMain / window.innerWidth * 100,
          Math.min(DEFAULT_LAYOUT.maxMain, state.main - deltaPercent)
        );
      } else if (state.resizeDirection === 'vertical') {
        // Vertical resize affects timeline height
        const deltaPercent = (deltaY / window.innerHeight) * 100;
        
        newState.timeline = Math.max(
          DEFAULT_LAYOUT.minTimeline / window.innerHeight * 100,
          Math.min(DEFAULT_LAYOUT.maxTimeline, state.timeline - deltaPercent)
        );
      }
      
      return {
        ...newState,
        currentPreset: 'custom',
      };

    case 'END_RESIZE':
      return {
        ...state,
        isResizing: false,
        resizeDirection: null,
        resizeStart: { x: 0, y: 0 },
      };

    case 'SET_PRESET':
      const preset = state.presets[action.preset];
      if (!preset) return state;
      
      return {
        ...state,
        ...preset,
        currentPreset: action.preset,
      };

    case 'RESET_LAYOUT':
      return {
        ...state,
        ...DEFAULT_LAYOUT,
        currentPreset: 'default',
      };

    case 'LOAD_LAYOUT':
      return {
        ...state,
        ...action.layout,
        currentPreset: action.preset || 'custom',
      };

    default:
      return state;
  }
};

const LayoutContext = createContext();

export const LayoutProvider = ({ children }) => {
  const [state, dispatch] = useReducer(layoutReducer, initialState);

  // Load saved layout on mount
  useEffect(() => {
    const savedLayout = localStorage.getItem('clipforge-layout');
    if (savedLayout) {
      try {
        const layout = JSON.parse(savedLayout);
        dispatch({ type: 'LOAD_LAYOUT', layout });
      } catch (error) {
        console.warn('Failed to load saved layout:', error);
      }
    }
  }, []);

  // Save layout when it changes
  useEffect(() => {
    if (state.autoSave) {
      const layoutToSave = {
        sidebar: state.sidebar,
        main: state.main,
        controls: state.controls,
        timeline: state.timeline,
        currentPreset: state.currentPreset,
      };
      localStorage.setItem('clipforge-layout', JSON.stringify(layoutToSave));
    }
  }, [state.sidebar, state.main, state.controls, state.timeline, state.currentPreset, state.autoSave]);

  // Context value
  const value = {
    // State
    ...state,
    
    // Actions
    setPanelSize: (panel, size) => dispatch({ type: 'SET_PANEL_SIZE', panel, size }),
    startResize: (direction, start) => dispatch({ type: 'START_RESIZE', direction, start }),
    updateResize: (current) => dispatch({ type: 'UPDATE_RESIZE', current }),
    endResize: () => dispatch({ type: 'END_RESIZE' }),
    setPreset: (preset) => dispatch({ type: 'SET_PRESET', preset }),
    resetLayout: () => dispatch({ type: 'RESET_LAYOUT' }),
    
    // Computed values
    getPanelSize: (panel) => state[panel],
    getMinSize: (panel) => DEFAULT_LAYOUT[`min${panel.charAt(0).toUpperCase() + panel.slice(1)}`],
    getMaxSize: (panel) => DEFAULT_LAYOUT[`max${panel.charAt(0).toUpperCase() + panel.slice(1)}`],
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};
