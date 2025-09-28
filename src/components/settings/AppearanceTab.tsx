import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { Sun, Moon } from 'lucide-react'

interface SettingsProps {
  settings: any
  onChange: (key: string, value: any) => void
}

export default function AppearanceTab({ settings, onChange }: SettingsProps) {
  return (
    <>
      <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            {settings.darkMode ? <Moon className="h-5 w-5 mr-2" /> : <Sun className="h-5 w-5 mr-2" />}
            Tùy chỉnh Giao diện
          </CardTitle>
          <CardDescription>Thay đổi giao diện ứng dụng giữa Sáng và Tối.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode" className="flex items-center space-x-2">
              <span>Chế độ Tối (Dark Mode)</span>
            </Label>
            <Switch
              id="dark-mode"
              checked={settings.darkMode}
              onCheckedChange={(checked) => onChange('darkMode', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </>
  )
}
