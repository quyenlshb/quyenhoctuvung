// File: src/components/AuthProvider/AuthModal.tsx
import { Dialog, DialogContent } from '../ui/dialog'
import { DialogTitle } from '../ui/dialog-title'
import { VisuallyHidden } from '../ui/visually-hidden'
import { useAuth } from './index'
import AuthForm from './AuthForm'

interface AuthModalProps {
  showAuthForm: boolean
  setShowAuthForm: (visible: boolean) => void
}

export default function AuthModal({ showAuthForm, setShowAuthForm }: AuthModalProps) {
  const { user } = useAuth()

  return (
    <Dialog open={showAuthForm} onOpenChange={setShowAuthForm}>
      <DialogContent
        className="sm:max-w-[425px] p-0 border-none bg-transparent shadow-none"
        onPointerDownOutside={(e) => {
          const protectedRoutes = ['/learn', '/vocabulary', '/statistics', '/settings']
          if (protectedRoutes.includes(window.location.pathname) && !user) e.preventDefault()
        }}
      >
        <DialogTitle>
          <VisuallyHidden>Đăng nhập hoặc đăng ký</VisuallyHidden>
        </DialogTitle>
        <AuthForm />
      </DialogContent>
    </Dialog>
  )
}
