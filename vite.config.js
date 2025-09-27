import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // ✅ ĐÃ XÓA: root: 'src'
  
  plugins: [react()],
  build: {
    // ✅ ĐÃ SỬA: outDir quay về 'dist' (chuẩn Vite)
    outDir: 'dist', 
    sourcemap: true
  },
  server: {
    port: 3000
  }
})