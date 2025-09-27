// File: src/components/AuthProvider/AuthForm.tsx
import { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Mail, Lock, User as UserIcon, Eye, EyeOff } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'
import { Loader2 } from 'lucide-react'
import { useAuth } from './index'

export default function AuthForm() {
  const { login, register, loginWithGoogle } = useAuth()
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
      setError('Vui lòng nhập tên.')
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
        <CardTitle className="text-2xl font-bold text-center">
          {currentTab === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}
        </CardTitle>
        <CardDescription className="text-center">
          {currentTab === 'login'
            ? 'Đăng nhập để tiếp tục hành trình học tiếng Nhật'
            : 'Tham gia cùng cộng đồng học từ vựng ngay bây giờ!'}
        </CardDescription>
        <Button variant="outline" className="w-full mt-4 flex items-center" onClick={handleGoogleLogin} disabled={isFormLoading}>
          <FcGoogle className="h-5 w-5 mr-2" /> Đăng nhập với Google
        </Button>
      </CardHeader>

      <CardContent className="px-6 pb-6 pt-0">
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-gray-900 px-2 text-muted-foreground">Hoặc dùng email</span>
          </div>
        </div>

        <Tabs defaultValue="login" className="w-full" onValueChange={(v) => { setCurrentTab(v as 'login' | 'register'); setError(null) }}>
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
                  <Input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" placeholder="tenban@example.com" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input id="login-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" placeholder="••••••••" required />
                  <button type="button" className="absolute right-3 top-3" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                  </button>
                </div>
              </div>

              {error && <div className="text-red-600 text-sm text-center">{error}</div>}

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
                  <Input id="register-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="pl-10" placeholder="Ví dụ: Sensei Ken" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input id="register-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" placeholder="tenban@example.com" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input id="register-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" placeholder="••••••••" required />
                  <button type="button" className="absolute right-3 top-3" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                  </button>
                </div>
              </div>

              {error && <div className="text-red-600 text-sm text-center">{error}</div>}

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
