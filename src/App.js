import React, { useEffect } from 'react';
import { TimelineProvider, useTimeline } from './context/TimelineContext';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { UIProvider, useUI } from './context/UIContext';
import { PlaybackProvider } from './context/PlaybackContext';
import { LayoutProvider, useLayout } from './context/LayoutContext';
import ImportPanel from './components/ImportPanel';
import VideoPlayer from './components/VideoPlayer';
import ExportPanel from './components/ExportPanel';
import Timeline from './components/timeline/Timeline'; // Updated to use new professional timeline
import ErrorBoundary from './components/ErrorBoundary';
// UI Components for PR#12
import Modal from './components/ui/Modal';
import { ToastContainer } from './components/ui/Toast';
import Toolbar, { ToolbarGroups } from './components/ui/Toolbar';
import LayoutToolbar from './components/ui/LayoutToolbar';
import ResizeHandle from './components/ui/ResizeHandle';
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
  const { 
    sidebar, 
    main, 
    controls, 
    timeline, 
    startResize, 
    updateResize, 
    endResize 
  } = useLayout();

  // Test IPC communication on mount
  useEffect(() => {
    if (window.electronAPI) {
      const result = window.electronAPI.ping();
      console.log('IPC test:', result);
    }
  }, []);

  // Update CSS custom properties when layout changes
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--sidebar-width', `${sidebar}%`);
    root.style.setProperty('--controls-width', `${controls}%`);
    root.style.setProperty('--timeline-height', `${timeline}%`);
  }, [sidebar, controls, timeline]);

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
    
    // Always select the first imported clip for immediate playback
    if (newClips.length > 0) {
      console.log('Auto-selecting first clip:', newClips[0].name);
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
    const timelineTime = data?.currentTime || 0;
    
    // 🎯 CRITICAL FIX: Convert timeline time back to relative timeline position
    // VideoPlayer sends timeline time (includes trimIn offset), but timeline should show relative position
    const selectedClip = getSelectedClip();
    const trimIn = selectedClip?.trimIn || 0;
    const relativeTime = Math.max(0, timelineTime - trimIn);
    
    console.log('[App] handleVideoTimeUpdate:', {
      timelineTime,
      trimIn,
      relativeTime,
      currentPlayhead: playhead,
      selectedClipName: selectedClip?.name
    });
    
    if (Math.abs(relativeTime - playhead) > 0.1) {
      setPlayhead(relativeTime);
    }
    
    // Update the selected clip's duration if we have it (only once)
    if (selectedClipId && data?.duration) {
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

        {/* Layout Toolbar */}
        <LayoutToolbar />

        {/* Left Sidebar - Import */}
        <div className="sidebar">
          <ImportPanel 
            onImport={handleImport}
            isImporting={importStatus.loading}
          />
        </div>
        
        {/* Resize Handle - Sidebar/Main */}
        <ResizeHandle
          direction="horizontal"
          onResizeStart={(direction, start) => startResize(direction, start)}
          onResizeMove={(current) => updateResize(current)}
          onResizeEnd={() => endResize()}
          className="resize-handle--sidebar-main"
        />
        
        {/* Main Area - Video Player */}
        <div className="main-content">
          {(() => {
            const selectedClip = getSelectedClip();
            const videoSrc = selectedClip?.path ? `file://${selectedClip.path}` : null;
            console.log('VideoPlayer props:', { selectedClip, videoSrc, selectedClipId });
            return (
              <VideoPlayer 
                videoSrc={videoSrc}
                onTimeUpdate={handleVideoTimeUpdate}
                selectedClip={selectedClip}
                trimData={getCurrentTrimData()}
              />
            );
          })()}
        </div>
        
        {/* Resize Handle - Main/Controls */}
        <ResizeHandle
          direction="horizontal"
          onResizeStart={(direction, start) => startResize(direction, start)}
          onResizeMove={(current) => updateResize(current)}
          onResizeEnd={() => endResize()}
          className="resize-handle--main-controls"
        />
        
        {/* Right Sidebar - Export Only */}
        <div className="controls-sidebar">
          <ExportPanel 
            currentClip={getSelectedClip()}
            allClips={clips}
            clipTrims={clipTrims}
          />
        </div>
        
        {/* Resize Handle - Timeline */}
        <ResizeHandle
          direction="vertical"
          onResizeStart={(direction, start) => startResize(direction, start)}
          onResizeMove={(current) => updateResize(current)}
          onResizeEnd={() => endResize()}
          className="resize-handle--timeline"
        />
        
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
    <LayoutProvider>
      <TimelineProvider>
        <ProjectProvider>
          <UIProvider>
            <PlaybackProvider>
              <AppContent />
            </PlaybackProvider>
          </UIProvider>
        </ProjectProvider>
      </TimelineProvider>
    </LayoutProvider>
  );
}

export default App;

