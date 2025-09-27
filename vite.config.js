import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // Cần cho alias

export default defineConfig({
  // ✅ THÊM DÒNG NÀY: Đảm bảo đường dẫn tài sản tương đối với thư mục gốc.
  base: './', 
  
  plugins: [react()],
  
  resolve: {
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