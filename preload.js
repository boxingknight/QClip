const { contextBridge } = require('electron');

// Expose protected methods that allow the renderer process
// to use ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // IPC methods will be added in future PRs
  // For now, just verify communication works
  ping: () => 'pong'
});

