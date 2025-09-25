
/**
 * Settings Page
 * Manages user preferences and learning configurations
 */

import { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Switch } from '../components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Separator } from '../components/ui/separator'
import { 
  Settings as SettingsIcon, 
  Timer, 
  Target, 
  Bell,
  Moon,
  Sun,
  LogOut,
  User
} from 'lucide-react'

export default function Settings() {
  const [settings, setSettings] = useState({
    timer: 15, // seconds per question
    wordsPerSession: 10,
    dailyGoal: 50,
    reminderEnabled: true,
    reminderTime: '20:00',
    soundEnabled: true,
    vibrationEnabled: true,
    darkMode: false
  })

  const [userInfo, setUserInfo] = useState({
    name: 'Người dùng',
    email: 'user@example.com'
  })

  useEffect(() => {
    // Load settings from localStorage or backend
    const savedSettings = localStorage.getItem('learningSettings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem('learningSettings', JSON.stringify(newSettings))
  }

  const handleLogout = () => {
    // In real app, this would call Firebase Auth signOut
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
      localStorage.removeItem('learningSettings')
      // Redirect to login page
      window.location.href = '/'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Cài đặt
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Tùy chỉnh trải nghiệm học tập của bạn
          </p>
        </div>

        {/* User info card */}
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-800 dark:text-white">
                  {userInfo.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {userInfo.email}
                </p>
              </div>
              <Button variant="ghost" size="icon">
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="learning" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="learning">Học tập</TabsTrigger>
            <TabsTrigger value="notifications">Thông báo</TabsTrigger>
            <TabsTrigger value="appearance">Giao diện</TabsTrigger>
          </TabsList>

          <TabsContent value="learning" className="space-y-4">
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Timer className="h-5 w-5 text-blue-500" />
                  <span>Thời gian</span>
                </CardTitle>
                <CardDescription>
                  Cài đặt thời gian cho mỗi câu hỏi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="timer">Thời gian mỗi câu (giây)</Label>
                  <Input
                    id="timer"
                    type="number"
                    min="5"
                    max="120"
                    value={settings.timer}
                    onChange={(e) => handleSettingChange('timer', parseInt(e.target.value))}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Mẹo: 15-30 giây là khoảng thời gian lý tưởng
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-green-500" />
                  <span>Mục tiêu học tập</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="wordsPerSession">Số từ mỗi phiên học</Label>
                  <Input
                    id="wordsPerSession"
                    type="number"
                    min="5"
                    max="50"
                    value={settings.wordsPerSession}
                    onChange={(e) => handleSettingChange('wordsPerSession', parseInt(e.target.value))}
                  />
                </div>
                <Separator />
                <div>
                  <Label htmlFor="dailyGoal">Mục tiêu hàng ngày (điểm)</Label>
                  <Input
                    id="dailyGoal"
                    type="number"
                    min="10"
                    max="200"
                    value={settings.dailyGoal}
                    onChange={(e) => handleSettingChange('dailyGoal', parseInt(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-yellow-500" />
                  <span>Nhắc nhở học tập</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Bật nhắc nhở hàng ngày</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Nhận thông báo nhắc học tập
                    </p>
                  </div>
                  <Switch
                    checked={settings.reminderEnabled}
                    onCheckedChange={(checked) => handleSettingChange('reminderEnabled', checked)}
                  />
                </div>
                
                {settings.reminderEnabled && (
                  <div>
                    <Label htmlFor="reminderTime">Giờ nhắc nhở</Label>
                    <Input
                      id="reminderTime"
                      type="time"
                      value={settings.reminderTime}
                      onChange={(e) => handleSettingChange('reminderTime', e.target.value)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Âm thanh & Rung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Âm thanh</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Phát âm thanh khi trả lời
                    </p>
                  </div>
                  <Switch
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) => handleSettingChange('soundEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Rung</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Rung khi có thông báo
                    </p>
                  </div>
                  <Switch
                    checked={settings.vibrationEnabled}
                    onCheckedChange={(checked) => handleSettingChange('vibrationEnabled', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4">
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {settings.darkMode ? (
                    <Moon className="h-5 w-5 text-indigo-500" />
                  ) : (
                    <Sun className="h-5 w-5 text-yellow-500" />
                  )}
                  <span>Chủ đề</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Chế độ tối</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Giảm mỏi mắt khi học ban đêm
                    </p>
                  </div>
                  <Switch
                    checked={settings.darkMode}
                    onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Kích thước chữ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <span className="text-sm">Nhỏ</span>
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <span className="text-base">Vừa (mặc định)</span>
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <span className="text-lg">Lớn</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Logout button */}
        <Button 
          variant="outline" 
          className="w-full mt-6 bg-transparent"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Đăng xuất
        </Button>
      </div>
    </div>
  )
}

