import { useContent } from '../lib/content'
import { scrollToSection } from '../lib/scroll'
import { Icon } from './Icon'

export function Hero() {
  const { site } = useContent()

  return (
    <section id="home" className="relative flex min-h-[calc(100vh-4rem)] scroll-mt-24 items-center pb-24 pt-32">
      <div className="wrap grid items-center gap-14 lg:grid-cols-[1.08fr_0.92fr]">
        <div>
          <div
            className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-paper/65"
            data-reveal
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            正在寻找前端方向的机会
          </div>

          <h1
            className="mt-7 text-[clamp(2.35rem,5.6vw,4rem)] font-semibold leading-[1.06] tracking-tight"
            data-reveal
          >
            你好，我是
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-accent2 via-indigo-300 to-accent bg-clip-text text-transparent">
              {site.name}
            </span>
          </h1>

          <p className="mt-5 text-lg text-paper/75" data-reveal>
            {site.role}
          </p>
          <p className="mt-2 max-w-md text-[15px] leading-relaxed text-paper/55" data-reveal>
            {site.tagline}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3" data-reveal>
            <button type="button" onClick={() => scrollToSection('projects')} className="btn-primary">
              看看项目
              <Icon name="arrow-right" size={16} />
            </button>
            <a href={site.resumeUrl} target="_blank" rel="noreferrer noopener" className="btn-ghost">
              <Icon name="download" size={15} />
              下载简历
            </a>
            <button
              type="button"
              onClick={() => scrollToSection('contact')}
              className="btn-ghost !border-transparent !bg-transparent hover:!bg-white/[0.05]"
            >
              联系我
            </button>
          </div>

          <div className="mt-10 flex items-center gap-4 text-paper/45" data-reveal>
            {site.socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer noopener"
                className="link-underline inline-flex items-center gap-2 text-xs"
              >
                <Icon name={social.icon === 'github' ? 'github' : 'mail'} size={15} />
                {social.label}
              </a>
            ))}
            <span className="inline-flex items-center gap-1.5 text-xs">
              <Icon name="pin" size={14} />
              {site.location}
            </span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[340px]" data-reveal>
          <div
            className="absolute inset-6 -z-10 rounded-full opacity-60 blur-3xl"
            style={{ background: 'linear-gradient(135deg, #6366F1 0%, #22D3EE 100%)' }}
          />
          <div className="card p-3.5">
            <img
              src={site.avatar}
              alt={`${site.name} 的头像`}
              className="aspect-square w-full rounded-xl object-cover"
              loading="eager"
            />
            <div className="flex items-center justify-between gap-3 px-1.5 pb-1 pt-4">
              <div>
                <p className="text-sm font-medium text-paper">{site.name}</p>
                <p className="mt-0.5 text-[11px] text-paper/40">{site.location}</p>
              </div>
              <span className="chip !border-emerald-400/25 !bg-emerald-400/[0.08] !text-emerald-300/90">
                Open to work
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
