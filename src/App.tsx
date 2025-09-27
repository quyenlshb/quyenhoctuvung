import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/Home'
import SettingsPage from './pages/Settings'
import StatisticsPage from './pages/Statistics'
import LearningMode from './components/LearningMode'
import VocabularyManager from './components/VocabularyManager'
import Shell from './components/Shell'

import { AuthProvider, useAuthProvider } from './components/AuthProvider'
import AuthModal from './components/AuthProvider/AuthModal'

export default function App() {
  const authContext = useAuthProvider()

  return (
    <AuthProvider>
      <AuthModal showAuthForm={authContext.showAuthForm} setShowAuthForm={authContext.showAuthModal} />
      <Routes>
        <Route path="/" element={<Shell />}>
          <Route index element={<HomePage />} />
          <Route path="learn/:setId" element={<LearningMode />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="statistics" element={<StatisticsPage />} />
          <Route path="vocabulary" element={<VocabularyManager />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
