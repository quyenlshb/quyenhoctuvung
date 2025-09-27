import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' 

export default defineConfig({
  
  // FIX: Đường dẫn tương đối cho Vercel
  base: './', 
  
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Đảm bảo thư mục 'dist' được dọn sạch trước khi build
    emptyOutDir: true 
  },
  server: {
    port: 3000
  }
})