import React, { useState } from 'react';
import '../styles/Timeline.css';
import { formatDuration } from '../utils/timeHelpers';

const Timeline = ({ clips, selectedClip, onSelectClip, clipTrims, onSetInPoint, onSetOutPoint, onApplyTrim, onResetTrim, isRendering, renderProgress }) => {
  // Empty state
  if (!clips || clips.length === 0) {
    return (
      <div className="timeline timeline-empty">
        <div className="timeline-empty-icon">🎬</div>
        <p className="timeline-empty-title">No clips yet</p>
        <p className="timeline-empty-hint">
          Import video files to get started
        </p>
      </div>
    );
  }

  // Calculate total duration for proportional widths
  const totalDuration = clips.reduce((sum, clip) => sum + (clip.duration || 0), 0);

  // Get current selected clip's trim data
  const currentTrimData = selectedClip ? (clipTrims[selectedClip.id] || { inPoint: 0, outPoint: selectedClip.duration || 0 }) : null;
  const hasValidTrim = currentTrimData && currentTrimData.inPoint < currentTrimData.outPoint;

  return (
    <div className="timeline">
      <div className="timeline-header">
        <span className="timeline-info">
          {clips.length} clip{clips.length !== 1 ? 's' : ''} • 
          {formatDuration(totalDuration)} total
        </span>
        
        {/* Trim Control Buttons */}
        {selectedClip && currentTrimData && (
          <div className="timeline-trim-controls">
            <button
              className="btn-timeline-reset"
              onClick={onResetTrim}
              title="Reset trim"
            >
              Reset
            </button>
            <button
              className={`btn-timeline-apply ${!hasValidTrim || isRendering ? 'disabled' : ''}`}
              onClick={onApplyTrim}
              disabled={!hasValidTrim || isRendering}
              title={isRendering ? 'Applying trim...' : 'Apply trim'}
            >
              {isRendering ? `Applying... ${Math.round(renderProgress)}%` : 'Apply Trim'}
            </button>
          </div>
        )}
      </div>
      
      <div className="timeline-clips">
        {clips.map(clip => {
          const widthPercent = totalDuration > 0 
            ? ((clip.duration || 0) / totalDuration) * 100 
            : 100;
          
          // Get this clip's trim data
          const clipTrimData = clipTrims[clip.id] || { inPoint: 0, outPoint: clip.duration || 0 };
          
          return (
            <ClipBlock
              key={clip.id}
              clip={clip}
              widthPercent={widthPercent}
              isSelected={selectedClip?.id === clip.id}
              onSelect={() => onSelectClip(clip)}
              trimData={clipTrimData}
              onSetInPoint={onSetInPoint}
              onSetOutPoint={onSetOutPoint}
            />
          );
        })}
      </div>
    </div>
  );
};

const ClipBlock = ({ clip, widthPercent, isSelected, onSelect, trimData, onSetInPoint, onSetOutPoint }) => {
  const [draggingHandle, setDraggingHandle] = useState(null);
  
  // Calculate trim overlay positions
  const hasTrim = trimData && clip.duration;
  const leftDarkenPercent = hasTrim && trimData.inPoint > 0
    ? (trimData.inPoint / clip.duration) * 100
    : 0;
  const rightDarkenPercent = hasTrim && trimData.outPoint < clip.duration
    ? ((clip.duration - trimData.outPoint) / clip.duration) * 100
    : 0;
  const trimmedRegionLeft = hasTrim ? (trimData.inPoint / clip.duration) * 100 : 0;
  const trimmedRegionWidth = hasTrim ? ((trimData.outPoint - trimData.inPoint) / clip.duration) * 100 : 0;

  // Drag start
  const handleDragStart = (e, isInHandle) => {
    if (!isSelected || !hasTrim) return;
    e.stopPropagation();
    e.preventDefault();
    setDraggingHandle(isInHandle ? 'in' : 'out');
  };

  // Drag move - only when dragging
  const handleDragMove = (e) => {
    if (!draggingHandle || !isSelected || !hasTrim) return;
    
    const clipBlock = e.currentTarget.closest('.clip-block');
    if (!clipBlock) return;
    
    const rect = clipBlock.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const time = (percent / 100) * clip.duration;
    
    if (draggingHandle === 'in') {
      onSetInPoint(time);
    } else {
      onSetOutPoint(time);
    }
  };

  // Drag end
  const handleDragEnd = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setDraggingHandle(null);
  };

  // Add mouse listeners when dragging
  React.useEffect(() => {
    if (draggingHandle) {
      const handleGlobalMouseMove = (e) => {
        const clipBlock = document.querySelector(`.clip-block.selected`);
        if (!clipBlock) return;
        const rect = clipBlock.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
        const time = (percent / 100) * clip.duration;
        
        if (draggingHandle === 'in') {
          onSetInPoint(time);
        } else {
          onSetOutPoint(time);
        }
      };

      const handleGlobalMouseUp = () => {
        setDraggingHandle(null);
      };

      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [draggingHandle, onSetInPoint, onSetOutPoint]);

  const handleTimelineClick = (e) => {
    if (!isSelected || !hasTrim) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = (x / rect.width) * 100;
    const time = (percent / 100) * clip.duration;
    
    // Click to set trim point
    if (percent < trimmedRegionLeft + (trimmedRegionWidth / 2)) {
      onSetInPoint(time);
    } else {
      onSetOutPoint(time);
    }
  };

  return (
    <div
      className={`clip-block ${isSelected ? 'selected' : ''} ${isSelected && hasTrim ? 'trim-active' : ''}`}
      style={{ width: `${Math.max(widthPercent, 10)}%` }}
      onClick={onSelect}
      onDoubleClick={handleTimelineClick}
    >
      {/* Trim Overlay */}
      {hasTrim && isSelected && (
        <div className="trim-overlay" onClick={handleTimelineClick}>
          {/* Left darkened region (before in-point) */}
          {leftDarkenPercent > 0 && (
            <div
              className="trim-darken"
              style={{ 
                width: `${leftDarkenPercent}%`,
                left: 0
              }}
            />
          )}
          
          {/* Trimmed region (highlighted) */}
          {trimmedRegionWidth > 0 && (
            <div 
              className="trim-highlighted"
              style={{
                left: `${trimmedRegionLeft}%`,
                width: `${trimmedRegionWidth}%`
              }}
            >
              {/* Draggable IN Handle */}
              <div
                className="trim-handle trim-handle-in"
                style={{ left: 0 }}
                onMouseDown={(e) => handleDragStart(e, true)}
                title="Drag to adjust IN point"
              />
              
              {/* Draggable OUT Handle */}
              <div
                className="trim-handle trim-handle-out"
                style={{ right: 0 }}
                onMouseDown={(e) => handleDragStart(e, false)}
                title="Drag to adjust OUT point"
              />
            </div>
          )}
          
          {/* Right darkened region (after out-point) */}
          {rightDarkenPercent > 0 && (
            <div
              className="trim-darken"
              style={{ 
                width: `${rightDarkenPercent}%`,
                right: 0
              }}
            />
          )}
        </div>
      )}
      
      <div className="clip-info">
        <span className="clip-name" title={clip.name}>
          {clip.name}
        </span>
        <span className="clip-duration">
          {formatDuration(clip.duration)}
        </span>
      </div>
    </div>
  );
};

export default Timeline;

