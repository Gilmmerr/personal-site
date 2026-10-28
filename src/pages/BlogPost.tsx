import { isValidElement, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import bash from 'highlight.js/lib/languages/bash'
import css from 'highlight.js/lib/languages/css'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import markdown from 'highlight.js/lib/languages/markdown'
import tsx from 'highlight.js/lib/languages/typescript'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import { formatDate, getPost, getPostNeighbors, slugify } from '../lib/posts'
import { useReveal } from '../lib/useReveal'
import { Icon } from '../components/Icon'
import { NotFound } from './NotFound'

// 只注册文章里实际用到的语言，避免打进完整的 highlight.js 语言包
const highlightLanguages = {
  bash,
  css,
  javascript,
  json,
  markdown,
  tsx,
  typescript,
  xml,
  html: xml,
  js: javascript,
  ts: typescript,
  md: markdown,
}

function nodeText(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(nodeText).join('')
  if (isValidElement<{ children?: React.ReactNode }>(node)) return nodeText(node.props.children)
  return ''
}

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const post = slug ? getPost(slug) : undefined
  const [activeId, setActiveId] = useState('')
  useReveal()

  useEffect(() => {
    if (!post) return
    setActiveId(post.toc[0]?.id ?? '')

    const headings = post.toc
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el))
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-18% 0px -72% 0px', threshold: 0 },
    )
    headings.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [post])

  if (!post) return <NotFound title="文章不存在" desc="链接可能失效了，回博客列表看看其他的。" />

  const { prev, next } = getPostNeighbors(post.slug)

  return (
    <article className="pb-24 pt-28">
      <div className="wrap">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-[13px] text-paper/45 transition-colors hover:text-paper"
        >
          <Icon name="arrow-left" size={15} />
          全部文章
        </Link>

        <header className="mt-8 max-w-3xl" data-reveal>
          <p className="font-mono text-[11.5px] text-paper/35">
            {formatDate(post.date)} · 约 {post.readingTime} 分钟
          </p>
          <h1 className="mt-4 text-[clamp(1.75rem,4vw,2.6rem)] font-semibold leading-[1.22] tracking-tight text-paper">
            {post.title}
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-paper/55">{post.summary}</p>
          <div className="mt-5 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <span key={tag} className="chip">
                {tag}
              </span>
            ))}
          </div>
        </header>

        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_210px] lg:gap-16">
          <div className="prose-dark min-w-0">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[[rehypeHighlight, { languages: highlightLanguages, detect: false }]]}
              components={{
                h2: ({ children }) => <h2 id={slugify(nodeText(children))}>{children}</h2>,
                h3: ({ children }) => <h3 id={slugify(nodeText(children))}>{children}</h3>,
              }}
            >
              {post.body}
            </ReactMarkdown>
          </div>

          {post.toc.length > 0 && (
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <p className="text-[11px] uppercase tracking-[0.18em] text-paper/30">目录</p>
                <nav className="mt-3 space-y-1 border-l border-white/10">
                  {post.toc.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        document
                          .getElementById(item.id)
                          ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }
                      className={[
                        '-ml-px block w-full border-l py-1.5 text-left text-[12.5px] leading-relaxed transition-all duration-200',
                        item.depth === 3 ? 'pl-6' : 'pl-4',
                        activeId === item.id
                          ? 'border-accent2 text-paper'
                          : 'border-transparent text-paper/40 hover:text-paper/75',
                      ].join(' ')}
                    >
                      {item.text}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>
          )}
        </div>

        <div className="mt-16 grid gap-3 border-t border-white/[0.07] pt-8 sm:grid-cols-2">
          {prev ? (
            <Link to={`/blog/${prev.slug}`} className="card card-hover group p-5">
              <p className="text-[11px] uppercase tracking-wider text-paper/30">上一篇</p>
              <p className="mt-1.5 text-[13.5px] text-paper/80 transition-colors group-hover:text-paper">
                {prev.title}
              </p>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link to={`/blog/${next.slug}`} className="card card-hover group p-5 sm:text-right">
              <p className="text-[11px] uppercase tracking-wider text-paper/30">下一篇</p>
              <p className="mt-1.5 text-[13.5px] text-paper/80 transition-colors group-hover:text-paper">
                {next.title}
              </p>
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
