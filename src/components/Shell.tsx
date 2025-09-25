import { Outlet, Link } from 'react-router-dom';
import { LogOut, Home, Settings, Brain, BookOpen, BarChart3, Menu, X } from 'lucide-react';
import { useState } from 'react';

// ✅ ĐÃ SỬA LỖI: Thêm đuôi file '.tsx' vào đường dẫn import
import { useIsMobile } from '../hooks/use-mobile.tsx';
import { Button } from './ui/button';
import { useAuth } from './AuthProvider'; // Dùng AuthContext của bạn

export default function Shell() {
  // Đảm bảo các component/hook này tồn tại:
  // - Button từ './ui/button'
  // - useAuth từ './AuthProvider'
  // - useIsMobile từ '../use-mobile.tsx'
  const { user, logout, showAuthModal } = useAuth(); 
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleLogout = () => {
    logout(); 
  };
  
  const navItems = [
    { to: "/", icon: Home, label: "Trang chủ" },
    { to: "/learn", icon: Brain, label: "Chế độ Học" },
    { to: "/vocabulary", icon: BookOpen, label: "Quản lý Từ vựng" },
    { to: "/statistics", icon: BarChart3, label: "Thống kê" },
    { to: "/settings", icon: Settings, label: "Cài đặt" },
  ];
  
  const sidebarContent = (
    <nav className="flex-1 space-y-2">
      {navItems.map((item) => (
        <Button 
          key={item.to} 
          asChild 
          variant="ghost" 
          className="w-full justify-start"
          onClick={() => isMobile && setIsMenuOpen(false)}
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
      
      {/* 1. Sidebar (Desktop) */}
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
        
        {/* Navbar (Mobile) */}
        {isMobile && (
          <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 border-b bg-white dark:bg-gray-800 dark:border-gray-700 shadow-md">
            <h1 className="text-xl font-bold text-primary">Nihongo App</h1>
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(true)}>
              <Menu className="h-6 w-6" />
            </Button>
          </header>
        )}
        
        <div className={isMobile ? 'p-4' : 'p-8'}>
          <Outlet /> 
        </div>
      </main>
      
      {/* 3. Mobile Menu (Drawer/Overlay) */}
      {isMobile && isMenuOpen && (
        <div 
          className="fixed inset-0 z-50 flex"
          onClick={() => setIsMenuOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50" />
          
          <div 
            className="w-64 bg-white dark:bg-gray-800 h-full p-4 flex flex-col" 
            onClick={(e) => e.stopPropagation()}
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