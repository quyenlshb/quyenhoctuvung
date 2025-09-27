import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './components/AuthProvider'
import Home from './pages/Home'
import LearningMode from './components/LearningMode'
import VocabularyManager from './components/VocabularyManager'
import { Toaster } from './components/ui/toaster'

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user } = useAuth()
  if (!user) {
    return <Navigate to="/" replace />
  }
  return children
}

function MainApp() {
  const { user, openAuthModal } = useAuth()

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <Home onLoginClick={openAuthModal} />
          }
        />
        <Route
          path="/learn/:setId"
          element={
            <RequireAuth>
              <LearningMode />
            </RequireAuth>
          }
        />
        <Route
          path="/vocabulary"
          element={
            <RequireAuth>
              <VocabularyManager />
            </RequireAuth>
          }
        />
      </Routes>
      <Toaster />
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  )
}
