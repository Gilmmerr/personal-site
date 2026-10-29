/**
 * 数据链路体检：npm run check
 *
 * 按「MySQL → 数据表 → 后端接口 → 前端代理」四段依次检查，
 * 每段给出能否连通的结论，最后汇总内容条数。
 * 交作业截图、排查「为什么后台改了不生效」都先跑这个。
 */
import { spawnSync } from 'node:child_process'
import { connect } from 'node:net'
import { existsSync } from 'node:fs'

const MYSQL_BIN_CANDIDATES = [
  'C:/Program Files/MySQL/MySQL Server 9.2/bin/mysql.exe',
  'C:/Program Files/MySQL/MySQL Server 8.4/bin/mysql.exe',
  'C:/Program Files/MySQL/MySQL Server 8.0/bin/mysql.exe',
]

const DB = { host: '127.0.0.1', port: 3306, user: 'root', password: 'jyt317', database: 'personal_site' }
const BACKEND = 'http://127.0.0.1:8081/api/content'
const FRONTEND = 'http://127.0.0.1:5180/'

const EXPECTED_TABLES = 16

const ok = (text) => console.log(`  \u2713 ${text}`)
const bad = (text) => console.log(`  \u2717 ${text}`)

/** 端口是否有人监听 */
function portOpen(port) {
  return new Promise((resolve) => {
    const socket = connect({ host: '127.0.0.1', port })
    const done = (value) => {
      socket.destroy()
      resolve(value)
    }
    socket.setTimeout(1200)
    socket.once('connect', () => done(true))
    socket.once('timeout', () => done(false))
    socket.once('error', () => done(false))
  })
}

function findMysqlClient() {
  const fromPath = spawnSync('mysql', ['--version'], { shell: true, stdio: 'ignore', timeout: 8000 })
  if (fromPath.status === 0) return 'mysql'
  return MYSQL_BIN_CANDIDATES.find((file) => existsSync(file)) ?? null
}

/** 查一次库，返回 stdout 文本；失败返回 null */
function query(client, sql) {
  const args = ['--default-character-set=utf8mb4', `-u${DB.user}`, `-p${DB.password}`, '-N', '-B', DB.database, '-e', sql]
  const result = spawnSync(client, args, { encoding: 'utf8', timeout: 15000 })
  if (result.status !== 0) return null
  return (result.stdout ?? '').trim()
}

async function main() {
  console.log('\n个人展示站 · 数据链路体检\n' + '='.repeat(46))

  // 1. MySQL 端口
  console.log('\n[1/4] MySQL 服务')
  const mysqlUp = await portOpen(DB.port)
  if (mysqlUp) ok(`127.0.0.1:${DB.port} 已监听`)
  else bad(`127.0.0.1:${DB.port} 没有监听，先启动 MySQL 服务`)

  // 2. 数据表与内容条数
  console.log('\n[2/4] 数据库内容')
  let summary = null
  if (!mysqlUp) {
    bad('跳过（MySQL 没起）')
  } else {
    const client = findMysqlClient()
    if (!client) {
      bad('找不到 mysql 客户端，跳过表检查')
    } else {
      const tables = query(client, 'SHOW TABLES;')
      if (tables === null) {
        bad(`连不上库 ${DB.database}，检查账号密码（application-local.yml）`)
      } else {
        const count = tables.split(/\r?\n/).filter(Boolean).length
        if (count >= EXPECTED_TABLES) ok(`${count} 张表就绪（预期 ${EXPECTED_TABLES} 张）`)
        else bad(`只有 ${count} 张表，预期 ${EXPECTED_TABLES} 张，先执行 backend/src/main/resources/db/schema.sql`)

        const row = query(
          client,
          "SELECT CONCAT_WS(' | ', (SELECT COUNT(*) FROM project), (SELECT COUNT(*) FROM post), (SELECT COUNT(*) FROM skill_group), (SELECT COUNT(*) FROM skill_item), (SELECT v FROM site_meta WHERE k='updatedAt'));",
        )
        if (row) {
          const [projects, posts, groups, skills, updatedAt] = row.split(' | ')
          summary = { projects, posts, groups, skills, updatedAt }
          ok(`项目 ${projects} 个 · 文章 ${posts} 篇 · 技能组 ${groups} 个（${skills} 条技能）`)
          ok(`最近入库时间 ${updatedAt ?? '（空）'}`)
        }
      }
    }
  }

  // 3. 后端接口
  console.log('\n[3/4] 后端接口 8081')
  let apiOk = false
  try {
    const response = await fetch(BACKEND, { cache: 'no-store' })
    const text = await response.text()
    if (response.ok) {
      apiOk = true
      ok(`GET /api/content → ${response.status}，${text.length} 字节`)
    } else {
      bad(`GET /api/content → ${response.status}`)
    }
  } catch {
    bad('连不上，后端没启动？在项目根目录执行 npm run api')
  }

  // 4. 前端
  console.log('\n[4/4] 前端 5180')
  let webOk = false
  try {
    const response = await fetch(FRONTEND, { cache: 'no-store' })
    webOk = response.ok
    if (webOk) ok(`GET / → ${response.status}`)
    else bad(`GET / → ${response.status}`)
  } catch {
    bad('前端没启动，执行 npm run dev')
  }

  console.log('\n' + '='.repeat(46))
  if (mysqlUp && apiOk && webOk) {
    console.log('结论：数据链路正常，数据库是真数据源。')
    if (summary) {
      console.log(`      最近一次写库：${summary.updatedAt ?? '未知'}`)
    }
    console.log('      站点   http://127.0.0.1:5180/')
    console.log('      后台   http://127.0.0.1:5180/#/admin   （口令 admin888）')
    console.log('      接口   http://127.0.0.1:8081/api/content')
  } else {
    console.log('结论：链路没通，按上面标 ✗ 的那一段处理。')
    if (!mysqlUp) console.log('  · 起 MySQL：服务管理器里启动 MySQL 服务')
    if (!apiOk) console.log('  · 起后端：npm run api')
    if (!webOk) console.log('  · 起前端：npm run dev')
  }
  console.log('')
}

main()
