import { Card, CardContent } from '../components/ui/card';
import { useAuth } from '../components/AuthProvider';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-xl text-center shadow-lg transition-all duration-300 transform hover:scale-105">
        <CardContent className="p-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Chào mừng bạn đến với Ứng dụng Học tiếng Nhật
          </h1>
          {user ? (
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Chào mừng trở lại, **{user.name || user.email}**!
              <br />
              Hãy bắt đầu buổi học từ vựng ngay bây giờ.
            </p>
          ) : (
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Vui lòng đăng nhập hoặc đăng ký để bắt đầu hành trình học từ vựng của bạn.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}