import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ADMIN_PASSWORD,
  saveDraft,
  useContentSnapshot,
  type Content,
  type ContentSource,
} from '../../lib/content'
import { Btn, TextInput } from './ui'
import { formatTime } from './helpers'
import { OverviewPanel } from './OverviewPanel'
import { SitePanel } from './SitePanel'
import { TimelinePanel } from './TimelinePanel'
import { SkillsPanel } from './SkillsPanel'
import { ProjectsPanel } from './ProjectsPanel'
import { PostsPanel } from './PostsPanel'
import { DataPanel } from './DataPanel'
import type { TabKey } from './types'

const AUTH_KEY = 'personal-site:admin:auth'

const tabs: { key: TabKey; label: string }[] = [
  { key: 'overview', label: '概览' },
  { key: 'site', label: '站点信息' },
  { key: 'timeline', label: '经历' },
  { key: 'skills', label: '技能' },
  { key: 'projects', label: '项目' },
  { key: 'posts', label: '文章' },
  { key: 'data', label: '数据' },
]

const sourceText: Record<ContentSource, string> = {
  default: '默认内容',
  published: '已发布版本',
  draft: '本地草稿',
}

function readAuth(): boolean {
  try {
    return sessionStorage.getItem(AUTH_KEY) === '1'
  } catch {
    return false
  }
}

function Login({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (password === ADMIN_PASSWORD) {
      try {
        sessionStorage.setItem(AUTH_KEY, '1')
      } catch {
        // 隐私模式下存不住，本次会话仍然算登录成功
      }
      onSuccess()
      return
    }
    setError('口令不对，再试一次')
    setPassword('')
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-5">
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-[90px]"
        style={{ background: 'linear-gradient(135deg, #6366F1 0%, #22D3EE 100%)' }}
      />

      <div className="w-full max-w-[380px]">
        <div className="mb-7 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-accent2 to-accent text-[15px] font-semibold text-ink">
            管
          </span>
          <div>
            <p className="text-[15px] font-medium tracking-tight text-paper">内容管理台</p>
            <p className="mt-0.5 text-[11.5px] text-paper/35">Personal Site CMS · v1.1</p>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 backdrop-blur-sm"
        >
          <label htmlFor="admin-password" className="mb-2 block text-[11.5px] tracking-wide text-paper/45">
            管理口令
          </label>
          <TextInput
            id="admin-password"
            type="password"
            autoFocus
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError('')
            }}
            placeholder="请输入口令"
            className="!py-2.5"
          />
          {error && <p className="mt-2 text-[11.5px] text-rose-300/85">{error}</p>}

          <Btn variant="primary" type="submit" className="mt-4 w-full !py-2.5">
            进入后台
          </Btn>

          <p className="mt-4 text-[11.5px] leading-relaxed text-paper/30">
            默认口令 <code className="rounded bg-white/[0.07] px-1.5 py-0.5 font-mono text-accent2">admin888</code>
            ，可在
            <code className="mx-1 rounded bg-white/[0.07] px-1.5 py-0.5 font-mono">src/lib/content.ts</code>
            修改。纯前端校验，仅用于挡住误入。
          </p>
        </form>

        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-1.5 text-[12.5px] text-paper/40 transition-colors hover:text-paper/80"
        >
          ← 返回站点
        </Link>
      </div>
    </div>
  )
}

