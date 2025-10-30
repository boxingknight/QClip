const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

// Get FFmpeg paths (works in both dev and production)
function getFFmpegPaths() {
  // Check if we're in a packaged app
  const isPackaged = !!process.resourcesPath;
  const isDev = !isPackaged || process.env.NODE_ENV === 'development' || process.env.npm_lifecycle_event === 'start';
  
  console.log('[FFmpeg] Environment check:', { 
    NODE_ENV: process.env.NODE_ENV, 
    npm_lifecycle_event: process.env.npm_lifecycle_event,
    isDev, 
    isPackaged,
    resourcesPath: process.resourcesPath
  });
  
  console.log('[FFmpeg] Environment:', { isDev, isPackaged, __dirname, resourcesPath: process.resourcesPath });
  
  if (isDev) {
    // Development mode - use node_modules
    console.log('[FFmpeg] Using development paths (node_modules)');
    return {
      ffmpeg: require('ffmpeg-static'),
      ffprobe: require('ffprobe-static').path
    };
  } else if (isPackaged) {
    // Packaged app - use extraResources
    const resourcesPath = process.resourcesPath;
    const ffmpegPath = path.join(resourcesPath, 'ffmpeg');
    const ffprobePath = path.join(resourcesPath, 'ffprobe-x64');
    
    console.log('[FFmpeg] Using extraResources paths:', { ffmpegPath, ffprobePath });
    
    return {
      ffmpeg: ffmpegPath,
      ffprobe: ffprobePath
    };
  } else {
    // Production: use bundled binaries
    const resourcesPath = process.resourcesPath;
    const ffmpegPath = path.join(resourcesPath, 'ffmpeg');
    // Note: ffprobe-static only provides x86_64 binaries, use the x64 version
    const ffprobePath = path.join(resourcesPath, 'ffprobe-x64');
    
    console.log('[FFmpeg] Using production paths:', { resourcesPath, ffmpegPath, ffprobePath });
    
    // Verify binaries exist
    if (!fs.existsSync(ffmpegPath)) {
      console.error('[FFmpeg ERROR] Binary not found at:', ffmpegPath);
      // List directory contents for debugging
      try {
        const dirContents = fs.readdirSync(resourcesPath);
        console.error('Resources directory contents:', dirContents);
      } catch (e) {
        console.error('Failed to list directory:', e.message);
      }
      throw new Error(`FFmpeg binary not found at ${ffmpegPath}. Make sure extraResources is configured in electron-builder.yml`);
    }
    
    if (!fs.existsSync(ffprobePath)) {
      console.error('[FFmpeg ERROR] FFprobe binary not found at:', ffprobePath);
    }
    
    // Fallback to unpacked ASAR binaries if extraResources don't exist
    const unpackPath = path.join(__dirname, '..', 'node_modules');
    const fallbackFfmpeg = path.join(unpackPath, 'ffmpeg-static', 'ffmpeg');
    const fallbackFfprobe = path.join(unpackPath, 'ffprobe-static', 'bin', 'darwin', 'arm64', 'ffprobe');
    
    if (fs.existsSync(ffmpegPath) && fs.existsSync(ffprobePath)) {
      console.log('[FFmpeg] Using extraResources binaries');
      return {
        ffmpeg: ffmpegPath,
        ffprobe: ffprobePath
      };
    } else if (fs.existsSync(fallbackFfmpeg) && fs.existsSync(fallbackFfprobe)) {
      console.log('[FFmpeg] Using unpacked ASAR binaries');
      return {
        ffmpeg: fallbackFfmpeg,
        ffprobe: fallbackFfprobe
      };
    } else {
      throw new Error(`Cannot find FFmpeg binaries. Checked: ${ffmpegPath}, ${fallbackFfmpeg}`);
    }
  }
}

// Get paths dynamically (don't set at module load - process.resourcesPath not available yet)
let currentFFmpegPath = null;
let currentFFprobePath = null;

