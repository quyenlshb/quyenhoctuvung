// File: src/main.tsx
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' 
import './shadcn.css'
import App from './App'
import { AuthProvider } from './components/AuthProvider' 
// BỔ SUNG: Import Toaster để tránh lỗi runtime khi dùng useToast
import { Toaster } from './components/ui/toaster' 

const root = createRoot(document.getElementById('app')!)

root.render(
  <BrowserRouter>
    <AuthProvider>
      <App />
      <Toaster /> {/* ✅ Phải có Toaster */}
    </AuthProvider>
  </BrowserRouter>
)