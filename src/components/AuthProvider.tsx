/**
 * Firebase Authentication Provider
 * Integrated with Firebase Auth and Firestore for production deployment
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  User as UserIcon, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  LogOut
} from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'   
import { useNavigate } from 'react-router-dom'

// ⚡️ IMPORT HÀM FIREBASE THỰC TẾ
import { 
  auth, // Exported auth instance
  googleProvider,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  saveUserData, // Function to save user data to Firestore
  getUserData // Function to get user data from Firestore
} from '../lib/firebase' // Đảm bảo đường dẫn này là chính xác

interface User {
  id: string
  email: string
  name: string
  photoURL?: string
  totalPoints?: number
  streak?: number
  totalWordsLearned?: number
  totalTimeSpent?: number
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  googleSignIn: () => Promise<void>
  logout: () => void
  showAuthModal: (shouldShow: boolean) => void // Thêm hàm để điều khiển hiển thị Auth Modal
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAuth, setShowAuth] = useState(false) // State để hiển thị/ẩn Auth Modal

  // State cho Form
  const [activeTab, setActiveTab] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // 1. LẮNG NGHE TRẠNG THÁI XÁC THỰC FIREBASE
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Người dùng đã đăng nhập, tải dữ liệu Firestore
        const userData = await getUserData(firebaseUser.uid)
        
        const appUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: userData?.name || firebaseUser.displayName || 'Người dùng mới',
          photoURL: firebaseUser.photoURL || undefined,
          // Load other fields from Firestore if they exist, otherwise use default
          totalPoints: userData?.totalPoints || 0,
          streak: userData?.streak || 0,
          totalWordsLearned: userData?.totalWordsLearned || 0,
          totalTimeSpent: userData?.totalTimeSpent || 0,
        }
        setUser(appUser)
        setShowAuth(false) // Đóng modal khi đăng nhập thành công
        navigate('/') // Điều hướng về trang chủ
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // 2. HÀM LOGIN BẰNG EMAIL/PASSWORD
  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      // onAuthStateChanged sẽ xử lý cập nhật state (setUser)
    } catch (err: any) {
      const firebaseError = err.code || 'Lỗi không xác định'
      if (firebaseError === 'auth/invalid-credential') {
        setError('Email hoặc mật khẩu không đúng.')
      } else if (firebaseError === 'auth/user-not-found') {
        setError('Người dùng không tồn tại.')
      } else {
        setError(`Lỗi đăng nhập: ${firebaseError}`)
      }
      setLoading(false)
    }
  }

  // 3. HÀM ĐĂNG KÝ BẰNG EMAIL/PASSWORD
  const register = async (name: string, email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user
      
      // Khởi tạo hồ sơ người dùng trong Firestore
      const initialUserData = {
        name: name,
        email: email,
        createdAt: new Date(),
        totalPoints: 0,
        streak: 0,
        totalWordsLearned: 0,
        totalTimeSpent: 0,
        // ... các cài đặt mặc định khác
      }
      await saveUserData(firebaseUser.uid, initialUserData)

      // onAuthStateChanged sẽ xử lý cập nhật state (setUser)
    } catch (err: any) {
      const firebaseError = err.code || 'Lỗi không xác định'
      if (firebaseError === 'auth/email-already-in-use') {
        setError('Email này đã được sử dụng.')
      } else if (firebaseError === 'auth/weak-password') {
        setError('Mật khẩu phải có ít nhất 6 ký tự.')
      } else {
        setError(`Lỗi đăng ký: ${firebaseError}`)
      }
      setLoading(false)
    }
  }

  // 4. HÀM LOGIN BẰNG GOOGLE
  const googleSignIn = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const firebaseUser = result.user

      // Kiểm tra xem người dùng đã có data trong Firestore chưa
      const userData = await getUserData(firebaseUser.uid)

      if (!userData) {
        // Người dùng mới, tạo hồ sơ trong Firestore
        const initialUserData = {
          name: firebaseUser.displayName || 'Người dùng Google',
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || undefined,
          createdAt: new Date(),
          totalPoints: 0,
          streak: 0,
          totalWordsLearned: 0,
          totalTimeSpent: 0,
        }
        await saveUserData(firebaseUser.uid, initialUserData)
      }
      
      // onAuthStateChanged sẽ xử lý cập nhật state (setUser)
    } catch (err: any) {
      console.error('Google Sign-In Error:', err)
      setError('Đăng nhập bằng Google thất bại.')
      setLoading(false)
    }
  }

  // 5. HÀM LOGOUT
  const logout = () => {
    signOut(auth)
      .then(() => {
        setUser(null)
        navigate('/') // Điều hướng về trang chủ
      })
      .catch((err) => {
        console.error('Logout Error:', err)
      })
  }

  // Hàm hiển thị/ẩn Auth Modal
  const showAuthModal = (shouldShow: boolean) => {
    setShowAuth(shouldShow)
    setError(null) // Reset lỗi khi mở/đóng
  }
  
  const value = {
    user,
    loading,
    login,
    register,
    googleSignIn,
    logout,
    showAuthModal,
  }

  if (loading) {
    // Hiển thị Loading State khi kiểm tra trạng thái Auth lần đầu
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <p className="ml-3 text-lg text-primary">Đang tải...</p>
      </div>
    )
  }

  // Nếu người dùng KHÔNG đăng nhập, hiển thị giao diện Auth
  if (!user && showAuth) {
    return <AuthComponent 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      name={name} setName={setName} 
      email={email} setEmail={setEmail} 
      password={password} setPassword={setPassword}
      error={error} setError={setError}
      login={login}
      register={register}
      googleSignIn={googleSignIn}
      loading={loading}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
      setShowAuth={setShowAuth} // Truyền hàm đóng modal
    />
  }

  // Mọi thứ đã sẵn sàng, hiển thị các component con
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// =========================================================
// AUTH COMPONENT (Giao diện Login/Register)
// =========================================================

// Tách AuthComponent ra khỏi AuthProvider để làm cho code sạch hơn và dễ quản lý hơn
interface AuthComponentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  error: string | null;
  setError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  googleSignIn: () => Promise<void>;
  loading: boolean;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  setShowAuth: (show: boolean) => void;
}

const AuthComponent = ({
  activeTab,
  setActiveTab,
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  error,
  setError,
  login,
  register,
  googleSignIn,
  loading,
  showPassword,
  setShowPassword,
  setShowAuth
}: AuthComponentProps) => {
  
  // Xử lý đăng nhập
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.')
      return
    }
    login(email, password)
  }

  // Xử lý đăng ký
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password) {
      setError('Vui lòng nhập đầy đủ tên, email và mật khẩu.')
      return
    }
    register(name, email, password)
  }
  
  // Reset form khi chuyển tab
  useEffect(() => {
    setError(null)
    setEmail('')
    setPassword('')
    setName('')
  }, [activeTab])
  

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80">
      <Card className="w-full max-w-sm mx-auto shadow-2xl">
        <CardHeader className="p-6 pb-4">
          <div className="flex justify-between items-center">
             <CardTitle className="text-2xl font-bold">
               {activeTab === 'login' ? 'Đăng nhập' : 'Đăng ký'}
             </CardTitle>
             <Button variant="ghost" size="icon" onClick={() => setShowAuth(false)}>
                <LogOut className="h-4 w-4" />
             </Button>
          </div>
          <CardDescription>
            {activeTab === 'login' 
              ? 'Nhập email và mật khẩu để truy cập ứng dụng.'
              : 'Tạo tài khoản mới để bắt đầu học.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <Button 
            variant="outline" 
            className="w-full mb-4 flex items-center bg-white dark:bg-gray-800"
            onClick={googleSignIn}
            disabled={loading}
          >
            <FcGoogle className="h-5 w-5 mr-2" />
            {loading ? 'Đang tải...' : 'Đăng nhập bằng Google'}
          </Button>
          
          <div className="relative flex justify-center text-xs uppercase mb-6">
            <span className="bg-card px-2 text-muted-foreground">
              Hoặc tiếp tục bằng email
            </span>
          </div>

          <Tabs 
            value={activeTab} 
            onValueChange={(tab) => setActiveTab(tab)} 
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Đăng nhập</TabsTrigger>
              <TabsTrigger value="register">Đăng ký</TabsTrigger>
            </TabsList>
            
            {/* ======================= LOGIN TAB ======================= */}
            <TabsContent value="login" className="mt-0">
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
                      placeholder="email@example.com"
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

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </Button>
              </form>
            </TabsContent>

            {/* ======================= REGISTER TAB ======================= */}
            <TabsContent value="register" className="mt-0">
              <form onSubmit={handleRegister} className="space-y-4">
                 <div className="space-y-2">
                  <Label htmlFor="register-name">Tên của bạn</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="register-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      placeholder="Nguyễn Văn A"
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
                      placeholder="email@example.com"
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

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}