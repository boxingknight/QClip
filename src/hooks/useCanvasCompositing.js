// useCanvasCompositing.js - Canvas compositing hook for PIP recording
// PR#32: Picture-in-Picture Recording

import { useEffect, useRef, useState } from 'react';
import { calculatePIPPosition, calculatePIPDimensions } from '../utils/pipUtils';
import { logger } from '../utils/logger';

/**
 * Custom hook for compositing screen and webcam streams into a canvas
 * @param {MediaStream} screenStream - Screen recording stream
 * @param {MediaStream} webcamStream - Webcam recording stream
 * @param {object} pipSettings - PIP settings { position, size }
 * @returns {object} Returns canvas ref, canvas stream, and error state
 */
export function useCanvasCompositing(screenStream, webcamStream, pipSettings) {
  const canvasRef = useRef(null);
  const screenVideoRef = useRef(null);
  const webcamVideoRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [canvasStream, setCanvasStream] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only setup if both streams are available
    if (!screenStream || !webcamStream || !canvasRef.current) {
      if (canvasStream) {
        // Clean up existing stream if streams removed
        setCanvasStream(null);
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    
    // Create video elements for both streams
    const screenVideo = document.createElement('video');
    const webcamVideo = document.createElement('video');
    
    screenVideo.srcObject = screenStream;
    webcamVideo.srcObject = webcamStream;
    screenVideo.autoplay = true;
    webcamVideo.autoplay = true;
    screenVideo.muted = true; // Prevent audio feedback
    webcamVideo.muted = true;
    screenVideo.playsInline = true;
    webcamVideo.playsInline = true;
    
    screenVideoRef.current = screenVideo;
    webcamVideoRef.current = webcamVideo;

    let isSetupComplete = false;
    let pipWidth = 0;
    let pipHeight = 0;
    let pipX = 0;
    let pipY = 0;

    // Wait for both video metadata before setting up canvas
    const setupCanvas = async () => {
      try {
        await new Promise((resolve) => {
          screenVideo.onloadedmetadata = () => {
            screenVideo.play();
            resolve();
          };
        });

        await new Promise((resolve) => {
          webcamVideo.onloadedmetadata = () => {
            webcamVideo.play();
            resolve();
          };
        });

        // Set canvas size to screen resolution
        canvas.width = screenVideo.videoWidth;
        canvas.height = screenVideo.videoHeight;

        // Calculate PIP dimensions and position
        const webcamAspectRatio = webcamVideo.videoHeight / webcamVideo.videoWidth;
        const dimensions = calculatePIPDimensions(
          pipSettings.size,
          canvas.width,
          webcamAspectRatio
        );
        
        pipWidth = dimensions.width;
        pipHeight = dimensions.height;

        const position = calculatePIPPosition(
          pipSettings.position,
          canvas.width,
          canvas.height,
          pipWidth,
          pipHeight
        );
        
        pipX = position.x;
        pipY = position.y;

        // Throttle to 30fps
        let lastFrameTime = 0;
        const targetFPS = 30;
        const frameInterval = 1000 / targetFPS;

        // Rendering loop
        const render = (currentTime) => {
          if (!isSetupComplete) return;

          // Throttle to 30fps
          if (currentTime - lastFrameTime >= frameInterval) {
            try {
              // Draw screen (full size background)
              ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);
              
              // Draw webcam (PIP overlay)
              ctx.drawImage(webcamVideo, pipX, pipY, pipWidth, pipHeight);
              
              lastFrameTime = currentTime;
            } catch (renderError) {
              logger.error('Canvas render error', renderError);
              setError('Failed to render composited video');
            }
          }
          
          animationFrameRef.current = requestAnimationFrame(render);
        };

        // Start rendering loop
        isSetupComplete = true;
        render(performance.now());

        // Get canvas stream at 30fps
        const stream = canvas.captureStream(30);
        setCanvasStream(stream);
        
        setError(null);
        logger.info('Canvas compositing setup complete', {
          canvasWidth: canvas.width,
          canvasHeight: canvas.height,
          pipWidth,
          pipHeight,
          pipX,
          pipY,
          fps: 30
        });

      } catch (setupError) {
        logger.error('Canvas compositing setup error', setupError);
        setError(`Failed to setup canvas compositing: ${setupError.message}`);
        setCanvasStream(null);
      }
    };

    setupCanvas();

    // Cleanup function
    return () => {
      isSetupComplete = false;
      
      // Cancel rendering loop
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      // Clean up video elements
      if (screenVideo) {
        screenVideo.srcObject = null;
        screenVideo.removeAttribute('src');
      }
      if (webcamVideo) {
        webcamVideo.srcObject = null;
        webcamVideo.removeAttribute('src');
      }

      screenVideoRef.current = null;
      webcamVideoRef.current = null;
      setCanvasStream(null);
    };
  }, [screenStream, webcamStream, pipSettings?.position, pipSettings?.size]); // Re-run when streams or settings change

  return { 
    canvasRef, 
    canvasStream, 
    error,
    videoRefs: {
      screenVideoRef,
      webcamVideoRef
    }
  };
}

