import React, { useState } from 'react';
import './ErrorFallback.css';

/**
 * Error Fallback UI displayed when ErrorBoundary catches an error
 */
const ErrorFallback = ({ error, errorInfo, onReset }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="error-fallback">
      <div className="error-fallback-content">
        <div className="error-icon">⚠️</div>
        <h2>Something Went Wrong</h2>
        <p>ClipForge encountered an unexpected error.</p>
        
        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error.message || error.toString()}
          </div>
        )}

        <div className="error-actions">
          <button className="btn-primary" onClick={onReset}>
            Reload App
          </button>
          <button 
            className="btn-secondary" 
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </button>
        </div>

        {showDetails && errorInfo && (
          <div className="error-details">
            <h4>Technical Details:</h4>
            <pre>{errorInfo.componentStack || error.stack}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorFallback;

