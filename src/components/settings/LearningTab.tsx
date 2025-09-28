import { Card, CardContent, CardHeader, CardTitle, Separator } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Timer } from 'lucide-react'

interface SettingsProps {
  settings: any
  onChange: (key: string, value: any) => void
}

export default function LearningTab({ settings, onChange }: SettingsProps) {
  return (
    <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Timer className="h-5 w-5 mr-2 text-secondary" /> Cấu hình Bài học
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="words-per-session">Số từ mỗi phiên</Label>
          <Input
            id="words-per-session"
            type="number"
            value={settings.wordsPerSession}
            onChange={(e) => onChange('wordsPerSession', parseInt(e.target.value))}
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
            onChange={(e) => onChange('timer', parseInt(e.target.value))}
            min={0}
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
            onChange={(e) => onChange('dailyGoal', parseInt(e.target.value))}
            min={1}
          />
        </div>
      </CardContent>
    </Card>
  )
}
