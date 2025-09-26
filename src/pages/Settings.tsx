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

// ✅ IMPORT useAuth
import { useAuth } from '../components/AuthProvider'

export default function Settings() {
  // ✅ LẤY THÔNG TIN USER VÀ HÀM LOGOUT TỪ AUTH CONTEXT
  const { user, logout } = useAuth()
  
  const [settings, setSettings] = useState({
    timer: 15, // seconds per question
    wordsPerSession: 10,
    dailyGoal: 50,
    reminderEnabled: true,
    reminderTime: '20:00',
    soundEnabled: true,
    vibrationEnabled: true,
    darkMode: false // Sẽ sử dụng theme context nếu có
  })

  // ✅ BỎ userInfo vì đã dùng user từ AuthContext
  // const [userInfo, setUserInfo] = useState({
  //   name: 'Người dùng',
  //   email: 'user@example.com'
  // })

  useEffect(() => {
    // Load settings from localStorage or backend
    // Ví dụ:
    // const savedSettings = JSON.parse(localStorage.getItem('userSettings') || '{}')
    // setSettings(prev => ({...prev, ...savedSettings}))
  }, [])
  
  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    // Lưu cài đặt vào backend/localStorage
    // saveSettingsToBackend({...settings, [key]: value})
  }

  const handleLogout = () => {
    logout() // Gọi hàm logout từ AuthProvider
  }
  
  // Hiển thị loading/placeholder nếu user chưa load
  if (!user) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <p className="ml-3 text-lg text-primary">Đang tải cài đặt...</p>
      </div>
    )
  }

  return (
    <div className="min-h-full p-4 sm:p-6 max-w-3xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <SettingsIcon className="h-6 w-6 mr-2 text-primary" /> Cài đặt ứng dụng
        </h1>
        <p className="text-muted-foreground mt-1">Quản lý tài khoản và tùy chỉnh trải nghiệm học tập của bạn.</p>
      </header>

      <div className="space-y-8">
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-4">
            <TabsTrigger value="account">Tài khoản</TabsTrigger>
            <TabsTrigger value="learning">Học tập</TabsTrigger>
            <TabsTrigger value="notifications">Thông báo</TabsTrigger>
            <TabsTrigger value="appearance">Giao diện</TabsTrigger>
          </TabsList>
          
          {/* ====================== TÀI KHOẢN ====================== */}
          <TabsContent value="account" className="mt-6">
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Thông tin Cá nhân</CardTitle>
                <CardDescription>Cập nhật tên và địa chỉ email của bạn.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên</Label>
                  <Input 
                    id="name" 
                    defaultValue={user.name || ''} 
                    placeholder="Tên của bạn"
                    disabled // Giả định việc đổi tên sẽ được xử lý qua form riêng
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    defaultValue={user.email} 
                    placeholder="Email"
                    type="email"
                    disabled // Email thường không được đổi
                  />
                </div>
                {/* <Button>Lưu Thay Đổi</Button> */}
              </CardContent>
            </Card>
            
            {/* Logout button - Đã chuyển xuống cuối cùng, nhưng giữ lại nếu muốn có trong tab */}
            {/* <Button 
              variant="outline" 
              className="w-full mt-6 bg-transparent"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Đăng xuất
            </Button> */}
          </TabsContent>
          
          {/* ====================== HỌC TẬP ====================== */}
          <TabsContent value="learning" className="mt-6 space-y-6">
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Timer className="h-5 w-5 mr-2 text-secondary" /> Cấu hình Bài học
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="words-per-session">Số từ mỗi phiên</Label>
                  <Input
                    id="words-per-session"
                    type="number"
                    value={settings.wordsPerSession}
                    onChange={(e) => handleSettingChange('wordsPerSession', parseInt(e.target.value))}
                    min={5}
                    max={50}
                  />
                  <p className="text-xs text-muted-foreground">Số lượng từ vựng bạn sẽ học trong mỗi phiên.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timer">Giới hạn thời gian mỗi câu (giây)</Label>
                  <Input
                    id="timer"
                    type="number"
                    value={settings.timer}
                    onChange={(e) => handleSettingChange('timer', parseInt(e.target.value))}
                    min={5}
                    max={60}
                  />
                  <p className="text-xs text-muted-foreground">Đặt thành 0 để không giới hạn thời gian.</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="daily-goal">Mục tiêu từ vựng hàng ngày</Label>
                  <Input
                    id="daily-goal"
                    type="number"
                    value={settings.dailyGoal}
                    onChange={(e) => handleSettingChange('dailyGoal', parseInt(e.target.value))}
                    min={1}
                  />
                  <p className="text-xs text-muted-foreground">Số từ bạn muốn học hoặc ôn tập mỗi ngày.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* ====================== THÔNG BÁO ====================== */}
          <TabsContent value="notifications" className="mt-6 space-y-6">
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-secondary" /> Cài đặt Thông báo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="reminder-enabled" className="flex flex-col space-y-1">
                    <span>Nhắc nhở học hàng ngày</span>
                    <span className="font-normal text-muted-foreground">Nhận thông báo để duy trì streak.</span>
                  </Label>
                  <Switch
                    id="reminder-enabled"
                    checked={settings.reminderEnabled}
                    onCheckedChange={(checked) => handleSettingChange('reminderEnabled', checked)}
                  />
                </div>
                {settings.reminderEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor="reminder-time">Thời gian nhắc nhở</Label>
                    <Input
                      id="reminder-time"
                      type="time"
                      value={settings.reminderTime}
                      onChange={(e) => handleSettingChange('reminderTime', e.target.value)}
                    />
                  </div>
                )}
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor="sound-enabled" className="flex flex-col space-y-1">
                    <span>Âm thanh trong ứng dụng</span>
                    <span className="font-normal text-muted-foreground">Bật/tắt âm thanh phản hồi.</span>
                  </Label>
                  <Switch
                    id="sound-enabled"
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) => handleSettingChange('soundEnabled', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="vibration-enabled" className="flex flex-col space-y-1">
                    <span>Rung (chỉ dành cho thiết bị di động)</span>
                    <span className="font-normal text-muted-foreground">Phản hồi rung cho các hành động quan trọng.</span>
                  </Label>
                  <Switch
                    id="vibration-enabled"
                    checked={settings.vibrationEnabled}
                    onCheckedChange={(checked) => handleSettingChange('vibrationEnabled', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ====================== GIAO DIỆN ====================== */}
          <TabsContent value="appearance" className="mt-6 space-y-6">
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sun className="h-5 w-5 mr-2 text-secondary" /> Tùy chỉnh Giao diện
                </CardTitle>
                <CardDescription>Thay đổi giao diện ứng dụng giữa Sáng và Tối.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="dark-mode" className="flex items-center space-x-2">
                    {settings.darkMode ? (
                      <Moon className="h-5 w-5" />
                    ) : (
                      <Sun className="h-5 w-5" />
                    )}
                    <span>Chế độ Tối (Dark Mode)</span>
                  </Label>
                  <Switch
                    id="dark-mode"
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
        
        {/* Logout button chính (sau tất cả các tab) */}
        <Button 
          variant="outline" 
          className="w-full mt-6 bg-transparent hover:bg-red-50 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border-red-300 dark:border-red-700"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Đăng xuất khỏi Nihongo Navigator
        </Button>
      </div>
    </div>
  )
}