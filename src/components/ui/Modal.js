// Modal.js - Reusable modal component with portal rendering
// V2 Feature: Professional modal dialogs with accessibility
// Status: Implemented for PR #12

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useUI } from '../../context/UIContext';
import './Modal.css';

const Modal = ({ 
  modalName, 
  title, 
  children, 
  size = 'medium',
  showCloseButton = true,
  onClose,
  className = ''
}) => {
  const { modals, hideModal } = useUI();
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  const isOpen = modals[modalName]?.isOpen || false;

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previousActiveElement.current = document.activeElement;
      
      // Focus the modal content
      if (modalRef.current) {
        modalRef.current.focus();
      }
    } else {
      // Restore focus to the previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      hideModal(modalName);
    }
  };

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  const modalContent = (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div 
        ref={modalRef}
        className={`modal-content modal-${size} ${className}`}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? `${modalName}-title` : undefined}
      >
        {title && (
          <div className="modal-header">
            <h2 id={`${modalName}-title`} className="modal-title">
              {title}
            </h2>
            {showCloseButton && (
              <button
                className="modal-close"
                onClick={handleClose}
                aria-label="Close modal"
              >
                ✕
              </button>
            )}
          </div>
        )}
        
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );

  // Render modal in portal
  return createPortal(modalContent, document.body);
};

export default Modal;

