/**
 * 把前端的默认内容导出成后端能吃的 seed.json。
 *
 * src/data 与 src/content/posts 是 TypeScript + import.meta.glob，
 * Node 直接跑不了，所以借 Vite 的 ssrLoadModule 把 content.ts 加载出来，
 * 拿到 getDefaultContent() 的运行时结果再落盘。
 *
 * 用法：npm run export:seed
 */
import { createServer } from 'vite'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const root = process.cwd()
const target = resolve(root, 'backend/src/main/resources/db/seed.json')

const server = await createServer({
  root,
  logLevel: 'warn',
  server: { middlewareMode: true },
  appType: 'custom',
})

try {
  const module = await server.ssrLoadModule('/src/lib/content.ts')
  const content = module.getDefaultContent()

  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, `${JSON.stringify(content, null, 2)}\n`, 'utf8')

  const counts = [
    `${content.projects.length} 个项目`,
    `${content.posts.length} 篇文章`,
    `${content.skillGroups.length} 组技能`,
    `${content.site.timeline.length} 段经历`,
  ]
  console.log(`已导出 ${target}`)
  console.log(`内容：${counts.join(' / ')}`)
} finally {
  await server.close()
}
