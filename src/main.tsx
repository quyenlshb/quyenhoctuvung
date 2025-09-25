import { createRoot } from 'react-dom/client'
import './shadcn.css'
import App from './App'
// ✅ ĐÃ SỬA LỖI: Import AuthProvider từ đường dẫn components/AuthProvider
import { AuthProvider } from './components/AuthProvider' 
// Lưu ý: AuthProvider nằm trong thư mục 'components', và main.tsx đang nằm trong 'src', 
// nên đường dẫn tương đối là './components/AuthProvider'

const root = createRoot(document.getElementById('app')!)

// ✅ ĐÃ SỬA LỖI: Bọc <App /> bằng <AuthProvider> để cung cấp ngữ cảnh xác thực
root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
)
