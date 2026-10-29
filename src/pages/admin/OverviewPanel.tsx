import type { Content, ContentSource } from '../../lib/content'
import { Panel, Tag } from './ui'
import { formatTime } from './helpers'
import type { TabKey } from './types'

const sourceText: Record<ContentSource, string> = {
  database: 'MySQL 数据库',
  snapshot: '静态快照',
  default: '默认内容',
}

const cards: { key: TabKey; label: string; hint: string }[] = [
  { key: 'site', label: '站点信息', hint: '姓名、简介、邮箱、社交链接' },
  { key: 'timeline', label: '经历', hint: '关于区块的时间线' },
  { key: 'skills', label: '技能', hint: '分组与熟练度' },
  { key: 'projects', label: '项目', hint: '作品卡片与详情' },
  { key: 'posts', label: '文章', hint: 'Markdown 正文' },
  { key: 'data', label: '数据', hint: '导出、导入、重置' },
]

export function OverviewPanel({
  draft,
  source,
  updatedAt,
  onNavigate,
}: {
  draft: Content
  source: ContentSource
  updatedAt: string
  onNavigate: (tab: TabKey) => void
}) {
  const skillCount = draft.skillGroups.reduce((total, group) => total + group.items.length, 0)

  const stats = [
    { label: '项目', value: draft.projects.length, unit: '个' },
    { label: '文章', value: draft.posts.length, unit: '篇' },
    { label: '技能', value: skillCount, unit: '项' },
    { label: '经历', value: draft.site.timeline.length, unit: '段' },
  ]

  return (
    <Panel
      title="概览"
      desc="这里是整站文案的控制台。左侧选模块，改完点右上角「保存」，内容写进本机 MySQL，站点立即生效。"
      actions={<Tag tone={source === 'database' ? 'ok' : 'warn'}>当前来源：{sourceText[source]}</Tag>}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-4">
            <p className="text-[11px] uppercase tracking-wider text-paper/30">{stat.label}</p>
            <p className="mt-2 flex items-baseline gap-1">
              <span className="text-[26px] font-semibold leading-none tracking-tight text-paper">
                {stat.value}
              </span>
              <span className="text-[11.5px] text-paper/35">{stat.unit}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <button
            key={card.key}
            type="button"
            onClick={() => onNavigate(card.key)}
            className="group rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-4 text-left transition-all duration-200 hover:-translate-y-[2px] hover:border-white/20 hover:bg-white/[0.05]"
          >
            <p className="flex items-center justify-between text-[13.5px] font-medium text-paper/85">
              {card.label}
              <span className="text-paper/20 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-accent2">
                →
              </span>
            </p>
            <p className="mt-1.5 text-[11.5px] text-paper/35">{card.hint}</p>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
        <h3 className="text-[13.5px] font-medium text-paper/85">改完内容去哪了</h3>
        <ul className="mt-3 space-y-2.5 text-[12.5px] leading-relaxed text-paper/55">
          <li>
            <b className="font-medium text-paper/80">保存</b> → 写进本机 MySQL 的
            <code className="mx-1 rounded bg-white/[0.07] px-1.5 py-0.5 font-mono text-[11.5px] text-accent2">
              personal_site
            </code>
            库，全站立即生效
          </li>
          <li>
            <b className="font-medium text-paper/80">导出 content.json</b> → 备份用；纯静态部署时放进
            <code className="mx-1 rounded bg-white/[0.07] px-1.5 py-0.5 font-mono text-[11.5px]">public/</code>
            可当兜底数据
          </li>
          <li>
            <b className="font-medium text-paper/80">恢复初始内容</b> → 用后端打包的 seed 覆盖数据库
          </li>
        </ul>
        <p className="mt-4 border-t border-white/[0.07] pt-3 text-[11.5px] text-paper/30">
          最近保存：{formatTime(updatedAt || draft.updatedAt)}
        </p>
      </div>
    </Panel>
  )
}
