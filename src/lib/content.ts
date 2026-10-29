/**
 * 内容层：全站文案的唯一出口。
 *
 * 数据来源按优先级：
 *   1. 数据库 —— 本机 Spring Boot 提供的 /api/content（后台保存即写库，真正的数据源）
 *   2. 快照   —— 站点根目录的 content.json（纯静态部署时用它兜底，随构建一起发布）
 *   3. 默认值 —— 构建期从 src/data/*.ts 与 src/content/posts/*.md 打包进来
 *
 * 组件只通过 useContent() 取数据，不直接 import 数据文件，
 * 后台改完保存，全站立即读到新内容。
 */
import { useMemo, useSyncExternalStore } from 'react'
import { site as seedSite, type NavItem, type Social, type TimelineItem } from '../data/site'
import { skillGroups as seedSkillGroups, type SkillGroup } from '../data/skills'
import { projects as seedProjects, type Challenge, type Project } from '../data/projects'
import { buildPost, defaultPostSource, sortPosts, type ContentPost, type Post } from './posts'

export interface SiteInfo {
  name: string
  role: string
  tagline: string
  email: string
  location: string
  avatar: string
  resumeUrl: string
  intro: string[]
  socials: Social[]
  nav: NavItem[]
  timeline: TimelineItem[]
  /** 关于区块右侧的四张信息卡 */
  facts: { label: string; value: string }[]
}

export interface Content {
  version: number
  updatedAt: string
  site: SiteInfo
  skillGroups: SkillGroup[]
  projects: Project[]
  posts: ContentPost[]
}

/** database = 读到了后端数据库；snapshot = 退回静态 content.json；default = 内置默认值 */
export type ContentSource = 'database' | 'snapshot' | 'default'

export interface ContentSnapshot {
  content: Content
  source: ContentSource
  /** 首次内容加载完成后置为 true，后台在此之后才渲染表单，避免表单被异步结果覆盖 */
  ready: boolean
  /** 后端是否连得上；读不到时后台会提示先启动 Spring Boot */
  apiReachable: boolean
}

const DRAFT_ENDPOINT = '/api/content'
const SNAPSHOT_FILE = 'content.json'

/** 后台登录口令（前端校验，只用于挡住误入；本地开发够用，不是真正的安全边界） */
export const ADMIN_PASSWORD = 'admin888'

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const defaultContent: Content = {
  version: 1,
  updatedAt: '',
  site: {
    ...clone(seedSite),
    facts: [
      { label: '当前方向', value: '前端开发 / 全栈' },
      { label: '可投入时间', value: '全职实习' },
      { label: '常用工具', value: 'VS Code · Vite · WorkBuddy' },
      { label: '联系方式', value: seedSite.email },
    ],
  },
  skillGroups: clone(seedSkillGroups),
  projects: clone(seedProjects),
  posts: clone(defaultPostSource),
}

export function getDefaultContent(): Content {
  return clone(defaultContent)
}

/* ------------------------------ 数据清洗 ------------------------------ */

const asString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []

function sanitizeProject(raw: unknown, index: number): Project {
  const item = (raw ?? {}) as Partial<Project>
  const tags = asStringArray(item.tags)
  return {
    slug: asString(item.slug, `project-${index + 1}`),
    title: asString(item.title, `未命名项目 ${index + 1}`),
    summary: asString(item.summary),
    year: asString(item.year),
    role: asString(item.role),
    cover: asString(item.cover, 'linear-gradient(135deg, #0b0f1a 0%, #312e81 55%, #0e7490 100%)'),
    glyph: asString(item.glyph, '📁'),
    tags: tags.length > 0 ? tags : ['项目'],
    links: Array.isArray(item.links)
      ? item.links.map((link) => ({
          label: asString((link as { label?: unknown }).label, '链接'),
          href: asString((link as { href?: unknown }).href),
        }))
      : [],
    background: asString(item.background),
    approach: asStringArray(item.approach),
    challenges: Array.isArray(item.challenges)
      ? item.challenges.map((challenge) => ({
          title: asString((challenge as Challenge).title),
          detail: asString((challenge as Challenge).detail),
        }))
      : [],
    outcome: asString(item.outcome),
  }
}

