// src/components/ui/ResizeHandle.js
/**
 * ResizeHandle component for resizing panels
 * Provides visual feedback and handles resize interactions
 */

import React, { useRef, useCallback } from 'react';
import './ResizeHandle.css';

const ResizeHandle = ({ 
  direction, // 'horizontal' or 'vertical'
  onResizeStart, 
  onResizeMove, 
  onResizeEnd,
  className = '',
  disabled = false 
}) => {
  const handleRef = useRef(null);
  const isResizingRef = useRef(false);

  const handleMouseDown = useCallback((e) => {
    if (disabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    isResizingRef.current = true;
    
    const startPos = {
      x: e.clientX,
      y: e.clientY
    };
    
    onResizeStart?.(direction, startPos);
    
    // Add global mouse event listeners
    const handleMouseMove = (e) => {
      if (!isResizingRef.current) return;
      
      const currentPos = {
        x: e.clientX,
        y: e.clientY
      };
      
      onResizeMove?.(currentPos);
    };
    
    const handleMouseUp = () => {
      if (!isResizingRef.current) return;
      
      isResizingRef.current = false;
      onResizeEnd?.();
      
      // Remove global listeners
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [direction, onResizeStart, onResizeMove, onResizeEnd, disabled]);

  return (
    <div
      ref={handleRef}
      className={`resize-handle resize-handle--${direction} ${className} ${disabled ? 'resize-handle--disabled' : ''}`}
      onMouseDown={handleMouseDown}
      title={`Resize ${direction === 'horizontal' ? 'panels' : 'timeline'}`}
    >
      <div className="resize-handle__indicator" />
    </div>
  );
};

export default ResizeHandle;
