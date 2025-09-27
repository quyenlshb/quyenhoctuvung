// File: src/main.tsx
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' 
import './shadcn.css'
import App from './App'
import { AuthProvider } from './components/AuthProvider' 

const root = createRoot(document.getElementById('app')!)

// SỬA: Đảm bảo <BrowserRouter> bọc <AuthProvider> bọc <App>
root.render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
)