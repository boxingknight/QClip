# PR#32: Picture-in-Picture Recording - Implementation Checklist

**Use this as your daily todo list.** Check off items as you complete them.

---

## Pre-Implementation Setup (15 minutes)

- [ ] Read main planning document (~45 min)
- [ ] Prerequisites verified
  - PR#17 (Screen Recording) complete ✅
  - PR#18 (Webcam Recording) complete ✅
- [ ] Dependencies installed
  ```bash
  # No new dependencies needed - using native Web APIs
  ```
- [ ] Environment configured
  ```bash
  # Ensure Electron environment with Canvas CaptureStream support
  npm start
  ```
- [ ] Git branch created
  ```bash
  git checkout -b feature/pr32-picture-in-picture-recording
  ```

---

## Phase 1: Canvas Compositing Foundation (2-3 hours)

### 1.1: Create PIP Utilities (30 minutes)

#### Create File
- [ ] Create `src/utils/pipUtils.js`

#### Add Position Calculation
- [ ] Add calculatePIPPosition function
  ```javascript
  /**
   * Calculate PIP position coordinates based on corner and size
   * @param {string} position - Corner position ('top-left', 'top-right', etc.)
   * @param {number} canvasWidth - Full canvas width
   * @param {number} canvasHeight - Full canvas height
   * @param {number} pipWidth - PIP overlay width
   * @param {number} pipHeight - PIP overlay height
   * @returns {{x: number, y: number}} PIP position coordinates
   */
  export function calculatePIPPosition(position, canvasWidth, canvasHeight, pipWidth, pipHeight) {
    const padding = 20; // 20px padding from edges
    
    switch (position) {
      case 'top-left':
        return { x: padding, y: padding };
      case 'top-right':
        return { x: canvasWidth - pipWidth - padding, y: padding };
      case 'bottom-left':
        return { x: padding, y: canvasHeight - pipHeight - padding };
      case 'bottom-right':
        return { 
          x: canvasWidth - pipWidth - padding, 
          y: canvasHeight - pipHeight - padding 
        };
      default:
        return { x: padding, y: padding };
    }
  }
  ```

#### Add Dimension Calculation
- [ ] Add calculatePIPDimensions function
  ```javascript
  /**
   * Calculate PIP dimensions from size percentage
   * @param {number} sizePercent - Size as percentage (15-50)
   * @param {number} screenWidth - Screen width
   * @param {number} webcamAspectRatio - Webcam height/width ratio
   * @returns {{width: number, height: number}} PIP dimensions
   */
  export function calculatePIPDimensions(sizePercent, screenWidth, webcamAspectRatio) {
    const pipWidth = Math.floor((screenWidth * sizePercent) / 100);
    const pipHeight = Math.floor(pipWidth * webcamAspectRatio);
    return { width: pipWidth, height: pipHeight };
  }
  ```

#### Test
- [ ] Test case 1: Top-left position
  - Expected: x=20, y=20 (with padding)
  - Actual: [Record result]
- [ ] Test case 2: Bottom-right position
  - Expected: x=canvasWidth-pipWidth-20, y=canvasHeight-pipHeight-20
  - Actual: [Record result]
- [ ] Test case 3: Dimension calculation
  - Expected: Width = sizePercent% of screen, height maintains aspect ratio
  - Actual: [Record result]

**Checkpoint:** PIP position and dimension calculations working ✓

**Commit:** `feat(pip): add PIP position and dimension calculation utilities`

---

### 1.2: Create Canvas Compositing Hook (2 hours)

#### Create File
- [ ] Create `src/hooks/useCanvasCompositing.js`

#### Add Imports
- [ ] Add imports
  ```javascript
  import { useEffect, useRef, useState } from 'react';
  import { calculatePIPPosition, calculatePIPDimensions } from '../utils/pipUtils';
  import { logger } from '../utils/logger';
  ```

#### Implement Hook
- [ ] Create useCanvasCompositing hook structure
  ```javascript
  export function useCanvasCompositing(screenStream, webcamStream, pipSettings) {
    const canvasRef = useRef(null);
    const screenVideoRef = useRef(null);
    const webcamVideoRef = useRef(null);
    const animationFrameRef = useRef(null);
    const [canvasStream, setCanvasStream] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
      // Implementation here
    }, [screenStream, webcamStream, pipSettings]);

    return { canvasRef, canvasStream, error };
  }
  ```

