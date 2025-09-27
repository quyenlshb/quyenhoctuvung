// File: src/main.tsx
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './shadcn.css'
import App from './App'

// AuthProvider
import { AuthProvider, useAuthProvider } from './components/AuthProvider'

// --------------------------
// LẤY CONTEXT AUTH CHO APP
// --------------------------
const authContext = useAuthProvider()

// --------------------------
// RENDER APP
// --------------------------
const rootElement = document.getElementById('app')
if (!rootElement) throw new Error('Root element #app not found')

const root = createRoot(rootElement)

root.render(
  <BrowserRouter>
    <AuthProvider value={authContext}>
      <App />
    </AuthProvider>
  </BrowserRouter>
)
