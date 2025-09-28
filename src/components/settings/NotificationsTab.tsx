import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Separator } from '../ui/separator'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'

type Props = {
  settings: {
    reminderEnabled: boolean
    reminderTime: string
    soundEnabled: boolean
    vibrationEnabled: boolean
  }
  handleSettingChange: (key: keyof typeof settings, value: any) => void
}

export default function NotificationsTab({ settings, handleSettingChange }: any) {
  return (
    <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Cài đặt Thông báo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="reminder-enabled" className="flex flex-col space-y-1">
            <span>Nhắc nhở học hàng ngày</span>
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
            <input
              id="reminder-time"
              type="time"
              value={settings.reminderTime}
              onChange={(e) => handleSettingChange('reminderTime', e.target.value)}
              className="border rounded px-2 py-1 w-full"
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
            onCheckedChange={(checked) => handleSettingChange('soundEnabled', checked)}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="vibration-enabled" className="flex flex-col space-y-1">
            <span>Rung (chỉ dành cho thiết bị di động)</span>
          </Label>
          <Switch
            id="vibration-enabled"
            checked={settings.vibrationEnabled}
            onCheckedChange={(checked) => handleSettingChange('vibrationEnabled', checked)}
          />
        </div>
      </CardContent>
    </Card>
  )
}
