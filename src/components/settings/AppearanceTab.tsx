import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Switch } from '../ui/switch'
import { Sun, Moon } from 'lucide-react'
import { Label } from '../ui/label'

type Props = {
  settings: {
    darkMode: boolean
  }
  handleSettingChange: (key: keyof typeof settings, value: any) => void
}

export default function AppearanceTab({ settings, handleSettingChange }: any) {
  return (
    <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Tùy chỉnh Giao diện</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="dark-mode" className="flex items-center space-x-2">
            {settings.darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
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
  )
}
