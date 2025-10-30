// RecordingContext.js - Recording state management
// V2 Feature: Context API for recording state
// Status: Implemented for PR #17

import React, { createContext, useContext, useState, useCallback } from 'react';
import { logger } from '../utils/logger';
import { getWebcamDevices } from '../utils/webcamUtils';
import { extractVideoMetadata } from '../utils/videoMetadata';

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
  const [recordingType, setRecordingType] = useState(null); // 'screen' or 'webcam'
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
  
  // Webcam-specific state
  const [selectedWebcamId, setSelectedWebcamId] = useState(null);
  const [availableWebcams, setAvailableWebcams] = useState([]);
  const [previewStream, setPreviewStream] = useState(null);

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

  // Get available webcam devices
  const getWebcamDevicesList = useCallback(async () => {
    try {
      setError(null);
      logger.info('Getting available webcam devices');
      
      const devices = await getWebcamDevices();
      setAvailableWebcams(devices);
      
      logger.info(`Found ${devices.length} webcam devices`);
      return devices;
    } catch (error) {
      logger.error('Failed to get webcam devices', error);
      setError(error.message || 'Unable to access webcam devices. Please check permissions.');
      throw error;
    }
  }, []);

  // Start webcam recording
  const startWebcamRecording = useCallback(async (deviceId, settings = {}) => {
    let timer = null;
    let recordingResolve = null;
    let recordingReject = null;
    
    try {
      setError(null);
      logger.info('Starting webcam recording', { deviceId, settings });
      
      // Parse resolution
      const resolution = settings.resolution || '1280x720';
      const [width, height] = resolution.split('x').map(Number);
      const framerate = settings.framerate || 30;
      
      // Get webcam stream
      const streamConstraints = {
        video: {
          deviceId: { exact: deviceId },
          width: { ideal: width },
          height: { ideal: height },
          frameRate: { ideal: framerate }
        },
        audio: settings.audio !== false // Include audio if enabled
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(streamConstraints);
      
      // Setup MediaRecorder
      const mimeType = 'video/webm;codecs=vp9,opus';
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: settings.quality === 'high' ? 8000000 : 4000000
      });
      
      // Local chunks array
      const chunks = [];
      let chunksComplete = false;
      let pendingDataPromise = null;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
          logger.debug('Chunk received', { 
            size: event.data.size, 
            totalChunks: chunks.length
          });
          
          if (pendingDataPromise && event.data.size > 0) {
            pendingDataPromise.resolve();
            pendingDataPromise = null;
          }
        } else if (event.data.size === 0 && chunks.length > 0) {
          chunksComplete = true;
          if (pendingDataPromise) {
            pendingDataPromise.resolve();
            pendingDataPromise = null;
          }
        }
      };
      
      // Create promise for stop event
      const stopPromise = new Promise((resolve, reject) => {
        recordingResolve = resolve;
        recordingReject = reject;
        
        mediaRecorder.onstop = async () => {
          try {
            logger.info('onstop event fired', { chunksCount: chunks.length });
            
            // Wait for final chunk
            const waitForFinalChunk = () => {
              return new Promise((resolveWait) => {
                if (chunksComplete || chunks.length === 0) {
                  resolveWait();
                  return;
                }
                
                pendingDataPromise = { resolve: resolveWait };
                
                setTimeout(() => {
                  if (pendingDataPromise) {
                    pendingDataPromise = null;
                  }
                  logger.warn('Timeout waiting for final chunk, proceeding anyway');
                  resolveWait();
                }, 500);
              });
            };
            
            await waitForFinalChunk();
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const blob = new Blob(chunks, { type: mimeType });
            
            if (blob.size === 0) {
              throw new Error('Blob is empty - no recording data collected');
            }
            
            stream.getTracks().forEach(track => {
              track.stop();
              logger.debug('Track stopped', { kind: track.kind, id: track.id });
            });
            
            setRecordedChunks([blob]);
            resolve(blob);
          } catch (error) {
            logger.error('Error creating blob from chunks', error);
            reject(error);
          }
        };
      });
      
      mediaRecorder._stopPromise = stopPromise;
      mediaRecorder._chunks = chunks;
      
      mediaRecorder.onerror = (event) => {
        logger.error('MediaRecorder error', event);
        setError('Recording error occurred');
        if (recordingReject) {
          recordingReject(new Error('MediaRecorder error occurred'));
        }
      };
      
      // Start recording
      mediaRecorder.start(1000);
      setMediaRecorder(mediaRecorder);
      setMediaStream(stream);
      setIsRecording(true);
      setRecordingType('webcam');
      setRecordingSource({ type: 'webcam', deviceId });
      setSelectedWebcamId(deviceId);
      setStartTime(Date.now());
      setRecordedChunks([]);
      
      // Start duration timer
      timer = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      window.recordingTimer = timer;
      
      logger.info('Webcam recording started successfully');
      return true;
    } catch (error) {
      if (timer) {
        clearInterval(timer);
      }
      logger.error('Failed to start webcam recording', error);
      setError(`Failed to start webcam recording: ${error.message}`);
      setIsRecording(false);
      setMediaRecorder(null);
      setMediaStream(null);
      setRecordingType(null);
      return false;
    }
  }, []);

  // Start recording
  const startRecording = useCallback(async (sourceId, options = {}) => {
    let timer = null;
    let recordingResolve = null;
    let recordingReject = null;
    
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
      
      // Local chunks array - collects data directly, avoids state timing issues
      const chunks = [];
      let chunksComplete = false;
      let pendingDataPromise = null;
      
      // Track if we've received all chunks (including final metadata chunk)
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
          logger.debug('Chunk received', { 
            size: event.data.size, 
            totalChunks: chunks.length,
            totalSize: chunks.reduce((sum, c) => sum + c.size, 0)
          });
          
          // Resolve pending promise if waiting for data
          if (pendingDataPromise && event.data.size > 0) {
            pendingDataPromise.resolve();
            pendingDataPromise = null;
          }
        } else if (event.data.size === 0 && chunks.length > 0) {
          // Empty chunk after recording stops = final metadata chunk
          chunksComplete = true;
          if (pendingDataPromise) {
            pendingDataPromise.resolve();
            pendingDataPromise = null;
          }
        }
      };
      
      // Create promise for stop event to properly wait for all chunks
      const stopPromise = new Promise((resolve, reject) => {
        recordingResolve = resolve;
        recordingReject = reject;
        
        mediaRecorder.onstop = async () => {
          try {
            logger.info('onstop event fired', { chunksCount: chunks.length });
            
            // CRITICAL: Wait for final data chunk after stop()
            // MediaRecorder may send final metadata chunk AFTER onstop fires
            // Wait up to 500ms for final chunk, then proceed
            const waitForFinalChunk = () => {
              return new Promise((resolveWait) => {
                if (chunksComplete || chunks.length === 0) {
                  resolveWait();
                  return;
                }
                
                // Set up promise to resolve when data arrives
                pendingDataPromise = { resolve: resolveWait };
                
                // Timeout fallback - proceed after 500ms even if no chunk
                setTimeout(() => {
                  if (pendingDataPromise) {
                    pendingDataPromise = null;
                  }
                  logger.warn('Timeout waiting for final chunk, proceeding anyway');
                  resolveWait();
                }, 500);
              });
            };
            
            // Wait for final chunk
            await waitForFinalChunk();
            
            // Small additional delay to ensure WebM container is finalized
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Create blob from all collected chunks
            const blob = new Blob(chunks, { type: mimeType });
            const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
            
            logger.info('Recording stopped, blob created', { 
              size: blob.size, 
              chunks: chunks.length,
              totalSize: totalSize,
              blobSize: blob.size,
              sizesMatch: blob.size === totalSize
            });
            
            // Validate blob
            if (blob.size === 0) {
              throw new Error('Blob is empty - no recording data collected');
            }
            
            if (blob.size < 1024) {
              logger.warn('Blob is very small, may be incomplete', { size: blob.size });
            }
            
            // Stop all tracks
            stream.getTracks().forEach(track => {
              track.stop();
              logger.debug('Track stopped', { kind: track.kind, id: track.id });
            });
            
            // Update state with final blob
            setRecordedChunks([blob]);
            resolve(blob);
          } catch (error) {
            logger.error('Error creating blob from chunks', error);
            reject(error);
          }
        };
      });
      
      // Store stop promise on mediaRecorder for access in stopRecording
      mediaRecorder._stopPromise = stopPromise;
      mediaRecorder._chunks = chunks;
      
      mediaRecorder.onerror = (event) => {
        logger.error('MediaRecorder error', event);
        setError('Recording error occurred');
        if (recordingReject) {
          recordingReject(new Error('MediaRecorder error occurred'));
        }
      };
      
      // Start recording
      mediaRecorder.start(1000); // Collect chunks every second
      setMediaRecorder(mediaRecorder);
      setMediaStream(stream);
      setIsRecording(true);
      setRecordingType('screen');
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
    if (!mediaRecorder || !isRecording) {
      throw new Error('No active recording');
    }
    
    logger.info('Stopping recording');
    
    // Clear duration timer
    if (window.recordingTimer) {
      clearInterval(window.recordingTimer);
      window.recordingTimer = null;
    }
    
    try {
      // CRITICAL: Properly stop MediaRecorder to ensure WebM finalization
      if (mediaRecorder.state === 'recording' || mediaRecorder.state === 'paused') {
        // Request data BEFORE stopping - this ensures final chunk is requested
        mediaRecorder.requestData();
        
        // Small delay to allow requestData to process
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Now stop - this will trigger onstop event
        mediaRecorder.stop();
        
        // Request data AGAIN after stop - sometimes needed for final metadata chunk
        // Note: This might not work in all browsers, but helps with WebM finalization
        setTimeout(() => {
          if (mediaRecorder.state === 'inactive') {
            try {
              mediaRecorder.requestData();
            } catch (e) {
              // Ignore - recorder already stopped
            }
          }
        }, 100);
      }
      
      // Wait for the stop promise (which waits for all chunks via onstop event)
      const blob = await mediaRecorder._stopPromise;
      
      // Reset state
      setIsRecording(false);
      setMediaRecorder(null);
      setMediaStream(null);
      setRecordingDuration(0);
      setStartTime(null);
      setRecordedChunks([]);
      setRecordingType(null);
      
      logger.info('Recording stopped successfully', { blobSize: blob.size });
      return blob;
    } catch (error) {
      logger.error('Error stopping recording', error);
      // Cleanup on error
      setIsRecording(false);
      setMediaRecorder(null);
      setMediaStream(null);
      setRecordingDuration(0);
      setStartTime(null);
      throw error;
    }
  }, [mediaRecorder, isRecording]);

  // Save recording
  const saveRecording = useCallback(async (blob, filename) => {
    try {
      logger.info('Saving recording', { blobSize: blob.size, filename });
      
      // Get save location
      const savePath = await window.electronAPI.showSaveDialog();
      
      if (!savePath.canceled && savePath.filePath) {
        // CRITICAL: Always save as .webm since we're recording WebM format
        // WebM data in MP4 container = corrupted file with duration: 0
        let filePath = savePath.filePath;
        
        // Remove any extension the user might have added
        if (filePath.endsWith('.mp4')) {
          filePath = filePath.slice(0, -4) + '.webm';
          logger.warn('User selected .mp4 extension, converting to .webm (recording is WebM format)');
        } else if (!filePath.endsWith('.webm')) {
          filePath = `${filePath}.webm`;
        }
        
        logger.info('Saving recording file', { 
          originalPath: savePath.filePath, 
          finalPath: filePath,
          blobSize: blob.size
        });
        // Convert Blob to ArrayBuffer for IPC (Blobs can't be serialized)
        const arrayBuffer = await blob.arrayBuffer();
        
        // Write file via IPC (passing ArrayBuffer instead of Blob)
        await window.electronAPI.saveRecordingFile(arrayBuffer, filePath);
        
        // 🎯 CRITICAL FIX: Wait for file to be fully written to disk before extracting metadata
        // WebM files need time for container structure to be finalized
        // This fixes the duration: 0 bug from PR#17
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get metadata using extractVideoMetadata which has HTML5 video element fallback
        // This fixes WebM files where FFprobe returns duration: 0
        const metadata = await extractVideoMetadata(filePath);
        
        const recordingFile = {
          id: `recording-${Date.now()}`,
          name: filename || `recording-${Date.now()}.webm`,
          path: filePath,
          duration: metadata.duration || 0,
          size: blob.size,
          format: filePath.endsWith('.mp4') ? 'mp4' : 'webm',
          timestamp: Date.now(),
          source: recordingSource,
          thumbnail: metadata.thumbnailUrl,
          // Include full metadata for Media Library
          width: metadata.width,
          height: metadata.height,
          fps: metadata.fps,
          codec: metadata.codec,
          hasAudio: metadata.hasAudio
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
    setRecordingType(null);
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
    recordingType,
    setRecordingSource,
    recordedChunks,
    recordingDuration,
    recordingSettings,
    savedRecordings,
    error,
    
    // Webcam-specific state
    selectedWebcamId,
    setSelectedWebcamId,
    availableWebcams,
    previewStream,
    setPreviewStream,
    
    // Actions
    getAvailableSources,
    getWebcamDevices: getWebcamDevicesList,
    startRecording,
    startWebcamRecording,
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
