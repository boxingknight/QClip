import React, { useState, useEffect } from 'react';
import ImportPanel from './components/ImportPanel';
import VideoPlayer from './components/VideoPlayer';
import ExportPanel from './components/ExportPanel';
import Timeline from './components/Timeline';
import TrimControls from './components/TrimControls';
import './App.css';

function App() {
  const [clips, setClips] = useState([]);
  const [selectedClip, setSelectedClip] = useState(null);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  // Store trim data per clip
  const [clipTrims, setClipTrims] = useState({});
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

  // Initialize trim data for clip if it doesn't exist
  useEffect(() => {
    if (selectedClip && !clipTrims[selectedClip.id] && selectedClip.duration) {
      setClipTrims(prev => ({
        ...prev,
        [selectedClip.id]: {
          inPoint: 0,
          outPoint: selectedClip.duration
        }
      }));
    }
  }, [selectedClip?.id, clipTrims]);

  const handleImport = (newClips) => {
    console.log('Importing clips:', newClips);
    setImportStatus({ loading: true, error: null, lastImported: null });
    
    // Add to existing clips
    setClips(prev => [...prev, ...newClips]);
    
    // Initialize trim data for new clips (full clip by default)
    setClipTrims(prev => {
      const newTrims = { ...prev };
      newClips.forEach(clip => {
        if (clip.duration) {
          newTrims[clip.id] = {
            inPoint: 0,
            outPoint: clip.duration
          };
        }
      });
      return newTrims;
    });
    
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
  
  // Get current clip's trim data
  const getCurrentTrimData = () => {
    if (!selectedClip) return { inPoint: 0, outPoint: 0 };
    return clipTrims[selectedClip.id] || { 
      inPoint: 0, 
      outPoint: selectedClip.duration || 0 
    };
  };

  // Trim Control Handlers
  const handleSetInPoint = (time) => {
    if (!selectedClip) return;
    
    const trimTime = time !== undefined ? time : currentVideoTime;
    
    setClipTrims(prev => ({
      ...prev,
      [selectedClip.id]: {
        ...prev[selectedClip.id],
        inPoint: trimTime
      }
    }));
  };

  const handleSetOutPoint = (time) => {
    if (!selectedClip) return;
    
    const trimTime = time !== undefined ? time : currentVideoTime;
    
    setClipTrims(prev => ({
      ...prev,
      [selectedClip.id]: {
        ...prev[selectedClip.id],
        outPoint: trimTime
      }
    }));
  };

  const handleResetTrim = () => {
    if (!selectedClip) return;
    
    setClipTrims(prev => ({
      ...prev,
      [selectedClip.id]: {
        inPoint: 0,
        outPoint: selectedClip.duration || 0
      }
    }));
  };

  const handleVideoTimeUpdate = (data) => {
    // Only update time if it's changed significantly (avoid excessive re-renders)
    const newTime = data?.currentTime || 0;
    if (Math.abs(newTime - currentVideoTime) > 0.1) {
      setCurrentVideoTime(newTime);
    }
    
    // Update the selected clip's duration if we have it (only once)
    if (selectedClip && data?.duration && !selectedClip.duration) {
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
      {/* Header */}
      <div className="header">
        <h1>ClipForge - Desktop Video Editor</h1>
      </div>

      {/* Left Sidebar - Import */}
      <div className="sidebar">
        <ImportPanel 
          onImport={handleImport}
          isImporting={importStatus.loading}
        />
      </div>
      
      {/* Main Area - Video Player */}
      <div className="main-content">
        <VideoPlayer 
          videoSrc={selectedClip?.path ? `file://${selectedClip.path}` : null}
          onTimeUpdate={handleVideoTimeUpdate}
          selectedClip={selectedClip}
        />
      </div>
      
      {/* Right Sidebar - Trim Controls & Export */}
      <div className="controls-sidebar">
        <TrimControls
          currentTime={currentVideoTime}
          duration={selectedClip?.duration || 0}
          inPoint={getCurrentTrimData().inPoint}
          outPoint={getCurrentTrimData().outPoint}
          onSetInPoint={handleSetInPoint}
          onSetOutPoint={handleSetOutPoint}
          onResetTrim={handleResetTrim}
        />
        <ExportPanel 
          currentClip={selectedClip}
          allClips={clips}
          clipTrims={clipTrims}
        />
      </div>
      
      {/* Timeline - Bottom */}
      <Timeline 
        clips={clips}
        selectedClip={selectedClip}
        onSelectClip={handleClipSelect}
        clipTrims={clipTrims}
      />
    </div>
  );
}

export default App;

