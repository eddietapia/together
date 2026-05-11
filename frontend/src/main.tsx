import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App';
import { TrayApp } from './TrayApp';

const isTray = new URLSearchParams(window.location.search).has('tray');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isTray ? <TrayApp /> : <App />}
  </StrictMode>
);
