import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

interface LearningTabProps {
  settings: any
  onChange: (key: string, value: any) => void
}

export function LearningTab({ settings, onChange }: LearningTabProps) {
  return (
    <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Cấu hình bài học</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="words-per-session">Số từ mỗi phiên</Label>
          <Input
            id="words-per-session"
            type="number"
            value={settings.wordsPerSession}
            onChange={e => onChange('wordsPerSession', parseInt(e.target.value))}
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
            onChange={e => onChange('timer', parseInt(e.target.value))}
            min={5}
            max={60}
          />
        </div>
      </CardContent>
    </Card>
  )
}
