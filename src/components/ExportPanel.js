import React, { useState, useEffect } from 'react';
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
      setError('No clips to export');
      return;
    }

    try {
      setIsExporting(true);
      setError(null);
      setProgress(0);
      setStatus('Preparing export...');

      // Show save dialog
      const dialogResult = await window.electronAPI.showSaveDialog();
      
      if (dialogResult.canceled) {
        setIsExporting(false);
        setStatus('');
        return;
      }

      setStatus(`Exporting ${allClips.length} clips...`);
      
      // Export all clips with their trim settings
      // For MVP, we'll export just the selected/current clip with trim
      // Future enhancement: concat all trimmed clips into one video
      const clipToExport = currentClip || allClips[0];
      const trimData = clipTrims[clipToExport.id] || { inPoint: 0, outPoint: clipToExport.duration };
      
      const result = await window.electronAPI.exportVideo(
        clipToExport.path,
        dialogResult.filePath,
        trimData
      );

      if (result.success) {
        setStatus(`✅ Exported to ${result.outputPath}`);
        setProgress(100);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Export error:', err);
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

