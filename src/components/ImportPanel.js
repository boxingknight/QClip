import React, { useState, useRef } from 'react';
import { validateFile, generateClipId } from '../utils/fileHelpers';
import { extractVideoMetadata } from '../utils/videoMetadata';
import { logger } from '../utils/logger';
import MediaLibrary from './MediaLibrary';
import './ImportPanel.css';

const ImportPanel = ({ onImport, isImporting }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Disable drag-over visual for now since it doesn't work in Electron contextIsolation
    // setIsDragOver(true);
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
    
    // Drag-and-drop file paths are not available with contextIsolation enabled
    // For MVP, use the "Browse Files" button instead
    setError('Please use the "Browse Files" button to import videos. Drag-and-drop coming soon!');
    
    // const files = Array.from(e.dataTransfer.files);
    // await processFiles(files);
  };

  // File picker handler using Electron dialog
  const handleFilePicker = async () => {
    if (!window.electronAPI) {
      logger.error('Electron API not available');
      setError('Electron API not available');
      return;
    }
    
    try {
      logger.info('Opening file dialog');
      
      // Use Electron's file dialog
      const filePaths = await window.electronAPI.openFileDialog();
      
      if (filePaths && filePaths.length > 0) {
        logger.info('Files selected', { count: filePaths.length });
        
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
      } else {
        logger.info('File selection canceled by user');
      }
    } catch (error) {
      logger.error('Error opening file dialog', error, { force: true });
      setError('Failed to open file dialog. Please try again.');
    }
  };

  // Process imported files
  const processFiles = async (files) => {
    if (files.length === 0) return;
    
    logger.info('Processing imported files', { count: files.length });
    
    const validClips = [];
    setError(null);
    
    for (const file of files) {
      try {
        // Validate file extension
        const ext = file.name.split('.').pop().toLowerCase();
        if (ext !== 'mp4' && ext !== 'mov') {
          logger.warn('Unsupported file extension', { fileName: file.name, extension: ext });
          setError(`${file.name} is not a supported format (MP4 or MOV only)`);
          continue;
        }
        
        // Get absolute path
        let filePath = file.path;
        
        logger.debug('Processing file', { 
          name: file.name, 
          path: file.path, 
          size: file.size, 
          type: file.type 
        });
        
        // Validate that we have a path
        if (!filePath) {
          logger.error('No path for file', null, { fileName: file.name });
          setError(`Failed to get path for ${file.name}`);
          continue;
        }
        
        // Extract video metadata
        const metadata = await extractVideoMetadata(filePath);
        
        const clip = {
          id: generateClipId(),
          name: file.name,
          path: filePath,
          duration: metadata.duration,
          width: metadata.width,
          height: metadata.height,
          fps: metadata.fps,
          codec: metadata.codec,
          hasAudio: metadata.hasAudio,
          fileSize: metadata.fileSize || file.size || 0,
          thumbnailUrl: metadata.thumbnailUrl,
          inPoint: 0,
          outPoint: metadata.duration,
          metadataError: metadata.error
        };
        
        validClips.push(clip);
        logger.debug('Clip created', { clipId: clip.id, name: clip.name });
      } catch (error) {
        logger.error('Error processing file', error, { fileName: file.name });
        setError(`Error processing ${file.name}: ${error.message}`);
        continue;
      }
    }
    
    if (validClips.length > 0) {
      logger.info('Import successful', { 
        importedCount: validClips.length, 
        totalFiles: files.length 
      });
      onImport(validClips);
      setError(null);
    } else {
      logger.warn('No valid clips imported', { totalFiles: files.length });
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
          <h3>Import Video Files</h3>
          <p className="or-text"></p>
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
      
      {/* Media Library - shows imported videos */}
      <MediaLibrary />
    </div>
  );
};

export default ImportPanel;

