import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import App from './App';

// Global error handler for renderer process
window.addEventListener('error', (event) => {
  console.error('[Renderer] Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Renderer] Unhandled promise rejection:', event.reason);
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

