// File: src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Shell from './components/Shell'
import { AuthProvider, useAuthProvider } from './components/AuthProvider'
import AuthModal from './components/AuthProvider/AuthModal'
import { Toaster } from './components/ui/toaster'
import HomePage from './pages/Home'
import LearnPage from './pages/Learn'
import VocabularyPage from './pages/Vocabulary'
import StatisticsPage from './pages/Statistics'
import SettingsPage from './pages/Settings'

export default function App() {
  // Lấy context auth
  const authContext = useAuthProvider()

  return (
    <AuthProvider value={authContext}>
      <Router>
        {/* Modal auth */}
        <AuthModal />

        {/* Toaster chung */}
        <Toaster />

        {/* Routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/app/*" element={<Shell />}>
            <Route path="learn" element={<LearnPage />} />
            <Route path="vocabulary" element={<VocabularyPage />} />
            <Route path="statistics" element={<StatisticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}