function sanitizeSkillGroups(raw: unknown): SkillGroup[] {
  if (!Array.isArray(raw)) return clone(defaultContent.skillGroups)
  return raw.map((group, index) => {
    const item = (group ?? {}) as Partial<SkillGroup>
    const items = Array.isArray(item.items) ? item.items : []
    return {
      group: asString(item.group, `分组 ${index + 1}`),
      desc: asString(item.desc),
      items: items.map((skill) => {
        const entry = (skill ?? {}) as { name?: unknown; icon?: unknown; level?: unknown }
        const level = Number(entry.level)
        return {
          name: asString(entry.name, '未命名技能'),
          icon: asString(entry.icon, '•'),
          level: Number.isFinite(level) ? Math.min(100, Math.max(0, Math.round(level))) : 60,
        }
      }),
    }
  })
}

function sanitizePosts(raw: unknown): ContentPost[] {
  if (!Array.isArray(raw)) return clone(defaultContent.posts)
  return raw.map((post, index) => {
    const item = (post ?? {}) as Partial<ContentPost>
    return {
      slug: asString(item.slug, `post-${index + 1}`),
      title: asString(item.title, `未命名文章 ${index + 1}`),
      date: asString(item.date, '2026-01-01'),
      tags: asStringArray(item.tags),
      summary: asString(item.summary),
      body: asString(item.body),
    }
  })
}

/** 把外部 JSON（接口返回或导入的文件）收敛成合法的 Content，缺字段用默认值补齐 */
export function normalizeContent(raw: unknown): Content {
  if (!raw || typeof raw !== 'object') return getDefaultContent()
  const input = raw as Partial<Content>
  const site = (input.site ?? {}) as Partial<SiteInfo>

  return {
    version: 1,
    updatedAt: asString(input.updatedAt),
    site: {
      ...clone(defaultContent.site),
      ...site,
      intro: asStringArray(site.intro).length > 0 ? asStringArray(site.intro) : clone(defaultContent.site.intro),
      socials: Array.isArray(site.socials) ? (site.socials as Social[]) : clone(defaultContent.site.socials),
      nav: Array.isArray(site.nav) ? (site.nav as NavItem[]) : clone(defaultContent.site.nav),
      timeline: Array.isArray(site.timeline) ? (site.timeline as TimelineItem[]) : clone(defaultContent.site.timeline),
      facts: Array.isArray(site.facts) ? (site.facts as { label: string; value: string }[]) : clone(defaultContent.site.facts),
    },
    skillGroups: sanitizeSkillGroups(input.skillGroups),
    projects: Array.isArray(input.projects)
      ? input.projects.map((project, index) => sanitizeProject(project, index))
      : clone(defaultContent.projects),
    posts: sanitizePosts(input.posts),
  }
}

/** 导入前做一次结构校验，返回中文错误信息，通过则返回 null */
export function validateContent(raw: unknown): string | null {
  if (!raw || typeof raw !== 'object') return '文件内容不是合法的 JSON 对象'
  const input = raw as Partial<Content>
  if (!input.site || typeof input.site !== 'object') return '缺少 site 字段'
  if (!Array.isArray(input.projects)) return '缺少 projects 数组'
  if (!Array.isArray(input.skillGroups)) return '缺少 skillGroups 数组'
  if (!Array.isArray(input.posts)) return '缺少 posts 数组'
  return null
}

/* ------------------------------ 状态仓库 ------------------------------ */

interface StoreState extends ContentSnapshot {
  snapshot: Content | null
}

let state: StoreState = {
  content: clone(defaultContent),
  source: 'default',
  ready: false,
  apiReachable: false,
  snapshot: null,
}

const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

