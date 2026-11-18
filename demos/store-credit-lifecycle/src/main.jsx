import React from 'react';
import {createRoot} from 'react-dom/client';
import '@shopify/polaris/build/esm/styles.css';
import './styles/tokens.css';
import './styles/chrome.css';
import './kit/kit.css';
import App from './App.jsx';

// ?shot=1: clean photo for the hub card and the PRD (no prototype bar, no amber outlines).
if (new URLSearchParams(window.location.search).get('shot') === '1') document.body.classList.add('is-shot');

createRoot(document.getElementById('root')).render(<App />);
