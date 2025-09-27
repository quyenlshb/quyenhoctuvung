import { Dialog } from './ui/dialog'
import { useState } from 'react'

export function AuthModal({ showAuthForm, setShowAuthForm }: { showAuthForm: boolean, setShowAuthForm: (v: boolean) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (!showAuthForm) return null

  return (
    <Dialog open={showAuthForm} onOpenChange={setShowAuthForm}>
      <h2>Đăng nhập</h2>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mật khẩu" />
      <button>Đăng nhập</button>
    </Dialog>
  )
}
