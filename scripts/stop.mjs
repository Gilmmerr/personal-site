/**
 * 停掉本地开发服务：npm run stop
 *
 * 关掉 5180（Vite）与 8081（Spring Boot）上的监听进程。
 * 直接按端口清理，因此即使是从别的终端起的、或者父进程已经没了留下的孤儿进程也能收干净。
 */
import { killPort, pidsOn } from './ports.mjs'

const API_PORT = Number(process.env.API_PORT) || 8081
const WEB_PORT = Number(process.env.VITE_DEV_PORT) || 5180

let cleaned = 0
for (const port of [WEB_PORT, API_PORT]) {
  const before = pidsOn(port)
  if (before.length === 0) {
    console.log(`[stop] ${port} 端口上没有服务在跑`)
    continue
  }
  const killed = killPort(port)
  cleaned += killed
  console.log(`[stop] 已停掉 ${port}（PID ${before.join(', ')}）`)
}

console.log(cleaned > 0 ? '[stop] 开发服务已全部停止' : '[stop] 没有需要停止的进程')
