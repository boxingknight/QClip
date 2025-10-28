import React, { useEffect } from 'react';
import { TimelineProvider, useTimeline } from './context/TimelineContext';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { UIProvider, useUI } from './context/UIContext';
import ImportPanel from './components/ImportPanel';
import VideoPlayer from './components/VideoPlayer';
import ExportPanel from './components/ExportPanel';
import Timeline from './components/timeline/Timeline'; // Updated to use new professional timeline
import ErrorBoundary from './components/ErrorBoundary';
// UI Components for PR#12
import Modal from './components/ui/Modal';
import { ToastContainer } from './components/ui/Toast';
import Toolbar, { ToolbarGroups } from './components/ui/Toolbar';
// Removed StatusBar import - now integrated into Timeline
import { logger } from './utils/logger';
import { validateInPoint, validateOutPoint } from './utils/trimValidation';
// Removed TrimControls - now integrated in Timeline
import './App.css';

// Main App component that uses contexts
function AppContent() {
  const { 
    clips, 
    selectedClipId, 
    playhead, 
    clipTrims, 
    isRendering, 
    renderProgress,
    addClips, 
    selectClip, 
    setPlayhead, 
    setInPoint, 
    setOutPoint, 
    resetTrim, 
    applyTrimSuccess, 
    setRendering,
    updateClipDuration,
    getSelectedClip,
    getCurrentTrimData
  } = useTimeline();
  
  const { setModified } = useProject();
  const { setImportStatus, importStatus, showModal, showToast } = useUI();

  // Test IPC communication on mount
  useEffect(() => {
    if (window.electronAPI) {
      const result = window.electronAPI.ping();
      console.log('IPC test:', result);
    }
  }, []);

  // Test UI components
  const handleToolbarAction = (action, data) => {
    console.log('Toolbar action:', action, data);
    
    switch (action) {
      case 'import':
        showToast({
          type: 'info',
          title: 'Import',
          message: 'Click the Import button in the sidebar to add video files',
          duration: 3000
        });
        break;
      case 'export':
        showModal('exportSettings', { clips: clips.length });
        break;
      case 'record':
        showToast({
          type: 'success',
          title: 'Recording',
          message: 'Recording feature coming in V2!',
          duration: 3000
        });
        break;
      default:
        showToast({
          type: 'info',
          title: 'Action',
          message: `${action} action triggered`,
          duration: 2000
        });
    }
  };

  const handleImport = (newClips) => {
    console.log('Importing clips:', newClips);
    setImportStatus({ loading: true, error: null, lastImported: null });
    
    // Add clips using context
    addClips(newClips);
    
    // Select the first imported clip if none selected
    if (!selectedClipId && newClips.length > 0) {
      selectClip(newClips[0].id);
    }
    
    // Mark project as modified
    setModified(true);
    
    // Update status
    setImportStatus({
      loading: false,
      error: null,
      lastImported: newClips.length
    });
  };

  const handleClipSelect = (clip) => {
    // Use context to select clip
    selectClip(clip.id);
  };
  
  // Trim Control Handlers
  const handleSetInPoint = (time) => {
    if (!selectedClipId) return;
    
    const trimTime = time !== undefined ? time : playhead;
    
    // No validation - just set the value (validation happens when applying)
    logger.debug('Setting in point', { clipId: selectedClipId, inPoint: trimTime });
    
    setInPoint(trimTime);
  };

  const handleSetOutPoint = (time) => {
    if (!selectedClipId) return;
    
    const trimTime = time !== undefined ? time : playhead;
    
    // No validation - just set the value (validation happens when applying)
    logger.debug('Setting out point', { clipId: selectedClipId, outPoint: trimTime });
    
    setOutPoint(trimTime);
  };

  const handleResetTrim = () => {
    if (!selectedClipId) return;
    
    resetTrim();
  };

  const handleApplyTrim = async () => {
    if (!selectedClipId) return;
    
    const selectedClip = getSelectedClip();
    const trimData = getCurrentTrimData();
    
    if (!trimData) {
      logger.warn('No trim data to apply');
      alert('Please set trim points before applying.');
      return;
    }
    
    // Validate trim data
    const validation = validateInPoint(trimData.inPoint, trimData.outPoint, selectedClip.duration || 0);
    if (!validation.valid) {
      logger.error('Invalid trim data when applying', { 
        trimData, 
        duration: selectedClip.duration,
        error: validation.error 
      });
      alert(validation.error);
      return;
    }
    
    logger.info('Applying trim', { 
      clipId: selectedClipId, 
      inPoint: trimData.inPoint, 
      outPoint: trimData.outPoint 
    });

    try {
      setRendering(true, 0);
      
      // Generate temp path (renderer-safe approach)
      const tempPath = await window.electronAPI.getTempTrimPath(selectedClipId);
      
      // Listen for progress updates
      const removeListener = window.electronAPI.onRenderProgress((progress) => {
        setRendering(true, progress.percent || 0);
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
        
        applyTrimSuccess(selectedClipId, result.outputPath, trimmedDuration, trimStartOffset);
        
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
      setRendering(false, 0);
    }
  };

  const handleVideoTimeUpdate = (data) => {
    // Only update time if it's changed significantly (avoid excessive re-renders)
    const newTime = data?.currentTime || 0;
    if (Math.abs(newTime - playhead) > 0.1) {
      setPlayhead(newTime);
    }
    
    // Update the selected clip's duration if we have it (only once)
    if (selectedClipId && data?.duration) {
      const selectedClip = getSelectedClip();
      if (selectedClip && !selectedClip.duration) {
        updateClipDuration(selectedClipId, data.duration);
      }
    }
  };

  return (
    <ErrorBoundary>
      <div className="app">
        {/* Toolbar */}
        <div className="toolbar">
          <Toolbar
            title="ClipForge"
            subtitle="Desktop Video Editor"
            groups={[
              ToolbarGroups.file,
              ToolbarGroups.recording,
              ToolbarGroups.timeline,
              ToolbarGroups.playback
            ]}
            onAction={handleToolbarAction}
          />
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
            videoSrc={getSelectedClip()?.path ? `file://${getSelectedClip().path}` : null}
            onTimeUpdate={handleVideoTimeUpdate}
            selectedClip={getSelectedClip()}
            trimData={getCurrentTrimData()}
          />
        </div>
        
        {/* Right Sidebar - Export Only */}
        <div className="controls-sidebar">
          <ExportPanel 
            currentClip={getSelectedClip()}
            allClips={clips}
            clipTrims={clipTrims}
          />
        </div>
        
        {/* Timeline - Bottom */}
        <Timeline />

        {/* UI Components */}
        <ToastContainer />
        
        {/* Test Modal */}
        <Modal
          modalName="exportSettings"
          title="Export Settings"
          size="medium"
        >
          <div style={{ padding: '20px' }}>
            <h3>Export Configuration</h3>
            <p>This is a test modal for the UI component library.</p>
            <p>Clips in project: {clips.length}</p>
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => showToast({ type: 'success', message: 'Export started!' })}
                style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px' }}
              >
                Start Export
              </button>
              <button 
                onClick={() => showToast({ type: 'error', message: 'Export cancelled' })}
                style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </ErrorBoundary>
  );
}

// Main App component with context providers
function App() {
  return (
    <TimelineProvider>
      <ProjectProvider>
        <UIProvider>
          <AppContent />
        </UIProvider>
      </ProjectProvider>
    </TimelineProvider>
  );
}

export default App;

