import React, { createContext, useContext, useReducer } from 'react';

// MediaLibrary Context for storing imported video files
const MediaLibraryContext = createContext();

// Initial state for media library
const initialState = {
  mediaItems: [], // Array of imported video files
  selectedMediaId: null, // Currently selected media item
  draggedMediaId: null, // Currently dragged media item
};

// MediaLibrary reducer
const mediaLibraryReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_MEDIA_ITEMS':
      console.log('🎬 [MEDIA_LIBRARY] Adding media items:', action.mediaItems);
      return {
        ...state,
        mediaItems: [...state.mediaItems, ...action.mediaItems],
        selectedMediaId: action.mediaItems[0]?.id || null, // Select first item
      };

    case 'SELECT_MEDIA':
      console.log('🎬 [MEDIA_LIBRARY] Selecting media:', action.mediaId);
      return {
        ...state,
        selectedMediaId: action.mediaId,
      };

    case 'REMOVE_MEDIA':
      console.log('🎬 [MEDIA_LIBRARY] Removing media:', action.mediaId);
      const filteredItems = state.mediaItems.filter(item => item.id !== action.mediaId);
      return {
        ...state,
        mediaItems: filteredItems,
        selectedMediaId: state.selectedMediaId === action.mediaId ? null : state.selectedMediaId,
      };

    case 'REORDER_MEDIA':
      console.log('🎬 [MEDIA_LIBRARY] Reordering media:', action.fromIndex, 'to', action.toIndex);
      const newItems = [...state.mediaItems];
      const [movedItem] = newItems.splice(action.fromIndex, 1);
      newItems.splice(action.toIndex, 0, movedItem);
      return {
        ...state,
        mediaItems: newItems,
      };

    case 'SET_DRAGGED_MEDIA':
      return {
        ...state,
        draggedMediaId: action.mediaId,
      };

    case 'CLEAR_DRAGGED_MEDIA':
      return {
        ...state,
        draggedMediaId: null,
      };

    default:
      return state;
  }
};

// MediaLibrary Provider component
export const MediaLibraryProvider = ({ children }) => {
  const [state, dispatch] = useReducer(mediaLibraryReducer, initialState);

  // Add media items to library
  const addMediaItems = (mediaItems) => {
    dispatch({ type: 'ADD_MEDIA_ITEMS', mediaItems });
  };

  // Select a media item
  const selectMedia = (mediaId) => {
    dispatch({ type: 'SELECT_MEDIA', mediaId });
  };

  // Remove a media item
  const removeMedia = (mediaId) => {
    dispatch({ type: 'REMOVE_MEDIA', mediaId });
  };

  // Reorder media items
  const reorderMedia = (fromIndex, toIndex) => {
    dispatch({ type: 'REORDER_MEDIA', fromIndex, toIndex });
  };

  // Set dragged media
  const setDraggedMedia = (mediaId) => {
    dispatch({ type: 'SET_DRAGGED_MEDIA', mediaId });
  };

  // Clear dragged media
  const clearDraggedMedia = () => {
    dispatch({ type: 'CLEAR_DRAGGED_MEDIA' });
  };

  // Get selected media item
  const getSelectedMedia = () => {
    return state.mediaItems.find(item => item.id === state.selectedMediaId);
  };

  const value = {
    // State
    mediaItems: state.mediaItems,
    selectedMediaId: state.selectedMediaId,
    draggedMediaId: state.draggedMediaId,
    
    // Actions
    addMediaItems,
    selectMedia,
    removeMedia,
    reorderMedia,
    setDraggedMedia,
    clearDraggedMedia,
    getSelectedMedia,
  };

  return (
    <MediaLibraryContext.Provider value={value}>
      {children}
    </MediaLibraryContext.Provider>
  );
};

// Custom hook to use MediaLibrary context
export const useMediaLibrary = () => {
  const context = useContext(MediaLibraryContext);
  if (!context) {
    throw new Error('useMediaLibrary must be used within a MediaLibraryProvider');
  }
  return context;
};
