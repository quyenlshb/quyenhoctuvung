import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react'
import { auth, googleProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged, saveUserData, getUserData } from '../../lib/firebase'
import { User, AuthContextType } from './types'

// --------------------------
// TẠO CONTEXT
// --------------------------
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Hook truy cập context
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

// --------------------------
// Hook chính: useAuthProvider
// --------------------------
export function useAuthProvider() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAuthForm, setShowAuthForm] = useState(false)

  const showAuthModal = (visible: boolean) => setShowAuthForm(visible)

  const login = async (email: string, password: string) => { /* ... giữ nguyên */ }
  const register = async (name: string, email: string, password: string) => { /* ... giữ nguyên */ }
  const loginWithGoogle = async () => { /* ... giữ nguyên */ }
  const logout = () => { signOut(auth); setUser(null) }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await getUserData(firebaseUser.uid)
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: userData?.name || firebaseUser.displayName || 'Người dùng',
          photoURL: firebaseUser.photoURL || undefined,
          totalPoints: userData?.totalPoints,
          streak: userData?.streak,
          totalWords: userData?.totalWords || 0
        })
      } else setUser(null)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  return { user, loading, login, register, loginWithGoogle, logout, showAuthForm, showAuthModal }
}

// --------------------------
// AuthProvider Component
// --------------------------
export function AuthProvider({ children, value }: { children: ReactNode, value: ReturnType<typeof useAuthProvider> }) {
  const contextValue = useMemo(() => value, [value])
  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}
