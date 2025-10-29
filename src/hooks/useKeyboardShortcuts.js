// src/hooks/useKeyboardShortcuts.js
/**
 * Custom hook for keyboard shortcuts
 * Handles global keyboard shortcuts for timeline operations
 */

import { useEffect } from 'react';
import { useTimeline } from './useTimeline';

export const useKeyboardShortcuts = () => {
  const {
    selection,
    splitClip,
    duplicateClip,
    removeClip,
    playhead,
    clips,
    undo,
    redo,
    canUndo,
    canRedo,
    saveState
  } = useTimeline();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for modifier keys
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Undo: Cmd/Ctrl + Z
      if (cmdOrCtrl && e.key === 'z' && !e.shiftKey && canUndo()) {
        e.preventDefault();
        undo();
        return;
      }

      // Redo: Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y
      if ((cmdOrCtrl && e.shiftKey && e.key === 'z') || (cmdOrCtrl && e.key === 'y')) {
        if (canRedo()) {
          e.preventDefault();
          redo();
        }
        return;
      }

      // Only proceed with clip operations if clips are selected
      if (selection.clips.length === 0) return;

      // Delete: Delete or Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        selection.clips.forEach(clipId => {
          removeClip(clipId);
        });
        saveState();
        return;
      }

      // Duplicate: Cmd/Ctrl + D
      if (cmdOrCtrl && e.key === 'd') {
        e.preventDefault();
        selection.clips.forEach(clipId => {
          duplicateClip(clipId);
        });
        saveState();
        return;
      }

      // Split at playhead: Cmd/Ctrl + B
      if (cmdOrCtrl && e.key === 'b') {
        e.preventDefault();
        
        // Find clips that intersect with the playhead
        selection.clips.forEach(clipId => {
          const clip = clips.find(c => c.id === clipId);
          if (clip) {
            const splitTime = playhead - clip.startTime;
            // splitClip expects absolute timeline time (playhead), not relative time
            if (splitTime > 0 && splitTime < clip.duration) {
              splitClip(clipId, playhead); // Pass absolute time (playhead)
            }
          }
        });
        saveState();
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    selection,
    splitClip,
    duplicateClip,
    removeClip,
    playhead,
    clips,
    undo,
    redo,
    canUndo,
    canRedo,
    saveState
  ]);
};