#### Implement Video Element Setup
- [ ] Create video elements for both streams
  ```javascript
  const screenVideo = document.createElement('video');
  const webcamVideo = document.createElement('video');
  screenVideo.srcObject = screenStream;
  webcamVideo.srcObject = webcamStream;
  screenVideo.autoplay = true;
  webcamVideo.autoplay = true;
  screenVideo.muted = true;
  webcamVideo.muted = true;
  
  screenVideoRef.current = screenVideo;
  webcamVideoRef.current = webcamVideo;
  ```

#### Implement Canvas Setup
- [ ] Wait for video metadata and set canvas size
  ```javascript
  Promise.all([
    new Promise(resolve => {
      screenVideo.onloadedmetadata = () => {
        screenVideo.play();
        resolve();
      };
    }),
    new Promise(resolve => {
      webcamVideo.onloadedmetadata = () => {
        webcamVideo.play();
        resolve();
      };
    })
  ]).then(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    
    // Set canvas size to screen resolution
    canvas.width = screenVideo.videoWidth;
    canvas.height = screenVideo.videoHeight;
    // ... continue with rendering loop
  });
  ```

#### Implement Rendering Loop
- [ ] Create requestAnimationFrame rendering loop
  ```javascript
  // Calculate PIP dimensions
  const { width: pipWidth, height: pipHeight } = calculatePIPDimensions(
    pipSettings.size,
    canvas.width,
    webcamVideo.videoHeight / webcamVideo.videoWidth
  );
  
  // Calculate PIP position
  const { x, y } = calculatePIPPosition(
    pipSettings.position,
    canvas.width,
    canvas.height,
    pipWidth,
    pipHeight
  );

  // Throttle to 30fps
  let lastFrameTime = 0;
  const targetFPS = 30;
  const frameInterval = 1000 / targetFPS;

  const render = (currentTime) => {
    if (currentTime - lastFrameTime >= frameInterval) {
      // Draw screen (full size)
      ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);
      
      // Draw webcam (PIP overlay)
      ctx.drawImage(webcamVideo, x, y, pipWidth, pipHeight);
      
      lastFrameTime = currentTime;
    }
    
    animationFrameRef.current = requestAnimationFrame(render);
  };

  render(performance.now());
  ```

#### Implement Canvas Stream Capture
- [ ] Capture canvas stream
  ```javascript
  // Get canvas stream at 30fps
  const stream = canvas.captureStream(30);
  setCanvasStream(stream);
  logger.info('Canvas stream captured', {
    width: canvas.width,
    height: canvas.height,
    fps: 30
  });
  ```

#### Implement Cleanup
- [ ] Clean up on unmount or stream change
  ```javascript
  return () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (screenVideo) {
      screenVideo.srcObject = null;
      screenVideo = null;
    }
    if (webcamVideo) {
      webcamVideo.srcObject = null;
      webcamVideo = null;
    }
    setCanvasStream(null);
  };
  ```

#### Test
- [ ] Test case 1: Hook with valid streams
  - Expected: Canvas stream created with video track
  - Actual: [Record result]
- [ ] Test case 2: Rendering loop runs
  - Expected: Canvas content updates every frame
  - Actual: [Record result]
- [ ] Test case 3: Cleanup on unmount
  - Expected: Animation frame cancelled, video streams stopped
  - Actual: [Record result]

**Checkpoint:** Canvas compositing hook working with two video streams ✓

**Commit:** `feat(pip): implement canvas compositing hook for PIP rendering`

---

## Phase 2: PIP Recording Implementation (3-4 hours)

### 2.1: Extend RecordingContext State (30 minutes)

#### Add PIP State
- [ ] Add recordingMode state
  ```javascript
  const [recordingMode, setRecordingMode] = useState('screen'); // 'screen' | 'webcam' | 'pip'
  ```

#### Add PIP Settings
- [ ] Add pipSettings state
  ```javascript
  const [pipSettings, setPipSettings] = useState({
    position: 'top-right', // Default
    size: 25, // 25% - Medium preset
    audioSource: 'webcam' // Default to webcam mic
  });
  ```

#### Add Dual Stream State
- [ ] Add screenStream and webcamStream state
  ```javascript
  const [screenStream, setScreenStream] = useState(null);
  const [webcamStream, setWebcamStream] = useState(null);
  const [compositeCanvas, setCompositeCanvas] = useState(null);
  const [canvasStream, setCanvasStream] = useState(null);
  const renderingLoopRef = useRef(null);
  ```

