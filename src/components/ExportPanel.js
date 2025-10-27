import React, { useState, useEffect } from 'react';
import '../styles/ExportPanel.css';

const ExportPanel = ({ currentClip, trimData }) => {
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
    if (!currentClip) {
      setError('No clip selected');
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

      setStatus('Exporting video...');
      
      // Call export API with trim data
      const result = await window.electronAPI.exportVideo(
        currentClip.path,
        dialogResult.filePath,
        trimData // Pass trim data if available
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

