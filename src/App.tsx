// src/App.tsx
import { Routes, Route } from 'react-router-dom'

// 1. IMPORT COMPONENTS CHÍNH
import Shell from './components/Shell'
import HomePage from './pages/HomePage'
import LearningMode from './components/LearningMode'
import VocabularyManager from './components/VocabularyManager'
import StatisticsPage from './pages/StatisticsPage'
import SettingsPage from './pages/SettingsPage'

// 2. IMPORT AUTH
import { AuthProvider, useAuthProvider } from './components/AuthProvider'

// 3. IMPORT TOASTER
import { Toaster } from './components/ui/toaster'

export default function App() {
  const authContext = useAuthProvider()

  return (
    <AuthProvider value={authContext}>
      <Toaster /> {/* Phải có Toaster nếu dùng useToast */}
      <Routes>
        <Route path="/" element={<Shell />}>
          {/* Trang chính */}
          <Route index element={<HomePage />} />

          {/* Protected routes */}
          <Route path="learn" element={<LearningMode />} />
          <Route path="vocabulary" element={<VocabularyManager />} />
          <Route path="statistics" element={<StatisticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          
          {/* Fallback */}
          <Route path="*" element={<HomePage />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
