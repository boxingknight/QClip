// Toolbar.js - Main toolbar component with grouped buttons
// V2 Feature: Professional toolbar with tooltips and accessibility
// Status: Implemented for PR #12

import React from 'react';
import './Toolbar.css';

const Toolbar = ({ 
  title, 
  subtitle, 
  groups = [], 
  className = '',
  onAction 
}) => {
  const handleAction = (action, data) => {
    if (onAction) {
      onAction(action, data);
    }
  };

  return (
    <div className={`toolbar ${className}`} role="toolbar" aria-label="Main toolbar">
      {title && (
        <div className="toolbar-info">
          <h1 className="toolbar-title">{title}</h1>
          {subtitle && (
            <p className="toolbar-subtitle">{subtitle}</p>
          )}
        </div>
      )}
      
      <div className="toolbar-spacer" />
      
      {groups.map((group, groupIndex) => (
        <div key={groupIndex} className="toolbar-group">
          {group.items?.map((item, itemIndex) => {
            if (item.type === 'separator') {
              return <div key={itemIndex} className="toolbar-separator" />;
            }

            return (
              <ToolbarButton
                key={itemIndex}
                item={item}
                onClick={() => handleAction(item.action, item.data)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

const ToolbarButton = ({ item, onClick }) => {
  const { 
    icon, 
    label, 
    action, 
    disabled = false, 
    primary = false, 
    tooltip,
    shortcut 
  } = item;

  const buttonProps = {
    className: `toolbar-button ${primary ? 'toolbar-button-primary' : ''} ${!label ? 'toolbar-button-icon-only' : ''}`,
    onClick,
    disabled,
    role: 'button',
    tabIndex: 0,
    title: tooltip || (shortcut ? `${label} (${shortcut})` : label),
    'aria-label': label || tooltip,
  };

  return (
    <button {...buttonProps}>
      {icon && (
        <div className="toolbar-button-icon">
          {icon}
        </div>
      )}
      {label && <span>{label}</span>}
    </button>
  );
};

// Predefined toolbar groups for common actions
export const ToolbarGroups = {
  // File operations
  file: {
    items: [
      {
        icon: '📁',
        label: 'Import',
        action: 'import',
        tooltip: 'Import video files'
      },
      {
        icon: '💾',
        label: 'Save',
        action: 'save',
        tooltip: 'Save project',
        shortcut: 'Ctrl+S'
      },
      {
        icon: '📤',
        label: 'Export',
        action: 'export',
        tooltip: 'Export video',
        shortcut: 'Ctrl+E'
      }
    ]
  },

  // Recording operations
  recording: {
    items: [
      {
        icon: '🔴',
        label: 'Record',
        action: 'record',
        tooltip: 'Start recording',
        shortcut: 'Ctrl+R'
      },
      {
        icon: '⏹',
        label: 'Stop',
        action: 'stop',
        tooltip: 'Stop recording',
        disabled: true
      }
    ]
  },

  // Timeline operations
  timeline: {
    items: [
      {
        icon: '✂️',
        label: 'Split',
        action: 'split',
        tooltip: 'Split clip at playhead',
        shortcut: 'S'
      },
      {
        icon: '🗑️',
        label: 'Delete',
        action: 'delete',
        tooltip: 'Delete selected clip',
        shortcut: 'Delete'
      },
      {
        icon: '↩️',
        label: 'Undo',
        action: 'undo',
        tooltip: 'Undo last action',
        shortcut: 'Ctrl+Z'
      },
      {
        icon: '↪️',
        label: 'Redo',
        action: 'redo',
        tooltip: 'Redo last action',
        shortcut: 'Ctrl+Y'
      }
    ]
  },

  // Playback controls
  playback: {
    items: [
      {
        icon: '⏮',
        label: 'Previous',
        action: 'previous',
        tooltip: 'Go to previous frame',
        shortcut: '←'
      },
      {
        icon: '⏯',
        label: 'Play',
        action: 'play',
        tooltip: 'Play/pause',
        shortcut: 'Space'
      },
      {
        icon: '⏭',
        label: 'Next',
        action: 'next',
        tooltip: 'Go to next frame',
        shortcut: '→'
      }
    ]
  }
};

export default Toolbar;

