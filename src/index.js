import React from 'react';
import { createRoot } from 'react-dom/client';  // New import for React 18+
import App from './App.tsx';  // Your App.tsx
import './index.css';  // Global styles (add your viewer styles here if needed)

const container = document.getElementById('root');  // Ensure #root exists in index.html
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}