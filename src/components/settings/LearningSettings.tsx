import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Separator } from "../../components/ui/separator"
import { Timer } from "lucide-react"

export default function LearningSettings() {
  const [settings, setSettings] = useState({
    wordsPerSession: 10,
    timer: 15,
    dailyGoal: 50,
  })

  const handleChange = (key: keyof typeof settings, value: number) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg mt-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Timer className="h-5 w-5 mr-2 text-secondary" /> Cấu hình Bài học
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="words-per-session">Số từ mỗi phiên</Label>
          <Input
            id="words-per-session"
            type="number"
            value={settings.wordsPerSession}
            onChange={(e) => handleChange("wordsPerSession", parseInt(e.target.value))}
            min={5}
            max={50}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timer">Giới hạn thời gian mỗi câu (giây)</Label>
          <Input
            id="timer"
            type="number"
            value={settings.timer}
            onChange={(e) => handleChange("timer", parseInt(e.target.value))}
            min={5}
            max={60}
          />
        </div>
        <Separator />
        <div className="space-y-2">
          <Label htmlFor="daily-goal">Mục tiêu từ vựng hàng ngày</Label>
          <Input
            id="daily-goal"
            type="number"
            value={settings.dailyGoal}
            onChange={(e) => handleChange("dailyGoal", parseInt(e.target.value))}
            min={1}
          />
        </div>
      </CardContent>
    </Card>
  )
}
