// File: src/components/AuthProvider/AuthModal.tsx
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '../ui/dialog' // ✅ Sửa đường dẫn
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { useAuth } from './index'

export default function AuthModal() {
  const { showAuthForm, showAuthModal, login, register, loginWithGoogle } = useAuth()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const handleSubmit = async () => {
    if (isRegister) {
      await register(name, email, password)
    } else {
      await login(email, password)
    }
  }

  if (!showAuthForm) return null

  return (
    <Dialog open={showAuthForm} onOpenChange={showAuthModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isRegister ? 'Đăng ký' : 'Đăng nhập'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {isRegister && (
            <Input
              placeholder="Tên"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder="Mật khẩu"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <DialogFooter className="flex flex-col space-y-2">
          <Button onClick={handleSubmit} className="w-full">
            {isRegister ? 'Đăng ký' : 'Đăng nhập'}
          </Button>
          {!isRegister && (
            <Button onClick={loginWithGoogle} variant="outline" className="w-full">
              Đăng nhập với Google
            </Button>
          )}
          <Button
            variant="link"
            onClick={() => setIsRegister(!isRegister)}
            className="text-sm"
          >
            {isRegister ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
