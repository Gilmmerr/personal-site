export interface TocItem {
  depth: number
  text: string
  id: string
}

export interface PostMeta {
  slug: string
  title: string
  date: string
  tags: string[]
  summary: string
  readingTime: number
}

export interface Post extends PostMeta {
  body: string
  toc: TocItem[]
}

/** 可被后台编辑的文章原始数据（不含推导出来的目录与阅读时长） */
export interface ContentPost {
  slug: string
  title: string
  date: string
  tags: string[]
  summary: string
  body: string
}

/** 标题转锚点：保留中英文与数字，去掉 markdown 标记与标点 */
export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[`*_~]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const normalized = raw.replace(/\r\n/g, '\n')
  if (!normalized.startsWith('---')) return { data: {}, body: normalized }

  const end = normalized.indexOf('\n---', 3)
  if (end === -1) return { data: {}, body: normalized }

  const block = normalized.slice(3, end).trim()
  const body = normalized.slice(end + 4).replace(/^\n+/, '')
  const data: Record<string, string> = {}

  for (const line of block.split('\n')) {
    const match = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/)
    if (!match) continue
    data[match[1]] = match[2].trim().replace(/^["']|["']$/g, '')
  }

  return { data, body }
}

/** 从正文里提取二级、三级标题（跳过代码块内的 # 行） */
export function extractToc(body: string): TocItem[] {
  const items: TocItem[] = []
  let inFence = false

  for (const line of body.split('\n')) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence
      continue
    }
    if (inFence) continue

    const match = line.match(/^(#{2,3})\s+(.+?)\s*#*\s*$/)
    if (!match) continue

    const text = match[2].replace(/`/g, '').trim()
    items.push({ depth: match[1].length, text, id: slugify(text) })
  }

  return items
}

/** 粗略估算阅读时长：按 420 字/分钟 */
export function countReadingTime(body: string): number {
  const chars = body.replace(/\s/g, '').length
  return Math.max(1, Math.round(chars / 420))
}

const modules = import.meta.glob('../content/posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

/** 构建期读入的默认文章，作为内容层的初始数据 */
export const defaultPostSource: ContentPost[] = Object.entries(modules).map(([path, raw]) => {
  const slug = path.split('/').pop()!.replace(/\.md$/, '')
  const { data, body } = parseFrontmatter(raw)
  return {
    slug,
    title: data.title ?? slug,
    date: data.date ?? '2026-01-01',
    tags: (data.tags ?? '')
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean),
    summary: data.summary ?? '',
    body,
  }
})

/** 由原始数据推导出渲染所需的完整文章（目录、阅读时长） */
export function buildPost(input: ContentPost): Post {
  return {
    ...input,
    readingTime: countReadingTime(input.body),
    toc: extractToc(input.body),
  }
}

export function sortPosts(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function formatDate(date: string): string {
  const [y, m, d] = date.split('-')
  if (!y || !m || !d) return date
  return `${y}.${m}.${d}`
}

/** 由标题生成一个不与现有文章冲突的 slug */
export function uniqueSlug(base: string, taken: string[]): string {
  const seed = slugify(base) || 'post'
  if (!taken.includes(seed)) return seed
  let index = 2
  while (taken.includes(`${seed}-${index}`)) index += 1
  return `${seed}-${index}`
}
