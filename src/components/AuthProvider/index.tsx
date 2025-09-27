// File: src/components/AuthProvider/index.tsx
import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react'
import {
  auth,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  saveUserData,
  getUserData
} from '../../lib/firebase'
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

  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const userData = await getUserData(userCredential.user.uid)
    setUser({
      id: userCredential.user.uid,
      email: userCredential.user.email || '',
      name: userData?.name || 'Người dùng',
      photoURL: userCredential.user.photoURL || undefined,
      totalPoints: userData?.totalPoints,
      streak: userData?.streak,
      totalWords: userData?.totalWords || 0
    })
    setShowAuthForm(false)
  }

  const register = async (name: string, email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const newUser: User = {
      id: userCredential.user.uid,
      email,
      name,
      totalWords: 0
    }
    await saveUserData(newUser.id, {
      name: newUser.name,
      email: newUser.email,
      totalPoints: 0,
      streak: 0,
      totalWords: 0
    })
    setUser(newUser)
    setShowAuthForm(false)
  }

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider)
    const firebaseUser = result.user
    let userData = await getUserData(firebaseUser.uid)

    if (!userData) {
      const newUser: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || 'Người dùng',
        photoURL: firebaseUser.photoURL || undefined,
        totalWords: 0
      }
      await saveUserData(newUser.id, {
        name: newUser.name,
        email: newUser.email,
        photoURL: newUser.photoURL,
        totalPoints: 0,
        streak: 0,
        totalWords: 0
      })
      setUser(newUser)
    } else {
      setUser({
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: userData.name,
        photoURL: firebaseUser.photoURL || undefined,
        totalPoints: userData.totalPoints,
        streak: userData.streak,
        totalWords: userData.totalWords
      })
    }
    setShowAuthForm(false)
  }

  const logout = () => {
    signOut(auth)
    setUser(null)
  }

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

  return {
    user,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    showAuthForm,
    showAuthModal
  }
}

// --------------------------
// AuthProvider Component
// --------------------------
export function AuthProvider({ children, value }: { children: ReactNode, value: ReturnType<typeof useAuthProvider> }) {
  const contextValue = useMemo(() => value, [value])
  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

// --------------------------
// Export AuthModal để App.tsx import
// --------------------------
export { default as AuthModal } from './AuthModal'
