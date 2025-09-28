import { Card, CardContent, CardHeader, CardTitle, Separator } from '../ui/card'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { Bell } from 'lucide-react'

interface SettingsProps {
  settings: any
  onChange: (key: string, value: any) => void
}

export default function NotificationsTab({ settings, onChange }: SettingsProps) {
  return (
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
          </Label>
          <Switch
            id="reminder-enabled"
            checked={settings.reminderEnabled}
            onCheckedChange={(checked) => onChange('reminderEnabled', checked)}
          />
        </div>
        {settings.reminderEnabled && (
          <div className="space-y-2">
            <Label htmlFor="reminder-time">Thời gian nhắc nhở</Label>
            <input
              id="reminder-time"
              type="time"
              value={settings.reminderTime}
              onChange={(e) => onChange('reminderTime', e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
        )}
        <Separator />
        <div className="flex items-center justify-between">
          <Label htmlFor="sound-enabled" className="flex flex-col space-y-1">
            <span>Âm thanh trong ứng dụng</span>
          </Label>
          <Switch
            id="sound-enabled"
            checked={settings.soundEnabled}
            onCheckedChange={(checked) => onChange('soundEnabled', checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="vibration-enabled" className="flex flex-col space-y-1">
            <span>Rung (chỉ dành cho thiết bị di động)</span>
          </Label>
          <Switch
            id="vibration-enabled"
            checked={settings.vibrationEnabled}
            onCheckedChange={(checked) => onChange('vibrationEnabled', checked)}
          />
        </div>
      </CardContent>
    </Card>
  )
}
