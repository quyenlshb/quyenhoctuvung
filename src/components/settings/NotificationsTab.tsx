import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'

interface NotificationsTabProps {
  settings: any
  onChange: (key: string, value: any) => void
}

export function NotificationsTab({ settings, onChange }: NotificationsTabProps) {
  return (
    <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Cài đặt thông báo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="reminder-enabled">Nhắc nhở học hàng ngày</Label>
          <Switch
            id="reminder-enabled"
            checked={settings.reminderEnabled}
            onCheckedChange={checked => onChange('reminderEnabled', checked)}
          />
        </div>
      </CardContent>
    </Card>
  )
}
