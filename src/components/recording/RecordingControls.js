import React, { useState } from 'react';
import { useRecording } from '../../context/RecordingContext';
import { useUI } from '../../context/UIContext';
import RecordingButton from './RecordingButton';
import RecordingIndicator from './RecordingIndicator';
import SourcePicker from './SourcePicker';
import './RecordingControls.css';

const RecordingControls = () => {
  const {
    isRecording,
    recordingDuration,
    recordingSource,
    getAvailableSources,
    startRecording,
    stopRecording,
    saveRecording,
    error
  } = useRecording();
  
  const { showModal, hideModal } = useUI();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleStartRecording = async () => {
    try {
      setIsLoading(true);
      
      // Show source picker if no source selected
      if (!recordingSource) {
        const sources = await getAvailableSources();
        const selectedSource = await new Promise((resolve) => {
          showModal('source-picker', {
            sources,
            onSelect: resolve,
            onCancel: () => resolve(null)
          });
        });
        
        if (!selectedSource) {
          setIsLoading(false);
          return;
        }
        setRecordingSource(selectedSource);
      }
      
      await startRecording(recordingSource.id, {
        includeAudio: true,
        quality: 'high'
      });
    } catch (err) {
      console.error('Failed to start recording', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStopRecording = async () => {
    try {
      setIsLoading(true);
      const blob = await stopRecording();
      await saveRecording(blob);
    } catch (err) {
      console.error('Failed to stop recording', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="recording-controls">
      {error && (
        <div className="recording-error">
          <span className="error-icon">⚠️</span>
          <span className="error-message">{error}</span>
        </div>
      )}
      
      {!isRecording ? (
        <RecordingButton
          onClick={handleStartRecording}
          label="Start Recording"
          icon="●"
          loading={isLoading}
          disabled={isLoading}
        />
      ) : (
        <div className="recording-active">
          <RecordingIndicator
            duration={recordingDuration}
            source={recordingSource}
          />
          <RecordingButton
            onClick={handleStopRecording}
            label="Stop Recording"
            icon="■"
            variant="danger"
            loading={isLoading}
            disabled={isLoading}
          />
        </div>
      )}
    </div>
  );
};

export default RecordingControls;
