import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import '../styles/ExportPanel.css';

const ExportPanel = ({ currentClip, allClips, clipTrims }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);

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
      
      // 🎯 CRITICAL: Convert new timeline clip format to export format
      // New format: clips have trimIn/trimOut directly on the object
      // Export expects: clipTrims as { clipId: { inPoint, outPoint } }
      const clipTrimsForExport = {};
      allClips.forEach(clip => {
        clipTrimsForExport[clip.id] = {
          inPoint: clip.trimIn || 0,
          outPoint: clip.trimOut || clip.duration
        };
      });

      logger.info('Export trim data', { 
        clipCount: allClips.length,
        trims: clipTrimsForExport 
      });
      
      // Export entire timeline with all trimmed clips
      // Pass all clips and their trim data for concatenation
      const result = await window.electronAPI.exportTimeline(
        allClips,
        clipTrimsForExport,
        dialogResult.filePath
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

  return (
    <div className="export-panel">
      <h3>Export</h3>
      
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
        disabled={!currentClip || isExporting}
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

