// File: vite.config.js
import { defineConfig } from 'vite' // DÒNG NÀY PHẢI ĐÚNG
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  server: {
    port: 3000
  }
})