import { Outlet, Link, useLocation } from 'react-router-dom'; 
import { LogOut, Home, Settings, Brain, BookOpen, BarChart3, Menu, X, User as UserIcon, Loader2 } from 'lucide-react'; // Thêm Loader2
import { useState, useEffect } from 'react';

import { useIsMobile } from '../hooks/use-mobile.tsx';
import { Button } from './ui/button';
import { useAuth } from './AuthProvider'; 

export default function Shell() {
  // ✅ Cập nhật: Thêm showAuthForm vào destructuring
  const { user, logout, showAuthModal, loading, showAuthForm } = useAuth(); 
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  const handleLogout = () => {
    logout(); 
    setIsMenuOpen(false); // Đóng menu sau khi đăng xuất
  };

  // Các đường dẫn cần bảo vệ
  const protectedRoutes = ['/learn', '/vocabulary', '/statistics', '/settings'];
  const isProtected = protectedRoutes.includes(location.pathname);


  // ✅ LOGIC BẢO VỆ ROUTE VÀ HIỂN THỊ AUTH MODAL
  useEffect(() => {
    // Nếu không trong quá trình tải, người dùng chưa đăng nhập, và đang ở trang bảo vệ:
    if (!loading && !user && isProtected) {
      showAuthModal(true); // Hiển thị modal đăng nhập
    } else if (user && isProtected) {
      // Nếu đã đăng nhập và đang ở trang bảo vệ, đảm bảo modal bị ẩn
      showAuthModal(false); 
    }
    
    // Nếu chuyển đến trang không được bảo vệ, đảm bảo modal bị ẩn (nếu nó không bị chặn đóng)
    if (!isProtected && showAuthForm) {
        showAuthModal(false);
    }
  }, [loading, user, isProtected, showAuthModal, location.pathname]); // Thêm location.pathname

  // Logic Nav Items (giữ nguyên)
  const navItems = [
    { to: '/', label: 'Trang chủ', icon: Home, isProtected: false },
    { to: '/learn', label: 'Chế độ học', icon: Brain, isProtected: true },
    { to: '/vocabulary', label: 'Quản lý từ vựng', icon: BookOpen, isProtected: true },
    { to: '/statistics', label: 'Thống kê', icon: BarChart3, isProtected: true },
    { to: '/settings', label: 'Cài đặt', icon: Settings, isProtected: true },
  ];

  // ✅ LOGIC ĐIỀU KIỆN RENDER
  // Chỉ render Outlet nếu:
  // 1. Quá trình tải kết thúc (loading == false) VÀ 
  // 2. (Route KHÔNG được bảo vệ HOẶC Người dùng ĐÃ đăng nhập) VÀ
  // 3. Auth Modal KHÔNG đang mở (chỉ cần kiểm tra nếu đang ở protected route)
  const shouldRenderOutlet = !loading && (!isProtected || user) && (!isProtected || !showAuthForm);
  
  
  // Mobile Menu UI (Giữ nguyên)
  const MobileMenu = ({ navItems, isMenuOpen, setIsMenuOpen, handleLogout, user }: any) => (
    <div 
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        aria-hidden={!isMenuOpen}
    >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)}></div>
        
        {/* Drawer */}
        <div 
            className={`absolute left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 shadow-2xl transition-transform duration-300 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} p-4`}
        >
            <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-primary">Nihongo App</h2>
                    <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            
                {/* User Info Mobile */}
                <div className="mb-4 p-3 bg-accent dark:bg-gray-800 rounded-lg">
                    {user ? (
                        <div className="flex items-center space-x-3">
                            <UserIcon className="h-6 w-6 text-primary" />
                            <div>
                                <p className="font-semibold text-sm truncate">{user.name || user.email}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Điểm: {user.totalPoints || 0}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-gray-500">
                            Vui lòng đăng nhập
                        </div>
                    )}
                </div>
            
                {/* Nav Items cho Mobile */}
                <nav className="flex-1 space-y-1">
                    {navItems.map((item: any) => (
                        <Link
                            key={item.to}
                            to={item.to}
                            className={`flex items-center p-3 rounded-lg transition-colors \
                                ${location.pathname === item.to 
                                    ? 'bg-primary text-primary-foreground font-semibold' 
                                    : 'text-foreground hover:bg-accent dark:hover:bg-gray-700'\
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
    </div>
  )

  // Sidebar Desktop UI (Giữ nguyên)
  const Sidebar = ({ navItems, handleLogout, user }: any) => (
    <div className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex flex-col w-64 border-r dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex flex-col flex-1 h-0">
          <div className="flex flex-col flex-1 overflow-y-auto pt-5 pb-4 px-4">
            <div className="flex items-center flex-shrink-0 px-2 mb-6">
              <h1 className="text-2xl font-bold text-primary">Nihongo App</h1>
            </div>
            
            {/* User Info Desktop */}
            <div className="mb-6 p-3 bg-accent dark:bg-gray-800 rounded-lg">
              {user ? (
                  <div className="flex items-center space-x-3">
                      <img 
                          src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name || 'User'}`} 
                          alt="Avatar" 
                          className="h-8 w-8 rounded-full object-cover" 
                      />
                      <div>
                          <p className="font-semibold text-sm truncate">{user.name || user.email}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Điểm: {user.totalPoints || 0}</p>
                      </div>
                  </div>
              ) : (
                  <Button onClick={() => showAuthModal(true)} className="w-full">
                      <UserIcon className="h-4 w-4 mr-2" /> Đăng nhập
                  </Button>
              )}
            </div>

            {/* Nav Items Desktop */}
            <nav className="flex-1 space-y-1">
              {navItems.map((item: any) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center p-3 rounded-lg transition-colors \
                    ${location.pathname === item.to 
                      ? 'bg-primary text-primary-foreground font-semibold' 
                      : 'text-foreground hover:bg-accent dark:hover:bg-gray-700'\
                    }`}
                >
                  <item.icon className="h-5 w-5 mr-3 shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
          
          {/* Logout button Desktop */}
          {user && (
             <div className="pb-4 px-4 border-t dark:border-gray-800">
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
    </div>
  )


  // Header Mobile UI (Giữ nguyên)
  const HeaderMobile = ({ isMobile, isMenuOpen, setIsMenuOpen, user }: any) => {
    if (!isMobile) return null;
    return (
      <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b dark:border-gray-800 lg:hidden">
        <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(true)}>
          <Menu className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold text-primary">Nihongo App</h1>
        <div className="w-10">
          {user ? (
            <img 
                src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name || 'User'}`} 
                alt="Avatar" 
                className="h-8 w-8 rounded-full object-cover" 
            />
          ) : (
            <Button variant="ghost" size="icon" onClick={() => showAuthModal(true)}>
                <UserIcon className="h-6 w-6" />
            </Button>
          )}
        </div>
      </header>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      
      {/* Sidebar (Desktop) */}
      <Sidebar navItems={navItems} handleLogout={handleLogout} user={user} />
      
      {/* Mobile Menu */}
      <MobileMenu 
        navItems={navItems} 
        isMenuOpen={isMenuOpen} 
        setIsMenuOpen={setIsMenuOpen} 
        handleLogout={handleLogout} 
        user={user}
      />
      
      {/* Header Mobile */}
      <HeaderMobile isMobile={isMobile} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} user={user} />

      <main className="flex-1 overflow-y-auto pt-0 lg:pt-0">
        
        {loading ? (
          <div className="flex h-full items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-gray-500">Đang tải bố cục...</span>
          </div>
        ) : (
          // ✅ RENDER CÓ ĐIỀU KIỆN
          shouldRenderOutlet ? (
            <div className={`p-4 md:p-8 ${isMobile ? 'pt-20' : ''}`}>
                <Outlet /> {/* Render nội dung trang con */}
            </div>
          ) : (
             // Khi người dùng chưa đăng nhập, ở protected route
             isProtected && !user && showAuthForm ? (
                <div className="flex h-full items-center justify-center p-8">
                    <Card className="text-center shadow-lg w-full max-w-sm">
                        <CardHeader>
                            <CardTitle>Truy cập bị từ chối</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-500 mb-4">Vui lòng đăng nhập để truy cập trang này.</p>
                            <Button onClick={() => showAuthModal(true)}>Đăng nhập ngay</Button>
                        </CardContent>
                    </Card>
                </div>
             ) : (
                // Nếu đang ở trang không bảo vệ nhưng AuthModal không mở (ví dụ: Trang chủ)
                <div className={`p-4 md:p-8 ${isMobile ? 'pt-20' : ''}`}>
                    <Outlet /> 
                </div>
             )
          )
        )}
      </main>
    </div>
  );
}