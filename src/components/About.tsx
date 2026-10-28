import { site } from '../data/site'
import { SectionHeading } from './SectionHeading'

export function About() {
  return (
    <section id="about" className="scroll-mt-24 py-24">
      <div className="wrap">
        <SectionHeading
          eyebrow="About"
          title="关于我"
          desc="一个把「先想清楚再动手」当习惯的开发者。下面是我的经历，按时间倒序排。"
        />

        <div className="mt-14 grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <div className="space-y-5" data-reveal>
            {site.intro.map((paragraph, index) => (
              <p
                key={index}
                className={[
                  'text-[15.5px] leading-[1.95]',
                  index === 0 ? 'text-paper/80' : 'text-paper/62',
                ].join(' ')}
              >
                {paragraph}
              </p>
            ))}

            <div className="!mt-8 grid gap-3 sm:grid-cols-2">
              {[
                { label: '当前方向', value: '前端开发 / 全栈' },
                { label: '可投入时间', value: '全职实习' },
                { label: '常用工具', value: 'VS Code · Vite · WorkBuddy' },
                { label: '联系方式', value: site.email },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
                  <p className="text-[11px] uppercase tracking-wider text-paper/35">{item.label}</p>
                  <p className="mt-1 truncate text-[13px] text-paper/75">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <ol className="relative space-y-9 border-l border-white/10 pl-6" data-reveal>
            {site.timeline.map((item) => (
              <li key={item.period} className="relative">
                <span className="absolute -left-[1.6rem] top-1.5 grid h-3 w-3 place-items-center rounded-full border border-accent2/40 bg-ink">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent2" />
                </span>
                <p className="font-mono text-[11px] tracking-wide text-accent2/70">{item.period}</p>
                <h3 className="mt-1.5 text-[15px] font-medium text-paper/90">
                  {item.title}
                  <span className="ml-2 text-xs font-normal text-paper/40">{item.org}</span>
                </h3>
                <p className="mt-2 text-[13.5px] leading-[1.85] text-paper/55">{item.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
