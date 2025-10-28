// src/components/ui/LayoutToolbar.js
/**
 * LayoutToolbar component for switching between layout presets
 * Quick access to different layout configurations
 */

import React from 'react';
import { useLayout } from '../../context/LayoutContext';
import './LayoutToolbar.css';

const LayoutToolbar = () => {
  const { 
    currentPreset, 
    setPreset, 
    resetLayout,
    presets 
  } = useLayout();

  const presetButtons = [
    { key: 'default', label: 'Default', icon: '⚖️' },
    { key: 'timeline', label: 'Timeline', icon: '🎬' },
    { key: 'player', label: 'Player', icon: '📺' },
    { key: 'compact', label: 'Compact', icon: '📱' },
  ];

  return (
    <div className="layout-toolbar">
      <div className="layout-toolbar__presets">
        {presetButtons.map(({ key, label, icon }) => (
          <button
            key={key}
            className={`layout-toolbar__preset ${currentPreset === key ? 'active' : ''}`}
            onClick={() => setPreset(key)}
            title={`Switch to ${label} layout`}
          >
            <span className="layout-toolbar__icon">{icon}</span>
            <span className="layout-toolbar__label">{label}</span>
          </button>
        ))}
      </div>
      
      <div className="layout-toolbar__actions">
        <button
          className="layout-toolbar__reset"
          onClick={resetLayout}
          title="Reset to default layout"
        >
          🔄 Reset
        </button>
      </div>
    </div>
  );
};

export default LayoutToolbar;