function setState(next: Partial<StoreState>) {
  state = { ...state, ...next }
  emit()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot(): StoreState {
  return state
}

async function fetchFromApi(): Promise<Content | null> {
  try {
    const response = await fetch(DRAFT_ENDPOINT, { cache: 'no-store' })
    if (!response.ok) return null
    const parsed = (await response.json()) as unknown
    if (validateContent(parsed)) return null
    const content = normalizeContent(parsed)
    // 表还没灌数据时后端会返回空壳，这种情况当作没读到，继续往后退
    if (!content.site.name && content.projects.length === 0) return null
    return content
  } catch {
    return null
  }
}

async function fetchSnapshot(): Promise<Content | null> {
  try {
    const url = new URL(SNAPSHOT_FILE, document.baseURI).toString()
    const response = await fetch(url, { cache: 'no-store' })
    if (!response.ok) return null
    const parsed = (await response.json()) as unknown
    if (validateContent(parsed)) return null
    return normalizeContent(parsed)
  } catch {
    return null
  }
}

let initStarted = false

/** 应用启动时调用一次：先读后端数据库，读不到再退回静态快照 */
export async function initContent(): Promise<void> {
  if (initStarted) return
  initStarted = true

  const fromApi = await fetchFromApi()
  if (fromApi) {
    setState({ content: fromApi, source: 'database', ready: true, apiReachable: true })
    return
  }

  const snapshot = await fetchSnapshot()
  if (snapshot) {
    setState({ content: snapshot, source: 'snapshot', ready: true, snapshot })
    return
  }

  setState({ ready: true })
}

export interface SaveResult {
  ok: boolean
  message: string
  /** 后端回写的最终内容（带数据库生成的时间戳），调用方可用它同步编辑区 */
  content?: Content
}

/** 保存到数据库：成功后全站立即读到新内容 */
export async function saveContent(next: Content): Promise<SaveResult> {
  try {
    const response = await fetch(DRAFT_ENDPOINT, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next),
    })

    if (!response.ok) {
      const detail = (await response.json().catch(() => null)) as { message?: string } | null
      return { ok: false, message: detail?.message ?? `保存失败（HTTP ${response.status}）` }
    }

    const saved = normalizeContent((await response.json()) as unknown)
    setState({ content: saved, source: 'database', ready: true, apiReachable: true })
    return { ok: true, message: '已保存到数据库，站点立即生效', content: saved }
  } catch {
    setState({ apiReachable: false })
    return { ok: false, message: '连不上后端，请先启动 Spring Boot（端口 8081）' }
  }
}

/** 恢复成后端打包的初始内容 */
export async function resetContent(): Promise<SaveResult> {
  try {
    const response = await fetch(`${DRAFT_ENDPOINT}/reset`, { method: 'POST' })
    if (!response.ok) {
      const detail = (await response.json().catch(() => null)) as { message?: string } | null
      return { ok: false, message: detail?.message ?? `重置失败（HTTP ${response.status}）` }
    }
    const reset = normalizeContent((await response.json()) as unknown)
    setState({ content: reset, source: 'database', ready: true, apiReachable: true })
    return { ok: true, message: '已恢复为初始内容', content: reset }
  } catch {
    setState({ apiReachable: false })
    return { ok: false, message: '连不上后端，恢复失败' }
  }
}

export function serializeContent(content: Content): string {
  return JSON.stringify({ ...content, version: 1 }, null, 2)
}

/* ------------------------------ React 接口 ------------------------------ */

export interface UseContentResult {
  site: SiteInfo
  skillGroups: SkillGroup[]
  projects: Project[]
  posts: Post[]
  content: Content
  source: ContentSource
  ready: boolean
}

export function useContent(): UseContentResult {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const { content } = snapshot

  const posts = useMemo(() => sortPosts(content.posts.map(buildPost)), [content.posts])

  return {
    site: content.site,
    skillGroups: content.skillGroups,
    projects: content.projects,
    posts,
    content,
    source: snapshot.source,
    ready: snapshot.ready,
  }
}

/** 只关心数据的组件（后台表单）用这个，避免每处都解构一堆字段 */
export function useContentSnapshot(): ContentSnapshot & { snapshot: Content | null } {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return {
    content: snapshot.content,
    source: snapshot.source,
    ready: snapshot.ready,
    apiReachable: snapshot.apiReachable,
    snapshot: snapshot.snapshot,
  }
}