export function AdminPage() {
  const { content, ready, source } = useContentSnapshot()
  const navigate = useNavigate()
  const [authed, setAuthed] = useState(readAuth)
  const [searchParams, setSearchParams] = useSearchParams()
  const [draft, setDraft] = useState<Content>(() => JSON.parse(JSON.stringify(content)) as Content)
  const [toast, setToast] = useState<{ text: string; tone: 'ok' | 'warn'; id: number } | null>(null)

  // 当前模块放在 ?tab= 里，刷新或分享链接都能停在同一页
  const tabParam = searchParams.get('tab')
  const tab: TabKey = tabs.some((item) => item.key === tabParam) ? (tabParam as TabKey) : 'overview'
  const setTab = (key: TabKey) =>
    setSearchParams(key === 'overview' ? {} : { tab: key }, { replace: true })

  const notify = (text: string, tone: 'ok' | 'warn' = 'ok') => {
    setToast({ text, tone, id: Date.now() })
  }

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 3600)
    return () => window.clearTimeout(timer)
  }, [toast])

  const dirty = useMemo(
    () =>
      JSON.stringify({ ...draft, updatedAt: '' }) !== JSON.stringify({ ...content, updatedAt: '' }),
    [draft, content],
  )

  const onSave = () => {
    saveDraft(draft)
    notify('已保存，当前浏览器打开站点即可看到新内容')
  }

  // Ctrl/Cmd + S 保存
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        saveDraft(draft)
        notify('已保存（Ctrl + S）')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [draft])

  // 有未保存改动时离开页面给个提示
  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  if (!authed) return <Login onSuccess={() => setAuthed(true)} />

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/15 border-t-accent2" />
      </div>
    )
  }

  const panelProps = { draft, setDraft, notify }

  return (
    <div className="min-h-screen bg-ink text-paper">
      <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-ink/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-4 px-5">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent2 to-accent text-[14px] font-semibold text-ink transition-transform hover:-translate-y-0.5"
              title="返回站点"
            >
              管
            </Link>
            <div className="min-w-0">
              <p className="truncate text-[14px] font-medium tracking-tight text-paper/90">
                内容管理台
                <span className="ml-2 font-normal text-paper/30">{sourceText[source]}</span>
              </p>
              <p className="mt-0.5 hidden text-[11px] text-paper/30 sm:block">
                {dirty ? '有未保存的修改' : `最近保存 ${formatTime(content.updatedAt)}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {dirty && (
              <span className="hidden items-center gap-1.5 text-[11.5px] text-amber-300/80 sm:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                未保存
              </span>
            )}
            <a
              href="#/"
              target="_blank"
              rel="noreferrer noopener"
              className="hidden items-center gap-1.5 rounded-lg border border-white/[0.12] px-3.5 py-2 text-[12.5px] text-paper/70 transition-colors hover:border-white/30 hover:text-paper sm:inline-flex"
            >
              预览站点
            </a>
            <Btn variant="primary" onClick={onSave} disabled={!dirty}>
              保存
            </Btn>
            <Btn
              variant="subtle"
              onClick={() => {
                try {
                  sessionStorage.removeItem(AUTH_KEY)
                } catch {
                  // 忽略
                }
                setAuthed(false)
                navigate('/')
              }}
            >
              退出
            </Btn>
          </div>
        </div>

        <div className="mx-auto max-w-[1320px] px-5 lg:hidden">
          <div className="-mx-1 flex gap-1 overflow-x-auto pb-2.5">
            {tabs.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={[
                  'shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px] transition-colors',
                  tab === item.key ? 'bg-white/[0.09] text-paper' : 'text-paper/50 hover:text-paper/80',
                ].join(' ')}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1320px] gap-8 px-5 py-7">
        <aside className="hidden w-[188px] shrink-0 lg:block">
          <nav className="sticky top-24 space-y-1">
            {tabs.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={[
                  'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] transition-colors',
                  tab === item.key
                    ? 'bg-white/[0.07] text-paper'
                    : 'text-paper/50 hover:bg-white/[0.04] hover:text-paper/85',
                ].join(' ')}
              >
                <span
                  className={[
                    'h-1 w-1 rounded-full transition-colors',
                    tab === item.key ? 'bg-accent2' : 'bg-transparent',
                  ].join(' ')}
                />
                {item.label}
              </button>
            ))}

            <div className="!mt-6 border-t border-white/[0.07] pt-4">
              <a
                href="#/"
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-[12.5px] text-paper/40 transition-colors hover:bg-white/[0.04] hover:text-paper/80"
              >
                ↗ 打开站点
              </a>
            </div>
          </nav>
        </aside>

        <main className="min-w-0 flex-1 pb-24">
          {tab === 'overview' && (
            <OverviewPanel
              draft={draft}
              source={source}
              updatedAt={content.updatedAt}
              onNavigate={setTab}
            />
          )}
          {tab === 'site' && <SitePanel {...panelProps} />}
          {tab === 'timeline' && <TimelinePanel {...panelProps} />}
          {tab === 'skills' && <SkillsPanel {...panelProps} />}
          {tab === 'projects' && <ProjectsPanel {...panelProps} />}
          {tab === 'posts' && <PostsPanel {...panelProps} />}
          {tab === 'data' && <DataPanel {...panelProps} />}
        </main>
      </div>

      {toast && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 px-4">
          <div
            className={[
              'rounded-xl border px-4 py-2.5 text-[12.5px] shadow-[0_18px_40px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl',
              toast.tone === 'warn'
                ? 'border-rose-400/30 bg-rose-500/[0.12] text-rose-100'
                : 'border-emerald-400/25 bg-emerald-500/[0.12] text-emerald-100',
            ].join(' ')}
          >
            {toast.text}
          </div>
        </div>
      )}
    </div>
  )
}