function updateFFmpegPaths() {
  const paths = getFFmpegPaths();
  
  // Debug: Check if paths point to files or directories
  try {
    const ffmpegStats = fs.statSync(paths.ffmpeg);
    const ffprobeStats = fs.statSync(paths.ffprobe);
    console.log('[FFmpeg DEBUG] ffmpeg path:', paths.ffmpeg);
    console.log('[FFmpeg DEBUG] ffprobe path:', paths.ffprobe);
    console.log('[FFmpeg DEBUG] ffmpeg is file:', ffmpegStats.isFile(), 'size:', ffmpegStats.size);
    console.log('[FFmpeg DEBUG] ffprobe is file:', ffprobeStats.isFile(), 'size:', ffprobeStats.size);
    
    // Check if it's actually executable
    if (!ffmpegStats.isFile()) {
      console.error('[FFmpeg DEBUG ERROR] ffmpeg path is NOT a file!');
    }
    if (!ffprobeStats.isFile()) {
      console.error('[FFmpeg DEBUG ERROR] ffprobe path is NOT a file!');
    }
  } catch (e) {
    console.error('[FFmpeg DEBUG ERROR]', e.message, 'path:', e.path);
  }
  
  ffmpeg.setFfmpegPath(paths.ffmpeg);
  ffmpeg.setFfprobePath(paths.ffprobe);
  currentFFmpegPath = paths.ffmpeg;
  currentFFprobePath = paths.ffprobe;
  console.log('[FFmpeg] Configured - Binary:', paths.ffmpeg);
  console.log('[FFmpeg] Configured - FFprobe:', paths.ffprobe);
}

// Set paths on first use, after Electron is ready
updateFFmpegPaths();

/**
 * Get video codec from settings
 * @param {Object} settings - Export settings
 * @returns {string} FFmpeg video codec
 */
function getVideoCodec(settings) {
  const codec = settings.advanced?.codec || 'h264';
  
  switch (codec) {
    case 'h264':
      return 'libx264';
    case 'h265':
      return 'libx265';
    case 'vp9':
      return 'libvpx-vp9';
    default:
      return 'libx264';
  }
}

/**
 * Get audio codec from settings
 * @param {Object} settings - Export settings
 * @returns {string} FFmpeg audio codec
 */
function getAudioCodec(settings) {
  return 'aac'; // Always use AAC for compatibility
}

/**
 * Get video encoding options from settings
 * @param {Object} settings - Export settings
 * @param {string} inputPath - Input file path (for PIP detection)
 * @returns {Array} FFmpeg output options
 */
function getVideoOptions(settings, inputPath = '') {
  const options = [];
  const advanced = settings.advanced || {};
  
  // Preset
  if (advanced.preset) {
    options.push(`-preset ${advanced.preset}`);
  }
  
  // Profile
  if (advanced.profile) {
    options.push(`-profile:v ${advanced.profile}`);
  }
  
  // Frame rate handling
  if (settings.framerate === 'custom' && settings.customFramerate) {
    options.push(`-r ${settings.customFramerate}`);
    console.log(`[FFmpeg] Setting custom frame rate: ${settings.customFramerate} fps`);
  } else if (settings.framerate === 'source') {
    // Keep source frame rate - no -r option needed
    console.log('[FFmpeg] Using source frame rate');
  }
  
  // CRITICAL FIX: Always force 30fps for PIP recordings to prevent slow motion
  // This fixes the 1000fps issue that causes slow motion and wrong duration
  if (inputPath.includes('pictureinpic') || inputPath.includes('webm')) {
    options.push('-r 30');
    console.log('[FFmpeg] FORCING 30fps for PIP/WebM recording to fix slow motion');
    
    // Also force better quality settings for PIP recordings
    options.push('-preset medium'); // Better quality than fast
    options.push('-crf 18'); // High quality (lower = better quality)
    console.log('[FFmpeg] FORCING high quality settings for PIP recording');
  }
  
  // Bitrate or CRF
  if (advanced.crf && advanced.crfValue !== undefined) {
    options.push(`-crf ${advanced.crfValue}`);
  } else if (advanced.bitrate) {
    options.push(`-b:v ${advanced.bitrate}`);
  }
  
  // Two-pass encoding
  if (advanced.twoPass) {
    options.push('-pass 1', '-passlogfile', path.join(process.cwd(), 'ffmpeg2pass'));
  }
  
  // Pixel format for compatibility
  options.push('-pix_fmt yuv420p');
  
  return options;
}

