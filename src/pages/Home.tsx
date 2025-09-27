import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { useAuth } from '../components/AuthProvider'
import { getVocabularySets } from '../lib/firebase'
import VocabularyManager from '../components/VocabularyManager' // Default import

export const Home: React.FC = () => {
  const { user, showAuthModal } = useAuth()
  const navigate = useNavigate()
  const [sets, setSets] = useState<any[]>([])

  useEffect(() => {
    if (!user) return
    const fetchSets = async () => {
      const data = await getVocabularySets(user.id)
      setSets(data)
    }
    fetchSets()
  }, [user])

  return (
    <div className="flex flex-col min-h-screen p-4 bg-gray-50 dark:bg-gray-900 space-y-6">
      {/* Card chào mừng */}
      <Card className="w-full max-w-xl mx-auto text-center shadow-lg transition-all duration-300 transform hover:scale-105">
        <CardContent className="p-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Chào mừng bạn đến với Ứng dụng Học tiếng Nhật
          </h1>
          {user ? (
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Chào mừng trở lại, <strong>{user.name || user.email}</strong>!
              <br />
              Hãy bắt đầu buổi học từ vựng ngay bây giờ.
            </p>
          ) : (
            <>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Vui lòng đăng nhập hoặc đăng ký để bắt đầu hành trình học từ vựng của bạn.
              </p>
              <Button className="mt-4" onClick={() => showAuthModal(true)}>
                Đăng nhập
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Nếu người dùng đã login, hiển thị VocabularyManager */}
      {user && sets.length > 0 && (
        <VocabularyManager />
      )}

      {/* Thông báo nếu chưa có bộ từ */}
      {user && sets.length === 0 && (
        <p className="text-gray-600 dark:text-gray-400 mt-4 text-center">
          Bạn chưa có bộ từ nào. Vui lòng tạo trong{' '}
          <span
            className="text-primary cursor-pointer"
            onClick={() => navigate('/vocabulary')}
          >
            Quản lý Từ vựng
          </span>
          .
        </p>
      )}
    </div>
  )
}
