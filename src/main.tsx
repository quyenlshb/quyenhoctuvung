import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './shadcn.css'
import App from './App'
import { AuthProvider } from './components/AuthProvider'

const container = document.getElementById('root')
if (!container) throw new Error('Root container missing in index.html')

const root = createRoot(container)
root.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
)
