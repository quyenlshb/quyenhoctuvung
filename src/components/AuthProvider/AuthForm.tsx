import { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs'
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'
import { useAuthProvider } from './index'

export default function AuthForm() {
  const { login, register, loginWithGoogle } = useAuthProvider()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [currentTab, setCurrentTab] = useState<'login' | 'register'>('login')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try { await login(email, password) } catch(err:any){ setError(err.message) }
    setLoading(false)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if(!name.trim()){ setError("Vui lòng nhập tên"); return }
    setLoading(true)
    setError(null)
    try { await register(name, email, password) } catch(err:any){ setError(err.message) }
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)
    try { await loginWithGoogle() } catch(err:any){ setError(err.message) }
    setLoading(false)
  }

  return (
    <div className="p-6">
      <Button variant="outline" className="w-full mb-4 flex items-center" onClick={handleGoogleLogin} disabled={loading}>
        <FcGoogle className="h-5 w-5 mr-2" /> Đăng nhập với Google
      </Button>
      <div className="text-center text-sm mb-4">Hoặc dùng email</div>

      <Tabs value={currentTab} onValueChange={(v)=>{setCurrentTab(v as any); setError(null)}}>
        <TabsList className="grid grid-cols-2 h-10">
          <TabsTrigger value="login">Đăng nhập</TabsTrigger>
          <TabsTrigger value="register">Đăng ký</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <form onSubmit={handleLogin} className="space-y-4">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
            <Label>Mật khẩu</Label>
            <div className="relative">
              <Input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} required />
              <button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2">
                {showPassword?<EyeOff/>:<Eye/>}
              </button>
            </div>
            {error && <div className="text-red-600">{error}</div>}
            <Button type="submit" disabled={loading}>{loading?<Loader2 className="animate-spin"/>:'Đăng nhập'}</Button>
          </form>
        </TabsContent>

        <TabsContent value="register">
          <form onSubmit={handleRegister} className="space-y-4">
            <Label>Tên hiển thị</Label>
            <Input type="text" value={name} onChange={e=>setName(e.target.value)} required />
            <Label>Email</Label>
            <Input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
            <Label>Mật khẩu</Label>
            <div className="relative">
              <Input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} required />
              <button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2">
                {showPassword?<EyeOff/>:<Eye/>}
              </button>
            </div>
            {error && <div className="text-red-600">{error}</div>}
            <Button type="submit" disabled={loading}>{loading?<Loader2 className="animate-spin"/>:'Đăng ký'}</Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}