/**
 * Get audio encoding options from settings
 * @param {Object} settings - Export settings
 * @returns {Array} FFmpeg output options
 */
function getAudioOptions(settings) {
  const options = [];
  
  // Audio bitrate
  if (settings.audioBitrate) {
    options.push(`-b:a ${settings.audioBitrate}`);
  }
  
  return options;
}

/**
 * Export video to MP4
 * @param {string} inputPath - Source video file
 * @param {string} outputPath - Destination file
 * @param {Object} options - Export options {startTime, duration, onProgress, settings}
 * @returns {Promise<string>} Output file path
 */
async function exportVideo(inputPath, outputPath, options = {}) {
  return new Promise((resolve, reject) => {
    // Update paths each time to ensure correct in production
    updateFFmpegPaths();
    
    const { startTime, duration, onProgress, settings = {} } = options;
    
    console.log('🎬 [EXPORT] Starting export:', inputPath, '->', outputPath);
    console.log('🎬 [EXPORT] Options:', { startTime, duration, settings });
    
    // Fallback progress tracking for when FFmpeg doesn't provide progress
    let fallbackProgress = 0;
    let progressInterval = null;
    
    const startFallbackProgress = () => {
      if (progressInterval) clearInterval(progressInterval);
      
      // Start with 5% to show something is happening
      fallbackProgress = 5;
      if (onProgress) {
        onProgress({ percent: fallbackProgress, timemark: '00:00:00' });
      }
      
      // Gradually increase progress over time (fallback)
      progressInterval = setInterval(() => {
        if (fallbackProgress < 95) {
          fallbackProgress += Math.random() * 5; // Random increment to simulate progress
          if (onProgress) {
            onProgress({ percent: Math.min(95, fallbackProgress), timemark: 'Processing...' });
          }
        }
      }, 1000); // Update every second
    };
    
    const stopFallbackProgress = () => {
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
    };
    
    // Validate input file exists
    if (!fs.existsSync(inputPath)) {
      const error = `Input file does not exist: ${inputPath}`;
      console.error('❌ [EXPORT ERROR]', error);
      reject(new Error(error));
      return;
    }
    
    // Validate trim parameters
    if (startTime !== undefined && (startTime < 0 || !isFinite(startTime))) {
      const error = `Invalid startTime: ${startTime}`;
      console.error('❌ [EXPORT ERROR]', error);
      reject(new Error(error));
      return;
    }
    
    if (duration !== undefined && (duration <= 0 || !isFinite(duration))) {
      const error = `Invalid duration: ${duration}`;
      console.error('❌ [EXPORT ERROR]', error);
      reject(new Error(error));
      return;
    }
    
    // Build FFmpeg command with settings
    let command = ffmpeg(inputPath);
    
    // Apply video codec and settings
    const videoCodec = getVideoCodec(settings);
    const videoOptions = getVideoOptions(settings, inputPath);
    command = command.videoCodec(videoCodec);
    if (videoOptions.length > 0) {
      command = command.outputOptions(videoOptions);
      console.log('🎬 [EXPORT] Video options:', videoOptions);
    }
    
    // Apply audio codec and settings
    const audioCodec = getAudioCodec(settings);
    const audioOptions = getAudioOptions(settings);
    command = command.audioCodec(audioCodec);
    if (audioOptions.length > 0) {
      command = command.outputOptions(audioOptions);
      console.log('🎬 [EXPORT] Audio options:', audioOptions);
    }

    // Apply trim if specified
    if (startTime && startTime > 0) {
      command = command.setStartTime(startTime);
      console.log('🎬 [EXPORT] Trimming from:', startTime, 'seconds');
    }
    
    if (duration && duration > 0) {
      command = command.setDuration(duration);
      console.log('🎬 [EXPORT] Duration:', duration, 'seconds');
    }

    // Start fallback progress immediately
    startFallbackProgress();
    
    command
      .on('progress', (progress) => {
        // Stop fallback progress since we have real progress
        stopFallbackProgress();
        
        // Calculate progress percentage based on time if percent is not available
        let calculatedPercent = 0;
        
        if (progress.percent && !isNaN(progress.percent)) {
          calculatedPercent = Math.min(100, Math.max(0, progress.percent));
        } else if (duration && progress.timemark) {
          // Calculate progress based on time elapsed vs total duration
          const timeMatch = progress.timemark.match(/(\d+):(\d+):(\d+\.?\d*)/);
          if (timeMatch) {
            const hours = parseInt(timeMatch[1]) || 0;
            const minutes = parseInt(timeMatch[2]) || 0;
            const seconds = parseFloat(timeMatch[3]) || 0;
            const elapsedSeconds = hours * 3600 + minutes * 60 + seconds;
            calculatedPercent = Math.min(100, Math.max(0, (elapsedSeconds / duration) * 100));
          }
        }
        
        if (onProgress) {
          onProgress({
            percent: calculatedPercent,
            timemark: progress.timemark || '',
            targetSize: progress.targetSize || 0
          });
        }
        console.log('🎬 [EXPORT] Progress:', calculatedPercent.toFixed(1) + '%', progress.timemark);
      })
      .on('end', () => {
        stopFallbackProgress();
        console.log('🎬 [EXPORT] Export completed successfully:', outputPath);
        if (onProgress) {
          onProgress({ percent: 100, timemark: 'Complete' });
        }
        resolve(outputPath);
      })
      .on('error', (err) => {
        stopFallbackProgress();
        console.error('❌ [EXPORT] FFmpeg error:', err);
        reject(new Error(`FFmpeg error: ${err.message}`));
      })
      .save(outputPath);
  });
}

