import React from 'react';
import './App.css';

function App() {
  // Test IPC communication
  const testIPC = () => {
    if (window.electronAPI) {
      const result = window.electronAPI.ping();
      console.log('IPC test:', result);
    }
  };

  React.useEffect(() => {
    testIPC();
  }, []);

  return (
    <div className="app">
      <div className="header">
        <h1>ClipForge</h1>
        <p className="subtitle">Desktop Video Editor MVP</p>
      </div>
      <div className="main-content">
        <div className="welcome">
          <h2>Welcome to ClipForge</h2>
          <p>Your desktop video editor is ready!</p>
          <p className="status">✅ Project setup complete</p>
          <p className="status">✅ Electron main process running</p>
          <p className="status">✅ React renderer loaded</p>
          <p className="status">✅ IPC communication active</p>
        </div>
      </div>
    </div>
  );
}

export default App;

