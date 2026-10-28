import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base 用相对路径，配合 HashRouter，可部署在任意静态托管的任意子路径下
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 900,
  },
})
