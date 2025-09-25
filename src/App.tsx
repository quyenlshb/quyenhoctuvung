import { BrowserRouter, Route, Routes, Outlet } from 'react-router-dom'
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
    <BrowserRouter> 
      <Routes>
        
        {/*
          =======================================================
          ROUTE CHÍNH: Dùng Shell làm Layout Wrapper
          =======================================================
          - Mọi route con sẽ hiển thị BÊN TRONG component <Shell />
          - Nội dung của các route con sẽ thay thế thẻ <Outlet /> trong Shell.
        */}
        <Route path="/" element={<Shell />}>
          
          {/* Trang chủ: path="/" (sử dụng index) */}
          <Route index element={<HomePage />} />
          
          {/* Route cho các Chức năng Lớn (Pages/Components) */}
          <Route path="settings" element={<SettingsPage />} />
          <Route path="statistics" element={<StatisticsPage />} />
          <Route path="learn" element={<LearningMode />} />
          <Route path="vocabulary" element={<VocabularyManager />} />

          {/* Optional: Thêm Route Not Found nếu cần */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}
          
        </Route>
        
      </Routes>
    </BrowserRouter>
  )
}