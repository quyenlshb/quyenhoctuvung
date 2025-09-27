import { Dialog } from '../ui/dialog'
import { Button } from '../ui/button'
import { useAuth } from './index'
import { useState } from 'react'

export default function AuthModal() {
  const { showAuthForm, showAuthModal, login, register, loginWithGoogle } = useAuth()

  // State form
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  if (!showAuthForm) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isLogin) await login(email, password)
      else await register(name, email, password)
    } catch (err) {
      console.error(err)
      alert('Đã có lỗi xảy ra, vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={showAuthForm} onOpenChange={showAuthModal}>
      <div className="p-6 w-full max-w-sm bg-white dark:bg-gray-900 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">{isLogin ? 'Đăng nhập' : 'Đăng ký'}</h2>
        {!isLogin && (
          <input
            type="text"
            placeholder="Tên"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full mb-2 p-2 border rounded"
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />
        <Button onClick={handleSubmit} disabled={loading} className="w-full mb-2">
          {isLogin ? 'Đăng nhập' : 'Đăng ký'}
        </Button>
        <Button variant="outline" onClick={loginWithGoogle} className="w-full mb-2">
          Đăng nhập với Google
        </Button>
        <p className="text-sm text-center mt-2">
          {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}{' '}
          <button
            className="text-blue-500 underline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Đăng ký' : 'Đăng nhập'}
          </button>
        </p>
      </div>
    </Dialog>
  )
}
