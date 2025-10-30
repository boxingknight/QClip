// DeviceSelector.js - Webcam device selection component
// PR#18: Webcam Recording

import React, { useState, useEffect } from 'react';
import { getWebcamDevices } from '../../utils/webcamUtils';
import './DeviceSelector.css';

const DeviceSelector = ({ selectedDeviceId, onDeviceSelect, disabled = false }) => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      setLoading(true);
      setError(null);
      const webcamDevices = await getWebcamDevices();
      setDevices(webcamDevices);
      
      // Auto-select first device if none selected
      if (!selectedDeviceId && webcamDevices.length > 0) {
        onDeviceSelect?.(webcamDevices[0].id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load webcam devices');
      console.error('Device loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceChange = (e) => {
    const deviceId = e.target.value;
    onDeviceSelect?.(deviceId);
  };

  if (loading) {
    return (
      <div className="device-selector-loading">
        <div className="loading-spinner"></div>
        <span>Loading cameras...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="device-selector-error">
        <div className="error-icon">📷</div>
        <div className="error-message">{error}</div>
        <button onClick={loadDevices} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="device-selector-empty">
        <div className="empty-icon">📷</div>
        <div className="empty-message">No cameras found</div>
        <div className="empty-hint">Please connect a camera and try again</div>
        <button onClick={loadDevices} className="retry-button">
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="device-selector">
      <label htmlFor="webcam-select">Select Camera:</label>
      <select
        id="webcam-select"
        value={selectedDeviceId || ''}
        onChange={handleDeviceChange}
        disabled={disabled}
        className="device-select"
      >
        {devices.map(device => (
          <option key={device.id} value={device.id}>
            {device.label}
          </option>
        ))}
      </select>
      {devices.length > 1 && (
        <button
          onClick={loadDevices}
          className="refresh-button"
          disabled={disabled}
          title="Refresh device list"
        >
          🔄
        </button>
      )}
    </div>
  );
};

export default DeviceSelector;