#### Export New State
- [ ] Add to context value
  ```javascript
  const value = {
    // ... existing state
    recordingMode,
    setRecordingMode,
    pipSettings,
    setPipSettings,
    screenStream,
    webcamStream,
    canvasStream,
    // ... rest of value
  };
  ```

**Checkpoint:** RecordingContext extended with PIP state ✓

**Commit:** `feat(recording): extend RecordingContext with PIP state management`

---

### 2.2: Implement startPIPRecording() (2 hours)

#### Create Function
- [ ] Create startPIPRecording function in RecordingContext
  ```javascript
  const startPIPRecording = useCallback(async (
    screenSourceId, 
    webcamDeviceId, 
    pipSettings, 
    options = {}
  ) => {
    let timer = null;
    
    try {
      setError(null);
      logger.info('Starting PIP recording', { 
        screenSourceId, 
        webcamDeviceId, 
        pipSettings 
      });
      
      // Get screen stream
      // Get webcam stream
      // Setup canvas compositing
      // Setup MediaRecorder
      
    } catch (error) {
      logger.error('Failed to start PIP recording', error);
      setError(`Failed to start PIP recording: ${error.message}`);
      return false;
    }
  }, []);
  ```

#### Get Screen Stream
- [ ] Get screen stream using desktopCapturer
  ```javascript
  const screenStream = await navigator.mediaDevices.getUserMedia({
    audio: false, // Screen audio handled separately via audioSource
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: screenSourceId
      }
    }
  });
  
  setScreenStream(screenStream);
  logger.info('Screen stream acquired', {
    tracks: screenStream.getVideoTracks().length
  });
  ```

#### Get Webcam Stream
- [ ] Get webcam stream using getUserMedia
  ```javascript
  const webcamStream = await navigator.mediaDevices.getUserMedia({
    video: {
      deviceId: { exact: webcamDeviceId },
      width: { ideal: 1280 },
      height: { ideal: 720 },
      frameRate: { ideal: 30 }
    },
    audio: true // Webcam microphone
  });
  
  setWebcamStream(webcamStream);
  logger.info('Webcam stream acquired', {
    videoTracks: webcamStream.getVideoTracks().length,
    audioTracks: webcamStream.getAudioTracks().length
  });
  ```

#### Setup Canvas Compositing
- [ ] Use canvas compositing hook or direct implementation
  ```javascript
  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.style.display = 'none'; // Hidden canvas
  document.body.appendChild(canvas);
  
  // Use compositing hook or setup manually
  const { canvasStream: compositedStream } = await setupCanvasCompositing(
    screenStream,
    webcamStream,
    pipSettings,
    canvas
  );
  
  setCompositeCanvas(canvas);
  setCanvasStream(compositedStream);
  ```

#### Add Audio to Canvas Stream
- [ ] Select and add audio track based on pipSettings.audioSource
  ```javascript
  const audioTrack = await selectAudioSource(
    pipSettings.audioSource,
    screenStream,
    webcamStream
  );
  
  if (audioTrack) {
    compositedStream.addTrack(audioTrack);
    logger.info('Audio track added to canvas stream');
  }
  ```

#### Setup MediaRecorder
- [ ] Create MediaRecorder with canvas stream (reuse chunk handling from existing startRecording)
  ```javascript
  const mimeType = 'video/webm;codecs=vp9,opus';
  const mediaRecorder = new MediaRecorder(compositedStream, {
    mimeType,
    videoBitsPerSecond: options.quality === 'high' ? 8000000 : 4000000
  });
  
  // Chunk collection (same pattern as existing recording)
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
  
  // Stop promise (same pattern as existing recording)
  const stopPromise = new Promise((resolve, reject) => {
    mediaRecorder.onstop = async () => {
      try {
        await waitForFinalChunk();
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const blob = new Blob(chunks, { type: mimeType });
        
        if (blob.size === 0) {
          throw new Error('Blob is empty - no recording data collected');
        }
        
        // Stop all tracks
        screenStream.getTracks().forEach(track => track.stop());
        webcamStream.getTracks().forEach(track => track.stop());
        
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
  };
  
  mediaRecorder.start(1000);
  setMediaRecorder(mediaRecorder);
  ```

