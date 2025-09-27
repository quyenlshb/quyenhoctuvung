// src/App.tsx
import { Routes, Route } from 'react-router-dom'

// Components
import Shell from './components/Shell'
import { AuthProvider, useAuthProvider } from './components/AuthProvider'
import { Toaster } from './components/ui/toaster'

// Pages
import HomePage from './pages/Home'
import LearningMode from './components/LearningMode'
import VocabularyPage from './pages/Vocabulary'
import StatisticsPage from './pages/Statistics'
import SettingsPage from './pages/Settings'

// Lấy context auth
const authContext = useAuthProvider()

export default function App() {
  return (
    <AuthProvider value={authContext}>
      <Toaster />
      <Routes>
        <Route path="/" element={<Shell />}>
          <Route index element={<HomePage />} />
          <Route path="learn" element={<LearningMode />} />
          <Route path="vocabulary" element={<VocabularyPage />} />
          <Route path="statistics" element={<StatisticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
