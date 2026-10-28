import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { site, type NavItem } from '../data/site'
import { Icon } from './Icon'

const NAV_OFFSET = 72

export function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isHome = pathname === '/'
  const onBlog = pathname.startsWith('/blog')

  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('home')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // 区块高亮：取视口中部那条窄带所在的 section
  useEffect(() => {
    if (!isHome) return
    const elements = site.nav
      .filter((item) => item.id)
      .map((item) => document.getElementById(item.id as string))
      .filter((el): el is HTMLElement => Boolean(el))
    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [isHome, pathname])

  const scrollToId = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET
    window.scrollTo({ top, behavior: 'smooth' })
  }

  const go = (item: NavItem) => {
    setOpen(false)
    if (item.to) {
      navigate(item.to)
      return
    }
    const id = item.id as string
    if (isHome) {
      scrollToId(id)
      return
    }
    navigate('/')
    window.setTimeout(() => scrollToId(id), 180)
  }

  const itemClass = (isActive: boolean) =>
    [
      'rounded-full px-3.5 py-2 text-[13.5px] transition-colors duration-300',
      isActive ? 'bg-white/[0.08] text-paper' : 'text-paper/60 hover:text-paper',
    ].join(' ')

  return (
    <header
      className={[
        'fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-smooth',
        scrolled || open
          ? 'border-b border-white/[0.07] bg-ink/80 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent',
      ].join(' ')}
    >
      <nav className="wrap flex h-16 items-center justify-between" aria-label="主导航">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-accent2 to-accent text-[15px] font-semibold text-ink">
            G
          </span>
          <span className="text-sm font-medium tracking-tight text-paper/90 group-hover:text-paper">
            {site.name}
            <span className="text-accent2">.</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {site.nav.map((item) => {
            const isActive = item.to ? onBlog : isHome && active === item.id
            return (
              <button key={item.label} type="button" onClick={() => go(item)} className={itemClass(isActive)}>
                {item.label}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          <a
            href={site.socials[0].href}
            target="_blank"
            rel="noreferrer noopener"
            className="hidden h-9 w-9 place-items-center rounded-full border border-white/10 text-paper/60 transition-colors hover:border-white/25 hover:text-paper sm:grid"
            aria-label="GitHub"
          >
            <Icon name="github" size={16} />
          </a>
          <a
            href={site.resumeUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="btn-ghost hidden !px-4 !py-2 text-[13px] sm:inline-flex"
          >
            <Icon name="download" size={15} />
            简历
          </a>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-paper/70 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? '关闭菜单' : '打开菜单'}
          >
            <Icon name={open ? 'close' : 'menu'} size={18} />
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-white/[0.06] bg-ink/95 backdrop-blur-xl md:hidden">
          <div className="wrap grid gap-1 py-4">
            {site.nav.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => go(item)}
                className="rounded-xl px-3 py-3 text-left text-sm text-paper/75 transition-colors hover:bg-white/[0.05] hover:text-paper"
              >
                {item.label}
              </button>
            ))}
            <a
              href={site.resumeUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-xl px-3 py-3 text-sm text-paper/75 transition-colors hover:bg-white/[0.05] hover:text-paper"
            >
              下载简历
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
