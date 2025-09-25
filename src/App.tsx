import { BrowserRouter, Route, Routes } from 'react-router'

// ✅ SỬA LỖI: Các trang trong thư mục 'pages'
import HomePage from './pages/Home' 
import SettingsPage from './pages/Settings'        
import StatisticsPage from './pages/Statistics'    

// ✅ SỬA LỖI: Các component lớn trong thư mục 'components'
import LearningMode from './components/LearningMode'    
import VocabularyManager from './components/VocabularyManager' 
// Lưu ý: AuthProvider.tsx (cũng trong components) thường được dùng để bọc App, không phải là một Route.

export default function App() {
  return (
    // Dùng BrowserRouter để khắc phục lỗi 404 Not Found trên Vercel
    <BrowserRouter> 
      <Routes>
        <Route path="/" element={<HomePage />} />
        
        {/* Route cho các Trang (Pages) */}
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/statistics" element={<StatisticsPage />} />
        
        {/* Route cho các Chức năng Lớn (Components) */}
        <Route path="/learn" element={<LearningMode />} />
        <Route path="/vocabulary" element={<VocabularyManager />} />
        
      </Routes>
    </BrowserRouter>
  )
}
