import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Button } from '../components/ui/button'
import { LogOut } from 'lucide-react'
import { useAuth } from '../components/AuthProvider'

import AccountTab from '../components/settings/AccountTab'
import LearningTab from '../components/settings/LearningTab'
import NotificationsTab from '../components/settings/NotificationsTab'
import AppearanceTab from '../components/settings/AppearanceTab'

export default function Settings() {
  const { user, logout } = useAuth()

  const [settings, setSettings] = useState({
    timer: 15,
    wordsPerSession: 10,
    dailyGoal: 50,
    reminderEnabled: true,
    reminderTime: '20:00',
    soundEnabled: true,
    vibrationEnabled: true,
    darkMode: false
  })

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (!user) return <div>Đang tải cài đặt...</div>

  return (
    <div className="min-h-full p-4 sm:p-6 max-w-3xl mx-auto">
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="account">Tài khoản</TabsTrigger>
          <TabsTrigger value="learning">Học tập</TabsTrigger>
          <TabsTrigger value="notifications">Thông báo</TabsTrigger>
          <TabsTrigger value="appearance">Giao diện</TabsTrigger>
        </TabsList>

        <TabsContent value="account"><AccountTab /></TabsContent>
        <TabsContent value="learning"><LearningTab settings={settings} handleSettingChange={handleSettingChange} /></TabsContent>
        <TabsContent value="notifications"><NotificationsTab settings={settings} handleSettingChange={handleSettingChange} /></TabsContent>
        <TabsContent value="appearance"><AppearanceTab settings={settings} handleSettingChange={handleSettingChange} /></TabsContent>
      </Tabs>

      <Button
        variant="outline"
        className="w-full mt-6 bg-transparent hover:bg-red-50 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border-red-300 dark:border-red-700"
        onClick={logout}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Đăng xuất khỏi Nihongo Navigator
      </Button>
    </div>
  )
}
