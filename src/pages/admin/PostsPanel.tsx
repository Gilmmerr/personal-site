import { useState } from 'react'
import { countReadingTime, formatDate, uniqueSlug, type ContentPost } from '../../lib/posts'
import { Block, Btn, ConfirmButton, EmptyState, Field, Panel, Tag, TextArea, TextInput } from './ui'
import { fromTags, removeAt, replaceAt, toTags, today } from './helpers'
import type { PanelProps } from './types'

function blankPost(existing: ContentPost[]): ContentPost {
  const slug = uniqueSlug('新文章', existing.map((post) => post.slug))
  return {
    slug,
    title: '新文章',
    date: today(),
    tags: [],
    summary: '',
    body: '## 小标题\n\n在这里写正文，支持 Markdown、代码块与表格。\n',
  }
}

export function PostsPanel({ draft, setDraft }: PanelProps) {
  const { posts } = draft
  const [active, setActive] = useState(0)

  const post = posts[Math.min(active, Math.max(0, posts.length - 1))]

  const setPosts = (next: ContentPost[]) => setDraft((prev) => ({ ...prev, posts: next }))

  const setPost = (patch: Partial<ContentPost>) => {
    if (!post) return
    setPosts(replaceAt(posts, active, { ...post, ...patch }))
  }

  const addPost = () => {
    setPosts([blankPost(posts), ...posts])
    setActive(0)
  }

  const removePost = () => {
    setPosts(removeAt(posts, active))
    setActive((prev) => Math.max(0, Math.min(prev, posts.length - 2)))
  }

  const sorted = [...posts].sort((a, b) => (a.date < b.date ? 1 : -1))

  return (
    <Panel
      title="博客文章"
      desc="文章正文是 Markdown，保存后博客列表与详情页立即更新。目录（TOC）与阅读时长由正文自动推导。"
      actions={
        <Btn variant="primary" onClick={addPost}>
          + 写新文章
        </Btn>
      }
    >
      {posts.length === 0 && (
        <EmptyState title="还没有文章" desc="点右上角「+ 写新文章」，博客页会自动出现第一篇。" />
      )}

      {posts.length > 0 && post && (
        <div className="grid gap-5 lg:grid-cols-[236px_minmax(0,1fr)]">
          <aside className="space-y-2">
            {sorted.map((item) => {
              const index = posts.findIndex((candidate) => candidate === item)
              const isActive = index === active
              return (
                <button
                  key={item.slug}
                  type="button"
                  onClick={() => setActive(index)}
                  className={[
                    'w-full rounded-xl border px-3 py-2.5 text-left transition-all duration-200',
                    isActive
                      ? 'border-accent2/40 bg-accent2/[0.08]'
                      : 'border-white/[0.07] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]',
                  ].join(' ')}
                >
                  <p className="font-mono text-[10.5px] text-paper/30">{formatDate(item.date)}</p>
                  <p className="mt-1 line-clamp-2 text-[12.5px] leading-snug text-paper/80">{item.title}</p>
                </button>
              )
            })}
            <p className="pt-1 text-[11px] text-paper/25">列表按发布时间倒序展示</p>
          </aside>

          <div className="space-y-3">
            <Block
              actions={
                <>
                  <a
                    href={`#/blog/${post.slug}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.12] px-3.5 py-2 text-[12.5px] text-paper/75 transition-colors hover:border-white/30 hover:text-paper"
                  >
                    预览
                  </a>
                  <ConfirmButton onConfirm={removePost}>删除文章</ConfirmButton>
                </>
              }
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="标题" className="sm:col-span-2">
                  <TextInput value={post.title} onChange={(e) => setPost({ title: e.target.value })} />
                </Field>
                <Field label="slug" hint="网址片段">
                  <TextInput value={post.slug} onChange={(e) => setPost({ slug: e.target.value })} />
                </Field>
                <Field label="发布日期">
                  <TextInput
                    type="date"
                    value={post.date}
                    onChange={(e) => setPost({ date: e.target.value })}
                  />
                </Field>
                <Field label="标签" hint="逗号分隔" className="sm:col-span-2">
                  <TextInput
                    value={toTags(post.tags)}
                    onChange={(e) => setPost({ tags: fromTags(e.target.value) })}
                    placeholder="React, 调试, 部署"
                  />
                </Field>
                <Field label="摘要" hint="列表页与首页显示" className="sm:col-span-2">
                  <TextArea rows={2} value={post.summary} onChange={(e) => setPost({ summary: e.target.value })} />
                </Field>
              </div>
            </Block>

            <Block
              title="正文（Markdown）"
              desc="支持标题、列表、表格、代码块；二级/三级标题会自动进右侧目录"
              actions={
                <Tag>
                  {post.body.replace(/\s/g, '').length} 字 · 约 {countReadingTime(post.body)} 分钟
                </Tag>
              }
            >
              <TextArea
                rows={22}
                spellCheck={false}
                value={post.body}
                onChange={(e) => setPost({ body: e.target.value })}
                className="min-h-[420px] font-mono text-[12.5px] leading-[1.85]"
              />
            </Block>
          </div>
        </div>
      )}
    </Panel>
  )
}
