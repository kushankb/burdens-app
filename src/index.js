import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
// Note: StrictMode removed to prevent Mapbox double-init/teardown in dev
root.render(<App />);
