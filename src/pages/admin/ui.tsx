import { useEffect, useState } from 'react'
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react'

export const inputClass =
  'w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[13.5px] leading-relaxed text-paper placeholder:text-paper/25 transition-colors duration-200 focus:border-accent2/60 focus:bg-white/[0.06] focus:outline-none'

export function Field({
  label,
  hint,
  children,
  className = '',
}: {
  label: string
  hint?: string
  children: ReactNode
  className?: string
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 flex flex-wrap items-baseline gap-2 text-[11.5px] font-medium tracking-wide text-paper/45">
        {label}
        {hint && <span className="font-normal text-paper/25">{hint}</span>}
      </span>
      {children}
    </label>
  )
}

export function TextInput({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...rest} className={`${inputClass} ${className}`} />
}

export function TextArea({ className = '', ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...rest} className={`${inputClass} resize-y ${className}`} />
}

type BtnVariant = 'primary' | 'ghost' | 'subtle' | 'danger'

const btnVariants: Record<BtnVariant, string> = {
  primary: 'bg-gradient-to-r from-accent2 to-indigo-400 px-3.5 py-2 text-ink hover:brightness-110',
  ghost:
    'border border-white/[0.12] px-3.5 py-2 text-paper/75 hover:border-white/30 hover:bg-white/[0.04] hover:text-paper',
  subtle: 'px-2.5 py-1.5 text-paper/45 hover:bg-white/[0.06] hover:text-paper/85',
  danger: 'border border-rose-400/25 px-3 py-1.5 text-rose-300/80 hover:border-rose-400/50 hover:bg-rose-400/10',
}

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant
}

export function Btn({ variant = 'ghost', className = '', ...rest }: BtnProps) {
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg text-[12.5px] font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${btnVariants[variant]} ${className}`}
    />
  )
}

/** 两段式删除按钮：第一次点击变成「确认删除」，2.6 秒内不点就复原 */
export function ConfirmButton({
  onConfirm,
  children,
  confirmLabel = '确认删除？',
}: {
  onConfirm: () => void
  children: ReactNode
  confirmLabel?: string
}) {
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    if (!armed) return
    const timer = window.setTimeout(() => setArmed(false), 2600)
    return () => window.clearTimeout(timer)
  }, [armed])

  return (
    <Btn
      variant="danger"
      onClick={() => {
        if (armed) {
          onConfirm()
          setArmed(false)
          return
        }
        setArmed(true)
      }}
      aria-label={armed ? confirmLabel : '删除'}
    >
      {armed ? confirmLabel : children}
    </Btn>
  )
}

export function Panel({
  title,
  desc,
  actions,
  children,
}: {
  title: string
  desc?: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.07] pb-5">
        <div>
          <h2 className="text-[17px] font-semibold tracking-tight text-paper">{title}</h2>
          {desc && <p className="mt-1.5 max-w-2xl text-[12.5px] leading-relaxed text-paper/40">{desc}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </header>
      {children}
    </section>
  )
}

export function Block({
  title,
  desc,
  actions,
  children,
  className = '',
}: {
  title?: string
  desc?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 ${className}`}>
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            {title && <h3 className="text-[13.5px] font-medium text-paper/85">{title}</h3>}
            {desc && <p className="mt-1 text-[11.5px] text-paper/35">{desc}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  )
}

export function SubHeader({ index, title, actions }: { index: number; title: string; actions: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-white/[0.06] font-mono text-[11px] text-paper/50">
          {String(index + 1).padStart(2, '0')}
        </span>
        <p className="truncate text-[13px] text-paper/80">{title || '未命名'}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">{actions}</div>
    </div>
  )
}

export function EmptyState({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 px-6 py-14 text-center">
      <p className="text-[13.5px] text-paper/60">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-[12px] leading-relaxed text-paper/30">{desc}</p>
    </div>
  )
}

export function Tag({ children, tone = 'muted' }: { children: ReactNode; tone?: 'muted' | 'ok' | 'warn' }) {
  const tones = {
    muted: 'border-white/10 bg-white/[0.04] text-paper/55',
    ok: 'border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-300/90',
    warn: 'border-amber-400/25 bg-amber-400/[0.08] text-amber-300/90',
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-[3px] text-[11px] ${tones[tone]}`}
    >
      {children}
    </span>
  )
}
