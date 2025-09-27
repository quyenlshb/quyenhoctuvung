import { Dialog, DialogContent, DialogTitle } from '../ui/dialog'
import AuthForm from './AuthForm'

interface Props {
  showAuthForm: boolean
  setShowAuthForm: (visible: boolean) => void
}

export default function AuthModal({ showAuthForm, setShowAuthForm }: Props) {
  return (
    <Dialog open={showAuthForm} onOpenChange={setShowAuthForm}>
      <DialogContent className="sm:max-w-[425px] p-0 border-none bg-transparent shadow-none">
        <DialogTitle>
          <span className="sr-only">Đăng nhập hoặc đăng ký</span>
        </DialogTitle>
        <AuthForm />
      </DialogContent>
    </Dialog>
  )
}
