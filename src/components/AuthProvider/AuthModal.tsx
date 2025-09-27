import { FC } from 'react'
import { useAuth } from './index'
import AuthForm from './AuthForm'

interface Props {
  showAuthForm: boolean
  setShowAuthForm: (visible: boolean) => void
}

const AuthModal: FC<Props> = ({ showAuthForm, setShowAuthForm }) => {
  if (!showAuthForm) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md">
        <AuthForm />
        <button
          className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          onClick={() => setShowAuthForm(false)}
        >
          Đóng
        </button>
      </div>
    </div>
  )
}

export default AuthModal
