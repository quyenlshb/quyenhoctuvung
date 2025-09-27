import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import type { User } from './types'

export interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => void
  showAuthModal: (visible: boolean) => void
  showAuthForm: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export function AuthProviderWrapper({ children, value }: { children: ReactNode, value: AuthContextType }) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