#### Set Recording State
- [ ] Update recording state
  ```javascript
  setIsRecording(true);
  setRecordingMode('pip');
  setRecordingType('pip');
  setStartTime(Date.now());
  setRecordedChunks([]);
  
  // Start duration timer
  timer = setInterval(() => {
    setRecordingDuration(prev => prev + 1);
  }, 1000);
  window.recordingTimer = timer;
  
  logger.info('PIP recording started successfully');
  return true;
  ```

**Checkpoint:** startPIPRecording function implemented ✓

**Commit:** `feat(pip): implement startPIPRecording function`

---

### 2.3: Implement stopPIPRecording() (30 minutes)

#### Extend Existing stopRecording
- [ ] Add PIP-specific cleanup to stopRecording function
  ```javascript
  // In stopRecording function, add PIP-specific cleanup
  if (recordingMode === 'pip') {
    // Stop rendering loop
    if (renderingLoopRef.current) {
      cancelAnimationFrame(renderingLoopRef.current);
      renderingLoopRef.current = null;
    }
    
    // Remove canvas from DOM
    if (compositeCanvas) {
      document.body.removeChild(compositeCanvas);
      setCompositeCanvas(null);
    }
    
    // Stop both streams
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
    }
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
      setWebcamStream(null);
    }
    
    setCanvasStream(null);
  }
  ```

#### Test
- [ ] Test case 1: Stop PIP recording
  - Expected: Both streams stopped, canvas removed, blob created
  - Actual: [Record result]

**Checkpoint:** stopPIPRecording cleanup working ✓

**Commit:** `feat(pip): add PIP-specific cleanup to stopRecording`

---

## Phase 3: Audio Mixing (1-2 hours)

### 3.1: Create Audio Utilities (45 minutes)

#### Create File
- [ ] Create `src/utils/audioUtils.js`

#### Add Audio Mixing Function
- [ ] Add mixAudioTracks function
  ```javascript
  /**
   * Mix audio tracks from multiple sources
   * @param {MediaStreamTrack} track1 - First audio track
   * @param {MediaStreamTrack} track2 - Second audio track (optional)
   * @returns {Promise<MediaStreamTrack>} Mixed audio track
   */
  export async function mixAudioTracks(track1, track2) {
    try {
      const audioContext = new AudioContext();
      const destination = audioContext.createMediaStreamDestination();
      
      // Create sources from tracks
      const source1 = audioContext.createMediaStreamSource(
        new MediaStream([track1])
      );
      source1.connect(destination);
      
      if (track2) {
        const source2 = audioContext.createMediaStreamSource(
          new MediaStream([track2])
        );
        source2.connect(destination);
      }
      
      return destination.stream.getAudioTracks()[0];
    } catch (error) {
      logger.error('Failed to mix audio tracks', error);
      // Fall back to first track if mixing fails
      return track1;
    }
  }
  ```

#### Add Audio Source Selection
- [ ] Add selectAudioSource function
  ```javascript
  /**
   * Select audio source based on user preference
   * @param {string} audioSource - 'screen' | 'webcam' | 'both' | 'none'
   * @param {MediaStream} screenStream - Screen stream
   * @param {MediaStream} webcamStream - Webcam stream
   * @returns {Promise<MediaStreamTrack | null>} Selected or mixed audio track
   */
  export async function selectAudioSource(audioSource, screenStream, webcamStream) {
    const screenAudioTracks = screenStream?.getAudioTracks() || [];
    const webcamAudioTracks = webcamStream?.getAudioTracks() || [];
    
    switch (audioSource) {
      case 'screen':
        return screenAudioTracks[0] || null;
        
      case 'webcam':
        return webcamAudioTracks[0] || null;
        
      case 'both':
        if (screenAudioTracks[0] && webcamAudioTracks[0]) {
          return await mixAudioTracks(screenAudioTracks[0], webcamAudioTracks[0]);
        } else if (screenAudioTracks[0]) {
          return screenAudioTracks[0];
        } else if (webcamAudioTracks[0]) {
          return webcamAudioTracks[0];
        }
        return null;
        
      case 'none':
        return null;
        
      default:
        return webcamAudioTracks[0] || null; // Default to webcam
    }
  }
  ```

#### Test
- [ ] Test case 1: Select webcam audio
  - Expected: Returns webcam audio track
  - Actual: [Record result]
- [ ] Test case 2: Mix both audio tracks
  - Expected: Returns mixed audio track
  - Actual: [Record result]

**Checkpoint:** Audio utilities working ✓

