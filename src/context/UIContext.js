// src/context/UIContext.js
import React, { createContext, useContext, useReducer } from 'react';

const UIContext = createContext();

const initialState = {
  modals: {
    exportSettings: { isOpen: false, data: null },
    projectSettings: { isOpen: false, data: null }
  },
  toasts: [],
  loading: {
    export: false,
    import: false,
    recording: false
  },
  importStatus: {
    loading: false,
    error: null,
    lastImported: null
  }
};

const uiReducer = (state, action) => {
  switch (action.type) {
    case 'SHOW_MODAL':
      return {
        ...state,
        modals: {
          ...state.modals,
          [action.modalName]: { isOpen: true, data: action.data }
        }
      };

    case 'HIDE_MODAL':
      return {
        ...state,
        modals: {
          ...state.modals,
          [action.modalName]: { isOpen: false, data: null }
        }
      };

    case 'SHOW_TOAST':
      const toast = {
        id: Date.now(),
        type: action.toast.type || 'info',
        message: action.toast.message,
        duration: action.toast.duration || 3000
      };
      return {
        ...state,
        toasts: [...state.toasts, toast]
      };

    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter(toast => toast.id !== action.toastId)
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.key]: action.loading
        }
      };

    case 'SET_IMPORT_STATUS':
      return {
        ...state,
        importStatus: {
          ...state.importStatus,
          ...action.status
        }
      };

    default:
      return state;
  }
};

export const UIProvider = ({ children }) => {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  const showModal = (modalName, data = null) => {
    dispatch({ type: 'SHOW_MODAL', modalName, data });
  };

  const hideModal = (modalName) => {
    dispatch({ type: 'HIDE_MODAL', modalName });
  };

  const showToast = (toast) => {
    dispatch({ type: 'SHOW_TOAST', toast });
    
    // Auto-remove toast after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', toastId: Date.now() });
      }, toast.duration || 3000);
    }
  };

  const removeToast = (toastId) => {
    dispatch({ type: 'REMOVE_TOAST', toastId });
  };

  const setLoading = (key, loading) => {
    dispatch({ type: 'SET_LOADING', key, loading });
  };

  const setImportStatus = (status) => {
    dispatch({ type: 'SET_IMPORT_STATUS', status });
  };

  const value = {
    // State
    modals: state.modals,
    toasts: state.toasts,
    loading: state.loading,
    importStatus: state.importStatus,
    
    // Actions
    showModal,
    hideModal,
    showToast,
    removeToast,
    setLoading,
    setImportStatus
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};