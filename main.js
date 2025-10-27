const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const { exportVideo, exportTimeline } = require('./electron/ffmpeg/videoProcessing');

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
      { name: 'Video Files', extensions: ['mp4', 'mov'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  
  return result.canceled ? [] : result.filePaths;
});

ipcMain.handle('get-file-absolute-path', async (event, filePath) => {
  return path.resolve(filePath);
});

// Export video handler
ipcMain.handle('export-video', async (event, inputPath, outputPath, trimData) => {
  try {
    console.log('Export request received:', { inputPath, outputPath, trimData });
    
    // Convert trim data (inPoint/outPoint) to FFmpeg format (startTime/duration)
    const startTime = trimData?.inPoint || 0;
    const duration = trimData?.outPoint ? (trimData.outPoint - trimData.inPoint) : undefined;
    
    console.log('Trim settings:', { startTime, duration });
    
    await exportVideo(inputPath, outputPath, {
      startTime: startTime,
      duration: duration,
      onProgress: (progress) => {
        // Send progress to renderer
        event.sender.send('export-progress-update', progress);
      }
    });
    
    return { success: true, outputPath };
  } catch (error) {
    console.error('Export error:', error);
    return { success: false, error: error.message };
  }
});

// Export entire timeline
ipcMain.handle('export-timeline', async (event, clips, clipTrims, outputPath) => {
  try {
    console.log('Export timeline request:', { clips: clips.length, outputPath });
    
    const result = await exportTimeline(clips, clipTrims, outputPath, (progress) => {
      // Send progress to renderer
      event.sender.send('export-progress-update', progress);
    });
    
    return { success: true, outputPath: result };
  } catch (error) {
    console.error('Timeline export error:', error);
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