**Commit:** `feat(audio): add audio mixing and source selection utilities`

---

### 3.2: Integrate Audio into PIP Recording (30 minutes)

#### Import Audio Utils
- [ ] Import selectAudioSource in RecordingContext
  ```javascript
  import { selectAudioSource } from '../utils/audioUtils';
  ```

#### Add Audio to Canvas Stream
- [ ] Update startPIPRecording to use audio selection
  ```javascript
  // After canvas stream is created
  const audioTrack = await selectAudioSource(
    pipSettings.audioSource,
    screenStream,
    webcamStream
  );
  
  if (audioTrack) {
    canvasStream.addTrack(audioTrack);
    logger.info('Audio track added to canvas stream', {
      source: pipSettings.audioSource
    });
  }
  ```

#### Test
- [ ] Test case 1: PIP recording with webcam audio
  - Expected: Recorded video has webcam audio
  - Actual: [Record result]
- [ ] Test case 2: PIP recording with mixed audio
  - Expected: Recorded video has both screen and webcam audio
  - Actual: [Record result]

**Checkpoint:** Audio integration working ✓

**Commit:** `feat(pip): integrate audio source selection into PIP recording`

---

## Phase 4: UI Components (2-3 hours)

### 4.1: Create PIP Settings Component (1 hour)

#### Create File
- [ ] Create `src/components/recording/PIPSettings.js`

#### Add Imports
- [ ] Add imports
  ```javascript
  import React from 'react';
  import './PIPSettings.css';
  ```

#### Implement Component
- [ ] Create PIPSettings component
  ```javascript
  const PIPSettings = ({ settings, onSettingsChange, disabled = false }) => {
    const handlePositionChange = (position) => {
      onSettingsChange({ ...settings, position });
    };
    
    const handleSizeChange = (size) => {
      onSettingsChange({ ...settings, size });
    };
    
    const handleAudioSourceChange = (audioSource) => {
      onSettingsChange({ ...settings, audioSource });
    };
    
    return (
      <div className="pip-settings">
        <h3>Picture-in-Picture Settings</h3>
        
        {/* Position Selector */}
        <div className="setting-group">
          <label>Position</label>
          <select
            value={settings.position}
            onChange={(e) => handlePositionChange(e.target.value)}
            disabled={disabled}
          >
            <option value="top-left">Top Left</option>
            <option value="top-right">Top Right</option>
            <option value="bottom-left">Bottom Left</option>
            <option value="bottom-right">Bottom Right</option>
          </select>
        </div>
        
        {/* Size Selector */}
        <div className="setting-group">
          <label>Size</label>
          <div className="size-presets">
            <button onClick={() => handleSizeChange(15)} disabled={disabled}>
              Small (15%)
            </button>
            <button onClick={() => handleSizeChange(25)} disabled={disabled}>
              Medium (25%)
            </button>
            <button onClick={() => handleSizeChange(35)} disabled={disabled}>
              Large (35%)
            </button>
          </div>
          <input
            type="range"
            min="10"
            max="50"
            value={settings.size}
            onChange={(e) => handleSizeChange(Number(e.target.value))}
            disabled={disabled}
          />
          <span className="size-value">{settings.size}%</span>
        </div>
        
        {/* Audio Source Selector */}
        <div className="setting-group">
          <label>Audio Source</label>
          <select
            value={settings.audioSource}
            onChange={(e) => handleAudioSourceChange(e.target.value)}
            disabled={disabled}
          >
            <option value="webcam">Webcam Microphone</option>
            <option value="screen">Screen Audio</option>
            <option value="both">Both (Mixed)</option>
            <option value="none">None</option>
          </select>
        </div>
      </div>
    );
  };
  
  export default PIPSettings;
  ```

#### Add Styling
- [ ] Create `src/components/recording/PIPSettings.css`
  ```css
  .pip-settings {
    padding: var(--space-md);
    background: var(--color-surface);
    border-radius: var(--radius-md);
  }
  
  .setting-group {
    margin-bottom: var(--space-md);
  }
  
  .setting-group label {
    display: block;
    margin-bottom: var(--space-xs);
    font-weight: 500;
  }
  
  .size-presets {
    display: flex;
    gap: var(--space-xs);
    margin-bottom: var(--space-sm);
  }
  
  .size-value {
    margin-left: var(--space-sm);
  }
  ```

**Checkpoint:** PIP Settings component created ✓

