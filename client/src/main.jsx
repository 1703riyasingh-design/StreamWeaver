import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './Responsive.css';
import App from './App.jsx';
import { initSecurity } from './utils/security';

// Initialize security features (only active in production)
initSecurity();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);