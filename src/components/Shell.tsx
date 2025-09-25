import { Outlet, Link } from 'react-router-dom';
import { LogOut, Home, Settings, Brain, BookOpen, BarChart3, Menu, X } from 'lucide-react';
import { useState } from 'react';
// Imports các component UI (Tất cả đều có trong UI của bạn)
import { Button } from './ui/button';
import { useAuth } from './AuthProvider'; // Dùng AuthContext của bạn
import { useIsMobile } from '../use-mobile'; // Dùng hook kiểm tra mobile của bạn

export default function Shell() {
  const { user, logout, showAuthModal } = useAuth(); 
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Hàm xử lý Đăng xuất
  const handleLogout = () => {
    logout(); 
    // Có thể thêm logic điều hướng về trang chủ sau khi đăng xuất
  };
  
  // Danh sách các mục điều hướng
  const navItems = [
    { to: "/", icon: Home, label: "Trang chủ" },
    { to: "/learn", icon: Brain, label: "Chế độ Học" },
    { to: "/vocabulary", icon: BookOpen, label: "Quản lý Từ vựng" },
    { to: "/statistics", icon: BarChart3, label: "Thống kê" },
    { to: "/settings", icon: Settings, label: "Cài đặt" },
  ];
  
  // Logic hiển thị Sidebar
  const sidebarContent = (
    <nav className="flex-1 space-y-2">
      {navItems.map((item) => (
        <Button 
          key={item.to} 
          asChild 
          variant="ghost" 
          className="w-full justify-start"
          onClick={() => isMobile && setIsMenuOpen(false)} // Đóng menu sau khi chọn trên Mobile
        >
          <Link to={item.to}>
            <item.icon className="mr-2 h-4 w-4" /> {item.label}
          </Link>
        </Button>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      
      {/* 1. Sidebar (Chỉ hiển thị trên Desktop) */}
      {!isMobile && (
        <aside className="w-64 bg-white dark:bg-gray-800 p-4 border-r dark:border-gray-700 flex flex-col shadow-lg">
          <h2 className="text-2xl font-extrabold mb-8 text-primary uppercase tracking-wider">
            Nihongo App
          </h2>
          {sidebarContent}
          
          <div className="mt-auto pt-4 border-t dark:border-gray-700">
            {user ? (
              <Button 
                variant="outline" 
                className="w-full bg-transparent hover:bg-red-50 dark:hover:bg-red-900/50"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" /> 
                Đăng xuất
              </Button>
            ) : (
              <Button className="w-full" onClick={showAuthModal}>
                Đăng nhập
              </Button>
            )}
          </div>
        </aside>
      )}

      {/* 2. Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        
        {/* Navbar (Chỉ hiển thị trên Mobile) */}
        {isMobile && (
          <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 border-b bg-white dark:bg-gray-800 dark:border-gray-700 shadow-md">
            <h1 className="text-xl font-bold text-primary">Nihongo App</h1>
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(true)}>
              <Menu className="h-6 w-6" />
            </Button>
          </header>
        )}
        
        {/* Nội dung trang được tải ở đây */}
        <div className={isMobile ? 'p-4' : 'p-8'}>
          <Outlet /> 
        </div>
      </main>
      
      {/* 3. Mobile Menu (Drawer/Overlay) */}
      {isMobile && isMenuOpen && (
        <div 
          className="fixed inset-0 z-50 flex"
          onClick={() => setIsMenuOpen(false)} // Đóng khi click ra ngoài
        >
          {/* Overlay làm mờ */}
          <div className="absolute inset-0 bg-black/50" />
          
          {/* Menu chính */}
          <div 
            className="w-64 bg-white dark:bg-gray-800 h-full p-4 flex flex-col" 
            onClick={(e) => e.stopPropagation()} // Ngăn chặn đóng khi click vào menu
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-extrabold text-primary">Menu</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            {sidebarContent}
            <div className="mt-auto pt-4 border-t dark:border-gray-700">
              {user ? (
                <Button 
                  variant="outline" 
                  className="w-full bg-transparent hover:bg-red-50 dark:hover:bg-red-900/50"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" /> 
                  Đăng xuất
                </Button>
              ) : (
                <Button className="w-full" onClick={showAuthModal}>
                  Đăng nhập
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}