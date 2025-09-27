// File: src/App.tsx
import { Routes, Route } from 'react-router-dom'

// Pages
import HomePage from './pages/Home'
import SettingsPage from './pages/Settings'
import StatisticsPage from './pages/Statistics'
import LearningMode from './components/LearningMode'
import VocabularyManager from './components/VocabularyManager'

// Layout
import Shell from './components/Shell'

// Auth
import { AuthProvider, useAuthProvider } from './components/AuthProvider'
import { Toaster } from './components/ui/toaster'

export default function App() {
  // ✅ Hook AuthProvider chỉ gọi trong component
  const authContext = useAuthProvider()

  return (
    <AuthProvider value={authContext}>
      <Routes>
        <Route path="/" element={<Shell />}>
          <Route index element={<HomePage />} />
          <Route path="learn/:setId" element={<LearningMode />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="statistics" element={<StatisticsPage />} />
          <Route path="vocabulary" element={<VocabularyManager />} />
        </Route>
      </Routes>
      <Toaster /> {/* Phải có Toaster nếu dùng useToast */}
    </AuthProvider>
  )
}