**Commit:** `feat(pip): add PIP settings component`

---

### 4.2: Create PIP Preview Component (1 hour)

#### Create File
- [ ] Create `src/components/recording/PIPPreview.js`

#### Implement Component
- [ ] Create PIPPreview component using canvas compositing hook
  ```javascript
  import React from 'react';
  import { useCanvasCompositing } from '../../hooks/useCanvasCompositing';
  import './PIPPreview.css';
  
  const PIPPreview = ({ 
    screenStream, 
    webcamStream, 
    pipSettings, 
    isRecording = false 
  }) => {
    const { canvasRef, canvasStream, error } = useCanvasCompositing(
      screenStream,
      webcamStream,
      pipSettings
    );
    
    if (error) {
      return (
        <div className="pip-preview-error">
          <p>Preview error: {error}</p>
        </div>
      );
    }
    
    if (!screenStream || !webcamStream) {
      return (
        <div className="pip-preview-placeholder">
          <p>Select screen source and webcam to preview</p>
        </div>
      );
    }
    
    return (
      <div className="pip-preview">
        <canvas
          ref={canvasRef}
          className="preview-canvas"
        />
        {isRecording && (
          <div className="recording-overlay">
            <div className="recording-dot"></div>
            <span>Recording</span>
          </div>
        )}
      </div>
    );
  };
  
  export default PIPPreview;
  ```

#### Add Styling
- [ ] Create `src/components/recording/PIPPreview.css`
  ```css
  .pip-preview {
    position: relative;
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-md);
  }
  
  .preview-canvas {
    width: 100%;
    height: auto;
    display: block;
  }
  
  .recording-overlay {
    position: absolute;
    top: var(--space-sm);
    right: var(--space-sm);
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    background: rgba(0, 0, 0, 0.7);
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-md);
    color: white;
  }
  
  .recording-dot {
    width: 8px;
    height: 8px;
    background: var(--color-error);
    border-radius: 50%;
    animation: pulse 1s infinite;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  ```

**Checkpoint:** PIP Preview component created ✓

**Commit:** `feat(pip): add PIP preview component`

---

### 4.3: Create PIP Recording Controls (1 hour)

#### Create File
- [ ] Create `src/components/recording/PIPRecordingControls.js`

#### Implement Component
- [ ] Create PIPRecordingControls component
  ```javascript
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
      pipSettings,
      setPipSettings,
      screenStream,
      webcamStream,
      getAvailableSources,
      getWebcamDevices,
      startPIPRecording,
      stopRecording,
      saveRecording,
      recordingDuration,
      error
    } = useRecording();
    
    const { showModal, hideModal, showToast } = useUI();
    const [selectedScreenSource, setSelectedScreenSource] = useState(null);
    const [selectedWebcamId, setSelectedWebcamId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const handleStartRecording = async () => {
      if (!selectedScreenSource || !selectedWebcamId) {
        showToast({
          type: 'error',
          title: 'Selection Required',
          message: 'Please select both screen source and webcam',
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
          
          if (onRecordingSaved) {
            onRecordingSaved(recordingFile);
          }
        }
      } catch (err) {
        console.error('Failed to stop recording:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    return (
      <div className="pip-recording-controls">
        <div className="controls-header">
          <h2>Picture-in-Picture Recording</h2>
          {isRecording && recordingMode === 'pip' && (
            <RecordingIndicator
              duration={recordingDuration}
              source={{ name: 'PIP Recording' }}
            />
          )}
        </div>
        
        {error && (
          <div className="error-banner">{error}</div>
        )}
        
        <div className="controls-content">
          <div className="source-selection">
            <SourcePicker
              onSourceSelect={setSelectedScreenSource}
              disabled={isRecording}
            />
            <DeviceSelector
              selectedDeviceId={selectedWebcamId}
              onDeviceSelect={setSelectedWebcamId}
              disabled={isRecording}
            />
          </div>
          
          <PIPSettings
            settings={pipSettings}
            onSettingsChange={setPipSettings}
            disabled={isRecording}
          />
          
          {(selectedScreenSource && selectedWebcamId) && (
            <PIPPreview
              screenStream={screenStream}
              webcamStream={webcamStream}
              pipSettings={pipSettings}
              isRecording={isRecording && recordingMode === 'pip'}
            />
          )}
          
          <div className="recording-buttons">
            {!isRecording ? (
              <RecordingButton
                onClick={handleStartRecording}
                label="Start PIP Recording"
                icon="●"
                loading={isLoading}
                disabled={isLoading || !selectedScreenSource || !selectedWebcamId}
              />
            ) : (
              <RecordingButton
                onClick={handleStopRecording}
                label="Stop Recording"
                icon="■"
                variant="danger"
                loading={isLoading}
                disabled={isLoading}
              />
            )}
          </div>
        </div>
      </div>
    );
  };
  
  export default PIPRecordingControls;
  ```

