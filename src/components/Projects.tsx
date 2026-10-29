import { Link } from 'react-router-dom'
import type { Project } from '../data/projects'
import { useContent } from '../lib/content'
import { coverTexture } from '../lib/ui'
import { SectionHeading } from './SectionHeading'
import { Icon } from './Icon'

interface CardProps {
  project: Project
  featured?: boolean
  index: number
}

export function ProjectCard({ project, featured = false, index }: CardProps) {
  return (
    <Link
      to={`/project/${project.slug}`}
      className={[
        'card card-hover group flex flex-col overflow-hidden p-3',
        featured ? 'md:col-span-2 lg:col-span-2' : '',
      ].join(' ')}
      data-reveal
    >
      <div
        className={[
          'relative overflow-hidden rounded-xl',
          featured ? 'aspect-[16/9] md:aspect-[2/1]' : 'aspect-[16/10]',
        ].join(' ')}
        style={{ background: project.cover }}
      >
        <div className="absolute inset-0 opacity-[0.35]" style={coverTexture} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(255,255,255,0.24),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(11,15,26,0.72),rgba(11,15,26,0.05)_65%)]" />

        <span
          aria-hidden="true"
          className="absolute -bottom-5 right-3 select-none font-mono text-[88px] font-semibold leading-none text-white/[0.13] transition-transform duration-500 ease-smooth group-hover:-translate-y-1"
        >
          {String(index + 1).padStart(2, '0')}
        </span>

        <span className="absolute right-3.5 top-3.5 rounded-full border border-white/20 bg-black/25 px-2.5 py-1 font-mono text-[10.5px] text-white/75">
          {project.year}
        </span>

        <div className="absolute inset-x-4 bottom-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/55">Case Study</p>
          <p className="mt-1.5 truncate text-[13.5px] text-white/85">{project.tags[0]}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-5">
        <div className="flex flex-wrap gap-1.5">
          {project.tags.slice(0, featured ? 5 : 3).map((tag) => (
            <span key={tag} className="chip">
              {tag}
            </span>
          ))}
        </div>

        <h3 className="mt-3.5 text-[17px] font-medium tracking-tight text-paper/95">{project.title}</h3>
        <p className="mt-2 line-clamp-2 text-[13.5px] leading-relaxed text-paper/50">{project.summary}</p>

        <div className="mt-auto flex items-center justify-between pt-5">
          <span className="text-[11.5px] text-paper/30">{project.role.split(' / ')[0]}</span>
          <span className="inline-flex items-center gap-1.5 text-xs text-accent2/80 transition-transform duration-300 group-hover:translate-x-1">
            查看详情
            <Icon name="arrow-right" size={14} />
          </span>
        </div>
      </div>
    </Link>
  )
}

export function Projects() {
  const { projects } = useContent()

  return (
    <section id="projects" className="scroll-mt-24 py-24">
      <div className="wrap">
        <SectionHeading
          eyebrow="Projects"
          title="做过的东西"
          desc="每个项目都写清了背景、方案与被真实问题改过的部分。点击卡片看详情。"
        />

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <ProjectCard key={project.slug} project={project} featured={index === 0} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
