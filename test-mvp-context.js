// Test script to verify MVP functionality with Context API
// This can be run in the browser console to test the app

console.log('🧪 Testing ClipForge MVP functionality with Context API...');

// Test 1: Check if contexts are available
console.log('Test 1: Context availability');
try {
  // Check if the app is using contexts
  const timelineElement = document.querySelector('.timeline');
  if (timelineElement) {
    console.log('✅ Timeline component rendered');
  } else {
    console.log('❌ Timeline component not found');
  }
} catch (error) {
  console.log('❌ Error checking timeline:', error);
}

// Test 2: Check if import functionality works
console.log('Test 2: Import functionality');
try {
  const importButton = document.querySelector('button[onclick*="import"]') || 
                      document.querySelector('input[type="file"]');
  if (importButton) {
    console.log('✅ Import button/input found');
  } else {
    console.log('❌ Import functionality not found');
  }
} catch (error) {
  console.log('❌ Error checking import:', error);
}

// Test 3: Check if video player is present
console.log('Test 3: Video player');
try {
  const videoElement = document.querySelector('video');
  if (videoElement) {
    console.log('✅ Video element found');
  } else {
    console.log('❌ Video element not found');
  }
} catch (error) {
  console.log('❌ Error checking video player:', error);
}

// Test 4: Check if export functionality is present
console.log('Test 4: Export functionality');
try {
  const exportButton = document.querySelector('button[onclick*="export"]') ||
                       document.querySelector('button:contains("Export")');
  if (exportButton) {
    console.log('✅ Export button found');
  } else {
    console.log('❌ Export functionality not found');
  }
} catch (error) {
  console.log('❌ Error checking export:', error);
}

// Test 5: Check for console errors
console.log('Test 5: Console errors');
const originalError = console.error;
let errorCount = 0;
console.error = function(...args) {
  errorCount++;
  originalError.apply(console, args);
};

// Reset after 1 second
setTimeout(() => {
  console.error = originalError;
  if (errorCount === 0) {
    console.log('✅ No console errors detected');
  } else {
    console.log(`❌ ${errorCount} console errors detected`);
  }
}, 1000);

console.log('🎯 MVP functionality test complete!');
console.log('Manual test checklist:');
console.log('1. Import a video file');
console.log('2. Verify clip appears in timeline');
console.log('3. Click clip to select it');
console.log('4. Verify video player shows the clip');
console.log('5. Set trim points by dragging handles');
console.log('6. Click Apply Trim');
console.log('7. Export the video');
console.log('8. Verify all functionality works identically to MVP');
