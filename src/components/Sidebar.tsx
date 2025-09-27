// src/components/Sidebar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export default function Sidebar() {
  const { user, showAuthModal } = useAuth();

  const navItems = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Chế độ học', path: '/learn' },
    { name: 'Quản lý từ vựng', path: '/vocabulary' },
    { name: 'Thống kê', path: '/statistics' },
    { name: 'Cài đặt', path: '/settings' },
  ];

  return (
    <div className="w-64 h-screen bg-gray-100 dark:bg-gray-800 p-4 flex flex-col justify-between">
      <div className="space-y-2">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Nihongo App</h2>
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block px-4 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                isActive ? 'bg-gray-300 dark:bg-gray-700 font-semibold' : 'text-gray-800 dark:text-gray-200'
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </div>

      {!user && (
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => showAuthModal(true)}
        >
          Đăng nhập
        </button>
      )}
    </div>
  );
}
