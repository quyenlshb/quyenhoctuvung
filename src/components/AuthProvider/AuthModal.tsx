// File: src/components/AuthProvider/AuthModal.tsx
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog'
import AuthForm from './AuthForm'

interface AuthModalProps {
  showAuthForm: boolean
  setShowAuthForm: (visible: boolean) => void
}

export default function AuthModal({ showAuthForm, setShowAuthForm }: AuthModalProps) {
  return (
    <Dialog open={showAuthForm} onOpenChange={setShowAuthForm}>
      <DialogContent
        className="sm:max-w-[425px] p-0 border-none bg-transparent shadow-none"
        onPointerDownOutside={(e) => {
          const protectedRoutes = ['/learn', '/vocabulary', '/statistics', '/settings']
          if (protectedRoutes.includes(window.location.pathname)) e.preventDefault()
        }}
      >
        <DialogTitle className="sr-only">Đăng nhập hoặc đăng ký</DialogTitle>
        <AuthForm />
      </DialogContent>
    </Dialog>
  )
}
