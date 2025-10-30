const { app, BrowserWindow, dialog, ipcMain, desktopCapturer } = require('electron');
const path = require('path');
const { exportVideo, exportTimeline, renderTrimmedClip, getVideoMetadata } = require('./electron/ffmpeg/videoProcessing');
const os = require('os');

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('[Main Process] Uncaught Exception:', error);
  // Optionally crash app or recover gracefully
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Main Process] Unhandled Rejection:', reason);
});

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load from built file
  mainWindow.loadFile('dist/index.html');
  
  // Open DevTools
  mainWindow.webContents.openDevTools();
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers
ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Video Files', extensions: ['mp4', 'mov', 'webm'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  
  return result.canceled ? [] : result.filePaths;
});

ipcMain.handle('get-file-absolute-path', async (event, filePath) => {
  return path.resolve(filePath);
});

// Get video metadata handler
ipcMain.handle('get-video-metadata', async (event, videoPath) => {
  try {
    console.log('Metadata request received:', videoPath);
    const metadata = await getVideoMetadata(videoPath);
    return metadata;
  } catch (error) {
    console.error('Metadata extraction failed:', error);
    throw error;
  }
});

// Export video handler
ipcMain.handle('export-video', async (event, inputPath, outputPath, trimData, settings = {}) => {
  try {
    console.log('🎬 [MAIN] Export request received:', { inputPath, outputPath, trimData, settings });
    
    // Convert trim data (inPoint/outPoint) to FFmpeg format (startTime/duration)
    const startTime = trimData?.inPoint || 0;
    const duration = trimData?.outPoint ? (trimData.outPoint - trimData.inPoint) : undefined;
    
    console.log('🎬 [MAIN] Trim settings:', { 
      inPoint: trimData?.inPoint, 
      outPoint: trimData?.outPoint, 
      startTime, 
      duration 
    });
    console.log('🎬 [MAIN] Export settings:', settings);
    
    // Validate trim data
    if (trimData && trimData.outPoint && trimData.inPoint) {
      const calculatedDuration = trimData.outPoint - trimData.inPoint;
      console.log('🎬 [MAIN] Calculated duration:', calculatedDuration, 'seconds');
      
      if (calculatedDuration <= 0) {
        throw new Error(`Invalid trim duration: ${calculatedDuration} seconds (outPoint: ${trimData.outPoint}, inPoint: ${trimData.inPoint})`);
      }
    }
    
    await exportVideo(inputPath, outputPath, {
      startTime: startTime,
      duration: duration,
      settings: settings,
      onProgress: (progress) => {
        // Send progress to renderer
        event.sender.send('export-progress-update', progress);
      }
    });
    
    console.log('🎬 [MAIN] Export completed successfully:', outputPath);
    return { success: true, outputPath };
  } catch (error) {
    console.error('❌ [MAIN] Export error:', error);
    return { success: false, error: error.message };
  }
});

// Export entire timeline
ipcMain.handle('export-timeline', async (event, clips, clipTrims, outputPath, settings = {}) => {
  try {
    console.log('🎬 [MAIN] Export timeline request:', { clips: clips.length, outputPath, settings });
    console.log('🎬 [MAIN] Clip trims:', clipTrims);
    
    const result = await exportTimeline(clips, clipTrims, outputPath, (progress) => {
      // Send progress to renderer
      event.sender.send('export-progress-update', progress);
    }, settings);
    
    console.log('🎬 [MAIN] Timeline export completed successfully:', result);
    return { success: true, outputPath: result };
  } catch (error) {
    console.error('❌ [MAIN] Timeline export error:', error);
    return { success: false, error: error.message };
  }
});

// Get temp file path for trimmed clip
ipcMain.handle('get-temp-trim-path', async (event, clipId) => {
  try {
    const tempDir = path.join(os.tmpdir(), 'clipforge-trims');
    // Ensure directory exists
    const fs = require('fs');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const tempPath = path.join(tempDir, `${clipId}_trimmed.mp4`);
    console.log('Generated temp path:', tempPath);
    return tempPath;
  } catch (error) {
    console.error('Get temp path error:', error);
    throw error;
  }
});

// Render trimmed clip
ipcMain.handle('render-trimmed-clip', async (event, inputPath, outputPath, trimData) => {
  try {
    console.log('Render trim request:', { inputPath, outputPath, trimData });
    
    await renderTrimmedClip(inputPath, outputPath, trimData, (progress) => {
      // Send progress to renderer
      event.sender.send('render-progress-update', progress);
    });
    
    return { success: true, outputPath };
  } catch (error) {
    console.error('Render trim error:', error);
    return { success: false, error: error.message };
  }
});

// Save dialog for export
ipcMain.handle('show-save-dialog', async () => {
  const result = await dialog.showSaveDialog({
    filters: [{ name: 'Video', extensions: ['mp4'] }],
    defaultPath: 'export.mp4'
  });
  
  if (result.canceled) {
    return { canceled: true };
  }
  
  return { filePath: result.filePath };
});

// Screen recording handlers
ipcMain.handle('get-screen-sources', async () => {
  try {
    console.log('Getting screen sources...');
    const sources = await desktopCapturer.getSources({
      types: ['window', 'screen'],
      thumbnailSize: { width: 150, height: 150 }
    });
    
    console.log(`Found ${sources.length} screen sources`);
    
    return sources.map(source => ({
      id: source.id,
      name: source.name,
      displayId: source.display_id || '',
      thumbnail: source.thumbnail.toDataURL()
    }));
  } catch (error) {
    console.error('Failed to get screen sources:', error);
    throw new Error(`Unable to access screen sources: ${error.message}`);
  }
});

ipcMain.handle('request-screen-permission', async () => {
  // macOS requires screen recording permission
  // Electron handles this automatically on first use
  console.log('Screen recording permission requested');
  return true;
});

ipcMain.handle('save-recording-file', async (event, arrayBuffer, filePath) => {
  try {
    const fs = require('fs').promises;
    // ArrayBuffer is passed directly from renderer process
    // Convert to Node.js Buffer for file writing
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(filePath, buffer);
    console.log('Recording saved to:', filePath);
    return filePath;
  } catch (error) {
    console.error('Failed to save recording:', error);
    throw error;
  }
});

