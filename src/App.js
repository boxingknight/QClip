import React, { useState, useEffect } from 'react';
import ImportPanel from './components/ImportPanel';
import './App.css';

function App() {
  const [clips, setClips] = useState([]);
  const [importStatus, setImportStatus] = useState({
    loading: false,
    error: null,
    lastImported: null
  });

  // Test IPC communication on mount
  useEffect(() => {
    if (window.electronAPI) {
      const result = window.electronAPI.ping();
      console.log('IPC test:', result);
    }
  }, []);

  const handleImport = (newClips) => {
    console.log('Importing clips:', newClips);
    setImportStatus({ loading: true, error: null, lastImported: null });
    
    // Add to existing clips
    setClips(prev => [...prev, ...newClips]);
    
    // Update status
    setImportStatus({
      loading: false,
      error: null,
      lastImported: newClips.length
    });
  };

  return (
    <div className="app">
      <div className="header">
        <h1>ClipForge</h1>
        <p className="subtitle">Desktop Video Editor MVP</p>
      </div>
      <div className="main-content">
        <ImportPanel 
          onImport={handleImport}
          isImporting={importStatus.loading}
        />
        
        {clips.length > 0 && (
          <div className="imported-clips">
            <h3>Imported Clips ({clips.length})</h3>
            <ul>
              {clips.map(clip => (
                <li key={clip.id} className="clip-item">
                  <strong>{clip.name}</strong>
                  <span className="clip-size">
                    {clip.fileSize > 0 ? `(${(clip.fileSize / (1024 * 1024)).toFixed(2)} MB)` : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

