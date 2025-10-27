import React from 'react';
import '../styles/Timeline.css';
import { formatDuration } from '../utils/timeHelpers';

const Timeline = ({ clips, selectedClip, onSelectClip, clipTrims }) => {
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

  return (
    <div className="timeline">
      <div className="timeline-header">
        <span className="timeline-info">
          {clips.length} clip{clips.length !== 1 ? 's' : ''} • 
          {formatDuration(totalDuration)} total
        </span>
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
            />
          );
        })}
      </div>
    </div>
  );
};

const ClipBlock = ({ clip, widthPercent, isSelected, onSelect, trimData }) => {
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

  return (
    <div
      className={`clip-block ${isSelected ? 'selected' : ''}`}
      style={{ width: `${Math.max(widthPercent, 10)}%` }}
      onClick={onSelect}
    >
      {/* Trim Overlay */}
      {hasTrim && (
        <div className="trim-overlay">
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
            />
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

