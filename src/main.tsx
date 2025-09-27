// src/main.tsx
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' 
import './shadcn.css'
import App from './App'
// Sửa đường dẫn đúng với folder mới
import { AuthProvider } from './components/auth/AuthProvider'  

import { Toaster } from './components/ui/toaster' 

const root = createRoot(document.getElementById('app')!)

root.render(
  <BrowserRouter>
    <AuthProvider>
      <App />
      <Toaster /> {/*  Phải có Toaster */}
    </AuthProvider>
  </BrowserRouter>
)