#### Add Styling
- [ ] Create `src/components/recording/PIPRecordingControls.css`
  ```css
  .pip-recording-controls {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }
  
  .controls-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .controls-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-lg);
  }
  
  .source-selection {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }
  ```

**Checkpoint:** PIP Recording Controls component created ✓

**Commit:** `feat(pip): add PIP recording controls component`

---

### 4.4: Integrate with RecordingControls (30 minutes)

#### Update Mode Selector
- [ ] Add PIP mode to RecordingControls
  ```javascript
  // In RecordingControls.js
  const [recordingMode, setRecordingMode] = useState('screen'); // 'screen' | 'webcam' | 'pip'
  
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
  ```

#### Add Conditional Rendering
- [ ] Show PIP controls when mode is 'pip'
  ```javascript
  {recordingMode === 'pip' ? (
    <PIPRecordingControls onRecordingSaved={handleRecordingSaved} />
  ) : recordingMode === 'webcam' ? (
    <WebcamRecordingControls onRecordingSaved={handleRecordingSaved} />
  ) : (
    // Existing screen recording controls
  )}
  ```

#### Update Exports
- [ ] Export PIP components from index.js
  ```javascript
  // src/components/recording/index.js
  export { default as PIPRecordingControls } from './PIPRecordingControls';
  export { default as PIPSettings } from './PIPSettings';
  export { default as PIPPreview } from './PIPPreview';
  ```

**Checkpoint:** PIP mode integrated into RecordingControls ✓

**Commit:** `feat(recording): integrate PIP mode into RecordingControls`

---

## Phase 5: Integration & Polish (1 hour)

### 5.1: Media Library Integration (15 minutes)

#### Update Save Recording
- [ ] Ensure PIP recordings save correctly (should work with existing saveRecording)
  ```javascript
  // RecordingContext.saveRecording already handles this
  // But verify metadata extraction works for composited videos
  ```

#### Test Saving
- [ ] Test case 1: Save PIP recording
  - Expected: File saved, metadata extracted, appears in Media Library
  - Actual: [Record result]

**Checkpoint:** Media Library integration working ✓

---

### 5.2: Error Handling & Edge Cases (20 minutes)

#### Permission Errors
- [ ] Test screen permission denied
  - Expected: Clear error message, graceful degradation
  - Actual: [Record result]
  
- [ ] Test webcam permission denied
  - Expected: Clear error message, graceful degradation
  - Actual: [Record result]

#### Device Disconnection
- [ ] Test screen source disconnection
  - Expected: Recording stops, error shown
  - Actual: [Record result]
  
- [ ] Test webcam disconnection
  - Expected: Recording stops, error shown
  - Actual: [Record result]

**Checkpoint:** Error handling working ✓

---

### 5.3: Performance Optimization (15 minutes)

#### Monitor Performance
- [ ] Check canvas rendering framerate
  - Expected: Maintains 30fps
  - Actual: [Record result]
  
- [ ] Check memory usage
  - Expected: < 800MB during recording
  - Actual: [Record result]

#### Optimize if Needed
- [ ] Adjust frame rate throttling if needed
- [ ] Optimize canvas context settings

**Checkpoint:** Performance acceptable ✓

---

### 5.4: Final Testing (10 minutes)

#### Test All Features
- [ ] All 4 corner positions work
- [ ] All size presets work
- [ ] All audio sources work (webcam, screen, both, none)
- [ ] Preview matches recorded output
- [ ] Long recording (5+ minutes) works
- [ ] Error handling works
- [ ] Media Library integration works

**Checkpoint:** All features working ✓

**Commit:** `feat(pip): complete PIP recording implementation with all features`

---

## Completion Checklist

- [ ] All phases complete
- [ ] All tests passing
- [ ] Performance acceptable
- [ ] Error handling comprehensive
- [ ] Documentation complete
- [ ] Code reviewed
- [ ] Ready for production

**Status:** ✅ COMPLETE

