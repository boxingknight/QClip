// src/components/export/ExportSettingsModal.js
import React, { useState, useEffect } from 'react';
import { useExportSettings } from '../../context/ExportContext';
import { useUI } from '../../context/UIContext';
import { validateExportSettings, exportPresets } from '../../utils/exportSettings';
import BasicSettings from './BasicSettings';
import AdvancedSettings from './AdvancedSettings';
import PresetSelector from './PresetSelector';
import FileSizeEstimator from './FileSizeEstimator';
import Modal from '../ui/Modal';
import './ExportSettingsModal.css';

const ExportSettingsModal = () => {
  const { settings, updateSettings, loadPreset } = useExportSettings();
  const { modals, hideModal } = useUI();
  const [localSettings, setLocalSettings] = useState(settings);
  const [showAdvanced, setShowAdvanced] = useState(settings.showAdvanced || false);
  const [validation, setValidation] = useState({ valid: true, errors: [] });
  
  const isOpen = modals['exportSettings']?.isOpen || false;
  
  // Update local settings when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
      setShowAdvanced(settings.showAdvanced || false);
    }
  }, [isOpen, settings]);
  
  // Validate settings when they change
  useEffect(() => {
    const result = validateExportSettings(localSettings);
    setValidation(result);
  }, [localSettings]);
  
  const handleSave = () => {
    if (validation.valid) {
      updateSettings({ ...localSettings, showAdvanced });
      hideModal('exportSettings');
    }
  };
  
  const handleCancel = () => {
    setLocalSettings(settings);
    setShowAdvanced(settings.showAdvanced || false);
    hideModal('exportSettings');
  };
  
  return (
    <Modal
      modalName="exportSettings"
      title="Export Settings"
      size="large"
      onClose={handleCancel}
    >
      <div className="export-settings-modal-content">
        <PresetSelector 
          settings={localSettings}
          onSelect={(preset) => {
            setLocalSettings(prev => ({ ...prev, ...preset }));
          }}
        />
        
        <BasicSettings 
          settings={localSettings}
          onChange={setLocalSettings}
        />
        
        <div className="advanced-toggle">
          <button 
            className="toggle-button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            aria-expanded={showAdvanced}
          >
            <span className="toggle-icon">{showAdvanced ? '▼' : '▶'}</span>
            Advanced Settings
          </button>
        </div>
        
        {showAdvanced && (
          <AdvancedSettings 
            settings={localSettings}
            onChange={setLocalSettings}
            isVisible={showAdvanced}
          />
        )}
        
        <FileSizeEstimator settings={localSettings} />
        
        {!validation.valid && (
          <div className="validation-errors">
            <h4>Please fix the following errors:</h4>
            <ul>
              {validation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="modal-actions">
          <button 
            className="btn-secondary" 
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button 
            className="btn-primary" 
            onClick={handleSave}
            disabled={!validation.valid}
          >
            Apply Settings
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ExportSettingsModal;
