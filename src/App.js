import React, { useState, useEffect } from 'react';
import ImportPanel from './components/ImportPanel';
import VideoPlayer from './components/VideoPlayer';
import ExportPanel from './components/ExportPanel';
import Timeline from './components/Timeline';
import './App.css';

function App() {
  const [clips, setClips] = useState([]);
  const [selectedClip, setSelectedClip] = useState(null);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
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
    
    // Select the first imported clip if none selected
    if (!selectedClip && newClips.length > 0) {
      setSelectedClip(newClips[0]);
    }
    
    // Update status
    setImportStatus({
      loading: false,
      error: null,
      lastImported: newClips.length
    });
  };

  const handleClipSelect = (clip) => {
    // Find the latest version of the clip from the clips array
    const freshClip = clips.find(c => c.id === clip.id) || clip;
    setSelectedClip(freshClip);
  };

  const handleVideoTimeUpdate = (data) => {
    setCurrentVideoTime(data?.currentTime || 0);
    
    // Update the selected clip's duration if we have it
    if (selectedClip && data?.duration && selectedClip.duration !== data.duration) {
      const updatedDuration = data.duration;
      
      setClips(prev => prev.map(clip => 
        clip.id === selectedClip.id 
          ? { ...clip, duration: updatedDuration }
          : clip
      ));
      
      // Update selectedClip reference to maintain consistency
      setSelectedClip(prev => prev ? { ...prev, duration: updatedDuration } : null);
    }
  };

  return (
    <div className="app">
      <div className="header">
        <h1>ClipForge</h1>
        <p className="subtitle">Desktop Video Editor MVP</p>
      </div>
      <div className="main-content">
        <div className="content-area">
          <ImportPanel 
            onImport={handleImport}
            isImporting={importStatus.loading}
          />
          
          {/* Video Player */}
          <VideoPlayer 
            videoSrc={selectedClip?.path ? `file://${selectedClip.path}` : null}
            onTimeUpdate={handleVideoTimeUpdate}
            selectedClip={selectedClip}
          />
          
          {/* Export Panel */}
          <ExportPanel currentClip={selectedClip} />
        </div>
        
        {/* Timeline - Always at bottom */}
        <Timeline 
          clips={clips}
          selectedClip={selectedClip}
          onSelectClip={handleClipSelect}
        />
      </div>
    </div>
  );
}

export default App;

