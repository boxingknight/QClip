import React, { useState, useRef } from 'react';
import { validateFile, generateClipId } from '../utils/fileHelpers';
import './ImportPanel.css';

const ImportPanel = ({ onImport, isImporting }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  };

  // File picker handler using Electron dialog
  const handleFilePicker = async () => {
    if (!window.electronAPI) {
      setError('Electron API not available');
      return;
    }
    
    try {
      // Use Electron's file dialog
      const filePaths = await window.electronAPI.openFileDialog();
      
      if (filePaths && filePaths.length > 0) {
        // Convert file paths to file-like objects
        const files = filePaths.map(filePath => {
          const fileName = filePath.split('/').pop() || filePath;
          return {
            name: fileName,
            path: filePath,
            size: 0, // We'll get this later if needed
            type: ''
          };
        });
        
        await processFiles(files);
      }
    } catch (error) {
      console.error('Error opening file dialog:', error);
      setError('Failed to open file dialog');
    }
  };

  // Process imported files
  const processFiles = async (files) => {
    if (files.length === 0) return;
    
    const validClips = [];
    setError(null);
    
    for (const file of files) {
      // Validate file extension
      const ext = file.name.split('.').pop().toLowerCase();
      if (ext !== 'mp4' && ext !== 'mov') {
        setError(`${file.name} is not a supported format (MP4 or MOV only)`);
        continue;
      }
      
      // Get absolute path
      let filePath = file.path;
      
      console.log('File object:', {
        name: file.name,
        path: file.path,
        size: file.size,
        type: file.type
      });
      
      // Validate that we have a path
      if (!filePath) {
        console.error('No path for file:', file.name);
        setError(`Failed to get path for ${file.name}`);
        continue;
      }
      
      const clip = {
        id: generateClipId(),
        name: file.name,
        path: filePath,
        duration: 0, // Will be extracted during playback
        inPoint: 0,
        outPoint: 0,
        fileSize: file.size
      };
      
      validClips.push(clip);
    }
    
    if (validClips.length > 0) {
      onImport(validClips);
      setError(null);
    }
  };


  return (
    <div className="import-panel">
      <div
        className={`drop-zone ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="drop-zone-content">
          <svg className="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="#666" stroke="#666" strokeWidth="1.5"/>
            <path d="M14 2V8H20" fill="none" stroke="#666" strokeWidth="1.5"/>
            <path d="M8 13V11H16V13H8Z" fill="#666"/>
            <path d="M8 17V15H16V17H8Z" fill="#666"/>
          </svg>
          <h3>Drag video files here</h3>
          <p className="or-text">or</p>
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept="video/*,.mp4,.mov"
            onChange={() => {}} // Ignore standard file input
            style={{ display: 'none' }}
          />
          <button className="browse-button" onClick={handleFilePicker}>
            Browse Files
          </button>
        </div>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {isImporting && (
        <div className="loading">
          Importing files...
        </div>
      )}
    </div>
  );
};

export default ImportPanel;

