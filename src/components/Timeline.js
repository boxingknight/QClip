import React from 'react';
import '../styles/Timeline.css';
import { formatDuration } from '../utils/timeHelpers';

const Timeline = ({ clips, selectedClip, onSelectClip }) => {
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
          
          return (
            <ClipBlock
              key={clip.id}
              clip={clip}
              widthPercent={widthPercent}
              isSelected={selectedClip?.id === clip.id}
              onSelect={() => onSelectClip(clip)}
            />
          );
        })}
      </div>
    </div>
  );
};

const ClipBlock = ({ clip, widthPercent, isSelected, onSelect }) => {
  return (
    <div
      className={`clip-block ${isSelected ? 'selected' : ''}`}
      style={{ width: `${Math.max(widthPercent, 10)}%` }}
      onClick={onSelect}
    >
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

