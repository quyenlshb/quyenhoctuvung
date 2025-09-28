import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

interface AccountTabProps {
  user: { name: string; email: string }
}

export function AccountTab({ user }: AccountTabProps) {
  return (
    <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Thông tin cá nhân</CardTitle>
        <CardDescription>Cập nhật tên và địa chỉ email của bạn.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Tên</Label>
          <Input id="name" defaultValue={user.name} disabled />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" defaultValue={user.email} type="email" disabled />
        </div>
      </CardContent>
    </Card>
  )
}
