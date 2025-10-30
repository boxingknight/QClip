// PIPRecordingControls.js - Picture-in-Picture recording controls component
// PR#32: Picture-in-Picture Recording

import React, { useState } from 'react';
import { useRecording } from '../../context/RecordingContext';
import { useUI } from '../../context/UIContext';
import SourcePicker from './SourcePicker';
import DeviceSelector from './DeviceSelector';
import PIPSettings from './PIPSettings';
import PIPPreview from './PIPPreview';
import RecordingButton from './RecordingButton';
import RecordingIndicator from './RecordingIndicator';
import './PIPRecordingControls.css';

const PIPRecordingControls = ({ onRecordingSaved }) => {
  const {
    isRecording,
    recordingMode,
    recordingType,
    pipSettings,
    setPipSettings,
    screenStream,
    webcamStream,
    recordingDuration,
    getAvailableSources,
    getWebcamDevices,
    startPIPRecording,
    stopRecording,
    saveRecording,
    error,
    formatDuration
  } = useRecording();
  
  const { showModal, showToast } = useUI();
  
  const [selectedScreenSource, setSelectedScreenSource] = useState(null);
  const [selectedWebcamId, setSelectedWebcamId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewScreenStream, setPreviewScreenStream] = useState(null);
  const [previewWebcamStream, setPreviewWebcamStream] = useState(null);

  // Setup preview streams when sources selected
  React.useEffect(() => {
    const setupPreviewStreams = async () => {
      // Clean up existing preview streams
      if (previewScreenStream) {
        previewScreenStream.getTracks().forEach(track => track.stop());
      }
      if (previewWebcamStream) {
        previewWebcamStream.getTracks().forEach(track => track.stop());
      }
      
      if (selectedScreenSource && selectedWebcamId) {
        try {
          // Get screen preview stream
          const screenStream = await navigator.mediaDevices.getUserMedia({
            video: {
              mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: selectedScreenSource.id
              }
            }
          });
          setPreviewScreenStream(screenStream);
          
          // Get webcam preview stream
          const webcamStream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: { exact: selectedWebcamId }
            }
          });
          setPreviewWebcamStream(webcamStream);
        } catch (err) {
          console.error('Failed to setup preview streams:', err);
          // Don't show error for preview, just won't show preview
        }
      } else {
        setPreviewScreenStream(null);
        setPreviewWebcamStream(null);
      }
    };
    
    setupPreviewStreams();
    
    return () => {
      if (previewScreenStream) {
        previewScreenStream.getTracks().forEach(track => track.stop());
      }
      if (previewWebcamStream) {
        previewWebcamStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [selectedScreenSource, selectedWebcamId]);

  const handleScreenSourceSelect = async () => {
    try {
      const sources = await getAvailableSources();
      
      const selectedSource = await new Promise((resolve) => {
        showModal('source-picker', {
          sources,
          onSelect: resolve,
          onCancel: () => resolve(null)
        });
      });
      
      if (selectedSource) {
        setSelectedScreenSource(selectedSource);
      }
    } catch (err) {
      console.error('Failed to select screen source:', err);
      showToast({
        type: 'error',
        title: 'Source Selection Failed',
        message: err.message || 'Failed to get screen sources',
        duration: 3000
      });
    }
  };

  const handleWebcamSelect = (deviceId) => {
    setSelectedWebcamId(deviceId);
  };

  const handleStartRecording = async () => {
    if (!selectedScreenSource || !selectedWebcamId) {
      showToast({
        type: 'error',
        title: 'Selection Required',
        message: 'Please select both screen source and webcam device',
        duration: 3000
      });
      return;
    }

    try {
      setIsLoading(true);
      const success = await startPIPRecording(
        selectedScreenSource.id,
        selectedWebcamId,
        pipSettings,
        { quality: 'high' }
      );
      
      if (!success) {
        showToast({
          type: 'error',
          title: 'Recording Failed',
          message: error || 'Failed to start PIP recording',
          duration: 3000
        });
      }
    } catch (err) {
      console.error('Failed to start PIP recording:', err);
      showToast({
        type: 'error',
        title: 'Recording Failed',
        message: err.message || 'Failed to start PIP recording',
        duration: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopRecording = async () => {
    try {
      setIsLoading(true);
      const blob = await stopRecording();
      
      if (blob && blob.size > 0) {
        const filename = `pip-recording-${Date.now()}.webm`;
        const recordingFile = await saveRecording(blob, filename);
        
        // Note: saveRecording() already adds to Media Library via RecordingContext
        // No need to call addMediaItems() here to avoid duplicates
        
        showToast({
          type: 'success',
          title: 'Recording Saved',
          message: `PIP recording added to Media Library: ${recordingFile.name}`,
          duration: 3000
        });
        
        if (onRecordingSaved) {
          onRecordingSaved(recordingFile);
        }
      }
    } catch (err) {
      console.error('Failed to stop recording:', err);
      showToast({
        type: 'error',
        title: 'Stop Failed',
        message: err.message || 'Failed to stop recording',
        duration: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pip-recording-controls">
      <div className="pip-controls-header">
        <h2>Picture-in-Picture Recording</h2>
        {isRecording && recordingMode === 'pip' && (
          <RecordingIndicator
            duration={recordingDuration}
            source={{ name: 'PIP Recording' }}
          />
        )}
      </div>

      {error && (
        <div className="pip-error-banner">
          <span className="error-icon">⚠️</span>
          <span className="error-message">{error}</span>
        </div>
      )}

      <div className="pip-controls-content">
        <div className="pip-source-selection">
          <div className="pip-source-item">
            <label className="pip-source-label">Screen Source</label>
            {selectedScreenSource ? (
              <div className="pip-source-selected">
                <span>{selectedScreenSource.name}</span>
                <button
                  type="button"
                  onClick={handleScreenSourceSelect}
                  disabled={isRecording}
                  className="pip-change-source-btn"
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleScreenSourceSelect}
                disabled={isRecording}
                className="pip-select-source-btn"
              >
                Select Screen Source
              </button>
            )}
          </div>

          <div className="pip-source-item">
            <label className="pip-source-label">Webcam Device</label>
            <DeviceSelector
              selectedDeviceId={selectedWebcamId}
              onDeviceSelect={handleWebcamSelect}
              disabled={isRecording}
            />
          </div>
        </div>

        <div className="pip-settings-section">
          <PIPSettings
            settings={pipSettings}
            onSettingsChange={setPipSettings}
            disabled={isRecording}
          />
        </div>

        {(selectedScreenSource && selectedWebcamId) && (
          <div className="pip-preview-section">
            <PIPPreview
              screenStream={previewScreenStream}
              webcamStream={previewWebcamStream}
              pipSettings={pipSettings}
              isRecording={isRecording && recordingMode === 'pip'}
            />
          </div>
        )}

        <div className="pip-recording-buttons">
          {!isRecording ? (
            <RecordingButton
              onClick={handleStartRecording}
              label="Start PIP Recording"
              icon="●"
              loading={isLoading}
              disabled={isLoading || !selectedScreenSource || !selectedWebcamId}
            />
          ) : recordingMode === 'pip' ? (
            <RecordingButton
              onClick={handleStopRecording}
              label="Stop Recording"
              icon="■"
              variant="danger"
              loading={isLoading}
              disabled={isLoading}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PIPRecordingControls;

