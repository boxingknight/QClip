import React from 'react';
import { useRecording } from '../../context/RecordingContext';
import './RecordingIndicator.css';

const RecordingIndicator = ({ duration, source }) => {
  const { formatDuration } = useRecording();
  
  return (
    <div className="recording-indicator">
      <div className="recording-indicator__status">
        <div className="recording-indicator__dot" />
        <span className="recording-indicator__label">Recording</span>
      </div>
      
      <div className="recording-indicator__info">
        <div className="recording-indicator__duration">
          {formatDuration(duration)}
        </div>
        {source && (
          <div className="recording-indicator__source">
            {source.name}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordingIndicator;
