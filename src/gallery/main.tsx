import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../lib/styles/index.css';
import './gallery.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
