/**
 * Statistics Page
 * Displays detailed learning progress, achievements, and analytics
 * UPDATED: Fetch user stats from Firestore
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Progress } from '../components/ui/progress'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { 
  TrendingUp, 
  Trophy, 
  Target, 
  Calendar, 
  Clock,
  Brain,
  BookOpen,
  Flame,
  Award,
  BarChart3,
  Loader2 // Icon cho trạng thái tải
} from 'lucide-react'

// 1. IMPORT CÁC THÀNH PHẦN FIREBASE & AUTH
import { useAuth } from '../components/AuthProvider'
// Giả định file firebase.ts nằm ở '../lib/firebase'
import { getUserStatistics } from '../lib/firebase' 

// 2. DEFINE INTERFACE VÀ INITIAL STATE
interface LearningSession {
  date: string
  wordsLearned: number
  points: number
  accuracy: number
  timeSpent: number // Giả định là phút hoặc giờ
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  progress?: number
  maxProgress?: number
}

// Interface cho dữ liệu thống kê người dùng từ Firestore
interface UserStatistics {
  totalPoints: number
  streak: number
  totalWordsLearned: number
  totalTimeSpent: number // Đơn vị: giờ
}

const INITIAL_STATS: UserStatistics = {
  totalPoints: 0,
  streak: 0,
  totalWordsLearned: 0,
  totalTimeSpent: 0,
}

export default function Statistics() {
  // Lấy user và trạng thái loading của Auth
  const { user, loading: authLoading } = useAuth()
  
  // State mới để lưu trữ dữ liệu từ Firestore
  const [stats, setStats] = useState<UserStatistics>(INITIAL_STATS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 3. LOGIC FETCH DỮ LIỆU TỪ FIRESTORE
  useEffect(() => {
    // Chỉ fetch nếu user đã có và Auth đã hoàn thành
    if (!user || authLoading) {
      if (!user && !authLoading) {
        setLoading(false) // Dừng loading nếu người dùng chưa đăng nhập
      }
      return // Chờ Auth hoàn thành
    }

    const loadUserStats = async () => {
      setLoading(true)
      setError(null)
      try {
        // Gọi hàm từ firebase.ts để lấy dữ liệu
        const userData = await getUserStatistics(user.id)
        
        if (userData) {
          // Ánh xạ dữ liệu từ Firestore vào state
          setStats({
            totalPoints: userData.totalPoints || 0,
            streak: userData.streak || 0,
            totalWordsLearned: userData.totalWordsLearned || 0,
            totalTimeSpent: userData.totalTimeSpent || 0, // Giả định đơn vị là giờ
          })
        } else {
          console.warn('Không tìm thấy thống kê cho người dùng:', user.id)
          setStats(INITIAL_STATS) 
        }

      } catch (e) {
        console.error('Lỗi khi tải thống kê người dùng:', e)
        setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại.')
        setStats(INITIAL_STATS)
      } finally {
        setLoading(false)
      }
    }

    loadUserStats()
  }, [user, authLoading])

  // Dữ liệu mock cho các thành phần chưa được tích hợp (ví dụ: LearningSession)
  const sessions: LearningSession[] = [
    { date: '2024-05-18', wordsLearned: 15, points: 50, accuracy: 0.85, timeSpent: 15 },
    { date: '2024-05-17', wordsLearned: 10, points: 30, accuracy: 0.90, timeSpent: 10 },
    { date: '2024-05-16', wordsLearned: 20, points: 70, accuracy: 0.78, timeSpent: 20 },
  ]
  
  // Dữ liệu mock cho thành tích
  const achievements: Achievement[] = [
    { id: '1', title: 'Học giả N5', description: 'Hoàn thành 100 từ N5.', icon: '🎓', unlocked: true },
    { id: '2', title: 'Cú đêm', description: 'Học liên tục 7 ngày.', icon: '🦉', unlocked: true },
    { id: '3', title: 'Chăm chỉ', description: 'Đạt 500 điểm.', icon: '💪', unlocked: false, progress: stats.totalPoints, maxProgress: 500 },
    { id: '4', title: 'Vua Từ', description: 'Học 500 từ.', icon: '👑', unlocked: false, progress: stats.totalWordsLearned, maxProgress: 500 },
  ]

  // RENDER DỰA TRÊN TRẠNG THÁI LOADING
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Đang tải thống kê...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8">
          <h2 className="text-xl font-bold text-destructive">Lỗi tải dữ liệu</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
      </div>
    )
  }

  if (!user && !loading) {
      return (
          <div className="text-center p-8">
              <h2 className="text-xl font-bold text-muted-foreground">Chưa đăng nhập</h2>
              <p className="text-gray-600 dark:text-gray-400">Vui lòng đăng nhập để xem thống kê học tập của bạn.</p>
          </div>
      )
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Thống kê Học tập của {user?.name || user?.email}</h1>
        
        {/* THẺ TỔNG QUAN (Sử dụng dữ liệu từ stats) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Tổng điểm */}
          <Card className="shadow-md transition-all duration-300 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng điểm</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPoints.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Điểm tích lũy</p>
            </CardContent>
          </Card>
          
          {/* Chuỗi ngày học (Streak) */}
          <Card className="shadow-md transition-all duration-300 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chuỗi ngày học</CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.streak} ngày</div>
              <p className="text-xs text-muted-foreground">Không bị gián đoạn</p>
            </CardContent>
          </Card>
          
          {/* Tổng từ đã học */}
          <Card className="shadow-md transition-all duration-300 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Từ đã học</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWordsLearned.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Tổng số từ</p>
            </CardContent>
          </Card>
          
          {/* Tổng thời gian */}
          <Card className="shadow-md transition-all duration-300 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng thời gian</CardTitle>
              <Clock className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTimeSpent.toFixed(1)} giờ</div>
              <p className="text-xs text-muted-foreground">Tổng thời gian học</p>
            </CardContent>
          </Card>
        </div>

        {/* TABS VIEW */}
        <Tabs defaultValue="sessions" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:w-fit">
            <TabsTrigger value="sessions">Phiên học</TabsTrigger>
            <TabsTrigger value="charts">Biểu đồ</TabsTrigger>
            <TabsTrigger value="achievements">Thành tích</TabsTrigger>
          </TabsList>
          
          {/* TAB: Phiên học */}
          <TabsContent value="sessions" className="mt-6 space-y-4">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Các phiên học gần đây</CardTitle>
                <CardDescription>Tổng quan về 3 phiên học cuối cùng của bạn</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sessions.map((session, index) => (
                    <div key={index} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium text-gray-800 dark:text-white">
                          Phiên học ngày {session.date}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {session.wordsLearned} từ | {session.timeSpent} phút
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                        {Math.round(session.accuracy * 100)}% Chính xác
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* TAB: Biểu đồ (Mock) */}
          <TabsContent value="charts" className="mt-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Biểu đồ Tiến độ</CardTitle>
                <CardDescription>Đây là nơi hiển thị biểu đồ về sự tiến bộ của bạn.</CardDescription>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground/50" />
                <p className="ml-4 text-lg text-muted-foreground">Đang phát triển...</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Thành tích */}
          <TabsContent value="achievements" className="mt-6 space-y-4">
            {/* Thành tích Đã mở khóa */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Đã mở khóa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {achievements.filter(a => a.unlocked).map((achievement) => (
                    <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-green-50/20 dark:bg-green-900/50 rounded-lg border border-green-500/50">
                      <span className="text-3xl">{achievement.icon}</span>
                      <div className="flex-1">
                        <p className="font-bold text-green-700 dark:text-green-300">{achievement.title}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Thành tích Đang tiến hành */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Đang tiến hành</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievements.filter(a => !a.unlocked && a.progress).map((achievement) => (
                    <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-2xl opacity-50">{achievement.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 dark:text-white">
                          {achievement.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {achievement.description}
                        </p>
                        <Progress 
                          value={(achievement.progress! / achievement.maxProgress!) * 100} 
                          className="h-2 mt-2" 
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {achievement.progress}/{achievement.maxProgress}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}