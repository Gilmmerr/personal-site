import { useState } from 'react'
import { useContent } from '../lib/content'
import { SectionHeading } from './SectionHeading'
import { Icon } from './Icon'

interface FormState {
  name: string
  email: string
  message: string
}

const emptyForm: FormState = { name: '', email: '', message: '' }

export function Contact() {
  const { site } = useContent()
  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [sent, setSent] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(site.email)
      setCopied(true)
    } catch {
      // 非 https 或旧浏览器降级
      const textarea = document.createElement('textarea')
      textarea.value = site.email
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(ok)
    }
    window.setTimeout(() => setCopied(false), 1600)
  }

  const update = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {}
    if (!form.name.trim()) next.name = '留个称呼吧'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = '邮箱格式看起来不对'
    if (form.message.trim().length < 10) next.message = '至少写 10 个字，方便我理解你的意思'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validate()) return

    try {
      const key = 'personal-site:messages'
      const stored = JSON.parse(localStorage.getItem(key) ?? '[]') as unknown[]
      localStorage.setItem(key, JSON.stringify([...stored, { ...form, at: new Date().toISOString() }]))
    } catch {
      // 隐私模式下 localStorage 不可写，忽略即可
    }
    setSent(true)
  }

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-paper placeholder:text-paper/25 transition-colors duration-300 focus:border-accent2/60 focus:outline-none'

  return (
    <section id="contact" className="scroll-mt-24 py-24">
      <div className="wrap">
        <SectionHeading
          eyebrow="Contact"
          title="聊聊？"
          desc="有岗位、有项目、或者只是想讨论某个实现，都可以直接找我。"
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="card p-7" data-reveal>
            <p className="text-[11px] uppercase tracking-[0.18em] text-paper/35">邮箱</p>
            <div className="mt-3 flex items-center gap-2">
              <a href={`mailto:${site.email}`} className="truncate text-[15px] text-paper/85 hover:text-paper">
                {site.email}
              </a>
              <button
                type="button"
                onClick={copyEmail}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-[11.5px] text-paper/60 transition-colors hover:border-white/25 hover:text-paper"
                aria-label="复制邮箱"
              >
                <Icon name={copied ? 'check' : 'copy'} size={13} />
                {copied ? '已复制' : '复制'}
              </button>
            </div>

            <div className="mt-7 h-px w-full bg-white/[0.07]" />

            <p className="mt-7 text-[11px] uppercase tracking-[0.18em] text-paper/35">在这些地方</p>
            <div className="mt-3 grid gap-2">
              {site.socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-[13px] text-paper/70 transition-colors hover:border-white/20 hover:text-paper"
                >
                  <span className="inline-flex items-center gap-2.5">
                    <Icon name={social.icon === 'github' ? 'github' : 'mail'} size={15} />
                    {social.label}
                  </span>
                  <Icon
                    name="external"
                    size={14}
                    className="text-paper/25 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:text-accent2"
                  />
                </a>
              ))}
            </div>

            <p className="mt-7 text-[12px] leading-relaxed text-paper/35">
              工作日通常 24 小时内回复。急着找可以直接发邮件，不要用表单。
            </p>
          </div>

          <div className="card p-7 sm:p-8" data-reveal>
            {sent ? (
              <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
                <span className="grid h-12 w-12 place-items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
                  <Icon name="check" size={22} />
                </span>
                <h3 className="mt-5 text-lg font-medium text-paper">已记下了，谢谢</h3>
                <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-paper/50">
                  这是一个纯静态站点，没有后端接收消息。内容已保存在本机浏览器里，我不一定看得到——
                  真有事情请直接发邮件，或者点左边的复制按钮。
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setForm(emptyForm)
                    setSent(false)
                  }}
                  className="btn-ghost mt-6"
                >
                  再写一条
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact-name" className="mb-1.5 block text-[12px] text-paper/50">
                      称呼
                    </label>
                    <input
                      id="contact-name"
                      value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                      className={inputClass}
                      placeholder="怎么称呼你"
                      autoComplete="name"
                    />
                    {errors.name && <p className="mt-1.5 text-[11.5px] text-rose-300/80">{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="mb-1.5 block text-[12px] text-paper/50">
                      邮箱
                    </label>
                    <input
                      id="contact-email"
                      value={form.email}
                      onChange={(e) => update('email', e.target.value)}
                      className={inputClass}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                    {errors.email && <p className="mt-1.5 text-[11.5px] text-rose-300/80">{errors.email}</p>}
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="contact-message" className="mb-1.5 block text-[12px] text-paper/50">
                    想说什么
                  </label>
                  <textarea
                    id="contact-message"
                    value={form.message}
                    onChange={(e) => update('message', e.target.value)}
                    rows={6}
                    className={`${inputClass} resize-none leading-relaxed`}
                    placeholder="简单说一下背景和你想聊的事情"
                  />
                  {errors.message && <p className="mt-1.5 text-[11.5px] text-rose-300/80">{errors.message}</p>}
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[11.5px] text-paper/30">不收集任何信息，内容只留在你自己的浏览器。</p>
                  <button type="submit" className="btn-primary">
                    提交
                    <Icon name="arrow-right" size={15} />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
