import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { User } from './types'
import type { AuthContextType } from './AuthContext'
import { auth, googleProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged, saveUserData, getUserData } from '../../lib/firebase'

export function useAuthProvider(): AuthContextType {
  const navigate = useNavigate()
  const [user, setUser] = useState<User|null>(null)
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
    navigate('/')
  }

  const register = async (name: string, email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const newUser: User = { id: userCredential.user.uid, email, name, totalWords:0 }
    await saveUserData(newUser.id, { name, email, totalPoints:0, streak:0, totalWords:0 })
    setUser(newUser)
    setShowAuthForm(false)
    navigate('/')
  }

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider)
    const firebaseUser = result.user
    let userData = await getUserData(firebaseUser.uid)
    if(!userData){
      const newUser: User = { id: firebaseUser.uid, email: firebaseUser.email||'', name: firebaseUser.displayName||'Người dùng', photoURL: firebaseUser.photoURL, totalWords:0 }
      await saveUserData(newUser.id, { name:newUser.name, email:newUser.email, photoURL:newUser.photoURL, totalPoints:0, streak:0, totalWords:0 })
      setUser(newUser)
    } else {
      setUser({ id:firebaseUser.uid, email: firebaseUser.email||'', name:userData.name, photoURL: firebaseUser.photoURL, totalPoints:userData.totalPoints, streak:userData.streak, totalWords:userData.totalWords })
    }
    setShowAuthForm(false)
    navigate('/')
  }

  const logout = () => {
    signOut(auth)
    setUser(null)
    navigate('/')
  }

  useEffect(()=>{
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser)=>{
      if(firebaseUser){
        const userData = await getUserData(firebaseUser.uid)
        setUser({ id:firebaseUser.uid, email:firebaseUser.email||'', name:userData?.name||firebaseUser.displayName||'Người dùng', photoURL:firebaseUser.photoURL||undefined, totalPoints:userData?.totalPoints, streak:userData?.streak, totalWords:userData?.totalWords||0 })
      } else setUser(null)
      setLoading(false)
    })
    return ()=>unsubscribe()
  },[])

  return useMemo(()=>({ user, loading, login, register, loginWithGoogle, logout, showAuthModal, showAuthForm }), [user, loading, showAuthForm])
}
