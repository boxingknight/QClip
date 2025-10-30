// WebcamRecordingControls.js - Main webcam recording controls component
// PR#18: Webcam Recording

import React, { useState, useEffect } from 'react';
import { useRecording } from '../../context/RecordingContext';
import DeviceSelector from './DeviceSelector';
import RecordingSettings from './RecordingSettings';
import WebcamPreview from './WebcamPreview';
import './WebcamRecordingControls.css';

const WebcamRecordingControls = ({ onRecordingSaved }) => {
  const {
    isRecording,
    recordingType,
    selectedWebcamId,
    setSelectedWebcamId,
    availableWebcams,
    previewStream,
    recordingDuration,
    getWebcamDevices,
    startWebcamRecording,
    stopRecording,
    saveRecording,
    error,
    formatDuration
  } = useRecording();

  const [settings, setSettings] = useState({
    resolution: '1280x720',
    framerate: 30,
    audio: true
  });

  const [previewError, setPreviewError] = useState(null);

  useEffect(() => {
    // Load webcam devices on mount
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      await getWebcamDevices();
    } catch (err) {
      console.error('Failed to load devices:', err);
    }
  };

  const handleDeviceSelect = (deviceId) => {
    setSelectedWebcamId(deviceId);
  };

  const handleStartRecording = async () => {
    if (!selectedWebcamId) {
      alert('Please select a camera first');
      return;
    }

    const success = await startWebcamRecording(selectedWebcamId, settings);
    if (!success) {
      alert('Failed to start recording. Please check camera permissions.');
    }
  };

  const handleStopRecording = async () => {
    try {
      const blob = await stopRecording();
      
      // Auto-save to Media Library
      if (blob && blob.size > 0) {
        const filename = `webcam-recording-${Date.now()}.webm`;
        const recordingFile = await saveRecording(blob, filename);
        
        // Notify parent component
        if (onRecordingSaved) {
          onRecordingSaved(recordingFile);
        }
      }
    } catch (err) {
      console.error('Failed to stop recording:', err);
      alert(`Failed to stop recording: ${err.message}`);
    }
  };

  const handlePreviewError = (error) => {
    setPreviewError(error);
  };

  const handlePreviewReady = () => {
    setPreviewError(null);
  };

  return (
    <div className="webcam-recording-controls">
      <div className="controls-header">
        <h2>Webcam Recording</h2>
        {isRecording && recordingType === 'webcam' && (
          <div className="recording-status">
            <div className="recording-dot"></div>
            <span>Recording: {formatDuration(recordingDuration)}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <div className="controls-content">
        <div className="preview-section">
          <WebcamPreview
            deviceId={selectedWebcamId}
            isRecording={isRecording && recordingType === 'webcam'}
            onStreamReady={handlePreviewReady}
            onStreamError={handlePreviewError}
            className="main-preview"
            settings={settings}
          />
          {previewError && (
            <div className="preview-error">
              {previewError.message || 'Failed to load preview'}
            </div>
          )}
        </div>

        <div className="settings-section">
          <DeviceSelector
            selectedDeviceId={selectedWebcamId}
            onDeviceSelect={handleDeviceSelect}
            disabled={isRecording}
          />

          <RecordingSettings
            settings={settings}
            onSettingsChange={setSettings}
            disabled={isRecording}
          />

          <div className="recording-buttons">
            {!isRecording ? (
              <button
                onClick={handleStartRecording}
                disabled={!selectedWebcamId || previewError}
                className="btn-primary start-recording"
              >
                Start Recording
              </button>
            ) : recordingType === 'webcam' ? (
              <button
                onClick={handleStopRecording}
                className="btn-danger stop-recording"
              >
                Stop Recording
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebcamRecordingControls;

