/**
 * 启动后端（Spring Boot），供 npm run api / npm run dev:full 复用。
 *
 * Maven 不一定在 PATH 里，这里按「环境变量 → PATH → 常见安装目录」的顺序找一个能用的。
 */
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const isWin = process.platform === 'win32'

const candidates = [
  process.env.MVN_CMD,
  isWin ? 'mvn.cmd' : 'mvn',
  'D:/apache-maven-3.9.16/bin/mvn.cmd',
  'D:/apache-maven-3.9.11/bin/mvn.cmd',
  'C:/Program Files/apache-maven/bin/mvn.cmd',
].filter(Boolean)

function findMaven() {
  for (const candidate of candidates) {
    if (candidate.includes('/') || candidate.includes('\\')) {
      if (existsSync(candidate)) return candidate
      continue
    }
    return candidate // 交给 PATH 解析
  }
  return null
}

export function startBackend() {
  const mvn = findMaven()
  if (!mvn) {
    console.error('找不到 mvn。请把 Maven 加入 PATH，或用 MVN_CMD 指定完整路径。')
    process.exit(1)
  }

  console.log(`[api] 使用 ${mvn} 启动 Spring Boot（http://127.0.0.1:8081）`)

  // 显式传 --server.port：外部环境可能注入了 SERVER__PORT 之类的变量，
  // 那会以高于 application.yml 的优先级覆盖端口，导致服务跑到别的端口上
  const child = spawn(
    mvn,
    [
      '-f',
      resolve(root, 'backend/pom.xml'),
      'spring-boot:run',
      '-Dspring-boot.run.arguments=--server.port=8081',
    ],
    { stdio: 'inherit', shell: isWin, cwd: root },
  )
  child.on('exit', (code) => {
    console.log(`[api] 后端已退出（code ${code}）`)
  })
  return child
}

startBackend()
