import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' 

export default defineConfig({
  
  // ✅ FIX QUAN TRỌNG: Sử dụng đường dẫn tương đối để Vercel tải đúng tài nguyên
  base: './', 
  
  plugins: [react()],
  
  resolve: {
    // Đảm bảo alias @/* hoạt động với cấu hình tsconfig.json
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Tùy chọn: Xóa thư mục 'dist' trước khi build
    emptyOutDir: true 
  },
  server: {
    port: 3000
  }
})