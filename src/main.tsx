// File: src/main.tsx
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './shadcn.css'
import App from './App'

// AuthProvider
import { AuthProvider, useAuthProvider } from './components/AuthProvider'

// Toaster UI
import { Toaster } from './components/ui/toaster'

// ==========================
// ROOT COMPONENT
// ==========================
function Root() {
  // ✅ Hook phải được gọi bên trong component
  const authContext = useAuthProvider()

  return (
    <BrowserRouter>
      <AuthProvider value={authContext}>
        <App />
        <Toaster /> {/* Phải có Toaster nếu dùng useToast */}
      </AuthProvider>
    </BrowserRouter>
  )
}

// ==========================
// RENDER
// ==========================
const root = createRoot(document.getElementById('app')!)
root.render(<Root />)
