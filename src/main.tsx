// File: src/main.tsx
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './shadcn.css'
import App from './App'

// AuthProvider
import { AuthProvider, useAuthProvider } from './components/AuthProvider'

// Toaster UI
import { Toaster } from './components/ui/toaster'

// --------------------------
// LẤY CONTEXT AUTH CHO APP
// --------------------------
const authContext = useAuthProvider()

// --------------------------
// RENDER APP
// --------------------------
const root = createRoot(document.getElementById('app')!)

root.render(
  <BrowserRouter>
    <AuthProvider value={authContext}>
      <App />
      <Toaster /> {/* Phải có Toaster nếu dùng useToast */}
    </AuthProvider>
  </BrowserRouter>
)
