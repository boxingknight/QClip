import React, { useState } from 'react';
import { useRecording } from '../../context/RecordingContext';
import { useUI } from '../../context/UIContext';
import RecordingButton from './RecordingButton';
import RecordingIndicator from './RecordingIndicator';
import SourcePicker from './SourcePicker';
import WebcamRecordingControls from './WebcamRecordingControls';
import PIPRecordingControls from './PIPRecordingControls';
import './RecordingControls.css';

const RecordingControls = () => {
  const [recordingMode, setRecordingMode] = useState('screen'); // 'screen' | 'webcam' | 'pip'
  const {
    isRecording,
    recordingDuration,
    recordingSource,
    setRecordingSource,
    getAvailableSources,
    startRecording,
    stopRecording,
    saveRecording,
    error
  } = useRecording();
  
  const { showModal, hideModal, showToast } = useUI();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleStartRecording = async () => {
    try {
      setIsLoading(true);
      
      // Always get sources and show picker if multiple screens available
      const sources = await getAvailableSources();
      
      // Always show source picker (allows user to change selection)
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
      
      // Set the selected source
      setRecordingSource(selectedSource);
      
      // Start recording with selected source
      await startRecording(selectedSource.id, {
        includeAudio: true,
        quality: 'high'
      });
    } catch (err) {
      console.error('Failed to start recording', err);
      // Error state is handled by RecordingContext
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
  
  // Handle recording saved callback for webcam
  const handleWebcamRecordingSaved = (recordingFile) => {
    // Note: saveRecording() already adds to Media Library via RecordingContext
    // No need to call addMediaItems() here to avoid duplicates
    
    showToast({
      type: 'success',
      title: 'Recording Saved',
      message: `Webcam recording added to Media Library: ${recordingFile.name}`,
      duration: 3000
    });
  };

  return (
    <div className="recording-controls">
      {/* Recording mode selector */}
      <div className="recording-mode-selector">
        <button
          className={`mode-button ${recordingMode === 'screen' ? 'active' : ''}`}
          onClick={() => setRecordingMode('screen')}
          disabled={isRecording}
        >
          🖥️ Screen
        </button>
        <button
          className={`mode-button ${recordingMode === 'webcam' ? 'active' : ''}`}
          onClick={() => setRecordingMode('webcam')}
          disabled={isRecording}
        >
          📷 Webcam
        </button>
        <button
          className={`mode-button ${recordingMode === 'pip' ? 'active' : ''}`}
          onClick={() => setRecordingMode('pip')}
          disabled={isRecording}
        >
          📺 Picture-in-Picture
        </button>
      </div>

      {recordingMode === 'pip' ? (
        <PIPRecordingControls onRecordingSaved={handleWebcamRecordingSaved} />
      ) : recordingMode === 'webcam' ? (
        <WebcamRecordingControls onRecordingSaved={handleWebcamRecordingSaved} />
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};

export default RecordingControls;
