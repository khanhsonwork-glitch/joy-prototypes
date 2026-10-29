import React from 'react';
import {createRoot} from 'react-dom/client';
import '@shopify/polaris/build/esm/styles.css';
import './styles/tokens.css';
import './styles/chrome.css';
import './kit/kit.css';
import './widget/widget.css';
import './styles/feature.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(<App />);
