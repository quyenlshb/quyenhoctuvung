import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Separator } from '../ui/separator'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

type Props = {
  settings: {
    timer: number
    wordsPerSession: number
    dailyGoal: number
  }
  handleSettingChange: (key: keyof typeof settings, value: any) => void
  settings: any
}

export default function LearningTab({ settings, handleSettingChange }: any) {
  return (
    <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Cấu hình Bài học</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="words-per-session">Số từ mỗi phiên</Label>
          <Input
            id="words-per-session"
            type="number"
            value={settings.wordsPerSession}
            onChange={(e) => handleSettingChange('wordsPerSession', parseInt(e.target.value))}
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
            onChange={(e) => handleSettingChange('timer', parseInt(e.target.value))}
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
            onChange={(e) => handleSettingChange('dailyGoal', parseInt(e.target.value))}
            min={1}
          />
        </div>
      </CardContent>
    </Card>
  )
}
