/**
 * 一条命令起全套：npm run dev:full
 *
 * 流程：先探 8081，已经有后端在跑就直接复用（避免端口冲突）；
 * 没有就起 Spring Boot，并轮询 /api/content 直到返回 200，再起 Vite。
 * 这样打开页面时数据库链路一定是通的，不会出现「先看到默认文案再跳成实际内容」。
 *
 * 退出时只清理自己启动的进程；复用来的服务不动，免得影响别的终端。
 */
import { spawn } from 'node:child_process'
import { startBackend } from './api.mjs'
import { killPort } from './ports.mjs'

const isWin = process.platform === 'win32'
const API_PORT = Number(process.env.API_PORT) || 8081
const API = `http://127.0.0.1:${API_PORT}/api/content`
// 与 vite.config.ts 的 DEV_PORT 保持一致：默认 5180，可用 VITE_DEV_PORT 覆盖
const WEB_PORT = Number(process.env.VITE_DEV_PORT) || 5180
const WEB = `http://127.0.0.1:${WEB_PORT}/`

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function alive(url) {
  try {
    const response = await fetch(url, { cache: 'no-store' })
    return response.ok
  } catch {
    return false
  }
}

function banner() {
  const line = '='.repeat(52)
  console.log(`\n${line}`)
  console.log('  个人展示站已就绪（数据来自 MySQL）')
  console.log(`  站点   ${WEB}`)
  console.log(`  后台   ${WEB}#/admin      口令 admin888`)
  console.log(`  接口   ${API}`)
  console.log('  体检   npm run check')
  console.log('  停止   npm run stop')
  console.log(`${line}\n`)
}

// 只有自己启动的服务才参与退出清理
const owned = { api: false, web: false }

// 后端：能连上就复用，连不上才启动
let backend = null
if (await alive(API)) {
  console.log(`[api] ${API_PORT} 已有后端在跑，直接复用`)
} else {
  backend = startBackend()
  owned.api = true
  process.stdout.write('[api] 等待 Spring Boot 就绪')
  let ready = false
  for (let i = 0; i < 180; i++) {
    if (await alive(API)) {
      ready = true
      break
    }
    process.stdout.write('.')
    await sleep(1000)
  }
  console.log(ready ? ' 已就绪' : ' 超时，检查上方 Maven 日志')
  if (!ready) {
    console.error('[api] 后端没起来，先退出。看看 MySQL 是否在运行、application-local.yml 的密码对不对。')
    process.exit(1)
  }
}

// 前端已经在跑就不重复起，避免 strictPort 冲突后整个脚本退出
if (await alive(WEB)) {
  console.log(`[web] ${WEB_PORT} 已有前端在跑，不重复启动`)
  banner()
  process.exit(0)
}

const vite = spawn(isWin ? 'npx.cmd' : 'npx', ['vite'], { stdio: 'inherit', shell: isWin })
owned.web = true

// Vite 起来后打印一次访问地址
;(async () => {
  for (let i = 0; i < 40; i++) {
    if (await alive(WEB)) {
      banner()
      return
    }
    await sleep(500)
  }
})()

let closing = false
const shutdown = (code) => {
  if (closing) return
  closing = true

  // 后端是 mvn 起的，kill 父进程杀不掉 java，按端口收干净
  if (owned.api) killPort(API_PORT)
  if (owned.web && !vite.killed) vite.kill()

  // 给子进程一点时间写完日志，然后无论如何都退出
  const timer = setTimeout(() => process.exit(code ?? 0), 800)
  timer.unref()
}

vite.on('exit', (code) => shutdown(code ?? 0))
// Windows 上 SIGHUP 才是「终端被关掉」时收到的信号，只监听 SIGINT/SIGTERM 收不到
for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGBREAK']) {
  process.on(signal, () => shutdown(0))
}
process.on('exit', () => {
  if (!closing) shutdown(0)
})
