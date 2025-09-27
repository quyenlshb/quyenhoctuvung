import { Dialog, DialogContent } from '../ui/dialog'
import { DialogTitle } from '../ui/DialogTitle'
import { VisuallyHidden } from '../ui/visually-hidden'
import { Auth } from './Auth'
import type { AuthContextType } from './AuthContext'

export function AuthModal({ showAuthForm, setShowAuthForm }: { showAuthForm:boolean, setShowAuthForm:(v:boolean)=>void }) {
  return (
    <Dialog open={showAuthForm} onOpenChange={setShowAuthForm}>
      <DialogContent className="sm:max-w-[425px] p-0 border-none bg-transparent shadow-none">
        <DialogTitle>
          <VisuallyHidden>Đăng nhập hoặc đăng ký</VisuallyHidden>
        </DialogTitle>
        <Auth />
      </DialogContent>
    </Dialog>
  )
}
