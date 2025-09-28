import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs'
import { Separator } from '../components/ui/separator'
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

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleLogout = () => {
    logout()
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-full p-4 sm:p-6 max-w-3xl mx-auto space-y-8">
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="account">Tài khoản</TabsTrigger>
          <TabsTrigger value="learning">Học tập</TabsTrigger>
          <TabsTrigger value="notifications">Thông báo</TabsTrigger>
          <TabsTrigger value="appearance">Giao diện</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <AccountTab />
        </TabsContent>
        <TabsContent value="learning">
          <LearningTab settings={settings} onChange={handleSettingChange} />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsTab settings={settings} onChange={handleSettingChange} />
        </TabsContent>
        <TabsContent value="appearance">
          <AppearanceTab settings={settings} onChange={handleSettingChange} />
        </TabsContent>
      </Tabs>

      <Button
        variant="outline"
        className="w-full mt-6 bg-transparent hover:bg-red-50 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border-red-300 dark:border-red-700"
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Đăng xuất khỏi Nihongo Navigator
      </Button>
    </div>
  )
}
