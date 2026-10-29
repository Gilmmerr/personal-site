import type { SkillGroup, SkillItem } from '../../data/skills'
import { Block, Btn, ConfirmButton, Field, Panel, SubHeader, TextInput } from './ui'
import { moveItem, removeAt, replaceAt } from './helpers'
import type { PanelProps } from './types'

const emptyGroup: SkillGroup = { group: '新分组', desc: '', items: [] }
const emptySkill: SkillItem = { name: '新技能', icon: '⚡', level: 70 }

export function SkillsPanel({ draft, setDraft }: PanelProps) {
  const { skillGroups } = draft

  const setGroups = (next: SkillGroup[]) => setDraft((prev) => ({ ...prev, skillGroups: next }))

  const setGroup = (index: number, patch: Partial<SkillGroup>) =>
    setGroups(replaceAt(skillGroups, index, { ...skillGroups[index], ...patch }))

  const setItem = (groupIndex: number, itemIndex: number, patch: Partial<SkillItem>) => {
    const group = skillGroups[groupIndex]
    setGroup(groupIndex, { items: replaceAt(group.items, itemIndex, { ...group.items[itemIndex], ...patch }) })
  }

  return (
    <Panel
      title="技能与工具"
      desc="首页「技能与工具」区块。分数只影响进度条长度，按「能独立交付」为标准打分即可。"
      actions={
        <Btn variant="primary" onClick={() => setGroups([...skillGroups, { ...emptyGroup }])}>
          + 新增分组
        </Btn>
      }
    >
      <div className="space-y-3">
        {skillGroups.map((group, groupIndex) => (
          <Block key={groupIndex}>
            <SubHeader
              index={groupIndex}
              title={`${group.group} · ${group.items.length} 项`}
              actions={
                <>
                  <Btn
                    variant="subtle"
                    disabled={groupIndex === 0}
                    onClick={() => setGroups(moveItem(skillGroups, groupIndex, groupIndex - 1))}
                  >
                    ↑
                  </Btn>
                  <Btn
                    variant="subtle"
                    disabled={groupIndex === skillGroups.length - 1}
                    onClick={() => setGroups(moveItem(skillGroups, groupIndex, groupIndex + 1))}
                  >
                    ↓
                  </Btn>
                  <ConfirmButton onConfirm={() => setGroups(removeAt(skillGroups, groupIndex))}>删除</ConfirmButton>
                </>
              }
            />

            <div className="mt-4 grid gap-4 sm:grid-cols-[220px_1fr]">
              <Field label="分组名称">
                <TextInput value={group.group} onChange={(e) => setGroup(groupIndex, { group: e.target.value })} />
              </Field>
              <Field label="一句话说明">
                <TextInput value={group.desc} onChange={(e) => setGroup(groupIndex, { desc: e.target.value })} />
              </Field>
            </div>

            <div className="mt-4 space-y-2 border-t border-white/[0.06] pt-4">
              {group.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className="grid items-center gap-2 sm:grid-cols-[60px_1fr_1fr_120px_auto]"
                >
                  <TextInput
                    value={item.icon}
                    onChange={(e) => setItem(groupIndex, itemIndex, { icon: e.target.value })}
                    aria-label="图标"
                    className="text-center"
                  />
                  <TextInput
                    value={item.name}
                    onChange={(e) => setItem(groupIndex, itemIndex, { name: e.target.value })}
                    placeholder="技能名称"
                  />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={item.level}
                    onChange={(e) => setItem(groupIndex, itemIndex, { level: Number(e.target.value) })}
                    className="w-full accent-accent2"
                    aria-label={`${item.name} 熟练度`}
                  />
                  <span className="font-mono text-[12px] tabular-nums text-paper/45">{item.level}</span>
                  <div className="flex gap-1.5">
                    <Btn
                      variant="subtle"
                      disabled={itemIndex === 0}
                      onClick={() =>
                        setGroup(groupIndex, { items: moveItem(group.items, itemIndex, itemIndex - 1) })
                      }
                      aria-label="上移"
                    >
                      ↑
                    </Btn>
                    <ConfirmButton
                      onConfirm={() => setGroup(groupIndex, { items: removeAt(group.items, itemIndex) })}
                    >
                      删除
                    </ConfirmButton>
                  </div>
                </div>
              ))}

              <Btn
                variant="subtle"
                onClick={() => setGroup(groupIndex, { items: [...group.items, { ...emptySkill }] })}
              >
                + 添加技能
              </Btn>
            </div>
          </Block>
        ))}

        {skillGroups.length === 0 && (
          <p className="rounded-xl border border-dashed border-white/10 px-5 py-10 text-center text-[12.5px] text-paper/35">
            还没有技能分组，点右上角「+ 新增分组」。
          </p>
        )}
      </div>

      <p className="text-[11.5px] leading-relaxed text-paper/30">
        提示：分组内条目用 ↑ 调整顺序，进度条上限 100，超过会被自动截断。
      </p>
    </Panel>
  )
}
