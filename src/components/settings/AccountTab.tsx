import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { useAuth } from '../AuthProvider'

export default function AccountTab() {
  const { user } = useAuth()

  if (!user) return <div>Đang tải thông tin người dùng...</div>

  return (
    <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Thông tin Cá nhân</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Tên</Label>
          <Input id="name" defaultValue={user.name || ''} placeholder="Tên của bạn" disabled />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" defaultValue={user.email} type="email" placeholder="Email" disabled />
        </div>
      </CardContent>
    </Card>
  )
}