/**
 * Export entire timeline with all clips concatenated
 * Uses FFmpeg concat demuxer for proper multi-clip export
 */
async function exportTimeline(clips, clipTrims, outputPath, onProgress, settings = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      // Update paths each time to ensure correct in production
      updateFFmpegPaths();
      
      console.log('Starting timeline export with', clips.length, 'clips');
      
      if (!clips || clips.length === 0) {
        reject(new Error('No clips to export'));
        return;
      }

      // If only one clip, use simple export
      if (clips.length === 1) {
        const clip = clips[0];
        const trimData = clipTrims[clip.id] || { inPoint: 0, outPoint: clip.duration };
        
        console.log('🎬 [TIMELINE] Single clip export:', {
          clipId: clip.id,
          clipName: clip.name,
          clipDuration: clip.duration,
          isTrimmed: clip.isTrimmed,
          trimmedPath: clip.trimmedPath,
          trimData,
          calculatedDuration: trimData.outPoint - trimData.inPoint
        });
        
        // Validate trim data
        if (trimData.outPoint <= trimData.inPoint) {
          console.error('❌ [TIMELINE] Invalid trim data:', trimData);
          reject(new Error(`Invalid trim data: outPoint (${trimData.outPoint}) must be greater than inPoint (${trimData.inPoint})`));
          return;
        }
        
        const finalDuration = trimData.outPoint - trimData.inPoint;
        console.log('🎬 [TIMELINE] Final export parameters:', {
          inputPath: clip.isTrimmed ? clip.trimmedPath : clip.path,
          startTime: clip.isTrimmed ? 0 : trimData.inPoint,
          duration: finalDuration
        });
        
        await exportVideo(clip.isTrimmed ? clip.trimmedPath : clip.path, outputPath, {
          startTime: clip.isTrimmed ? 0 : trimData.inPoint,
          duration: finalDuration,
          onProgress,
          settings
        });
        
        return resolve(outputPath);
      }

      // Multiple clips - render trimmed versions first, then concatenate
      const tempFiles = [];
      
      for (let i = 0; i < clips.length; i++) {
        const clip = clips[i];
        const trimData = clipTrims[clip.id] || { inPoint: 0, outPoint: clip.duration };
        
        // Skip if no trim needed
        if (clip.isTrimmed) {
          tempFiles.push({ path: clip.trimmedPath, duration: clip.duration });
          continue;
        }
        
        // Render trimmed version
        const tempPath = path.join(path.dirname(outputPath), `temp_${i}.mp4`);
        await renderTrimmedClip(clip.path, tempPath, trimData, (progress) => {
          // Progress for this clip
          if (onProgress) {
            onProgress({ percent: ((i / clips.length) * 100) + (progress.percent / clips.length) });
          }
        }, settings);
        tempFiles.push({ path: tempPath, duration: trimData.outPoint - trimData.inPoint });
      }
      
      // Create concat file
      const concatFile = path.join(path.dirname(outputPath), 'concat.txt');
      let concatContent = '';
      tempFiles.forEach(file => {
        concatContent += `file '${file.path}'\n`;
      });
      fs.writeFileSync(concatFile, concatContent);
      
      // Concatenate all clips
      await new Promise((concatResolve, concatReject) => {
        const videoCodec = getVideoCodec(settings);
        const audioCodec = getAudioCodec(settings);
        const videoOptions = getVideoOptions(settings, concatFile);
        const audioOptions = getAudioOptions(settings);
        
        let command = ffmpeg(concatFile)
          .inputOptions(['-f', 'concat', '-safe', '0'])
          .videoCodec(videoCodec)
          .audioCodec(audioCodec);
        
        // Apply all options
        const allOptions = [...videoOptions, ...audioOptions];
        if (allOptions.length > 0) {
          command = command.outputOptions(allOptions);
        }
        
        command
          .on('progress', (progress) => {
            // Calculate progress for concatenation phase (90-100%)
            let calculatedPercent = 90;
            
            if (progress.percent && !isNaN(progress.percent)) {
              calculatedPercent = 90 + (Math.min(100, Math.max(0, progress.percent)) * 0.1);
            }
            
            if (onProgress) {
              onProgress({ percent: calculatedPercent });
            }
            console.log('🎬 [CONCAT] Progress:', calculatedPercent.toFixed(1) + '%');
          })
          .on('end', () => {
            // Cleanup temp files
            tempFiles.forEach(file => {
              if (file.path.includes('temp_')) {
                try {
                  fs.unlinkSync(file.path);
                } catch (e) {}
              }
            });
            try {
              fs.unlinkSync(concatFile);
            } catch (e) {}
            concatResolve();
          })
          .on('error', concatReject)
          .save(outputPath);
      });
      
      resolve(outputPath);
    } catch (error) {
      console.error('Timeline export error:', error);
      reject(error);
    }
  });
}

