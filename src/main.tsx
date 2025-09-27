// File: src/main.tsx
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './shadcn.css'

const root = createRoot(document.getElementById('app')!)

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
