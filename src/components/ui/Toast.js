// Toast.js - Toast notification component with animations
// V2 Feature: Professional toast notifications with auto-dismiss
// Status: Implemented for PR #12

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useUI } from '../../context/UIContext';
import './Toast.css';

const Toast = ({ toast }) => {
  const { removeToast } = useUI();
  const [isExiting, setIsExiting] = useState(false);

  const { id, type = 'info', title, message, duration = 3000 } = toast;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      removeToast(id);
    }, 300); // Match animation duration
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  const toastElement = (
    <div 
      className={`toast toast-${type} ${isExiting ? 'toast-exit' : ''}`}
      role="alert"
      aria-live="polite"
    >
      <div className="toast-icon">
        {getIcon()}
      </div>
      
      <div className="toast-content">
        {title && (
          <div className="toast-title">
            {title}
          </div>
        )}
        <div className="toast-message">
          {message}
        </div>
      </div>
      
      <button
        className="toast-close"
        onClick={handleClose}
        aria-label="Close notification"
      >
        ✕
      </button>
      
      {duration > 0 && (
        <div 
          className="toast-progress"
          style={{ animationDuration: `${duration}ms` }}
        />
      )}
    </div>
  );

  return createPortal(toastElement, document.body);
};

// ToastContainer component to render all toasts
export const ToastContainer = () => {
  const { toasts } = useUI();

  if (toasts.length === 0) {
    return null;
  }

  const containerElement = (
    <div 
      className="toast-container"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );

  return createPortal(containerElement, document.body);
};

export default Toast;