/**
 * Render a trimmed clip (creates a new file with trim applied)
 * @param {string} inputPath - Source video file
 * @param {string} outputPath - Destination file
 * @param {Object} trimData - Trim data { inPoint, outPoint }
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<string>} Output file path
 */
async function renderTrimmedClip(inputPath, outputPath, trimData, onProgress, settings = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      // Update paths each time to ensure correct in production
      updateFFmpegPaths();
      
      const startTime = trimData.inPoint || 0;
      const duration = trimData.outPoint - trimData.inPoint;
      
    console.log(`[TRIM] Rendering trimmed clip: ${startTime}s - ${trimData.outPoint}s`);
    console.log(`[TRIM] Duration: ${duration}s`);
    console.log(`[TRIM] Input: ${inputPath}`);
    console.log(`[TRIM] Output: ${outputPath}`);
      
      // Ensure temp directory exists
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log(`Created temp directory: ${outputDir}`);
      }
      
      // Use settings for rendering (but use ultrafast preset for temp files)
      const videoCodec = getVideoCodec(settings);
      const audioCodec = getAudioCodec(settings);
      const videoOptions = getVideoOptions(settings, inputPath);
      const audioOptions = getAudioOptions(settings);
      
      // Override preset to ultrafast for temp files
      const tempVideoOptions = videoOptions.map(opt => 
        opt.startsWith('-preset') ? '-preset ultrafast' : opt
      );
      
      let command = ffmpeg(inputPath)
        .setStartTime(startTime)
        .setDuration(duration)
        .videoCodec(videoCodec)
        .audioCodec(audioCodec);
      
      // Apply all options
      const allOptions = [...tempVideoOptions, ...audioOptions, '-avoid_negative_ts make_zero'];
      if (allOptions.length > 0) {
        command = command.outputOptions(allOptions);
      }
      
      command
        .on('progress', (progress) => {
          // Calculate progress percentage based on time if percent is not available
          let calculatedPercent = 0;
          
          if (progress.percent && !isNaN(progress.percent)) {
            calculatedPercent = Math.min(100, Math.max(0, progress.percent));
          } else if (duration && progress.timemark) {
            // Calculate progress based on time elapsed vs total duration
            const timeMatch = progress.timemark.match(/(\d+):(\d+):(\d+\.?\d*)/);
            if (timeMatch) {
              const hours = parseInt(timeMatch[1]) || 0;
              const minutes = parseInt(timeMatch[2]) || 0;
              const seconds = parseFloat(timeMatch[3]) || 0;
              const elapsedSeconds = hours * 3600 + minutes * 60 + seconds;
              calculatedPercent = Math.min(100, Math.max(0, (elapsedSeconds / duration) * 100));
            }
          }
          
          console.log('🎬 [TRIM] Render progress:', calculatedPercent.toFixed(1) + '%', progress.timemark);
          if (onProgress) {
            onProgress({
              percent: calculatedPercent,
              timemark: progress.timemark || '00:00:00'
            });
          }
        })
        .on('end', () => {
          console.log('Trimmed clip rendered successfully');
          resolve(outputPath);
        })
        .on('error', (err) => {
          console.error('FFmpeg render error:', err);
          reject(new Error(`Failed to render trimmed clip: ${err.message}`));
        })
        .save(outputPath);
    } catch (error) {
      console.error('Render trimmed clip error:', error);
      reject(error);
    }
  });
}

