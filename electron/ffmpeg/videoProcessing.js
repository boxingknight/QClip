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
 * @param {Array} clips - Array of clip objects
 * @param {Object} clipTrims - Object mapping clip IDs to trim data
 * @param {string} outputPath - Destination file
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<string>} Output file path
 */
async function exportTimeline(clips, clipTrims, outputPath, onProgress) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('Starting timeline export with', clips.length, 'clips');
      
      if (!clips || clips.length === 0) {
        reject(new Error('No clips to export'));
        return;
      }

      // For MVP: Export first clip with its trim
      // TODO: Implement proper concatenation for multi-clip timelines
      const firstClip = clips[0];
      const trimData = clipTrims[firstClip.id] || { inPoint: 0, outPoint: firstClip.duration };
      
      console.log('Exporting clip:', firstClip.name);
      console.log('Trim data:', trimData);
      
      await exportVideo(firstClip.path, outputPath, {
        startTime: trimData.inPoint,
        duration: trimData.outPoint - trimData.inPoint,
        onProgress
      });
      
      resolve(outputPath);
    } catch (error) {
      console.error('Timeline export error:', error);
      reject(error);
    }
  });
}

module.exports = { exportVideo, exportTimeline };

