import { jsx as _jsx } from "react/jsx-runtime";
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';
import './services/openai-safe';
import './services/stripe-safe';
(() => {
    const id = 'network-interceptor';
    if (!document.getElementById(id)) {
        const script = document.createElement('script');
        script.id = id;
        script.src = '/intercept.js';
        document.head.appendChild(script);
    }
})();

const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error("Root element with id 'root' not found");
}
console.log('[App] Starting Bot360AI with safe service initialization');
createRoot(rootElement).render(_jsx(StrictMode, { children: _jsx(Router, { children: _jsx(App, {}) }) }));
