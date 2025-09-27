import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // ✅ THÊM DÒNG NÀY

export default defineConfig({
  plugins: [react()],
  
  // ✅ THÊM KHỐI RESOLVE ALIAS NÀY
  resolve: {
    alias: {
      // Ánh xạ ký tự '@' thành đường dẫn tuyệt đối tới thư mục './src'
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