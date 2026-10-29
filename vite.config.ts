import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 云端部署会注入 PORT，这里读出来给 preview 用（不写在 npm script 里，避免 Windows 下 shell 语法不兼容）
const previewPort = Number(process.env.PORT) || 4173

// 本地开发固定用 Vite 默认端口，且只监听回环地址；与 preview 的端口解耦，
// 否则 dev 会占用 preview 的端口，本地预览面板扫描不到开发服务
// 本地开发端口：5173 常被别的项目占着，默认用 5180，需要时用 VITE_DEV_PORT 覆盖。
// strictPort 保持 true，端口冲突时立刻报错，避免以为连的是本项目
const DEV_PORT = Number(process.env.VITE_DEV_PORT) || 5180

// 后端接口地址：本地 Spring Boot 只监听回环地址（8080 被别的服务占了，用 8081）
const API_TARGET = 'http://127.0.0.1:8081'

// base 用相对路径，配合 HashRouter，可部署在任意静态托管的任意子路径下
export default defineConfig({
  base: './',
  plugins: [react()],
  // 部署到反向代理后面时，需要放行外部 Host，否则 Vite 会报 Blocked request
  server: {
    host: '127.0.0.1',
    port: DEV_PORT,
    strictPort: true,
    allowedHosts: true,
    // 开发时 /api 转发给 Spring Boot，前端不用处理跨域
    proxy: {
      '/api': { target: API_TARGET, changeOrigin: true },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: previewPort,
    strictPort: true,
    allowedHosts: true,
    proxy: {
      '/api': { target: API_TARGET, changeOrigin: true },
    },
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 900,
  },
})
