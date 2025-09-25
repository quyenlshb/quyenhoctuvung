import esbuild from 'esbuild'
import stylePlugin from 'esbuild-style-plugin'
import { readdirSync, statSync, copyFileSync, mkdirSync, existsSync, cpSync, rmSync } from 'fs' // ✅ ĐÃ THÊM: rmSync
import { join } from 'path'
import tailwindcss from 'tailwindcss' // ✅ Đã sửa lỗi: Import tailwindcss
import autoprefixer from 'autoprefixer' // ✅ Đã sửa lỗi: Import autoprefixer

// Get all files recursively
function getFiles(dir) {
  const files = []
  if (!existsSync(dir)) return files
  const items = readdirSync(dir)
  
  for (const item of items) {
    const path = join(dir, item)
    if (statSync(path).isDirectory()) {
      files.push(...getFiles(path))
    } else {
      files.push(path)
    }
  }
  
  return files
}

// Hàm dọn dẹp thư mục dist (ĐÃ SỬA LỖI)
function cleanDist(dir) {
  if (existsSync(dir)) {
    // SỬA LỖI: Sử dụng rmSync để xóa thư mục một cách an toàn
    rmSync(dir, { recursive: true, force: true }) 
  }
}

const isProduction = process.argv.includes('--production')
const outDir = 'dist'

// Dọn dẹp thư mục dist trước khi build
cleanDist(outDir)

// Tạo thư mục dist nếu chưa có
if (!existsSync(outDir)) {
  mkdirSync(outDir)
}

await esbuild.build({
  entryPoints: getFiles('src').filter(file => 
    file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')
  ).filter(file => !file.includes('/__tests__/')), // Bỏ qua các file test
  
  // Chỉ bundle file main.tsx, các entry points còn lại sẽ là các file dependencies
  entryPoints: ['./src/main.tsx'], 
  
  bundle: true,
  outdir: outDir,
  platform: 'browser',
  format: 'esm',
  target: 'es2020',
  minify: isProduction,
  sourcemap: !isProduction,
  plugins: [
    stylePlugin({
      // Sử dụng tên biến đã import (tailwindcss, autoprefixer)
      postcss: {
        plugins: [tailwindcss, autoprefixer] 
      }
    })
  ],
  // Tùy chọn: External React để giảm kích thước bundle nếu bạn muốn sử dụng CDN (Không khuyến nghị cho Vercel)
  // external: ['react', 'react-dom'], 
  define: {
    'process.env.NODE_ENV': isProduction ? '\"production\"' : '\"development\"'
  },
  // Tùy chọn: react-shim.js có thể là một file nhỏ để import React vào môi trường cũ hơn, nhưng không cần thiết với React 18
  // inject: ['./src/react-shim.js'], 
  loader: {
    '.js': 'jsx',
    '.ts': 'tsx'
  },
  
  // Đảm bảo tên file đầu ra là index.js để khớp với index.html
  outbase: 'src',
  outExtension: { '.js': '.js' },
  entryNames: '[dir]/[name]',
})

// ✅ ĐÃ SỬA LỖI: Tìm file index.html trong cả thư mục gốc và thư mục 'src/'
const sourceIndexPath = existsSync('index.html') ? 'index.html' : (existsSync('src/index.html') ? 'src/index.html' : null);

if (sourceIndexPath) {
    try {
        // Sao chép index.html từ vị trí tìm được sang thư mục 'dist'
        copyFileSync(sourceIndexPath, join(outDir, 'index.html'));
        console.log(`✅ Copied index.html from ${sourceIndexPath} to ${outDir}`);
    } catch (error) {
        console.error(`❌ Failed to copy index.html: ${error}`);
    }
} else {
    console.error('❌ FATAL ERROR: index.html not found in root or src/ directory.');
}

console.log(`\n🎉 Build ${isProduction ? 'Production' : 'Development'} hoàn tất thành công!`)