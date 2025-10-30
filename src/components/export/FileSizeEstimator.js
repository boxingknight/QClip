// src/components/export/FileSizeEstimator.js
import React, { useEffect, useState } from 'react';
import { estimateFileSize } from '../../utils/fileSizeEstimator';
import { useTimeline } from '../../context/TimelineContext';
import './FileSizeEstimator.css';

const FileSizeEstimator = ({ settings }) => {
  const { clips } = useTimeline();
  const [fileSize, setFileSize] = useState(null);
  
  useEffect(() => {
    // Calculate total duration from all clips (considering trims)
    let totalDuration = 0;
    
    if (clips && clips.length > 0) {
      clips.forEach(clip => {
        if (clip.trimIn !== undefined && clip.trimOut !== undefined) {
          totalDuration += (clip.trimOut - clip.trimIn);
        } else {
          totalDuration += (clip.duration || 0);
        }
      });
    }
    
    if (totalDuration > 0) {
      const estimate = estimateFileSize(totalDuration, settings);
      setFileSize(estimate);
    } else {
      setFileSize(null);
    }
  }, [clips, settings]);
  
  if (!fileSize) return null;
  
  return (
    <div className="file-size-estimator">
      <h4>Estimated File Size</h4>
      <div className="file-size-display">
        <span className="file-size-value">{fileSize.size}</span>
        <span className="file-size-unit">{fileSize.unit}</span>
      </div>
      <div className="file-size-note">
        Estimate based on current timeline duration and settings
      </div>
    </div>
  );
};

export default FileSizeEstimator;
