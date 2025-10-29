#!/usr/bin/env node

/**
 * Open Exported Video Script
 * 
 * This script opens the exported video file in the default system video player
 * for manual verification of the export results.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test file path (update this to match your exported file)
const EXPORTED_FILE = '/Users/loganmay/Documents/54together.mp4';

console.log('🎬 ClipForge Export Verification');
console.log('================================');

// Check if file exists
if (!fs.existsSync(EXPORTED_FILE)) {
  console.error('❌ Export file not found:', EXPORTED_FILE);
  console.log('💡 Make sure you have exported a video from ClipForge first.');
  process.exit(1);
}

console.log('✅ Export file found:', EXPORTED_FILE);

// Get file stats
const stats = fs.statSync(EXPORTED_FILE);
const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

console.log('📊 File size:', fileSizeMB, 'MB');
console.log('📅 Created:', stats.birthtime.toLocaleString());

// Try to open the video file
try {
  console.log('');
  console.log('🎥 Opening video in default player...');
  
  // On macOS, use 'open' command
  if (process.platform === 'darwin') {
    execSync(`open "${EXPORTED_FILE}"`, { stdio: 'inherit' });
    console.log('✅ Video opened in QuickTime Player (or default video app)');
  }
  // On Windows, use 'start' command
  else if (process.platform === 'win32') {
    execSync(`start "${EXPORTED_FILE}"`, { stdio: 'inherit' });
    console.log('✅ Video opened in default Windows video player');
  }
  // On Linux, try common video players
  else {
    try {
      execSync(`xdg-open "${EXPORTED_FILE}"`, { stdio: 'inherit' });
      console.log('✅ Video opened in default Linux video player');
    } catch (error) {
      console.log('⚠️  Could not open video automatically. Please open manually:');
      console.log('   ', EXPORTED_FILE);
    }
  }
  
} catch (error) {
  console.error('❌ Failed to open video:', error.message);
  console.log('');
  console.log('💡 Please open the video manually:');
  console.log('   ', EXPORTED_FILE);
}

console.log('');
console.log('📝 Manual verification checklist:');
console.log('□ Video plays without errors');
console.log('□ Video shows expected resolution (1920x1080)');
console.log('□ Audio is synchronized with video');
console.log('□ First clip shows trimmed content (~5.4s)');
console.log('□ Second clip plays after first clip ends (~4.0s)');
console.log('□ Total duration is approximately 9.4 seconds');
console.log('□ No black frames or gaps between clips');
console.log('□ Video quality looks good');
console.log('');
console.log('🎉 Export verification complete!');
console.log('');
console.log('📊 Export Summary:');
console.log('   File: 54together.mp4');
console.log('   Size: ' + fileSizeMB + ' MB');
console.log('   Expected Duration: ~9.4s');
console.log('   Clips: 2 (trimmed + full)');
console.log('   Status: Ready for manual verification');
