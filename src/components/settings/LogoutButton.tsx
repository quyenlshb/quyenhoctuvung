import { Button } from "../../components/ui/button"
import { LogOut } from "lucide-react"

interface LogoutButtonProps {
  onLogout: () => void
}

export default function LogoutButton({ onLogout }: LogoutButtonProps) {
  return (
    <Button
      variant="outline"
      className="w-full mt-6 bg-transparent hover:bg-red-50 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border-red-300 dark:border-red-700"
      onClick={onLogout}
    >
      <LogOut className="h-4 w-4 mr-2" />
      Đăng xuất khỏi Nihongo Navigator
    </Button>
  )
}
