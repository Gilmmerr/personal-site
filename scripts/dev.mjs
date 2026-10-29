/**
 * 一条命令同时起后端和前端：npm run dev:full
 *
 * 后端先起（Maven 编译要几秒），Vite 立刻可用；此时访问 /api 会 502，等日志出现
 * 「Started SiteApplication」就通了。任一方退出，另一方跟着关掉。
 */
import { spawn } from 'node:child_process'
import './api.mjs'

const isWin = process.platform === 'win32'
const vite = spawn(isWin ? 'npx.cmd' : 'npx', ['vite'], { stdio: 'inherit', shell: isWin })

const shutdown = (code) => {
  if (!vite.killed) vite.kill()
  process.exit(code ?? 0)
}

vite.on('exit', (code) => shutdown(code ?? 0))
process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))
