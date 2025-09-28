import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { useAuth } from "../../components/AuthProvider"

export default function AccountSettings() {
  const { user } = useAuth()

  if (!user) {
    return <p className="p-4">Đang tải thông tin tài khoản...</p>
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg mt-6">
      <CardHeader>
        <CardTitle>Thông tin Cá nhân</CardTitle>
        <CardDescription>Cập nhật tên và địa chỉ email của bạn.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Tên</Label>
          <Input
            id="name"
            defaultValue={user.name || ""}
            placeholder="Tên của bạn"
            disabled
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            defaultValue={user.email}
            placeholder="Email"
            type="email"
            disabled
          />
        </div>
      </CardContent>
    </Card>
  )
}
