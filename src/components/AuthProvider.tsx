/**
 * Firebase Authentication Provider
 * Integrated with Firebase Auth and Firestore for production deployment
 */

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Dialog, DialogContent } from './ui/dialog' 
import { 
  User as UserIcon, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  LogOut,
  Loader2 
} from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'   
import { useNavigate } from 'react-router-dom'

// ⚡️ IMPORT HÀM FIREBASE THỰC TẾ
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
} from '../lib/firebase' 

interface User {
  id: string
  email: string
  name: string
  photoURL?: string
  totalPoints?: number
  streak?: number
  totalWords: number
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => void
  showAuthModal: (visible: boolean) => void 
  showAuthForm: boolean 
}

// ----------------------------------------------------
// 1. TẠO VÀ CUNG CẤP CONTEXT
// ----------------------------------------------------

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  
  // ✅ Dùng state này để kiểm soát trạng thái MỞ/ĐÓNG của Dialog
  const [showAuthForm, setShowAuthForm] = useState(false);

  // ----------------------------------------------------
  // HÀM XỬ LÝ AUTH (LOGIN, REGISTER, LOGOUT)
  // ----------------------------------------------------

  const showAuthModal = (visible: boolean) => setShowAuthForm(visible); 

  const login = async (email: string, password: string) => {
    try {
      setError(null)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const userData = await getUserData(userCredential.user.uid)
      
      const updatedUser: User = {
          id: userCredential.user.uid,
          email: userCredential.user.email || '',
          name: userData?.name || 'Người dùng',
          photoURL: userCredential.user.photoURL || undefined,
          totalPoints: userData?.totalPoints,
          streak: userData?.streak,
          totalWords: userData?.totalWords || 0
      }
      
      setUser(updatedUser)
      // 🔥 FIX QUAN TRỌNG: Đóng modal TRƯỚC KHI chuyển hướng
      setShowAuthForm(false); 
      navigate('/') 
    } catch (err: any) {
      const firebaseError = err.code ? "Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu." : "Lỗi không xác định."
      setError(firebaseError)
      throw new Error(firebaseError)
    } 
  }
  
  const register = async (name: string, email: string, password: string) => {
    try {
      setError(null)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      const newUser: User = {
          id: userCredential.user.uid,
          email: email,
          name: name,
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
      // 🔥 FIX QUAN TRỌNG: Đóng modal TRƯỚC KHI chuyển hướng
      setShowAuthForm(false); 
      navigate('/') 
    } catch (err: any) {
       const firebaseError = err.code ? "Đăng ký thất bại. Email đã được sử dụng hoặc mật khẩu quá yếu (dưới 6 ký tự)." : "Lỗi không xác định."
       setError(firebaseError)
       throw new Error(firebaseError)
    }
  }

  const loginWithGoogle = async () => {
    try {
      setError(null)
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
      
      // 🔥 FIX QUAN TRỌNG: Đóng modal TRƯỚC KHI chuyển hướng
      setShowAuthForm(false); 
      navigate('/')
    } catch (err) {
      setError("Đăng nhập bằng Google thất bại.");
      throw new Error("Đăng nhập bằng Google thất bại.");
    }
  }

  const logout = () => {
    signOut(auth)
    setUser(null)
    navigate('/')
  }
  
  // ----------------------------------------------------
  // LOGIC SỰ KIỆN AUTH FIREBASE
  // ----------------------------------------------------

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
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])
  
  // ----------------------------------------------------
  // 2. GIÁ TRỊ CONTEXT
  // ----------------------------------------------------

  const contextValue: AuthContextType = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      loginWithGoogle,
      logout,
      showAuthModal, 
      showAuthForm 
    }),
    [user, loading, showAuthForm] 
  )

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-600 dark:text-gray-300">Đang kiểm tra phiên...</span>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
      
      {/* RENDER AUTH MODAL Ở ĐÂY */}
      <Dialog 
        open={showAuthForm} 
        onOpenChange={setShowAuthForm} // ✅ Dùng trực tiếp setShowAuthForm
      >
        <DialogContent 
            className="sm:max-w-[425px] p-0 border-none bg-transparent shadow-none"
            onPointerDownOutside={(e) => {
              // Ngăn chặn việc đóng modal khi đang ở protected route
              const protectedRoutes = ['/learn', '/vocabulary', '/statistics', '/settings']; 
              const currentPath = window.location.pathname
              
              // Nếu đang ở protected route VÀ chưa đăng nhập (ngăn đóng để user đăng nhập)
              if (protectedRoutes.includes(currentPath) && !user) {
                  e.preventDefault()
              }
            }}
        >
            <Auth /> 
        </DialogContent>
      </Dialog>

    </AuthContext.Provider>
  )
}


// ----------------------------------------------------
// 3. COMPONENT AUTH (UI Đăng nhập/Đăng ký)
// ----------------------------------------------------
function Auth() {
  const { 
    login, 
    register, 
    loginWithGoogle,
  } = useAuth() 
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [currentTab, setCurrentTab] = useState<'login' | 'register'>('login')
  const [isFormLoading, setIsFormLoading] = useState(false) 

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsFormLoading(true)
    setError(null)
    try {
      await login(email, password)
    } catch (err: any) {
      setError(err.message) 
    } finally {
      setIsFormLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsFormLoading(true)
    setError(null)
    if (!name.trim()) {
        setError("Vui lòng nhập tên của bạn.")
        setIsFormLoading(false)
        return
    }
    try {
      await register(name, email, password)
    } catch (err: any) {
      setError(err.message) 
    } finally {
      setIsFormLoading(false)
    }
  }
  
  const handleGoogleLogin = async () => {
    setIsFormLoading(true)
    setError(null)
    try {
        await loginWithGoogle()
    } catch (err: any) {
        setError(err.message) 
    } finally {
        setIsFormLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-sm mx-auto shadow-2xl border-0">
      <CardHeader className="p-6">
        {/* ... (UI giữ nguyên) ... */}
        <CardTitle className="text-2xl font-bold text-center">
          {currentTab === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}
        </CardTitle>
        <CardDescription className="text-center">
          {currentTab === 'login' ? 'Đăng nhập để tiếp tục hành trình học tiếng Nhật' : 'Tham gia cùng cộng đồng học từ vựng ngay bây giờ!'}
        </CardDescription>
        <Button 
            variant="outline" 
            className="w-full mt-4 flex items-center"
            onClick={handleGoogleLogin}
            disabled={isFormLoading}
        >
            <FcGoogle className="h-5 w-5 mr-2" /> 
            Đăng nhập với Google
        </Button>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-0">
        <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-900 px-2 text-muted-foreground">
                    Hoặc dùng email
                </span>
            </div>
        </div>

        <Tabs defaultValue="login" className="w-full" onValueChange={(v) => {
            setCurrentTab(v as 'login' | 'register');
            setError(null);
        }}>
          <TabsList className="grid w-full grid-cols-2 h-10">
            <TabsTrigger value="login">Đăng nhập</TabsTrigger>
            <TabsTrigger value="register">Đăng ký</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="pt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder="tenban@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              
              {error && (
                <div className="text-red-600 text-sm text-center">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isFormLoading}>
                {isFormLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Đăng nhập'}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="register" className="pt-4">
            <form onSubmit={handleRegister} className="space-y-4">
              
              <div className="space-y-2">
                <Label htmlFor="register-name">Tên hiển thị</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="register-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    placeholder="Ví dụ: Sensei Ken"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="register-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder="tenban@example.com"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    placeholder="•••••••• (tối thiểu 6 ký tự)"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isFormLoading}>
                {isFormLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Đăng ký'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}