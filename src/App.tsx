import {  Route, Routes, Outlet } from 'react-router-dom'
// NOTE: Tôi đã thay thế 'react-router' thành 'react-router-dom' vì đây là package tiêu chuẩn cho môi trường web.

// 1. IMPORT CÁC TRANG CỦA BẠN (Được giữ nguyên)
import HomePage from './pages/Home' 
import SettingsPage from './pages/Settings'        
import StatisticsPage from './pages/Statistics'    
import LearningMode from './components/LearningMode'    
import VocabularyManager from './components/VocabularyManager' 

// 2. IMPORT COMPONENT BỐ CỤC CHUNG (Shell)
// Component này phải được TẠO MỚI (xem ghi chú quan trọng bên dưới)
import Shell from './components/Shell' 


export default function App() {
  return (
    // XÓA thẻ <BrowserRouter> ở đây
    <Routes>
      <Route path="/" element={<Shell />}>
  <Route index element={<HomePage />} />
  <Route path="learn/:setId" element={<LearningMode />} />
  <Route path="settings" element={<SettingsPage />} />
  <Route path="statistics" element={<StatisticsPage />} />
  <Route path="vocabulary" element={<VocabularyManager />} />
</Route>
    </Routes>
    // XÓA thẻ </BrowserRouter> ở đây
  )
}