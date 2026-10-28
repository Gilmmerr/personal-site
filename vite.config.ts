import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 云端部署会注入 PORT，这里读出来给 preview 用（不写在 npm script 里，避免 Windows 下 shell 语法不兼容）
const port = Number(process.env.PORT) || 4173

// base 用相对路径，配合 HashRouter，可部署在任意静态托管的任意子路径下
export default defineConfig({
  base: './',
  plugins: [react()],
  // 部署到反向代理后面时，需要放行外部 Host，否则 Vite 会报 Blocked request
  server: {
    host: '0.0.0.0',
    port,
    strictPort: true,
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port,
    strictPort: true,
    allowedHosts: true,
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 900,
  },
})
