import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' 

export default defineConfig({
  // ✅ THÊM DÒNG NÀY ĐỂ ĐẢM BẢO ĐƯỜNG DẪN TƯƠNG ĐỐI
  base: '/', 
  
  plugins: [react()],
  
  resolve: {
    // Đảm bảo alias vẫn hoạt động
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  server: {
    port: 3000
  }
})