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
    try {
      setError(null);
      logger.info('Starting screen recording', { sourceId, options });
      
      // Get media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: options.includeAudio !== false 
          ? { 
              mandatory: { 
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: sourceId
              } 
            }
          : false,
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
      const timer = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      logger.info('Recording started successfully');
      return timer;
    } catch (error) {
      logger.error('Failed to start recording', error);
      setError(`Failed to start recording: ${error.message}`);
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
      
      const handleStop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        setIsRecording(false);
        setMediaRecorder(null);
        setMediaStream(null);
        setRecordingDuration(0);
        setStartTime(null);
        logger.info('Recording stopped', { blobSize: blob.size });
        resolve(blob);
      };
      
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
      
      // Wait for onstop event (handled in startRecording setup)
      setTimeout(() => {
        if (recordedChunks.length > 0) {
          handleStop();
        } else {
          reject(new Error('No recording data collected'));
        }
      }, 500);
    });
  }, [mediaRecorder, isRecording, recordedChunks]);

  // Save recording
  const saveRecording = useCallback(async (blob, filename) => {
    try {
      logger.info('Saving recording', { blobSize: blob.size, filename });
      
      // Get save location
      const savePath = await window.electronAPI.showSaveDialog({
        defaultPath: filename || `recording-${Date.now()}.webm`,
        filters: [
          { name: 'WebM Video', extensions: ['webm'] },
          { name: 'MP4 Video', extensions: ['mp4'] }
        ]
      });
      
      if (!savePath.canceled && savePath.filePath) {
        // Write file via IPC
        await window.electronAPI.saveRecordingFile(blob, savePath.filePath);
        
        // Get metadata
        const metadata = await window.electronAPI.getVideoMetadata(savePath.filePath);
        
        const recordingFile = {
          id: `recording-${Date.now()}`,
          name: filename || `recording-${Date.now()}.webm`,
          path: savePath.filePath,
          duration: metadata.duration,
          size: blob.size,
          format: savePath.filePath.endsWith('.mp4') ? 'mp4' : 'webm',
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
