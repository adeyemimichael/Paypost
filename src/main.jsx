import React from 'react';
import ReactDOM from 'react-dom/client';

// Global error handler for uncaught errors
window.onerror = function(message, source, lineno, colno, error) {
  console.error('Global error:', { message, source, lineno, colno, error });
  // Show error on page if root is empty or still showing loader
  const root = document.getElementById('root');
  if (root) {
    const loader = root.querySelector('.initial-loader');
    if (loader || !root.hasChildNodes()) {
      root.innerHTML = `
        <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f9fafb; font-family: system-ui, sans-serif;">
          <div style="text-align: center; padding: 2rem; max-width: 500px;">
            <h1 style="color: #dc2626; font-size: 1.5rem; margin-bottom: 1rem;">Application Error</h1>
            <p style="color: #4b5563; margin-bottom: 1rem;">${message}</p>
            <p style="color: #9ca3af; font-size: 0.875rem;">Source: ${source}:${lineno}</p>
            <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.5rem; cursor: pointer;">
              Refresh Page
            </button>
          </div>
        </div>
      `;
    }
  }
  return false;
};

// Handle unhandled promise rejections
window.onunhandledrejection = function(event) {
  console.error('Unhandled promise rejection:', event.reason);
  const root = document.getElementById('root');
  if (root) {
    const loader = root.querySelector('.initial-loader');
    if (loader) {
      root.innerHTML = `
        <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f9fafb; font-family: system-ui, sans-serif;">
          <div style="text-align: center; padding: 2rem; max-width: 500px;">
            <h1 style="color: #dc2626; font-size: 1.5rem; margin-bottom: 1rem;">Application Error</h1>
            <p style="color: #4b5563; margin-bottom: 1rem;">${event.reason?.message || event.reason || 'Unknown error'}</p>
            <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.5rem; cursor: pointer;">
              Refresh Page
            </button>
          </div>
        </div>
      `;
    }
  }
};

// Log app initialization
console.log('🚀 PayPost initializing...');
console.log('Environment:', import.meta.env.MODE);
console.log('Privy App ID:', import.meta.env.VITE_PRIVY_APP_ID ? 'SET' : 'MISSING');
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL || 'NOT SET');

// Dynamic import to catch any module loading errors
import('./App.jsx')
  .then(({ default: App }) => {
    console.log('✅ App module loaded successfully');
    try {
      ReactDOM.createRoot(document.getElementById('root')).render(
        <React.StrictMode>
          <App />
        </React.StrictMode>,
      );
      console.log('✅ React app rendered');
    } catch (error) {
      console.error('Failed to render app:', error);
      throw error;
    }
  })
  .catch((error) => {
    console.error('Failed to load App module:', error);
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = `
        <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f9fafb; font-family: system-ui, sans-serif;">
          <div style="text-align: center; padding: 2rem; max-width: 500px;">
            <h1 style="color: #dc2626; font-size: 1.5rem; margin-bottom: 1rem;">Failed to Load Application</h1>
            <p style="color: #4b5563; margin-bottom: 1rem;">${error.message}</p>
            <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.5rem; cursor: pointer;">
              Refresh Page
            </button>
          </div>
        </div>
      `;
    }
  });