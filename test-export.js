#!/usr/bin/env node

/**
 * Test Export Verification Script
 * 
 * This script verifies that the exported video file exists and has the correct properties.
 * Run this after exporting a video to ensure the export process worked correctly.
 */

const fs = require('fs');
const path = require('path');

// Test file path (update this to match your exported file)
const EXPORTED_FILE = '/Users/loganmay/Documents/54together.mp4';

console.log('🎬 ClipForge Export Test');
console.log('========================');

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
console.log('📅 Created:', stats.birthtime.toLocaleString());
console.log('📅 Modified:', stats.mtime.toLocaleString());

// Check if file is readable
try {
  const fileHandle = fs.openSync(EXPORTED_FILE, 'r');
  fs.closeSync(fileHandle);
  console.log('✅ File is readable');
} catch (error) {
  console.error('❌ File is not readable:', error.message);
  process.exit(1);
}

// Basic file validation
if (stats.size === 0) {
  console.error('❌ Export file is empty (0 bytes)');
  process.exit(1);
}

if (stats.size < 1000) {
  console.warn('⚠️  Export file is very small (' + stats.size + ' bytes) - might be corrupted');
}

console.log('');
console.log('🎉 Export test completed successfully!');
console.log('');
console.log('📝 Next steps:');
console.log('1. Open the exported video in a media player to verify playback');
console.log('2. Check that the video contains the expected clips in the correct order');
console.log('3. Verify that trimmed portions are correctly applied');
console.log('');
console.log('💡 To test with different files, update the EXPORTED_FILE variable in this script.');
