import { Link, useParams } from 'react-router-dom'
import { getProject, projects } from '../data/projects'
import { Icon } from '../components/Icon'
import { coverTexture } from '../lib/ui'
import { useReveal } from '../lib/useReveal'
import { NotFound } from './NotFound'

export function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>()
  const project = slug ? getProject(slug) : undefined
  useReveal()

  if (!project) return <NotFound />

  const index = projects.findIndex((item) => item.slug === project.slug)
  const prev = index > 0 ? projects[index - 1] : undefined
  const next = index < projects.length - 1 ? projects[index + 1] : undefined

  return (
    <article className="pb-24 pt-28">
      <div className="wrap">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[13px] text-paper/45 transition-colors hover:text-paper"
        >
          <Icon name="arrow-left" size={15} />
          返回首页
        </Link>

        <header className="mt-8 max-w-3xl" data-reveal>
          <p className="eyebrow">
            <span className="h-px w-6 bg-accent2/60" />
            {project.year}
          </p>
          <h1 className="mt-4 text-[clamp(1.9rem,4.2vw,2.9rem)] font-semibold leading-tight tracking-tight text-paper">
            {project.title}
          </h1>
          <p className="mt-4 text-[15.5px] leading-relaxed text-paper/60">{project.summary}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span key={tag} className="chip">
                {tag}
              </span>
            ))}
          </div>
        </header>

        <div
          className="relative mt-10 h-[190px] overflow-hidden rounded-2xl border border-white/10 sm:h-[250px]"
          style={{ background: project.cover }}
          data-reveal
        >
          <div className="absolute inset-0 opacity-[0.35]" style={coverTexture} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(255,255,255,0.22),transparent_55%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(11,15,26,0.7),rgba(11,15,26,0.05)_65%)]" />
          <span
            aria-hidden="true"
            className="absolute -bottom-6 right-6 select-none font-mono text-[104px] font-semibold leading-none text-white/[0.15]"
          >
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="absolute inset-x-6 bottom-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/55">Case Study</p>
            <p className="mt-1.5 text-[15px] text-white/85">{project.tags[0]}</p>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3" data-reveal>
          {[
            { label: '时间', value: project.year },
            { label: '我的角色', value: project.role },
            { label: '相关链接', value: project.links.length > 0 ? `${project.links.length} 个` : '暂无公开链接' },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3.5">
              <p className="text-[11px] uppercase tracking-wider text-paper/30">{item.label}</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-paper/75">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-14 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div className="space-y-14">
            <section data-reveal>
              <h2 className="text-[13px] uppercase tracking-[0.18em] text-accent2/70">背景</h2>
              <p className="mt-4 text-[15px] leading-[1.95] text-paper/68">{project.background}</p>
            </section>

            <section data-reveal>
              <h2 className="text-[13px] uppercase tracking-[0.18em] text-accent2/70">怎么做的</h2>
              <ol className="mt-5 space-y-4">
                {project.approach.map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="mt-0.5 font-mono text-[11px] text-accent2/50">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="text-[14.5px] leading-[1.9] text-paper/65">{item}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section data-reveal>
              <h2 className="text-[13px] uppercase tracking-[0.18em] text-accent2/70">卡住的地方</h2>
              <div className="mt-5 grid gap-3">
                {project.challenges.map((item) => (
                  <div key={item.title} className="card p-5">
                    <h3 className="text-[14.5px] font-medium text-paper/90">{item.title}</h3>
                    <p className="mt-2 text-[13.5px] leading-[1.9] text-paper/55">{item.detail}</p>
                  </div>
                ))}
              </div>
            </section>

            <section data-reveal>
              <h2 className="text-[13px] uppercase tracking-[0.18em] text-accent2/70">结果</h2>
              <p className="mt-4 text-[15px] leading-[1.95] text-paper/68">{project.outcome}</p>

              {project.links.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-3">
                  {project.links.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="btn-ghost"
                    >
                      {link.label}
                      <Icon name="external" size={14} />
                    </a>
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-3">
              <Link to="/" className="card card-hover block p-4">
                <p className="text-[11px] uppercase tracking-wider text-paper/30">全部项目</p>
                <p className="mt-1.5 text-[13px] text-paper/75">返回首页查看列表</p>
              </Link>
              {prev && (
                <Link to={`/project/${prev.slug}`} className="card card-hover block p-4">
                  <p className="text-[11px] uppercase tracking-wider text-paper/30">上一个</p>
                  <p className="mt-1.5 text-[13px] text-paper/75">{prev.title}</p>
                </Link>
              )}
              {next && (
                <Link to={`/project/${next.slug}`} className="card card-hover block p-4">
                  <p className="text-[11px] uppercase tracking-wider text-paper/30">下一个</p>
                  <p className="mt-1.5 text-[13px] text-paper/75">{next.title}</p>
                </Link>
              )}
            </div>
          </aside>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-white/[0.07] pt-8 sm:flex-row sm:items-center sm:justify-between">
          {prev ? (
            <Link to={`/project/${prev.slug}`} className="group inline-flex items-center gap-2 text-[13px] text-paper/50 hover:text-paper">
              <Icon name="arrow-left" size={15} />
              上一个：{prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              to={`/project/${next.slug}`}
              className="group inline-flex items-center gap-2 text-[13px] text-paper/50 hover:text-paper sm:justify-end"
            >
              下一个：{next.title}
              <Icon name="arrow-right" size={15} />
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
