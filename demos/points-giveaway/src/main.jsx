import React from 'react';
import {createRoot} from 'react-dom/client';
import '@shopify/polaris/build/esm/styles.css';
import './styles/tokens.css';
import './styles/chrome.css';
import './styles/app.css';
import './styles/storefront.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(<App />);
