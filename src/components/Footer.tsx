import { Link } from 'react-router-dom'
import { useContent } from '../lib/content'
import { Icon } from './Icon'

export function Footer() {
  const { site } = useContent()

  return (
    <footer className="relative border-t border-white/[0.07] py-10">
      <div className="wrap flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-paper/70">
            © {new Date().getFullYear()} {site.name}
            <span className="text-accent2">.</span>
          </p>
          <p className="mt-1 text-xs text-paper/35">
            用 React + TypeScript + Tailwind 手写，静态托管，没有埋点。
          </p>
        </div>

        <div className="flex items-center gap-3">
          {site.socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noreferrer noopener"
              className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-paper/55 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:text-paper"
              aria-label={social.label}
            >
              <Icon name={social.icon === 'github' ? 'github' : 'mail'} size={16} />
            </a>
          ))}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3.5 py-2 text-xs text-paper/55 transition-colors hover:border-white/25 hover:text-paper"
          >
            <Icon name="arrow-up" size={14} />
            回到顶部
          </button>
          <Link
            to="/admin"
            title="内容管理"
            aria-label="进入内容管理后台"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] px-3.5 py-2 text-xs text-paper/30 transition-colors hover:border-white/20 hover:text-paper/80"
          >
            <Icon name="settings" size={14} />
            后台
          </Link>
        </div>
      </div>
    </footer>
  )
}
