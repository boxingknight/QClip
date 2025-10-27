const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process
// to use ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Test IPC communication
  ping: () => 'pong',
  
  // File import APIs
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  getFileAbsolutePath: (path) => ipcRenderer.invoke('get-file-absolute-path', path)
});