/**
 * Get video metadata using FFprobe
 * @param {string} videoPath - Path to video file
 * @returns {Promise<Object>} Video metadata
 */
async function getVideoMetadata(videoPath) {
  return new Promise((resolve, reject) => {
    try {
      // Update paths each time to ensure correct in production
      updateFFmpegPaths();
      
      console.log('[METADATA] Extracting metadata for:', videoPath);
      
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          console.error('[METADATA ERROR]', err.message);
          reject(new Error(`Failed to extract metadata: ${err.message}`));
          return;
        }

        try {
          const videoStream = metadata.streams.find(s => s.codec_type === 'video');
          const audioStream = metadata.streams.find(s => s.codec_type === 'audio');

          const result = {
            duration: parseFloat(metadata.format.duration) || 0,
            width: videoStream?.width || 0,
            height: videoStream?.height || 0,
            fps: videoStream?.r_frame_rate ? eval(videoStream.r_frame_rate) : 30,
            codec: videoStream?.codec_name || 'unknown',
            hasAudio: !!audioStream,
            fileSize: parseInt(metadata.format.size) || 0,
            thumbnailUrl: null // Could add thumbnail generation later
          };

          console.log('[METADATA] Extracted:', result);
          resolve(result);
        } catch (parseError) {
          console.error('[METADATA PARSE ERROR]', parseError);
          reject(new Error(`Failed to parse metadata: ${parseError.message}`));
        }
      });
    } catch (error) {
      console.error('[METADATA ERROR]', error);
      reject(error);
    }
  });
}

module.exports = { exportVideo, exportTimeline, renderTrimmedClip, getVideoMetadata };

