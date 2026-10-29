import type { TimelineItem } from '../../data/site'
import { Block, Btn, ConfirmButton, Field, Panel, SubHeader, TextArea, TextInput } from './ui'
import { insertAt, moveItem, removeAt, replaceAt } from './helpers'
import type { PanelProps } from './types'

const emptyItem: TimelineItem = { period: '2026.01 — 至今', title: '新的经历', org: '', desc: '' }

export function TimelinePanel({ draft, setDraft }: PanelProps) {
  const { timeline } = draft.site

  const setTimeline = (next: TimelineItem[]) =>
    setDraft((prev) => ({ ...prev, site: { ...prev.site, timeline: next } }))

  const setItem = (index: number, patch: Partial<TimelineItem>) =>
    setTimeline(replaceAt(timeline, index, { ...timeline[index], ...patch }))

  return (
    <Panel
      title="经历时间线"
      desc="「关于」区块右侧那条竖线。按时间倒序排，最新的放最上面。"
      actions={
        <Btn variant="primary" onClick={() => setTimeline(insertAt(timeline, 0, emptyItem))}>
          + 新增经历
        </Btn>
      }
    >
      <div className="space-y-3">
        {timeline.map((item, index) => (
          <Block key={index}>
            <SubHeader
              index={index}
              title={`${item.period} · ${item.title}`}
              actions={
                <>
                  <Btn variant="subtle" disabled={index === 0} onClick={() => setTimeline(moveItem(timeline, index, index - 1))}>
                    ↑
                  </Btn>
                  <Btn
                    variant="subtle"
                    disabled={index === timeline.length - 1}
                    onClick={() => setTimeline(moveItem(timeline, index, index + 1))}
                  >
                    ↓
                  </Btn>
                  <ConfirmButton onConfirm={() => setTimeline(removeAt(timeline, index))}>删除</ConfirmButton>
                </>
              }
            />

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="时间段" hint="如 2026.10 — 至今">
                <TextInput value={item.period} onChange={(e) => setItem(index, { period: e.target.value })} />
              </Field>
              <Field label="标题">
                <TextInput value={item.title} onChange={(e) => setItem(index, { title: e.target.value })} />
              </Field>
              <Field label="组织 / 场景" className="sm:col-span-2">
                <TextInput value={item.org} onChange={(e) => setItem(index, { org: e.target.value })} />
              </Field>
              <Field label="描述" className="sm:col-span-2">
                <TextArea rows={3} value={item.desc} onChange={(e) => setItem(index, { desc: e.target.value })} />
              </Field>
            </div>
          </Block>
        ))}

        {timeline.length === 0 && (
          <p className="rounded-xl border border-dashed border-white/10 px-5 py-10 text-center text-[12.5px] text-paper/35">
            还没有经历记录，点右上角「+ 新增经历」。
          </p>
        )}
      </div>
    </Panel>
  )
}
