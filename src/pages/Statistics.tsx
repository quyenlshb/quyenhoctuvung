// src/pages/Statistics.tsx
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Progress } from '../components/ui/progress'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { 
  TrendingUp, Trophy, Target, Calendar, Clock, Brain, BookOpen, Flame, Award, BarChart3, Loader2 
} from 'lucide-react'

import { useAuth } from '../components/AuthProvider'
import { getUserStatistics, getLearningSessions } from '../lib/firebase' 
import type { LearningSessionHistory } from '../lib/firebase'

interface UserStats {
  totalPoints: number
  totalWordsLearned: number
  currentStreak: number
  bestStreak: number
  lastUpdated: string
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

const mockAchievements: Achievement[] = [
  { id: '1', title: 'Người học đầu tiên', description: 'Hoàn thành phiên học đầu tiên', icon: '⭐', unlocked: false, progress: 1, maxProgress: 1 },
  { id: '2', title: '100 từ vựng', description: 'Đã học được 100 từ', icon: '💯', unlocked: false, progress: 50, maxProgress: 100 },
  { id: '3', title: '5 ngày liên tục', description: 'Học liên tục trong 5 ngày', icon: '🔥', unlocked: false, progress: 3, maxProgress: 5 },
  { id: '4', title: 'Chính xác 90%', description: 'Đạt độ chính xác 90% trong 5 phiên học', icon: '🎯', unlocked: false, progress: 0, maxProgress: 5 },
  { id: '5', title: 'Hàng ngàn điểm', description: 'Đạt 1000 điểm tích lũy', icon: '🏆', unlocked: false, progress: 0, maxProgress: 1000 },
]

export function Statistics() {
  const { user } = useAuth()

  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [isStatsLoading, setIsStatsLoading] = useState(true)

  const [learningSessions, setLearningSessions] = useState<LearningSessionHistory[]>([])
  const [isSessionsLoading, setIsSessionsLoading] = useState(true)

  const [achievements, setAchievements] = useState(mockAchievements)

  useEffect(() => {
    if (!user?.id) return
    const loadUserStats = async () => {
      setIsStatsLoading(true)
      try {
        const statsData = await getUserStatistics(user.id)
        if (statsData) setUserStats(statsData as UserStats)
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setIsStatsLoading(false)
      }
    }
    loadUserStats()
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) return
    const fetchSessions = async () => {
      setIsSessionsLoading(true)
      try {
        const sessions = await getLearningSessions(user.id, 10)
        setLearningSessions(sessions)
      } catch (error) {
        console.error('Error loading learning sessions:', error)
      } finally {
        setIsSessionsLoading(false)
      }
    }
    fetchSessions()
  }, [user?.id])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="p-4 md:p-0">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">📊 Thống kê Học tập</h1>

      {isStatsLoading ? (
        <div className="flex justify-center items-center h-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Trophy className="h-5 w-5 text-yellow-500" />} title="Tổng điểm" value={userStats?.totalPoints || 0} />
          <StatCard icon={<Brain className="h-5 w-5 text-primary" />} title="Từ đã học" value={userStats?.totalWordsLearned || 0} />
          <StatCard icon={<Flame className="h-5 w-5 text-red-500" />} title="Streak hiện tại" value={userStats?.currentStreak || 0} />
          <StatCard icon={<Calendar className="h-5 w-5 text-green-500" />} title="Streak tốt nhất" value={userStats?.bestStreak || 0} />
        </div>
      )}

      <Tabs defaultValue="chart" className="w-full mt-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chart">Biểu đồ</TabsTrigger>
          <TabsTrigger value="history">Lịch sử</TabsTrigger>
          <TabsTrigger value="achievements">Thành tựu</TabsTrigger>
        </TabsList>

        <TabsContent value="chart" className="mt-4">
          <Card className="bg-white dark:bg-gray-800 shadow-lg p-6 min-h-[300px]">
            <CardTitle className="text-xl mb-4">Tiến trình học tập (7 ngày)</CardTitle>
            <div className="flex justify-center items-center h-40">
              <BarChart3 className="h-10 w-10 text-gray-400 opacity-50" />
              <p className="ml-4 text-gray-500">Biểu đồ đang được xây dựng...</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          {isSessionsLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-6 w-6 animate-spin mr-2 text-primary" />
              <p className="text-gray-500">Đang tải lịch sử phiên học...</p>
            </div>
          ) : learningSessions.length === 0 ? (
            <Card className="text-center p-6 bg-white/80 dark:bg-gray-800/80">
              <CardTitle className="text-lg">Chưa có phiên học nào</CardTitle>
              <CardDescription className="mt-2">
                Hãy bắt đầu học từ vựng để thấy lịch sử tiến trình của bạn ở đây!
              </CardDescription>
            </Card>
          ) : (
            <div className="space-y-4">
              {learningSessions.map((session, index) => (
                <Card key={session.id || index} className="bg-white dark:bg-gray-800 shadow-sm transition-shadow hover:shadow-md">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <Clock className="h-6 w-6 text-indigo-500" />
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">Phiên học ngày {formatDate(session.date)}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{session.wordsLearned} từ | {session.timeSpent}s</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">+{session.points} điểm</p>
                      <Badge variant="secondary" className="mt-1">{Math.round(session.accuracy * 100)}% Chính xác</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="achievements" className="mt-4">
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
                      <p className="font-medium text-gray-800 dark:text-white">{achievement.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{achievement.description}</p>
                      <Progress value={(achievement.progress! / achievement.maxProgress!) * 100} className="h-2 mt-2" />
                      <p className="text-xs text-gray-500 mt-1">{achievement.progress}/{achievement.maxProgress}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  title: string
  value: number
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value }) => (
  <Card className="text-center shadow-md bg-white dark:bg-gray-800">
    <CardContent className="p-4">
      <div className="flex items-center justify-center mb-2">{icon}</div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{title}</p>
    </CardContent>
  </Card>
)
