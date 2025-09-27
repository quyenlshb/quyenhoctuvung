// src/App.tsx
import { Route, Routes } from 'react-router-dom'

// 1. IMPORT TRANG
import HomePage from './pages/Home'
import SettingsPage from './pages/Settings'
import StatisticsPage from './pages/Statistics'
import LearningMode from './components/LearningMode'
import VocabularyManager from './components/VocabularyManager'

// 2. IMPORT SHELL
import Shell from './components/Shell'

// 3. IMPORT AUTH
import { useAuth } from './components/auth'
import AuthModal from './components/auth/AuthModal' // modal riêng

export default function App() {
  const { showAuthForm, showAuthModal } = useAuth() // lấy context hiện tại

  return (
    <>
      {/* Modal đăng nhập/đăng ký */}
      <AuthModal 
        showAuthForm={showAuthForm} 
        setShowAuthForm={showAuthModal} 
      />

      {/* Routes chung với Shell */}
      <Routes>
        <Route path="/" element={<Shell />}>
          <Route index element={<HomePage />} />
          <Route path="learn/:setId" element={<LearningMode />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="statistics" element={<StatisticsPage />} />
          <Route path="vocabulary" element={<VocabularyManager />} />
        </Route>
      </Routes>
    </>
  )
}
