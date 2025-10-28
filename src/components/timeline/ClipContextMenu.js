// src/components/timeline/ClipContextMenu.js
/**
 * ClipContextMenu component
 * Context menu for clip operations (split, copy, paste, delete, etc.)
 */

import React, { useEffect, useRef } from 'react';
import { useTimeline } from '../../hooks/useTimeline';
import './ClipContextMenu.css';

const ClipContextMenu = ({ clip, position, onClose }) => {
  const {
    splitClip,
    duplicateClip,
    removeClip,
    playhead,
    saveState
  } = useTimeline();
  
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleSplit = () => {
    // Split clip at playhead position
    const splitTime = playhead - clip.startTime;
    
    if (splitTime > 0 && splitTime < clip.duration) {
      splitClip(clip.id, splitTime);
      saveState();
    }
    onClose();
  };

  const handleCopy = () => {
    // Copy clip to clipboard (will be implemented with clipboard state)
    // For now, just duplicate
    duplicateClip(clip.id);
    saveState();
    onClose();
  };

  const handleDuplicate = () => {
    duplicateClip(clip.id);
    saveState();
    onClose();
  };

  const handleDelete = () => {
    removeClip(clip.id);
    saveState();
    onClose();
  };

  const canSplit = playhead > clip.startTime && playhead < clip.startTime + clip.duration;

  return (
    <div
      ref={menuRef}
      className="clip-context-menu"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
    >
      <div className="context-menu-header">
        <span className="context-menu-title">{clip.name}</span>
      </div>
      
      <div className="context-menu-divider" />
      
      <button
        className="context-menu-item"
        onClick={handleSplit}
        disabled={!canSplit}
        title={canSplit ? 'Split clip at playhead' : 'Playhead not on clip'}
      >
        <span className="context-menu-icon">✂️</span>
        <span className="context-menu-label">Split at Playhead</span>
        <span className="context-menu-shortcut">Cmd+B</span>
      </button>
      
      <div className="context-menu-divider" />
      
      <button
        className="context-menu-item"
        onClick={handleCopy}
      >
        <span className="context-menu-icon">📋</span>
        <span className="context-menu-label">Copy</span>
        <span className="context-menu-shortcut">Cmd+C</span>
      </button>
      
      <button
        className="context-menu-item"
        onClick={handleDuplicate}
      >
        <span className="context-menu-icon">📑</span>
        <span className="context-menu-label">Duplicate</span>
        <span className="context-menu-shortcut">Cmd+D</span>
      </button>
      
      <div className="context-menu-divider" />
      
      <button
        className="context-menu-item danger"
        onClick={handleDelete}
      >
        <span className="context-menu-icon">🗑️</span>
        <span className="context-menu-label">Delete</span>
        <span className="context-menu-shortcut">Del</span>
      </button>
    </div>
  );
};

export default ClipContextMenu;

