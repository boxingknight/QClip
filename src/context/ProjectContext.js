// src/context/ProjectContext.js
import React, { createContext, useContext, useReducer } from 'react';

const ProjectContext = createContext();

const initialState = {
  projectName: 'Untitled Project',
  projectPath: null,
  isModified: false,
  lastSaved: null,
  settings: {
    resolution: { width: 1920, height: 1080 },
    framerate: 30,
    duration: 0
  }
};

const projectReducer = (state, action) => {
  switch (action.type) {
    case 'CREATE_PROJECT':
      return {
        ...initialState,
        projectName: action.name || 'Untitled Project'
      };

    case 'SET_MODIFIED':
      return {
        ...state,
        isModified: action.modified
      };

    case 'SAVE_PROJECT':
      return {
        ...state,
        projectPath: action.path,
        isModified: false,
        lastSaved: new Date()
      };

    case 'LOAD_PROJECT':
      return {
        ...action.projectData,
        isModified: false,
        lastSaved: new Date()
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.settings
        },
        isModified: true
      };

    case 'SET_PROJECT_NAME':
      return {
        ...state,
        projectName: action.name,
        isModified: true
      };

    default:
      return state;
  }
};

export const ProjectProvider = ({ children }) => {
  const [state, dispatch] = useReducer(projectReducer, initialState);

  const createProject = (name) => {
    dispatch({ type: 'CREATE_PROJECT', name });
  };

  const setModified = (modified) => {
    dispatch({ type: 'SET_MODIFIED', modified });
  };

  const saveProject = async (filePath) => {
    // TODO: Implement actual file saving in future PR
    // For now, just update the state
    dispatch({ type: 'SAVE_PROJECT', path: filePath });
  };

  const loadProject = async (filePath) => {
    // TODO: Implement actual file loading in future PR
    // For now, just update the state
    dispatch({ type: 'LOAD_PROJECT', projectData: initialState });
  };

  const updateSettings = (settings) => {
    dispatch({ type: 'UPDATE_SETTINGS', settings });
  };

  const setProjectName = (name) => {
    dispatch({ type: 'SET_PROJECT_NAME', name });
  };

  const value = {
    // State
    projectName: state.projectName,
    projectPath: state.projectPath,
    isModified: state.isModified,
    lastSaved: state.lastSaved,
    settings: state.settings,
    
    // Actions
    createProject,
    setModified,
    saveProject,
    loadProject,
    updateSettings,
    setProjectName
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};