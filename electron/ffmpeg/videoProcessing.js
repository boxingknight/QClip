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

module.exports = { exportVideo };

