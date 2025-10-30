// src/context/ExportContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { 
  getDefaultSettings, 
  loadSettingsFromStorage, 
  saveSettingsToStorage,
  exportPresets 
} from '../utils/exportSettings';

const ExportContext = createContext();

const exportSettingsReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_SETTINGS':
      const updatedSettings = { ...state, ...action.payload, lastUsed: Date.now() };
      saveSettingsToStorage(updatedSettings);
      return updatedSettings;

    case 'LOAD_PRESET':
      const presetSettings = { ...state, ...action.preset, lastUsed: Date.now() };
      saveSettingsToStorage(presetSettings);
      return presetSettings;

    case 'RESET_TO_DEFAULTS':
      const defaultSettings = getDefaultSettings();
      saveSettingsToStorage(defaultSettings);
      return defaultSettings;

    case 'LOAD_FROM_STORAGE':
      return action.settings;

    case 'TOGGLE_ADVANCED':
      return {
        ...state,
        showAdvanced: !state.showAdvanced
      };

    default:
      return state;
  }
};

export const ExportProvider = ({ children }) => {
  // Initialize with stored settings or defaults
  const initialSettings = loadSettingsFromStorage() || getDefaultSettings();
  
  const [settings, dispatch] = useReducer(exportSettingsReducer, initialSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const storedSettings = loadSettingsFromStorage();
    if (storedSettings) {
      dispatch({ type: 'LOAD_FROM_STORAGE', settings: storedSettings });
    }
  }, []);

  const updateSettings = (newSettings) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
  };

  const loadPreset = (presetName) => {
    const preset = exportPresets[presetName];
    if (preset) {
      dispatch({ type: 'LOAD_PRESET', preset });
    } else {
      console.warn(`Preset "${presetName}" not found`);
    }
  };

  const resetToDefaults = () => {
    dispatch({ type: 'RESET_TO_DEFAULTS' });
  };

  const toggleAdvanced = () => {
    dispatch({ type: 'TOGGLE_ADVANCED' });
  };

  const value = {
    settings,
    updateSettings,
    loadPreset,
    resetToDefaults,
    toggleAdvanced,
    presets: exportPresets
  };

  return (
    <ExportContext.Provider value={value}>
      {children}
    </ExportContext.Provider>
  );
};

export const useExportSettings = () => {
  const context = useContext(ExportContext);
  if (!context) {
    throw new Error('useExportSettings must be used within an ExportProvider');
  }
  return context;
};
