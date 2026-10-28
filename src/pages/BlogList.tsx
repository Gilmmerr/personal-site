import { Link } from 'react-router-dom'
import { formatDate, posts } from '../lib/posts'
import { Icon } from '../components/Icon'
import { useReveal } from '../lib/useReveal'

export function BlogList() {
  useReveal()
  return (
    <div className="pb-24 pt-28">
      <div className="wrap">
        <header className="max-w-2xl" data-reveal>
          <p className="eyebrow">
            <span className="h-px w-6 bg-accent2/60" />
            Writing
          </p>
          <h1 className="mt-4 text-[clamp(1.9rem,4.2vw,2.8rem)] font-semibold leading-tight tracking-tight text-paper">
            技术笔记
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-paper/55">
            共 {posts.length} 篇。大多来自真实项目里的卡点，尽量写清「为什么这样做」，而不只是「怎么做」。
          </p>
        </header>

        <div className="mt-12 grid gap-3">
          {posts.map((post, index) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="card card-hover group grid gap-4 p-6 sm:grid-cols-[110px_1fr_auto] sm:items-start"
              data-reveal
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <p className="font-mono text-[11.5px] text-paper/30 sm:pt-1">{formatDate(post.date)}</p>

              <div className="min-w-0">
                <h2 className="text-[16px] font-medium text-paper/90 transition-colors group-hover:text-paper">
                  {post.title}
                </h2>
                <p className="mt-2 text-[13.5px] leading-relaxed text-paper/50">{post.summary}</p>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {post.tags.map((tag) => (
                    <span key={tag} className="chip !py-0.5 !text-[10.5px]">
                      {tag}
                    </span>
                  ))}
                  <span className="ml-1 text-[11px] text-paper/25">约 {post.readingTime} 分钟</span>
                </div>
              </div>

              <Icon
                name="arrow-right"
                size={18}
                className="hidden shrink-0 text-paper/20 transition-all duration-300 group-hover:translate-x-1 group-hover:text-accent2 sm:mt-1 sm:block"
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
