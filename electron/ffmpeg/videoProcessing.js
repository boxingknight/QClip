const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const ffprobePath = require('ffprobe-static').path;

// Configure FFmpeg paths
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

console.log('FFmpeg configured - Binary path:', ffmpegPath);
console.log('FFprobe configured - Binary path:', ffprobePath);

/**
 * Export video to MP4
 * @param {string} inputPath - Source video file
 * @param {string} outputPath - Destination file
 * @param {Object} options - Export options {startTime, duration, onProgress}
 * @returns {Promise<string>} Output file path
 */
async function exportVideo(inputPath, outputPath, options = {}) {
  return new Promise((resolve, reject) => {
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

const fs = require('fs');
const path = require('path');

/**
 * Export entire timeline with all clips concatenated
 * Uses FFmpeg concat demuxer for proper multi-clip export
 */
async function exportTimeline(clips, clipTrims, outputPath, onProgress) {
  return new Promise(async (resolve, reject) => {
    try {
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
      const startTime = trimData.inPoint || 0;
      const duration = trimData.outPoint - trimData.inPoint;
      
      console.log(`Rendering trimmed clip: ${startTime}s - ${trimData.outPoint}s`);
      console.log(`Duration: ${duration}s`);
      console.log(`Output: ${outputPath}`);
      
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

