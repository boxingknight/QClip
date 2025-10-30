import React, { useState, useEffect } from 'react';
import { useTimeline } from '../context/TimelineContext';
import { useExportSettings } from '../context/ExportContext';
import { useUI } from '../context/UIContext';
import { logger } from '../utils/logger';
import '../styles/ExportPanel.css';

const ExportPanel = () => {
  const { clips, getSelectedClips, clipTrims } = useTimeline();
  const { settings } = useExportSettings();
  const { showModal } = useUI();
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);
  
  const selectedClips = getSelectedClips();
  const currentClip = selectedClips.length > 0 ? selectedClips[0] : null;
  const allClips = clips;

  useEffect(() => {
    // Subscribe to progress updates
    const unsubscribe = window.electronAPI?.onExportProgress((progressData) => {
      if (progressData.percent !== undefined) {
        setProgress(Math.round(progressData.percent));
        setStatus(`Exporting... ${Math.round(progressData.percent)}%`);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleExport = async () => {
    if (!allClips || allClips.length === 0) {
      logger.warn('Export attempted but no clips available');
      setError('No clips to export');
      return;
    }

    try {
      logger.info('Starting export', { clipCount: allClips.length });
      setIsExporting(true);
      setError(null);
      setProgress(0);
      setStatus('Preparing export...');

      // Show save dialog
      const dialogResult = await window.electronAPI.showSaveDialog();
      
      if (dialogResult.canceled) {
        logger.info('Export canceled by user');
        setIsExporting(false);
        setStatus('');
        return;
      }

      logger.info('Export location selected', { outputPath: dialogResult.filePath });
      setStatus(`Exporting ${allClips.length} clips...`);
      
      // 🎯 CRITICAL: Use the correct trim data source
      // The clipTrims object contains the actual trim data from the timeline
      // Each clip has { inPoint, outPoint } in clipTrims[clipId]
      const clipTrimsForExport = {};
      allClips.forEach(clip => {
        const trimData = clipTrims[clip.id];
        if (trimData) {
          // Use the actual trim data from the timeline
          clipTrimsForExport[clip.id] = {
            inPoint: trimData.inPoint || 0,
            outPoint: trimData.outPoint || clip.duration
          };
        } else {
          // Fallback to clip's own trim properties if no timeline trim data
          clipTrimsForExport[clip.id] = {
            inPoint: clip.trimIn || 0,
            outPoint: clip.trimOut || clip.duration
          };
        }
      });

      logger.info('Export trim data', { 
        clipCount: allClips.length,
        trims: clipTrimsForExport,
        originalClipTrims: clipTrims,
        clips: allClips.map(clip => ({
          id: clip.id,
          name: clip.name,
          duration: clip.duration,
          trimIn: clip.trimIn,
          trimOut: clip.trimOut,
          timelineTrimData: clipTrims[clip.id]
        }))
      });
      
      // Export entire timeline with all trimmed clips
      // Pass all clips and their trim data for concatenation
      const result = await window.electronAPI.exportTimeline(
        allClips,
        clipTrimsForExport,
        dialogResult.filePath,
        settings
      );

      if (result.success) {
        logger.info('Export successful', { outputPath: result.outputPath });
        setStatus(`✅ Exported to ${result.outputPath}`);
        setProgress(100);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      logger.error('Export failed', err, { 
        clipCount: allClips.length,
        force: true 
      });
      setError(err.message || 'Export failed. Please try again.');
      setStatus('Export failed');
      setProgress(0);
    } finally {
      setIsExporting(false);
    }
  };

  const handleOpenSettings = () => {
    showModal('exportSettings');
  };

  return (
    <div className="export-panel">
      <div className="export-header">
        <h3>Export</h3>
        <button 
          className="settings-button"
          onClick={handleOpenSettings}
          title="Export Settings"
          aria-label="Open export settings"
        >
          ⚙️
        </button>
      </div>
      
      {currentClip && (
        <div className="export-settings-summary">
          <div className="setting-item">
            <span>Format:</span>
            <span>{settings.format.toUpperCase()}</span>
          </div>
          <div className="setting-item">
            <span>Resolution:</span>
            <span>{settings.resolution}</span>
          </div>
          <div className="setting-item">
            <span>Frame Rate:</span>
            <span>{settings.framerate === 'custom' ? `${settings.customFramerate} fps` : 'Source'}</span>
          </div>
          <div className="setting-item">
            <span>Quality:</span>
            <span>{settings.quality}</span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="export-error">
          ⚠️ {error}
        </div>
      )}
      
      {status && !error && (
        <div className="export-status">
          {status}
        </div>
      )}
      
      {progress > 0 && progress < 100 && (
        <div className="export-progress">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          <div className="progress-text">{progress}%</div>
        </div>
      )}
      
      <button 
        className="export-button"
        onClick={handleExport}
        disabled={!currentClip || isExporting || allClips.length === 0}
      >
        {isExporting ? 'Exporting...' : 'Export Video'}
      </button>
      
      {!currentClip && (
        <p className="export-hint">Import a video to export</p>
      )}
    </div>
  );
};

export default ExportPanel;

