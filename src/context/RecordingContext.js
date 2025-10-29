// RecordingContext.js - Recording state management
// V2 Feature: Context API for recording state
// Status: Implemented for PR #17

import React, { createContext, useContext, useState, useCallback } from 'react';
import { logger } from '../utils/logger';

const RecordingContext = createContext();

export const useRecording = () => {
  const context = useContext(RecordingContext);
  if (!context) {
    throw new Error('useRecording must be used within RecordingProvider');
  }
  return context;
};

export const RecordingProvider = ({ children }) => {
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingSource, setRecordingSource] = useState(null);
  const [mediaStream, setMediaStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [recordingSettings, setRecordingSettings] = useState({
    includeAudio: true,
    videoCodec: 'vp9',
    audioCodec: 'opus',
    frameRate: 30,
    videoQuality: 'high'
  });
  const [savedRecordings, setSavedRecordings] = useState([]);
  const [error, setError] = useState(null);

  // Get available screen sources
  const getAvailableSources = useCallback(async () => {
    try {
      setError(null);
      logger.info('Getting available screen sources');
      
      if (!window.electronAPI?.getScreenSources) {
        throw new Error('Screen recording API not available');
      }
      
      const sources = await window.electronAPI.getScreenSources();
      
      logger.info(`Found ${sources.length} screen sources`);
      
      return sources.map(source => ({
        id: source.id,
        name: source.name,
        displayId: source.displayId || '',
        thumbnail: source.thumbnail
      }));
    } catch (error) {
      logger.error('Failed to get screen sources', error);
      setError('Unable to access screen sources. Please check permissions.');
      throw error;
    }
  }, []);

  // Start recording
  const startRecording = useCallback(async (sourceId, options = {}) => {
    let timer = null;
    try {
      setError(null);
      logger.info('Starting screen recording', { sourceId, options });
      
      // Get media stream - Electron desktopCapturer format
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false, // System audio requires additional setup, handle separately if needed
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: sourceId
          }
        }
      });
      
      // Setup MediaRecorder
      const mimeType = 'video/webm;codecs=vp9';
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: options.quality === 'high' ? 8000000 : 4000000
      });
      
      const chunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        setRecordedChunks([blob]);
        stream.getTracks().forEach(track => track.stop());
        logger.info('Recording stopped, blob created', { size: blob.size });
      };
      
      mediaRecorder.onerror = (event) => {
        logger.error('MediaRecorder error', event);
        setError('Recording error occurred');
      };
      
      // Start recording
      mediaRecorder.start(1000); // Collect chunks every second
      setMediaRecorder(mediaRecorder);
      setMediaStream(stream);
      setIsRecording(true);
      setStartTime(Date.now());
      setRecordedChunks([]);
      
      // Start duration timer
      timer = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      // Store timer ref for cleanup
      window.recordingTimer = timer;
      
      logger.info('Recording started successfully');
      return timer;
    } catch (error) {
      // Clean up timer if recording failed
      if (timer) {
        clearInterval(timer);
      }
      logger.error('Failed to start recording', error);
      setError(`Failed to start recording: ${error.message}`);
      setIsRecording(false);
      setMediaRecorder(null);
      setMediaStream(null);
      throw error;
    }
  }, []);

  // Stop recording
  const stopRecording = useCallback(async () => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorder || !isRecording) {
        reject(new Error('No active recording'));
        return;
      }
      
      logger.info('Stopping recording');
      
      // Clear duration timer
      if (window.recordingTimer) {
        clearInterval(window.recordingTimer);
        window.recordingTimer = null;
      }
      
      const chunks = [];
      
      // Collect all chunks before stopping
      const collectChunks = () => {
        if (recordedChunks.length > 0) {
          chunks.push(...recordedChunks);
        }
      };
      
      const handleStop = () => {
        const allChunks = chunks.length > 0 ? chunks : recordedChunks;
        const blob = new Blob(allChunks, { type: 'video/webm' });
        setIsRecording(false);
        setMediaRecorder(null);
        setMediaStream(null);
        setRecordingDuration(0);
        setStartTime(null);
        setRecordedChunks([]);
        logger.info('Recording stopped', { blobSize: blob.size });
        resolve(blob);
      };
      
      // Setup one-time stop handler
      const oneTimeStopHandler = () => {
        mediaRecorder.removeEventListener('stop', oneTimeStopHandler);
        collectChunks();
        handleStop();
      };
      
      mediaRecorder.addEventListener('stop', oneTimeStopHandler);
      
      if (mediaRecorder.state === 'recording' || mediaRecorder.state === 'paused') {
        mediaRecorder.stop();
      } else {
        // Already stopped, just cleanup
        collectChunks();
        handleStop();
      }
    });
  }, [mediaRecorder, isRecording, recordedChunks]);

  // Save recording
  const saveRecording = useCallback(async (blob, filename) => {
    try {
      logger.info('Saving recording', { blobSize: blob.size, filename });
      
      // Get save location
      const savePath = await window.electronAPI.showSaveDialog();
      
      if (!savePath.canceled && savePath.filePath) {
        // Ensure .webm extension for recordings
        const filePath = savePath.filePath.endsWith('.webm') || savePath.filePath.endsWith('.mp4')
          ? savePath.filePath
          : `${savePath.filePath}.webm`;
        // Convert Blob to ArrayBuffer for IPC (Blobs can't be serialized)
        const arrayBuffer = await blob.arrayBuffer();
        
        // Write file via IPC (passing ArrayBuffer instead of Blob)
        await window.electronAPI.saveRecordingFile(arrayBuffer, filePath);
        
        // Get metadata
        const metadata = await window.electronAPI.getVideoMetadata(filePath);
        
        const recordingFile = {
          id: `recording-${Date.now()}`,
          name: filename || `recording-${Date.now()}.webm`,
          path: filePath,
          duration: metadata.duration,
          size: blob.size,
          format: filePath.endsWith('.mp4') ? 'mp4' : 'webm',
          timestamp: Date.now(),
          source: recordingSource,
          thumbnail: metadata.thumbnailUrl
        };
        
        // Add to saved recordings
        setSavedRecordings(prev => [...prev, recordingFile]);
        
        logger.info('Recording saved successfully', recordingFile);
        return recordingFile;
      } else {
        throw new Error('Save cancelled by user');
      }
    } catch (error) {
      logger.error('Failed to save recording', error);
      setError(`Failed to save recording: ${error.message}`);
      throw error;
    }
  }, [recordingSource]);

  // Cancel recording
  const cancelRecording = useCallback(() => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
    setMediaRecorder(null);
    setMediaStream(null);
    setRecordedChunks([]);
    setRecordingDuration(0);
    setStartTime(null);
    setError(null);
    logger.info('Recording cancelled');
  }, [mediaRecorder, isRecording, mediaStream]);

  // Utility functions
  const formatDuration = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const getRecordingSize = useCallback((blob) => {
    return blob ? blob.size : 0;
  }, []);

  const value = {
    // State
    isRecording,
    isPaused,
    recordingSource,
    setRecordingSource,
    recordedChunks,
    recordingDuration,
    recordingSettings,
    savedRecordings,
    error,
    
    // Actions
    getAvailableSources,
    startRecording,
    stopRecording,
    saveRecording,
    cancelRecording,
    
    // Utilities
    formatDuration,
    getRecordingSize
  };

  return (
    <RecordingContext.Provider value={value}>
      {children}
    </RecordingContext.Provider>
  );
};
