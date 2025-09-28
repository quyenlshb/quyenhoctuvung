import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'

interface AppearanceTabProps {
  settings: any
  onChange: (key: string, value: any) => void
}

export function AppearanceTab({ settings, onChange }: AppearanceTabProps) {
  return (
    <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Giao diện</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="dark-mode">Chế độ tối</Label>
          <Switch
            id="dark-mode"
            checked={settings.darkMode}
            onCheckedChange={checked => onChange('darkMode', checked)}
          />
        </div>
      </CardContent>
    </Card>
  )
}
