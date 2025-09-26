import { Outlet, Link, useLocation } from 'react-router-dom'; // Thêm useLocation
import { LogOut, Home, Settings, Brain, BookOpen, BarChart3, Menu, X, User as UserIcon } from 'lucide-react'; // Thêm UserIcon
import { useState, useEffect } from 'react'; // Thêm useEffect

import { useIsMobile } from '../hooks/use-mobile.tsx';
import { Button } from './ui/button';
import { useAuth } from './AuthProvider'; 

export default function Shell() {
  const { user, logout, showAuthModal, loading } = useAuth(); // Thêm loading
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation(); // Hook để lấy thông tin đường dẫn hiện tại
  
  const handleLogout = () => {
    logout(); 
    setIsMenuOpen(false); // Đóng menu sau khi đăng xuất
  };

  // ✅ LOGIC BẢO VỆ ROUTE VÀ HIỂN THỊ AUTH MODAL
  useEffect(() => {
    // Các đường dẫn cần bảo vệ (chỉ người dùng đã đăng nhập mới xem được)
    const protectedRoutes = ['/learn', '/vocabulary', '/statistics', '/settings']; 

    if (!loading && !user && protectedRoutes.includes(location.pathname)) {
      // Nếu không trong quá trình tải, người dùng chưa đăng nhập, và đang ở trang bảo vệ:
      showAuthModal(true); // Hiển thị modal đăng nhập
    } else {
      showAuthModal(false); // Đảm bảo modal đóng khi user đã đăng nhập hoặc ở trang công khai
    }
    
    // Đóng menu mobile sau khi chuyển hướng
    if (!loading) {
      setIsMenuOpen(false);
    }
    
  }, [user, location.pathname, loading, showAuthModal]); // Chạy lại khi trạng thái user hoặc path thay đổi
  
  // Dữ liệu cho Sidebar
  const navItems = [
    { to: "/", icon: Home, label: "Trang chủ" },
    { to: "/learn", icon: Brain, label: "Chế độ Học" },
    { to: "/vocabulary", icon: BookOpen, label: "Quản lý Từ vựng" },
    { to: "/statistics", icon: BarChart3, label: "Thống kê" },
    { to: "/settings", icon: Settings, label: "Cài đặt" },
  ];
  
  // Content chung cho cả Desktop và Mobile Sidebar
  const sidebarContent = (
    <>
      {/* 1. Thông tin người dùng (Desktop Only) */}
      {!isMobile && (
        <div className="p-4 border-b dark:border-gray-700 mb-4">
          {user ? (
            <div>
              <div className="flex items-center space-x-2">
                 {/* <Avatar ... /> - (Giả sử bạn có component Avatar) */}
                 <UserIcon className="h-5 w-5 text-primary" />
                 <div>
                   <p className="font-semibold text-sm truncate">{user.name || 'Người dùng'}</p>
                   <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                 </div>
              </div>
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                 <span>Điểm: **{user.totalPoints}**</span>
                 <span>Streak: **{user.streak}**</span>
              </div>
            </div>
          ) : (
             <Button 
                variant="default" 
                className="w-full"
                onClick={() => showAuthModal(true)}
             >
               Đăng nhập / Đăng ký
             </Button>
          )}
        </div>
      )}
      
      {/* 2. Danh mục điều hướng */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex items-center p-3 rounded-lg transition-colors 
              ${location.pathname === item.to 
                ? 'bg-sidebar-primary text-sidebar-primary-foreground font-semibold' 
                : 'text-sidebar-foreground hover:bg-sidebar-accent dark:hover:bg-gray-700'
              }`}
            onClick={() => isMobile && setIsMenuOpen(false)}
          >
            <item.icon className="h-5 w-5 mr-3 shrink-0" />
            <span className="text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>
      
      {/* 3. Đăng xuất (Hiển thị cố định ở cuối sidebar Desktop) */}
      {!isMobile && user && (
        <div className="mt-auto pt-4 border-t dark:border-gray-700">
           <Button 
             variant="outline" 
             className="w-full bg-transparent hover:bg-red-50 dark:hover:bg-red-900/50"
             onClick={handleLogout}
           >
             <LogOut className="h-4 w-4 mr-2" /> 
             Đăng xuất
           </Button>
        </div>
      )}
    </>
  );

  // Loading state
  if (loading) {
     return (
       <div className="flex items-center justify-center min-h-screen">
         <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
         <p className="ml-3 text-lg text-primary">Đang tải ứng dụng...</p>
       </div>
     );
  }


  return (
    <div className="flex h-screen bg-background text-foreground">
      
      {/* 1. Desktop Sidebar */}
      {!isMobile && (
        <aside className="w-64 flex flex-col border-r dark:border-gray-800 bg-sidebar dark:bg-gray-900">
          <div className="p-4 border-b dark:border-gray-800">
            <h1 className="text-2xl font-extrabold text-primary">Nihongo Navigator</h1>
          </div>
          {/* Sidebar content for Desktop */}
          <div className="flex flex-col flex-1 p-4">
             {sidebarContent}
          </div>
        </aside>
      )}

      {/* 2. Main Content Area */}
      <main className="flex-1 overflow-auto">
        
        {/* Header/Mobile Nav */}
        <header className="sticky top-0 z-10 flex items-center justify-between p-4 border-b dark:border-gray-800 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 lg:hidden">
          <h1 className="text-xl font-extrabold text-primary">Nihongo Navigator</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMenuOpen(true)}
            className="lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </header>
        
        {/* Page Content */}
        <div className="p-4 sm:p-6">
          {/* Outlet render nội dung của các Route con (Home, Statistics, v.v.) */}
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
            
            {/* User Info cho Mobile */}
             <div className="p-4 border-b dark:border-gray-700 mb-4">
                {user ? (
                   <div>
                     <div className="flex items-center space-x-2">
                        <UserIcon className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-semibold text-sm truncate">{user.name || 'Người dùng'}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                     </div>
                   </div>
                ) : (
                  <Button 
                    variant="default" 
                    className="w-full"
                    onClick={() => {
                      showAuthModal(true);
                      setIsMenuOpen(false);
                    }}
                  >
                    Đăng nhập / Đăng ký
                  </Button>
                )}
              </div>
            
            {/* Nav Items cho Mobile */}
            <nav className="flex-1 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center p-3 rounded-lg transition-colors 
                    ${location.pathname === item.to 
                      ? 'bg-primary text-primary-foreground font-semibold' 
                      : 'text-foreground hover:bg-accent dark:hover:bg-gray-700'
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5 mr-3 shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Logout button Mobile */}
            {user && (
               <div className="mt-auto pt-4 border-t dark:border-gray-700">
                  <Button 
                    variant="outline" 
                    className="w-full bg-transparent hover:bg-red-50 dark:hover:bg-red-900/50"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" /> 
                    Đăng xuất
                  </Button>
               </div>
            )}
            
          </div>
        </div>
      )}
    </div>
  );
}