const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process
// to use ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Test IPC communication
  ping: () => 'pong',
  
  // File import APIs
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  getFileAbsolutePath: (path) => ipcRenderer.invoke('get-file-absolute-path', path),
  getVideoMetadata: (videoPath) => ipcRenderer.invoke('get-video-metadata', videoPath),
  
  // Export APIs
  exportVideo: (inputPath, outputPath, trimData, settings) => 
    ipcRenderer.invoke('export-video', inputPath, outputPath, trimData, settings),
  
  exportTimeline: (clips, clipTrims, outputPath, settings) =>
    ipcRenderer.invoke('export-timeline', clips, clipTrims, outputPath, settings),
  
  renderTrimmedClip: (inputPath, outputPath, trimData) =>
    ipcRenderer.invoke('render-trimmed-clip', inputPath, outputPath, trimData),
  
  getTempTrimPath: (clipId) =>
    ipcRenderer.invoke('get-temp-trim-path', clipId),
  
  showSaveDialog: () => ipcRenderer.invoke('show-save-dialog'),
  
  onExportProgress: (callback) => {
    const handler = (event, progress) => callback(progress);
    ipcRenderer.on('export-progress-update', handler);
    return () => ipcRenderer.removeListener('export-progress-update', handler);
  },
  
  onRenderProgress: (callback) => {
    const handler = (event, progress) => callback(progress);
    ipcRenderer.on('render-progress-update', handler);
    
    // Return unsubscribe function
    return () => ipcRenderer.removeListener('export-progress-update', handler);
  },
  
  // Screen recording APIs
  getScreenSources: () => ipcRenderer.invoke('get-screen-sources'),
  requestScreenPermission: () => ipcRenderer.invoke('request-screen-permission'),
  saveRecordingFile: (arrayBuffer, filePath) => ipcRenderer.invoke('save-recording-file', arrayBuffer, filePath)
});

