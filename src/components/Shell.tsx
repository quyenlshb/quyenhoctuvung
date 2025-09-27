// src/components/Shell.tsx
import React from 'react'
import Sidebar from './Sidebar'

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar /> {/* Giữ các nút Trang chủ, Chế độ học, Quản lý từ vựng */}
      <main className="flex-1 p-4 bg-gray-50 dark:bg-gray-900">
        {children}
      </main>
    </div>
  )
}
