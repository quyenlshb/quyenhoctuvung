// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './shadcn.css'; // CSS của bạn

// Tìm phần tử root trong DOM
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found. Hãy chắc chắn rằng index.html có <div id="root"></div>');
}

// Tạo root React 18
const root = ReactDOM.createRoot(rootElement);

// Render ứng dụng với Router
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
