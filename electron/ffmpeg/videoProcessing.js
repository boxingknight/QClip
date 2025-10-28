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
 * Export video to MP4
 * @param {string} inputPath - Source video file
 * @param {string} outputPath - Destination file
 * @param {Object} options - Export options {startTime, duration, onProgress}
 * @returns {Promise<string>} Output file path
 */
async function exportVideo(inputPath, outputPath, options = {}) {
  return new Promise((resolve, reject) => {
    // Update paths each time to ensure correct in production
    updateFFmpegPaths();
    
    const { startTime, duration, onProgress } = options;
    
    console.log('Starting export:', inputPath, '->', outputPath);
    console.log('Options:', { startTime, duration });
    
    let command = ffmpeg(inputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .outputOptions(['-preset fast', '-crf 23']);

    // Apply trim if specified
    if (startTime && startTime > 0) {
      command = command.setStartTime(startTime);
      console.log('Trimming from:', startTime, 'seconds');
    }
    
    if (duration && duration > 0) {
      command = command.setDuration(duration);
      console.log('Duration:', duration, 'seconds');
    }

    command
      .on('progress', (progress) => {
        if (onProgress) {
          onProgress({
            percent: progress.percent || 0,
            timemark: progress.timemark || '',
            targetSize: progress.targetSize || 0
          });
        }
        console.log('Export progress:', progress.percent + '%', progress.timemark);
      })
      .on('end', () => {
        console.log('Export completed successfully:', outputPath);
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        reject(new Error(`FFmpeg error: ${err.message}`));
      })
      .save(outputPath);
  });
}

/**
 * Export entire timeline with all clips concatenated
 * Uses FFmpeg concat demuxer for proper multi-clip export
 */
async function exportTimeline(clips, clipTrims, outputPath, onProgress) {
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
        
        await exportVideo(clip.isTrimmed ? clip.trimmedPath : clip.path, outputPath, {
          startTime: clip.isTrimmed ? 0 : trimData.inPoint,
          duration: clip.isTrimmed ? clip.duration : (trimData.outPoint - trimData.inPoint),
          onProgress
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
        });
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
        ffmpeg(concatFile)
          .inputOptions(['-f', 'concat', '-safe', '0'])
          .videoCodec('libx264')
          .audioCodec('aac')
          .outputOptions(['-preset fast', '-crf 23'])
          .on('progress', (progress) => {
            if (onProgress) {
              onProgress({ percent: 90 + (progress.percent * 0.1) });
            }
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
async function renderTrimmedClip(inputPath, outputPath, trimData, onProgress) {
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
      
      ffmpeg(inputPath)
        .setStartTime(startTime)
        .setDuration(duration)
        .videoCodec('libx264')
        .audioCodec('aac')
        .outputOptions([
          '-preset ultrafast',  // Fast rendering for MVP
          '-crf 23',
          '-avoid_negative_ts make_zero'
        ])
        .on('progress', (progress) => {
          console.log('Render progress:', progress.percent + '%', progress.timemark);
          if (onProgress) {
            onProgress({
              percent: progress.percent || 0,
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

module.exports = { exportVideo, exportTimeline, renderTrimmedClip };

