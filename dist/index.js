import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { createRoot } from 'react-dom/client'; // New import for React 18+
import App from './App.tsx'; // Your App.tsx
import './index.css'; // Global styles (add your viewer styles here if needed)
var container = document.getElementById('root'); // Ensure #root exists in index.html
if (container) {
    var root = createRoot(container);
    root.render(_jsx(React.StrictMode, { children: _jsx(App, {}) }));
}
