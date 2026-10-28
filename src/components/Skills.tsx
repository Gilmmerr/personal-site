import { skillGroups } from '../data/skills'
import { SectionHeading } from './SectionHeading'

export function Skills() {
  return (
    <section id="skills" className="scroll-mt-24 py-24">
      <div className="wrap">
        <SectionHeading
          eyebrow="Skills"
          title="技能与工具"
          desc="按「能独立交付」为标准打分，不是会用就算。分数只是相对参考，具体看项目。"
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {skillGroups.map((group, groupIndex) => (
            <div
              key={group.group}
              className="card card-hover p-6"
              data-reveal
              style={{ transitionDelay: `${groupIndex * 60}ms` }}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-[15px] font-medium text-paper/90">{group.group}</h3>
                <span className="font-mono text-[11px] text-paper/30">{group.items.length} 项</span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-paper/40">{group.desc}</p>

              <ul className="mt-6 space-y-4">
                {group.items.map((item) => (
                  <li key={item.name}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-[13.5px] text-paper/80">
                        <span aria-hidden="true" className="text-[13px]">
                          {item.icon}
                        </span>
                        {item.name}
                      </span>
                      <span className="font-mono text-[11px] tabular-nums text-paper/30">{item.level}</span>
                    </div>
                    <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-accent2/70 to-accent transition-[width] duration-700 ease-smooth"
                        style={{ width: `${item.level}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
