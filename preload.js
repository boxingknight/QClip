const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process
// to use ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Test IPC communication
  ping: () => 'pong',
  
  // File import APIs
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  getFileAbsolutePath: (path) => ipcRenderer.invoke('get-file-absolute-path', path),
  
  // Export APIs
  exportVideo: (inputPath, outputPath, trimData) => 
    ipcRenderer.invoke('export-video', inputPath, outputPath, trimData),
  
  exportTimeline: (clips, clipTrims, outputPath) =>
    ipcRenderer.invoke('export-timeline', clips, clipTrims, outputPath),
  
  renderTrimmedClip: (inputPath, outputPath, trimData) =>
    ipcRenderer.invoke('render-trimmed-clip', inputPath, outputPath, trimData),
  
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
  }
});

