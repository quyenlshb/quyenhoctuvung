import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './shadcn.css'
import App from './App'
import { AuthProvider } from './components/AuthProvider'
import { Toaster } from './components/ui/toaster'

const root = createRoot(document.getElementById('app')!)

root.render(
  <BrowserRouter>
    <AuthProvider>
      <App />
      <Toaster /> {/* Phải có nếu dùng useToast */}
    </AuthProvider>
  </BrowserRouter>
)
