import { useState } from 'react'
import { useAuth } from './AuthProvider'
import { Button } from './ui/button'
import { AuthModal } from './AuthProvider'

export default function Shell() {
  const { user, logout, showAuthModal, showAuthForm } = useAuth()

  return (
    <div>
      <header>
        <h1>Nihongo App</h1>
        {!user ? (
          <Button onClick={() => showAuthModal(true)}>Đăng nhập</Button>
        ) : (
          <Button onClick={logout}>Đăng xuất</Button>
        )}
      </header>

      {/* Nội dung trang */}
      <main>
        {/* ... Outlet hoặc nội dung chính */}
      </main>

      {/* Modal sẽ hiện khi showAuthForm === true */}
      {showAuthForm && <AuthModal showAuthForm={showAuthForm} setShowAuthForm={showAuthModal} />}
    </div>
  )
}
