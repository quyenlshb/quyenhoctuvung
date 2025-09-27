import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
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

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuthProvider() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuthProvider must be used within AuthProvider')
  return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAuthForm, setShowAuthForm] = useState(false)
  const navigate = useNavigate()

  const showAuthModal = (visible: boolean) => setShowAuthForm(visible)

  const login = async (email: string, password: string) => {
    try {
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
      navigate('/')
    } catch {
      throw new Error('Đăng nhập thất bại')
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const newUser: User = { id: userCredential.user.uid, email, name, totalWords: 0 }
      await saveUserData(newUser.id, { name, email, totalPoints: 0, streak: 0, totalWords: 0 })
      setUser(newUser)
      setShowAuthForm(false)
      navigate('/')
    } catch {
      throw new Error('Đăng ký thất bại')
    }
  }

  const loginWithGoogle = async () => {
    try {
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
        await saveUserData(newUser.id, { name: newUser.name, email: newUser.email, photoURL: newUser.photoURL, totalPoints: 0, streak: 0, totalWords: 0 })
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
      navigate('/')
    } catch {
      throw new Error('Đăng nhập Google thất bại')
    }
  }

  const logout = () => {
    signOut(auth)
    setUser(null)
    navigate('/')
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

  const contextValue: AuthContextType = useMemo(() => ({
    user, loading, login, register, loginWithGoogle, logout, showAuthModal, showAuthForm
  }), [user, loading, showAuthForm])

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin"/></div>

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}
