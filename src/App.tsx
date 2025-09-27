import { Route, Routes } from 'react-router-dom'

// Trang
import HomePage from './pages/Home'
import SettingsPage from './pages/Settings'
import StatisticsPage from './pages/Statistics'
import LearningMode from './components/LearningMode'
import VocabularyManager from './components/VocabularyManager'

// Shell
import Shell from './components/Shell'

// Auth
import { AuthProvider, useAuthProvider } from './components/AuthProvider'

// Toaster
import { Toaster } from './components/ui/toaster'

export default function App() {
  const authContext = useAuthProvider()

  return (
    <AuthProvider value={authContext}>
      {/* Routes */}
      <Routes>
        <Route path="/" element={<Shell />}>
          <Route index element={<HomePage />} />
          <Route path="learn/:setId" element={<LearningMode />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="statistics" element={<StatisticsPage />} />
          <Route path="vocabulary" element={<VocabularyManager />} />
        </Route>
      </Routes>

      <Toaster />
    </AuthProvider>
  )
}
