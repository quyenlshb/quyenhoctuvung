import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Switch } from "../../components/ui/switch"
import { Separator } from "../../components/ui/separator"
import { Bell } from "lucide-react"

export default function NotificationSettings() {
  const [settings, setSettings] = useState({
    reminderEnabled: true,
    reminderTime: "20:00",
    soundEnabled: true,
    vibrationEnabled: true,
  })

  const handleChange = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg mt-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="h-5 w-5 mr-2 text-secondary" /> Cài đặt Thông báo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="reminder-enabled">Nhắc nhở học hàng ngày</Label>
          <Switch
            id="reminder-enabled"
            checked={settings.reminderEnabled}
            onCheckedChange={(checked) => handleChange("reminderEnabled", checked)}
          />
        </div>
        {settings.reminderEnabled && (
          <div className="space-y-2">
            <Label htmlFor="reminder-time">Thời gian nhắc nhở</Label>
            <Input
              id="reminder-time"
              type="time"
              value={settings.reminderTime}
              onChange={(e) => handleChange("reminderTime", e.target.value)}
            />
          </div>
        )}
        <Separator />
        <div className="flex items-center justify-between">
          <Label htmlFor="sound-enabled">Âm thanh trong ứng dụng</Label>
          <Switch
            id="sound-enabled"
            checked={settings.soundEnabled}
            onCheckedChange={(checked) => handleChange("soundEnabled", checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="vibration-enabled">Rung (di động)</Label>
          <Switch
            id="vibration-enabled"
            checked={settings.vibrationEnabled}
            onCheckedChange={(checked) => handleChange("vibrationEnabled", checked)}
          />
        </div>
      </CardContent>
    </Card>
  )
}
