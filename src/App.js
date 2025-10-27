import React, { useState, useEffect } from 'react';
import ImportPanel from './components/ImportPanel';
import VideoPlayer from './components/VideoPlayer';
import ExportPanel from './components/ExportPanel';
import Timeline from './components/Timeline';
// Removed TrimControls - now integrated in Timeline
import './App.css';

function App() {
  const [clips, setClips] = useState([]);
  const [selectedClip, setSelectedClip] = useState(null);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  // Store trim data per clip
  const [clipTrims, setClipTrims] = useState({});
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
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
  }, [selectedClip?.id, selectedClip?.duration, clipTrims]);

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

  const handleApplyTrim = async () => {
    if (!selectedClip) return;
    
    const trimData = clipTrims[selectedClip.id];
    if (!trimData || trimData.inPoint >= trimData.outPoint) {
      alert('Invalid trim settings. Please set valid IN and OUT points.');
      return;
    }

    try {
      setIsRendering(true);
      setRenderProgress(0);
      
      // Generate temp path (renderer-safe approach)
      const tempPath = await window.electronAPI.getTempTrimPath(selectedClip.id);
      
      // Listen for progress updates
      const removeListener = window.electronAPI.onRenderProgress((progress) => {
        setRenderProgress(progress.percent || 0);
      });
      
      // Render trimmed clip
      const result = await window.electronAPI.renderTrimmedClip(
        selectedClip.path,
        tempPath,
        trimData
      );
      
      removeListener(); // Clean up listener
      
      if (result.success) {
        // Update clip state to use trimmed file
        const trimmedDuration = trimData.outPoint - trimData.inPoint;
        const trimStartOffset = trimData.inPoint;
        
        setClips(prev => prev.map(c =>
          c.id === selectedClip.id
            ? {
                ...c,
                trimmedPath: result.outputPath,
                isTrimmed: true,
                duration: trimmedDuration,
                trimStartOffset: trimStartOffset
              }
            : c
        ));
        
        // Update selected clip
        setSelectedClip(prev => ({
          ...prev,
          trimmedPath: result.outputPath,
          isTrimmed: true,
          duration: trimmedDuration,
          trimStartOffset: trimStartOffset
        }));
        
        // Clear trim marks (now applied)
        setClipTrims(prev => {
          const next = { ...prev };
          delete next[selectedClip.id];
          return next;
        });
        
        console.log('Trim applied - clip updated:', {
          trimmedPath: result.outputPath,
          duration: trimmedDuration,
          trimStartOffset: trimStartOffset
        });
      } else {
        alert(`Trim failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Apply trim error:', error);
      alert('Failed to apply trim. Please try again.');
    } finally {
      setIsRendering(false);
      setRenderProgress(0);
    }
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
          trimData={getCurrentTrimData()}
        />
      </div>
      
      {/* Right Sidebar - Export Only */}
      <div className="controls-sidebar">
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
        onSetInPoint={handleSetInPoint}
        onSetOutPoint={handleSetOutPoint}
        onApplyTrim={handleApplyTrim}
        onResetTrim={handleResetTrim}
        isRendering={isRendering}
        renderProgress={renderProgress}
      />
    </div>
  );
}

export default App;

