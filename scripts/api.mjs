/**
 * 启动后端（Spring Boot），供 npm run api / npm run dev:full 复用。
 *
 * Maven 不一定在 PATH 里（本机就是这种情况：mvn 没配 PATH，只装了 IDE 自带的），
 * 所以按「环境变量 → PATH → 常见安装目录 → 扫描盘符下的 apache-maven-*」逐个试，
 * 只认真正能执行 `mvn -v` 的那一个。
 */
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const isWin = process.platform === 'win32'
const PORT = Number(process.env.API_PORT) || 8081

function works(cmd) {
  try {
    const result = spawnSync(cmd, ['-v'], { shell: isWin, stdio: 'ignore', timeout: 20000 })
    return result.status === 0
  } catch {
    return false
  }
}

function scanMavenDirs() {
  const roots = ['D:/', 'C:/', 'C:/Program Files/', 'C:/Program Files (x86)/']
  const found = []
  for (const dir of roots) {
    try {
      for (const name of readdirSync(dir)) {
        if (/^apache-maven/i.test(name)) found.push(`${dir}${name}/bin/mvn.cmd`)
      }
    } catch {
      // 没有权限或目录不存在，跳过
    }
  }
  return found
}

function findMaven() {
  const candidates = [
    process.env.MVN_CMD,
    isWin ? 'mvn.cmd' : 'mvn',
    'D:/apache-maven-3.9.16/bin/mvn.cmd',
    'D:/apache-maven-3.9.11/bin/mvn.cmd',
    ...scanMavenDirs(),
  ].filter(Boolean)

  for (const candidate of candidates) {
    const isPath = candidate.includes('/') || candidate.includes('\\')
    if (isPath && !existsSync(candidate)) continue
    if (works(candidate)) return candidate
  }
  return null
}

export function startBackend() {
  const mvn = findMaven()
  if (!mvn) {
    console.error('[api] 找不到可用的 Maven。请把 mvn 加入 PATH，或用环境变量 MVN_CMD 指定 mvn.cmd 的完整路径。')
    process.exit(1)
  }

  console.log(`[api] 使用 ${mvn} 启动 Spring Boot（http://127.0.0.1:${PORT}）`)

  // 显式传 --server.port：外部环境可能注入了 SERVER__PORT 之类的变量，
  // 那会以高于 application.yml 的优先级覆盖端口，把服务挤到别的端口上
  const child = spawn(
    mvn,
    [
      '-f',
      resolve(root, 'backend/pom.xml'),
      'spring-boot:run',
      `-Dspring-boot.run.arguments=--server.port=${PORT}`,
    ],
    { stdio: 'inherit', shell: isWin, cwd: root },
  )

  child.on('exit', (code) => {
    console.log(`[api] 后端已退出（code ${code}）`)
  })
  return child
}

// 直接执行（npm run api）时才自动启动；被 dev.mjs / start.mjs 引入时由调用方决定何时起
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startBackend()
}
