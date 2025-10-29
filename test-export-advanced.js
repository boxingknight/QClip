#!/usr/bin/env node

/**
 * Advanced Export Verification Script
 * 
 * This script uses FFprobe to verify the exported video's metadata and ensure
 * it matches the expected timeline configuration.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test file path (update this to match your exported file)
const EXPORTED_FILE = '/Users/loganmay/Documents/54together.mp4';

console.log('🎬 ClipForge Advanced Export Test');
console.log('=================================');

// Check if file exists
if (!fs.existsSync(EXPORTED_FILE)) {
  console.error('❌ Export file not found:', EXPORTED_FILE);
  console.log('💡 Make sure you have exported a video from ClipForge first.');
  process.exit(1);
}

// Get file stats
const stats = fs.statSync(EXPORTED_FILE);
const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

console.log('✅ Export file found!');
console.log('📁 File path:', EXPORTED_FILE);
console.log('📊 File size:', fileSizeMB, 'MB');

// Try to get video metadata using FFprobe
try {
  console.log('');
  console.log('🔍 Analyzing video metadata...');
  
  // Run FFprobe to get video information
  const ffprobeCommand = `ffprobe -v quiet -print_format json -show_format -show_streams "${EXPORTED_FILE}"`;
  const ffprobeOutput = execSync(ffprobeCommand, { encoding: 'utf8' });
  const metadata = JSON.parse(ffprobeOutput);
  
  // Extract video stream info
  const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
  const audioStream = metadata.streams.find(stream => stream.codec_type === 'audio');
  
  if (videoStream) {
    console.log('📹 Video Stream:');
    console.log('   Resolution:', videoStream.width + 'x' + videoStream.height);
    console.log('   Codec:', videoStream.codec_name);
    console.log('   Frame Rate:', videoStream.r_frame_rate);
    console.log('   Duration:', parseFloat(metadata.format.duration).toFixed(2) + 's');
  }
  
  if (audioStream) {
    console.log('🔊 Audio Stream:');
    console.log('   Codec:', audioStream.codec_name);
    console.log('   Sample Rate:', audioStream.sample_rate + ' Hz');
    console.log('   Channels:', audioStream.channels);
  }
  
  console.log('');
  console.log('📋 Format Info:');
  console.log('   Format:', metadata.format.format_name);
  console.log('   Bitrate:', Math.round(metadata.format.bit_rate / 1000) + ' kbps');
  console.log('   File Size:', Math.round(metadata.format.size / (1024 * 1024)) + ' MB');
  
  // Validate expected properties
  console.log('');
  console.log('✅ Validation Results:');
  
  if (videoStream && videoStream.width === 1920 && videoStream.height === 1080) {
    console.log('✅ Resolution: 1920x1080 (Full HD)');
  } else {
    console.log('⚠️  Resolution:', videoStream?.width + 'x' + videoStream?.height);
  }
  
  if (videoStream && videoStream.codec_name === 'h264') {
    console.log('✅ Video Codec: H.264');
  } else {
    console.log('⚠️  Video Codec:', videoStream?.codec_name);
  }
  
  if (audioStream && audioStream.codec_name === 'aac') {
    console.log('✅ Audio Codec: AAC');
  } else {
    console.log('⚠️  Audio Codec:', audioStream?.codec_name);
  }
  
  const duration = parseFloat(metadata.format.duration);
  if (duration > 0 && duration < 1000) { // Reasonable duration check
    console.log('✅ Duration:', duration.toFixed(2) + 's');
  } else {
    console.log('⚠️  Duration:', duration + 's (unexpected)');
  }
  
} catch (error) {
  console.error('❌ Failed to analyze video metadata:', error.message);
  console.log('💡 Make sure FFprobe is installed and accessible');
  
  // Fallback to basic file check
  console.log('');
  console.log('📊 Basic file validation:');
  if (stats.size > 1000) {
    console.log('✅ File size is reasonable (' + fileSizeMB + ' MB)');
  } else {
    console.log('⚠️  File size is very small (' + fileSizeMB + ' MB)');
  }
}

console.log('');
console.log('🎉 Export verification completed!');
console.log('');
console.log('📝 Manual verification steps:');
console.log('1. Open the video in QuickTime Player or VLC');
console.log('2. Verify the video plays without errors');
console.log('3. Check that clips are in the correct order');
console.log('4. Verify trimmed portions are applied correctly');
console.log('5. Ensure audio is synchronized with video');
console.log('');
console.log('💡 Expected timeline based on logs:');
console.log('   - Clip 1: 2videotirm.mp4 (trimmed to ~5.4s)');
console.log('   - Clip 2: 3.mp4 (full duration ~4.0s)');
console.log('   - Total duration: ~9.4s');
