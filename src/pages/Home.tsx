import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { useAuth } from '../components/AuthProvider'
import { getVocabularySets } from '../lib/firebase'

export default function Home() {
  const { user, showAuthModal } = useAuth() // Lấy showAuthModal
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
    <div className="flex flex-col items-center justify-start min-h-screen p-4 bg-gray-50 dark:bg-gray-900 space-y-6">
      {/* Card chào mừng */}
      <Card className="w-full max-w-xl text-center shadow-lg transition-all duration-300 transform hover:scale-105">
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

      {/* Danh sách bộ từ */}
      {user && sets.length > 0 && (
        <div className="w-full max-w-4xl grid gap-4 md:grid-cols-2">
          {sets.map(set => (
            <Card key={set.id} className="flex flex-col justify-between shadow-md">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  {set.name}
                  <Badge variant="secondary">{set.totalWords || 0} từ</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col justify-between mt-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">{set.description}</p>
                <Button className="mt-3" onClick={() => navigate(`/learn/${set.id}`)}>
                  Học bộ từ này
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Thông báo nếu chưa có bộ từ */}
      {user && sets.length === 0 && (
        <p className="text-gray-600 dark:text-gray-400 mt-4">
          Bạn chưa có bộ từ nào. Vui lòng tạo trong{' '}
          <span className="text-primary cursor-pointer" onClick={() => navigate('/vocabulary')}>
            Quản lý Từ vựng
          </span>.
        </p>
      )}
    </div>
  )
}
