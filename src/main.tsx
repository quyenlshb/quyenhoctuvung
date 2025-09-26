// File: src/main.tsx (CẦN CHỈNH SỬA)
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // <-- Import thêm BrowserRouter
import './shadcn.css'
import App from './App'
import { AuthProvider } from './components/AuthProvider' 

const root = createRoot(document.getElementById('app')!)

// SỬA: Đảm bảo <BrowserRouter> là component bọc ngoài cùng (hoặc thứ hai, sau React.StrictMode nếu có)
root.render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
)