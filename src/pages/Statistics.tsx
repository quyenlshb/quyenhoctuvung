
/**
 * Statistics Page
 * Displays detailed learning progress, achievements, and analytics
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
  BarChart3
} from 'lucide-react'

interface LearningSession {
  date: string
  wordsLearned: number
  points: number
  accuracy: number
  timeSpent: number
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

export default function Statistics() {
  const [totalPoints, setTotalPoints] = useState<number>(1250)
  const [streak, setStreak] = useState<number>(12)
  const [totalWordsLearned, setTotalWordsLearned] = useState<number>(180)
  const [totalTimeSpent, setTotalTimeSpent] = useState<number>(480) // minutes
  const [weeklyProgress, setWeeklyProgress] = useState<number>(75)
  
  const [learningSessions, setLearningSessions] = useState<LearningSession[]>([
    { date: '2024-01-22', wordsLearned: 15, points: 120, accuracy: 85, timeSpent: 25 },
    { date: '2024-01-21', wordsLearned: 12, points: 90, accuracy: 78, timeSpent: 20 },
    { date: '2024-01-20', wordsLearned: 18, points: 150, accuracy: 92, timeSpent: 30 },
    { date: '2024-01-19', wordsLearned: 10, points: 80, accuracy: 72, timeSpent: 18 },
    { date: '2024-01-18', wordsLearned: 14, points: 110, accuracy: 88, timeSpent: 22 },
    { date: '2024-01-17', wordsLearned: 16, points: 130, accuracy: 90, timeSpent: 28 },
    { date: '2024-01-16', wordsLearned: 8, points: 60, accuracy: 65, timeSpent: 15 }
  ])

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'Người mới bắt đầu',
      description: 'Hoàn thành phiên học đầu tiên',
      icon: '🎯',
      unlocked: true
    },
    {
      id: '2',
      title: 'Chuỗi 7 ngày',
      description: 'Học tập liên tục 7 ngày',
      icon: '🔥',
      unlocked: true
    },
    {
      id: '3',
      title: 'Bậc thầy từ vựng',
      description: 'Học 100 từ vựng',
      icon: '📚',
      unlocked: false,
      progress: 80,
      maxProgress: 100
    },
    {
      id: '4',
      title: 'Chuẩn xác 90%',
      description: 'Đạt độ chính xác 90% trong 1 phiên',
      icon: '🎖️',
      unlocked: false,
      progress: 85,
      maxProgress: 90
    },
    {
      id: '5',
      title: 'Siêu não',
      description: 'Học 500 từ vựng',
      icon: '🧠',
      unlocked: false,
      progress: 180,
      maxProgress: 500
    }
  ])

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-green-600'
    if (accuracy >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Thống kê học tập
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Theo dõi tiến trình và thành tích của bạn
          </p>
        </div>

        {/* Overview cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardDescription className="text-sm">Tổng điểm</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="text-2xl font-bold text-gray-800 dark:text-white">
                  {totalPoints}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardDescription className="text-sm">Chuỗi ngày</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="text-2xl font-bold text-gray-800 dark:text-white">
                  {streak}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardDescription className="text-sm">Từ vựng đã học</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                <span className="text-2xl font-bold text-gray-800 dark:text-white">
                  {totalWordsLearned}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardDescription className="text-sm">Thời gian học</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-purple-500" />
                <span className="text-2xl font-bold text-gray-800 dark:text-white">
                  {formatTime(totalTimeSpent)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="progress" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="progress">Tiến trình</TabsTrigger>
            <TabsTrigger value="sessions">Phiên học</TabsTrigger>
            <TabsTrigger value="achievements">Thành tích</TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="space-y-4">
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-indigo-500" />
                  <span>Tuần này</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-300">
                        Hoàn thành mục tiêu
                      </span>
                      <span className="font-medium">{weeklyProgress}%</span>
                    </div>
                    <Progress value={weeklyProgress} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-600">42</p>
                      <p className="text-xs text-gray-500">Từ học</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">82%</p>
                      <p className="text-xs text-gray-500">Độ chính xác</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-purple-600">6</p>
                      <p className="text-xs text-gray-500">Ngày</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Thống kê theo trình độ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">N5 (Cơ bản)</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={70} className="w-20 h-2" />
                      <span className="text-sm font-medium">70%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">N4 (Trung cấp)</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={30} className="w-20 h-2" />
                      <span className="text-sm font-medium">30%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">N3 (Nâng cao)</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={5} className="w-20 h-2" />
                      <span className="text-sm font-medium">5%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-4">
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Lịch sử phiên học</CardTitle>
                <CardDescription>
                  7 ngày gần nhất
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {learningSessions.map((session, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">
                          {formatDate(session.date)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {session.wordsLearned} từ • {formatTime(session.timeSpent)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">{session.points} điểm</p>
                        <p className={`text-sm ${getAccuracyColor(session.accuracy)}`}>
                          {session.accuracy}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <span>Thành tích đã đạt được</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievements.filter(a => a.unlocked).map((achievement) => (
                    <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 dark:text-white">
                          {achievement.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {achievement.description}
                        </p>
                      </div>
                      <Trophy className="h-5 w-5 text-yellow-500" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
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

