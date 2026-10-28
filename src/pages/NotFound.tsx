import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'

interface NotFoundProps {
  title?: string
  desc?: string
}

export function NotFound({ title = '这里什么都没有', desc = '链接可能拼错了，或者内容已经挪走。' }: NotFoundProps) {
  return (
    <section className="flex min-h-[70vh] items-center pt-24">
      <div className="wrap text-center">
        <p className="font-mono text-[13px] text-accent2/60">404</p>
        <h1 className="mt-4 text-[clamp(1.6rem,4vw,2.4rem)] font-semibold tracking-tight text-paper">{title}</h1>
        <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-paper/50">{desc}</p>
        <Link to="/" className="btn-primary mt-8">
          回到首页
          <Icon name="arrow-right" size={15} />
        </Link>
      </div>
    </section>
  )
}
