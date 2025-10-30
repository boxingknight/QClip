// audioUtils.js - Audio mixing and source selection utilities
// PR#32: Picture-in-Picture Recording

import { logger } from './logger';

/**
 * Mix audio tracks from multiple sources using AudioContext
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
    
    // Return the mixed audio track
    const mixedTrack = destination.stream.getAudioTracks()[0];
    
    logger.info('Audio tracks mixed successfully', {
      track1Id: track1.id,
      track2Id: track2?.id || 'none',
      mixedTrackId: mixedTrack.id
    });
    
    return mixedTrack;
  } catch (error) {
    logger.error('Failed to mix audio tracks', error);
    // Fall back to first track if mixing fails
    logger.warn('Falling back to single audio track');
    return track1;
  }
}

/**
 * Select audio source based on user preference
 * @param {string} audioSource - 'screen' | 'webcam' | 'both' | 'none'
 * @param {MediaStream} screenStream - Screen stream
 * @param {MediaStream} webcamStream - Webcam stream
 * @returns {Promise<MediaStreamTrack | null>} Selected or mixed audio track
 */
export async function selectAudioSource(audioSource, screenStream, webcamStream) {
  try {
    const screenAudioTracks = screenStream?.getAudioTracks() || [];
    const webcamAudioTracks = webcamStream?.getAudioTracks() || [];
    
    logger.debug('Selecting audio source', {
      audioSource,
      hasScreenAudio: screenAudioTracks.length > 0,
      hasWebcamAudio: webcamAudioTracks.length > 0
    });
    
    switch (audioSource) {
      case 'screen':
        if (screenAudioTracks.length > 0) {
          return screenAudioTracks[0];
        }
        logger.warn('Screen audio requested but no screen audio track available');
        return null;
        
      case 'webcam':
        if (webcamAudioTracks.length > 0) {
          return webcamAudioTracks[0];
        }
        logger.warn('Webcam audio requested but no webcam audio track available');
        return null;
        
      case 'both':
        // Mix both audio tracks if both available
        if (screenAudioTracks[0] && webcamAudioTracks[0]) {
          logger.info('Mixing screen and webcam audio');
          return await mixAudioTracks(screenAudioTracks[0], webcamAudioTracks[0]);
        } else if (screenAudioTracks[0]) {
          logger.info('Using screen audio only (webcam audio not available)');
          return screenAudioTracks[0];
        } else if (webcamAudioTracks[0]) {
          logger.info('Using webcam audio only (screen audio not available)');
          return webcamAudioTracks[0];
        }
        logger.warn('Both audio requested but no audio tracks available');
        return null;
        
      case 'none':
        logger.info('No audio selected');
        return null;
        
      default:
        // Default to webcam if available
        if (webcamAudioTracks.length > 0) {
          logger.info('Defaulting to webcam audio');
          return webcamAudioTracks[0];
        }
        return null;
    }
  } catch (error) {
    logger.error('Error selecting audio source', error);
    return null;
  }
}

