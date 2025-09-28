import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Label } from "../../components/ui/label"
import { Switch } from "../../components/ui/switch"
import { Button } from "../../components/ui/button"
import { Sun, Moon } from "lucide-react"

export default function AppearanceSettings() {
  const [settings, setSettings] = useState({
    darkMode: false,
  })

  const toggleDarkMode = (checked: boolean) => {
    setSettings(prev => ({ ...prev, darkMode: checked }))
  }

  return (
    <div className="space-y-6 mt-6">
      <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sun className="h-5 w-5 mr-2 text-secondary" /> Tùy chỉnh Giao diện
          </CardTitle>
          <CardDescription>Chọn chế độ sáng hoặc tối.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode" className="flex items-center space-x-2">
              {settings.darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              <span>Chế độ Tối (Dark Mode)</span>
            </Label>
            <Switch
              id="dark-mode"
              checked={settings.darkMode}
              onCheckedChange={toggleDarkMode}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Kích thước chữ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full justify-start">Nhỏ</Button>
          <Button variant="outline" className="w-full justify-start">Vừa (mặc định)</Button>
          <Button variant="outline" className="w-full justify-start">Lớn</Button>
        </CardContent>
      </Card>
    </div>
  )
}
