// File: src/components/AuthProvider/types.ts

// ---------------- USER INTERFACE ----------------
export interface User {
  id: string
  email: string
  name: string
  photoURL?: string
  totalPoints?: number
  streak?: number
  totalWords: number
}

// ---------------- AUTH CONTEXT INTERFACE ----------------
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
