// src/components/Shell.tsx
import { Outlet, Link } from 'react-router-dom';
import { LogOut, Home, Settings, Brain, BookOpen, BarChart3 } from 'lucide-react';
import { Button } from './ui/button'; // Sử dụng Button từ Shadcn

// Đây là một Layout đơn giản với Sidebar
export default function Shell() {
  // Lấy trạng thái Auth từ AuthProvider.tsx để biết đã đăng nhập hay chưa
  // const { user, logout } = useAuth(); 

  return (
    <div className="flex min-h-screen">
      {/* 1. Sidebar/Navigation */}
      <aside className="w-60 bg-gray-50 dark:bg-gray-800 p-4 border-r dark:border-gray-700 flex flex-col">
        <h2 className="text-xl font-bold mb-6 text-primary">Nihongo App</h2>
        <nav className="flex-1 space-y-2">
          <Button asChild variant="ghost" className="w-full justify-start">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" /> Trang chủ
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start">
            <Link to="/learn">
              <Brain className="mr-2 h-4 w-4" /> Chế độ Học
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start">
            <Link to="/vocabulary">
              <BookOpen className="mr-2 h-4 w-4" /> Quản lý Từ vựng
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start">
            <Link to="/statistics">
              <BarChart3 className="mr-2 h-4 w-4" /> Thống kê
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start">
            <Link to="/settings">
              <Settings className="mr-2 h-4 w-4" /> Cài đặt
            </Link>
          </Button>
        </nav>
        {/* Nút Đăng xuất */}
        <Button variant="outline" className="w-full mt-4 bg-transparent">
          <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
        </Button>
      </aside>

      {/* 2. Content Area (Nội dung của từng Route sẽ hiển thị ở đây) */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}