/**
 * 端口工具：查出某个端口被哪些进程占着，并把它们停掉。
 *
 * Windows 上 `mvn spring-boot:run` 会衍生 java 子进程，直接 kill 父进程杀不掉 java，
 * 所以这里统一按「监听端口 → PID → taskkill」处理，不管它父进程是谁。
 */
import { execSync } from 'node:child_process'

export function pidsOn(port) {
  try {
    const out = execSync('netstat -ano -p tcp', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      windowsHide: true,
    })
    const pids = new Set()
    for (const line of out.split(/\r?\n/)) {
      if (!line.includes('LISTENING')) continue
      const matched = line.match(/TCP\s+(\S+):(\d+)\s+\S+\s+LISTENING\s+(\d+)/)
      if (matched && Number(matched[2]) === port) pids.add(matched[3])
    }
    return [...pids]
  } catch {
    return []
  }
}

/** 停掉占用该端口的进程，返回被停掉的 PID 数量 */
export function killPort(port) {
  const pids = pidsOn(port)
  if (pids.length === 0) return 0
  for (const pid of pids) {
    try {
      execSync(`taskkill /PID ${pid} /T /F`, { stdio: 'ignore', windowsHide: true })
    } catch {
      // 进程可能已经被别人停掉了，忽略
    }
  }
  return pids.length
}
