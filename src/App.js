import React, { useEffect } from 'react';
import { TimelineProvider, useTimeline } from './context/TimelineContext';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { UIProvider, useUI } from './context/UIContext';
import { PlaybackProvider } from './context/PlaybackContext';
import { LayoutProvider, useLayout } from './context/LayoutContext';
import { MediaLibraryProvider, useMediaLibrary } from './context/MediaLibraryContext';
import { RecordingProvider } from './context/RecordingContext';
import { ExportProvider } from './context/ExportContext';
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
import { RecordingControls, SourcePicker } from './components/recording';
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
    getCurrentTrimData,
    // Split and delete functions
    splitClip,
    removeClip,
    // Undo/redo functions
    undo,
    redo,
    canUndo,
    canRedo,
    // Selection functions
    selection,
    getSelectedClips
  } = useTimeline();
  
  const { 
    mediaItems, 
    selectedMediaId, 
    addMediaItems, 
    selectMedia, 
    getSelectedMedia 
  } = useMediaLibrary();
  
  const { setModified } = useProject();
  const { setImportStatus, importStatus, showModal, showToast, modals, hideModal } = useUI();
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

  // Toolbar action handlers
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
          type: 'info',
          title: 'Recording',
          message: 'Use the Recording Controls in the right sidebar',
          duration: 3000
        });
        break;
      case 'split':
        handleSplitAction();
        break;
      case 'delete':
        handleDeleteAction();
        break;
      case 'undo':
        handleUndoAction();
        break;
      case 'redo':
        handleRedoAction();
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

  // Split clip at playhead - works on ANY clip under playhead, not just selected ones
  const handleSplitAction = () => {
    // Find all clips that intersect with the playhead position (regardless of selection)
    const clipsUnderPlayhead = clips.filter(clip => {
      const clipStart = clip.startTime;
      const clipEnd = clip.startTime + clip.duration;
      return playhead > clipStart && playhead < clipEnd;
    });

    if (clipsUnderPlayhead.length === 0) {
      showToast({
        type: 'warning',
        title: 'Cannot Split',
        message: 'Playhead must be positioned over a clip',
        duration: 2000
      });
      return;
    }

    // Split all clips under the playhead
    let splitCount = 0;
    clipsUnderPlayhead.forEach(clip => {
      splitClip(clip.id, playhead);
      splitCount++;
    });

    showToast({
      type: 'success',
      title: 'Split Complete',
      message: `Split ${splitCount} clip(s) at playhead`,
      duration: 2000
    });
  };

  // Delete selected clips
  const handleDeleteAction = () => {
    const selectedClips = getSelectedClips();
    
    if (selectedClips.length === 0) {
      showToast({
        type: 'warning',
        title: 'No Selection',
        message: 'Please select a clip to delete',
        duration: 2000
      });
      return;
    }

    // Delete all selected clips
    selectedClips.forEach(clip => {
      removeClip(clip.id);
    });

    showToast({
      type: 'success',
      title: 'Deleted',
      message: `Deleted ${selectedClips.length} clip(s)`,
      duration: 2000
    });
  };

  // Undo last action - works regardless of selection
  const handleUndoAction = () => {
    if (canUndo()) {
      undo();
      showToast({
        type: 'info',
        title: 'Undone',
        message: 'Last action undone',
        duration: 1500
      });
    } else {
      showToast({
        type: 'info',
        title: 'Nothing to Undo',
        message: 'No actions to undo',
        duration: 1500
      });
    }
  };

  // Redo last action - works regardless of selection
  const handleRedoAction = () => {
    if (canRedo()) {
      redo();
      showToast({
        type: 'info',
        title: 'Redone',
        message: 'Last action redone',
        duration: 1500
      });
    } else {
      showToast({
        type: 'info',
        title: 'Nothing to Redo',
        message: 'No actions to redo',
        duration: 1500
      });
    }
  };

  const handleImport = (newClips) => {
    console.log('Importing clips:', newClips);
    setImportStatus({ loading: true, error: null, lastImported: null });
    
    // Add clips to Media Library (not Timeline)
    addMediaItems(newClips);
    
    // Select the first imported clip in Media Library for preview
    if (newClips.length > 0) {
      console.log('🎬 [APP] Auto-selecting first clip in Media Library:', newClips[0].name);
      selectMedia(newClips[0].id);
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
    // VideoPlayer now sends absolute timeline time (correct)
    // Just update playhead directly - no coordinate conversion needed
    const timelineTime = data?.currentTime || 0;
    
    // Only update if changed significantly (avoid excessive re-renders)
    // Use absolute timeline time directly - this is what the timeline uses
    if (Math.abs(timelineTime - playhead) > 0.05) {
      console.log('[App] handleVideoTimeUpdate - updating playhead:', {
        timelineTime,
        currentPlayhead: playhead,
        delta: Math.abs(timelineTime - playhead)
      });
      setPlayhead(timelineTime);
    }
    
    // 🎯 CRITICAL FIX: Update clip duration when video metadata loads (especially for WebM)
    // This fixes cases where FFprobe returned 0 duration but video element has correct duration
    if (selectedClipId && data?.duration && data?.updateClipDuration) {
      const selectedClip = getSelectedClip();
      if (selectedClip && (selectedClip.duration === 0 || Math.abs(selectedClip.duration - data.duration) > 1)) {
        console.log('[App] Updating clip duration from video element:', {
          clipId: selectedClipId,
          oldDuration: selectedClip.duration,
          newDuration: data.duration
        });
        updateClipDuration(selectedClipId, data.duration);
        // Also update trimOut to match new duration
        setOutPoint(data.duration);
      }
    } else if (selectedClipId && data?.duration) {
      // Also update if clip has no duration (original check)
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
              // Timeline group with dynamic disabled states
              {
                items: ToolbarGroups.timeline.items.map(item => {
                  if (item.action === 'split') {
                    // Disable split if playhead is not over ANY clip (works on all clips, not just selected)
                    const canSplit = clips.some(clip => {
                      const clipStart = clip.startTime;
                      const clipEnd = clip.startTime + clip.duration;
                      return playhead > clipStart && playhead < clipEnd;
                    });
                    return { ...item, disabled: !canSplit };
                  }
                  if (item.action === 'delete') {
                    // Disable delete if no selection
                    return { ...item, disabled: selection.clips.length === 0 };
                  }
                  if (item.action === 'undo') {
                    // Disable undo if nothing to undo (works regardless of selection)
                    return { ...item, disabled: !canUndo() };
                  }
                  if (item.action === 'redo') {
                    // Disable redo if nothing to redo (works regardless of selection)
                    return { ...item, disabled: !canRedo() };
                  }
                  return item;
                })
              },
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
            // 🎯 TIMELINE PLAYBACK MANAGER
            // Calculate which clip should be playing based on playhead position
            
            const selectedMedia = getSelectedMedia();
            const selectedClip = getSelectedClip();
            
            // Find the clip that the playhead is currently over
            const currentTimelineClip = clips
              .filter(clip => clip.trackId === 'video-1') // Only video track for now
              .sort((a, b) => a.startTime - b.startTime) // Sort by start time
              .find(clip => {
                const clipEnd = clip.startTime + clip.duration;
                return playhead >= clip.startTime && playhead < clipEnd;
              });
            
            // Priority: 
            // 1. Timeline clip at playhead position (for continuous playback)
            // 2. Selected timeline clip (for editing/preview)
            // 3. Media Library clip (for preview before adding to timeline)
            const activeClip = currentTimelineClip || selectedClip || selectedMedia;
            const videoSrc = activeClip?.path ? `file://${activeClip.path}` : null;
            
            // Calculate relative time within the active clip
            // This ensures the video player shows the correct portion of the clip
            const relativeClipTime = activeClip ? Math.max(0, playhead - activeClip.startTime) : 0;
            
            console.log('🎬 [APP] VideoPlayer props:', { 
              playhead,
              selectedMedia, 
              selectedClip,
              currentTimelineClip: currentTimelineClip?.name,
              activeClip: activeClip?.name,
              videoSrc, 
              relativeClipTime,
              clipStartTime: activeClip?.startTime,
              selectedMediaId,
              selectedClipId 
            });
            
            return (
              <VideoPlayer 
                videoSrc={videoSrc}
                onTimeUpdate={handleVideoTimeUpdate}
                selectedClip={activeClip}
                trimData={getCurrentTrimData()}
                allClips={clips}
                playhead={playhead}
                onClipEnd={(nextClipStartTime) => {
                  // When a clip ends, advance playhead to next clip's start
                  console.log('🎬 [APP] Advancing playhead to next clip at:', nextClipStartTime);
                  setPlayhead(nextClipStartTime);
                }}
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
        
        {/* Right Sidebar - Export and Recording */}
        <div className="controls-sidebar">
          <RecordingControls />
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
        
        {/* Export Settings Modal */}
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
        
        {/* Source Picker Modal */}
        <Modal
          modalName="source-picker"
          title="Select Recording Source"
          size="large"
        >
          {(() => {
            const modalData = modals['source-picker']?.data;
            if (!modalData) return null;
            
            return (
              <SourcePicker
                sources={modalData.sources || []}
                onSelect={(source) => {
                  if (modalData.onSelect) {
                    modalData.onSelect(source);
                  }
                  hideModal('source-picker');
                }}
                onCancel={() => {
                  if (modalData.onCancel) {
                    modalData.onCancel();
                  }
                  hideModal('source-picker');
                }}
              />
            );
          })()}
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
            <ExportProvider>
              <PlaybackProvider>
                <MediaLibraryProvider>
                  <RecordingProvider>
                    <AppContent />
                  </RecordingProvider>
                </MediaLibraryProvider>
              </PlaybackProvider>
            </ExportProvider>
          </UIProvider>
        </ProjectProvider>
      </TimelineProvider>
    </LayoutProvider>
  );
}

export default App;

