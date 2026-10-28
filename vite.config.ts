import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base 用相对路径，配合 HashRouter，可部署在任意静态托管的任意子路径下
export default defineConfig({
  base: './',
  plugins: [react()],
  // 部署到反向代理后面时，需要放行外部 Host，否则 Vite 会报 Blocked request
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 900,
  },
})
