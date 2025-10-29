import React, { useState, useEffect } from 'react';
import { useRecording } from '../../context/RecordingContext';
import './SourcePicker.css';

const SourcePicker = ({ sources, onSelect, onCancel }) => {
  const [selectedSource, setSelectedSource] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleSelect = async () => {
    if (!selectedSource) return;
    
    setLoading(true);
    try {
      await onSelect(selectedSource);
    } catch (error) {
      console.error('Failed to select source', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="source-picker">
      <div className="source-picker__header">
        <h3 className="source-picker__title">Select Recording Source</h3>
        <p className="source-picker__subtitle">
          Choose what you want to record
        </p>
      </div>
      
      <div className="source-picker__sources">
        {sources.map((source) => (
          <div
            key={source.id}
            className={`source-picker__source ${
              selectedSource?.id === source.id ? 'source-picker__source--selected' : ''
            }`}
            onClick={() => setSelectedSource(source)}
          >
            <div className="source-picker__thumbnail">
              <img
                src={source.thumbnail}
                alt={source.name}
                className="source-picker__thumbnail-img"
              />
            </div>
            <div className="source-picker__info">
              <div className="source-picker__name">{source.name}</div>
              <div className="source-picker__type">
                {source.displayId ? 'Screen' : 'Window'}
              </div>
            </div>
            {selectedSource?.id === source.id && (
              <div className="source-picker__check">✓</div>
            )}
          </div>
        ))}
      </div>
      
      <div className="source-picker__actions">
        <button
          className="source-picker__button source-picker__button--secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          className="source-picker__button source-picker__button--primary"
          onClick={handleSelect}
          disabled={!selectedSource || loading}
        >
          {loading ? 'Starting...' : 'Start Recording'}
        </button>
      </div>
    </div>
  );
};

export default SourcePicker;
