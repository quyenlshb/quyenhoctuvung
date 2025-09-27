import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './shadcn.css' // đường dẫn chính xác
import { Home } from './pages/Home'
import { Settings } from './pages/Settings'
import { Statistics } from './pages/Statistics'
import { AuthProvider } from './components/AuthProvider'

const container = document.getElementById('root')
if (!container) throw new Error('Root container missing in index.html')

const root = createRoot(container)
root.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/statistics" element={<Statistics />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
)
