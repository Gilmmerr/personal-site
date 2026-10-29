import { Link } from 'react-router-dom'
import { Hero } from '../components/Hero'
import { About } from '../components/About'
import { Skills } from '../components/Skills'
import { Projects } from '../components/Projects'
import { Contact } from '../components/Contact'
import { SectionHeading } from '../components/SectionHeading'
import { Icon } from '../components/Icon'
import { formatDate } from '../lib/posts'
import { useContent } from '../lib/content'
import { useReveal } from '../lib/useReveal'

export function Home() {
  useReveal()
  const { posts } = useContent()
  const latest = posts.slice(0, 3)

  return (
    <>
      <Hero />
      <About />
      <Skills />
      <Projects />

      <section id="writing" className="scroll-mt-24 py-24">
        <div className="wrap">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Writing"
              title="最近写的"
              desc="多是自己踩过的坑，按「现象 → 原因 → 怎么解」写，读完能直接照着做。"
            />
            <Link to="/blog" className="btn-ghost shrink-0" data-reveal>
              全部文章
              <Icon name="arrow-right" size={15} />
            </Link>
          </div>

          <div className="mt-12 grid gap-3">
            {latest.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="card card-hover group flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between"
                data-reveal
              >
                <div className="min-w-0">
                  <p className="font-mono text-[11px] text-paper/30">
                    {formatDate(post.date)} · 约 {post.readingTime} 分钟
                  </p>
                  <h3 className="mt-2 text-[15.5px] font-medium text-paper/90 transition-colors group-hover:text-paper">
                    {post.title}
                  </h3>
                  <p className="mt-1.5 truncate text-[13px] text-paper/45">{post.summary}</p>
                </div>
                <Icon
                  name="arrow-right"
                  size={18}
                  className="shrink-0 text-paper/20 transition-all duration-300 group-hover:translate-x-1 group-hover:text-accent2"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Contact />
    </>
  )
}
