import React from 'react';
import ReactDOM from 'react-dom/client';
import { injectSpeedInsights } from '@vercel/speed-insights/react';
import App from './App';

// Initialize Vercel Speed Insights
if (typeof window !== 'undefined') {
  injectSpeedInsights();
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
