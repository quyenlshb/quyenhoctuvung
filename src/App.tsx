// src/App.tsx
import { Routes, Route } from 'react-router-dom'

// Pages
import Home from './pages/Home'

// Components
import Shell from './components/Shell'
import LearningMode from './components/LearningMode'
import VocabularyManager from './components/VocabularyManager'

// Auth
import { AuthProvider, useAuthProvider, AuthModal } from './components/AuthProvider'

// Toaster
import { Toaster } from './components/ui/toaster'

export default function App() {
  // Lấy context auth
  const authContext = useAuthProvider()

  return (
    <AuthProvider value={authContext}>
      <Shell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/learn/:setId" element={<LearningMode />} />
          <Route path="/vocabulary" element={<VocabularyManager />} />
          <Route path="/statistics" element={<div>Thống kê</div>} />
          <Route path="/settings" element={<div>Cài đặt</div>} />
        </Routes>
      </Shell>

      {/* Modal Auth */}
      <AuthModal />

      {/* Toaster */}
      <Toaster />
    </AuthProvider>
  )
}
