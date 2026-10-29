/**
 * 把数据库里的内容导出成静态快照：npm run snapshot
 *
 * 只读 8081 的 /api/content，把结果写到 public/content.json。
 * 构建时它会一起被打包进 docs/，于是 GitHub Pages 这类纯静态托管也能显示
 * 你在后台改过的内容（快照是构建那一刻的，不是实时的）。
 *
 * 后端没起时不会报错中断构建，只提示一句，沿用上一次的快照。
 */
import { writeFileSync, existsSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

const ENDPOINTS = ['http://127.0.0.1:8081/api/content', 'http://127.0.0.1:5180/api/content']
const OUTPUT = resolve(process.cwd(), 'public/content.json')

async function pick() {
  for (const url of ENDPOINTS) {
    try {
      const response = await fetch(url, { cache: 'no-store' })
      if (!response.ok) continue
      const data = await response.json()
      if (!data?.site || !Array.isArray(data.projects)) continue
      return { data, url }
    } catch {
      // 试下一个
    }
  }
  return null
}

const result = await pick()

if (!result) {
  const exists = existsSync(OUTPUT)
  console.warn(
    exists
      ? `[snapshot] 没连上后端，沿用已有的 public/content.json（${statSync(OUTPUT).size} 字节，${statSync(OUTPUT).mtime.toLocaleString()}）`
      : '[snapshot] 没连上后端，也没有历史快照。构建出的站点会使用 src/data 里的内置默认内容。',
  )
  process.exit(0)
}

const { data, url } = result
data.updatedAt = data.updatedAt || new Date().toISOString().slice(0, 19)
writeFileSync(OUTPUT, JSON.stringify(data, null, 2), 'utf8')

console.log(`[snapshot] 已从 ${url} 导出 public/content.json`)
console.log(
  `[snapshot] 项目 ${data.projects.length} 个 · 文章 ${data.posts.length} 篇 · 技能组 ${data.skillGroups.length} 个 · 快照时间 ${data.updatedAt}`,
)
