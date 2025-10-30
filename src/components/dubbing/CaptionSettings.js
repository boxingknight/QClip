import React, { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import CostEstimator from './CostEstimator';
import DubbingProgress from './DubbingProgress';
import './CaptionSettings.css';

const CaptionSettings = ({ 
  videoDuration, 
  onCaptionComplete, 
  onCaptionError,
  isGeneratingCaptions = false,
  captionProgress = null,
  onCancelCaption
}) => {
  const { 
    openaiApiKey, 
    isApiKeyValid, 
    captionSettings,
    updateCaptionSettings
  } = useSettings();
  
  const [enableCaptions, setEnableCaptions] = useState(captionSettings.enabled);
  const [showCostWarning, setShowCostWarning] = useState(captionSettings.showCostWarning);
  const [showCostEstimate, setShowCostEstimate] = useState(false);

  useEffect(() => {
    setEnableCaptions(captionSettings.enabled);
    setShowCostWarning(captionSettings.showCostWarning);
  }, [captionSettings]);

  const handleEnableCaptionsChange = (enabled) => {
    setEnableCaptions(enabled);
    
    // Update the settings in the context
    updateCaptionSettings({ enabled });
    
    if (enabled && videoDuration > 0) {
      setShowCostEstimate(true);
    } else {
      setShowCostEstimate(false);
    }
  };

  const handleShowCostWarningChange = (show) => {
    setShowCostWarning(show);
    updateCaptionSettings({ showCostWarning: show });
  };

  const canGenerateCaptions = isApiKeyValid && videoDuration > 0 && videoDuration <= 1800; // 30 minutes max

  const costEstimate = videoDuration > 0 ? {
    durationMinutes: videoDuration / 60,
    costPerMinute: 0.006,
    totalCost: (videoDuration / 60) * 0.006,
    currency: 'USD'
  } : null;

  return (
    <div className="caption-settings">
      <div className="caption-settings-header">
        <h3>📝 Caption Generation</h3>
        <p>Generate automatic captions using OpenAI Whisper</p>
      </div>

      <div className="caption-settings-content">
        <div className="caption-toggle">
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={enableCaptions}
              onChange={(e) => handleEnableCaptionsChange(e.target.checked)}
              disabled={!canGenerateCaptions}
            />
            <span className="toggle-slider"></span>
          </label>
          <div className="toggle-label">
            <span className="toggle-title">Generate Captions</span>
            <span className="toggle-description">
              Create SRT subtitle file for this video
            </span>
          </div>
        </div>

        {!isApiKeyValid && (
          <div className="api-key-warning">
            <span className="warning-icon">⚠️</span>
            <span>OpenAI API key required for caption generation</span>
          </div>
        )}

        {videoDuration > 1800 && (
          <div className="duration-warning">
            <span className="warning-icon">⚠️</span>
            <span>Videos longer than 30 minutes are not supported</span>
          </div>
        )}

        {showCostEstimate && costEstimate && (
          <CostEstimator 
            costEstimate={costEstimate}
            showWarning={showCostWarning}
            onWarningChange={handleShowCostWarningChange}
            serviceName="OpenAI Whisper"
          />
        )}

        {isGeneratingCaptions && (
          <DubbingProgress 
            progress={captionProgress}
            onCancel={onCancelCaption}
            serviceName="Caption Generation"
          />
        )}
      </div>
    </div>
  );
};

export default CaptionSettings;
