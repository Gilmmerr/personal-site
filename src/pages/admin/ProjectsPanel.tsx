import { useState } from 'react'
import type { Project } from '../../data/projects'
import {
  Block,
  Btn,
  ConfirmButton,
  EmptyState,
  Field,
  Panel,
  SubHeader,
  Tag,
  TextArea,
  TextInput,
} from './ui'
import { fromLines, fromTags, insertAt, moveItem, removeAt, replaceAt, toLines, toTags } from './helpers'
import type { PanelProps } from './types'

const coverPresets = [
  'linear-gradient(135deg, #1e1b4b 0%, #4338ca 55%, #0891b2 100%)',
  'linear-gradient(135deg, #0f172a 0%, #134e4a 55%, #065f46 100%)',
  'linear-gradient(135deg, #172554 0%, #1d4ed8 50%, #7c3aed 100%)',
  'linear-gradient(135deg, #0b0f1a 0%, #312e81 55%, #0e7490 100%)',
  'linear-gradient(135deg, #2b0a3d 0%, #7e22ce 55%, #db2777 100%)',
]

function blankProject(index: number): Project {
  return {
    slug: `project-${index}`,
    title: '新项目',
    summary: '',
    year: String(new Date().getFullYear()),
    role: '独立完成',
    cover: coverPresets[0],
    glyph: '📁',
    tags: ['项目'],
    links: [],
    background: '',
    approach: [],
    challenges: [],
    outcome: '',
  }
}

export function ProjectsPanel({ draft, setDraft }: PanelProps) {
  const { projects } = draft
  const [active, setActive] = useState(0)

  const project = projects[Math.min(active, Math.max(0, projects.length - 1))]

  const setProjects = (next: Project[]) => setDraft((prev) => ({ ...prev, projects: next }))

  const setProject = (patch: Partial<Project>) => {
    if (!project) return
    setProjects(replaceAt(projects, active, { ...project, ...patch }))
  }

  const addProject = () => {
    const next = blankProject(projects.length + 1)
    setProjects([...projects, next])
    setActive(projects.length)
  }

  const removeProject = () => {
    setProjects(removeAt(projects, active))
    setActive((prev) => Math.max(0, Math.min(prev, projects.length - 2)))
  }

  return (
    <Panel
      title="项目作品"
      desc="首页卡片列表与项目详情页都读这里。slug 会出现在网址里（#/project/slug），建议用英文。"
      actions={
        <Btn variant="primary" onClick={addProject}>
          + 新增项目
        </Btn>
      }
    >
      {projects.length === 0 && (
        <EmptyState title="还没有项目" desc="点右上角「+ 新增项目」，首页作品区会自动出现卡片。" />
      )}

      {projects.length > 0 && project && (
        <div className="grid gap-5 lg:grid-cols-[236px_minmax(0,1fr)]">
          <aside className="space-y-2">
            {projects.map((item, index) => {
              const isActive = index === active
              return (
                <button
                  key={`${item.slug}-${index}`}
                  type="button"
                  onClick={() => setActive(index)}
                  className={[
                    'w-full rounded-xl border px-3 py-2.5 text-left transition-all duration-200',
                    isActive
                      ? 'border-accent2/40 bg-accent2/[0.08]'
                      : 'border-white/[0.07] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10.5px] text-paper/30">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="font-mono text-[10.5px] text-paper/30">{item.year}</span>
                  </div>
                  <p className="mt-1 truncate text-[12.5px] text-paper/80">{item.title}</p>
                </button>
              )
            })}

            <div className="flex gap-1.5 pt-1">
              <Btn variant="subtle" disabled={active === 0} onClick={() => setActive(active - 1)}>
                上一项
              </Btn>
              <Btn
                variant="subtle"
                disabled={active === projects.length - 1}
                onClick={() => setActive(active + 1)}
              >
                下一项
              </Btn>
            </div>
          </aside>

          <div className="space-y-3">
            <Block
              actions={
                <>
                  <Btn
                    variant="subtle"
                    disabled={active === 0}
                    onClick={() => {
                      setProjects(moveItem(projects, active, active - 1))
                      setActive(active - 1)
                    }}
                  >
                    ↑ 上移
                  </Btn>
                  <Btn
                    variant="subtle"
                    disabled={active === projects.length - 1}
                    onClick={() => {
                      setProjects(moveItem(projects, active, active + 1))
                      setActive(active + 1)
                    }}
                  >
                    ↓ 下移
                  </Btn>
                  <ConfirmButton onConfirm={removeProject}>删除项目</ConfirmButton>
                </>
              }
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="标题">
                  <TextInput value={project.title} onChange={(e) => setProject({ title: e.target.value })} />
                </Field>
                <Field label="slug" hint="网址片段，建议英文与连字符">
                  <TextInput value={project.slug} onChange={(e) => setProject({ slug: e.target.value })} />
                </Field>
                <Field label="年份 / 时间">
                  <TextInput value={project.year} onChange={(e) => setProject({ year: e.target.value })} />
                </Field>
                <Field label="角色">
                  <TextInput value={project.role} onChange={(e) => setProject({ role: e.target.value })} />
                </Field>
                <Field label="一句话简介" className="sm:col-span-2">
                  <TextArea
                    rows={2}
                    value={project.summary}
                    onChange={(e) => setProject({ summary: e.target.value })}
                  />
                </Field>
                <Field label="技术标签" hint="逗号分隔，卡片只显示前 3 个" className="sm:col-span-2">
                  <TextInput
                    value={toTags(project.tags)}
                    onChange={(e) => setProject({ tags: fromTags(e.target.value) })}
                  />
                </Field>
              </div>
            </Block>

            <Block title="封面与图标" desc="封面是 CSS 渐变，点下方色块快速套用">
              <div className="flex flex-wrap items-center gap-2">
                {coverPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setProject({ cover: preset })}
                    className={[
                      'h-9 w-16 rounded-lg border transition-transform',
                      project.cover === preset
                        ? 'border-white/70 scale-[1.04]'
                        : 'border-white/10 hover:border-white/40',
                    ].join(' ')}
                    style={{ background: preset }}
                    aria-label="套用封面配色"
                  />
                ))}
                <div className="ml-auto flex items-center gap-2">
                  <Field label="图标">
                    <TextInput
                      value={project.glyph}
                      onChange={(e) => setProject({ glyph: e.target.value })}
                      className="!w-20 text-center"
                    />
                  </Field>
                </div>
              </div>
              <Field label="渐变值" hint="也可直接填 linear-gradient(...)" className="mt-4">
                <TextInput value={project.cover} onChange={(e) => setProject({ cover: e.target.value })} />
              </Field>
            </Block>

            <Block title="详情内容" desc="项目详情页按「背景 → 怎么做的 → 卡住的地方 → 结果」四段渲染">
              <div className="space-y-4">
                <Field label="背景" hint="为什么要做">
                  <TextArea
                    rows={3}
                    value={project.background}
                    onChange={(e) => setProject({ background: e.target.value })}
                  />
                </Field>
                <Field label="怎么做的" hint="一行一条，自动编号">
                  <TextArea
                    rows={5}
                    value={toLines(project.approach)}
                    onChange={(e) => setProject({ approach: fromLines(e.target.value) })}
                  />
                </Field>
                <Field label="结果">
                  <TextArea
                    rows={3}
                    value={project.outcome}
                    onChange={(e) => setProject({ outcome: e.target.value })}
                  />
                </Field>
              </div>
            </Block>

            <Block
              title="卡住的地方"
              desc="详情页的难点卡片，一段「现象 + 原因 + 解法」最有说服力"
              actions={
                <Btn
                  variant="ghost"
                  onClick={() => setProject({ challenges: [...project.challenges, { title: '', detail: '' }] })}
                >
                  + 添加
                </Btn>
              }
            >
              <div className="space-y-3">
                {project.challenges.map((challenge, index) => (
                  <div key={index} className="rounded-xl border border-white/[0.06] p-3">
                    <SubHeader
                      index={index}
                      title={challenge.title}
                      actions={
                        <ConfirmButton
                          onConfirm={() =>
                            setProject({ challenges: removeAt(project.challenges, index) })
                          }
                        >
                          删除
                        </ConfirmButton>
                      }
                    />
                    <div className="mt-3 space-y-2">
                      <TextInput
                        value={challenge.title}
                        onChange={(e) =>
                          setProject({
                            challenges: replaceAt(project.challenges, index, {
                              ...challenge,
                              title: e.target.value,
                            }),
                          })
                        }
                        placeholder="问题标题"
                      />
                      <TextArea
                        rows={3}
                        value={challenge.detail}
                        onChange={(e) =>
                          setProject({
                            challenges: replaceAt(project.challenges, index, {
                              ...challenge,
                              detail: e.target.value,
                            }),
                          })
                        }
                        placeholder="现象、原因、怎么解"
                      />
                    </div>
                  </div>
                ))}
                {project.challenges.length === 0 && (
                  <p className="text-[12px] text-paper/30">还没有难点卡片。</p>
                )}
              </div>
            </Block>

            <Block
              title="相关链接"
              desc="详情页「结果」下方的按钮"
              actions={
                <Btn
                  variant="ghost"
                  onClick={() => setProject({ links: insertAt(project.links, project.links.length, { label: '源码仓库', href: 'https://' }) })}
                >
                  + 添加
                </Btn>
              }
            >
              <div className="space-y-2">
                {project.links.map((link, index) => (
                  <div key={index} className="grid gap-2 sm:grid-cols-[140px_1fr_auto]">
                    <TextInput
                      value={link.label}
                      onChange={(e) =>
                        setProject({ links: replaceAt(project.links, index, { ...link, label: e.target.value }) })
                      }
                      placeholder="按钮文案"
                    />
                    <TextInput
                      value={link.href}
                      onChange={(e) =>
                        setProject({ links: replaceAt(project.links, index, { ...link, href: e.target.value }) })
                      }
                      placeholder="https://"
                    />
                    <ConfirmButton onConfirm={() => setProject({ links: removeAt(project.links, index) })}>
                      删除
                    </ConfirmButton>
                  </div>
                ))}
                {project.links.length === 0 && <p className="text-[12px] text-paper/30">没有外链按钮。</p>}
              </div>
            </Block>

            <div className="flex flex-wrap items-center gap-2">
              <Tag>当前：{project.slug}</Tag>
              <Tag tone="ok">首页第 {active + 1} 张卡片</Tag>
              {active === 0 && <Tag tone="warn">第一张卡片会占两列</Tag>}
              <span className="ml-auto text-[11.5px] text-paper/25">
                共 {projects.length} 个 · 难点 {project.challenges.length} 条
              </span>
            </div>
          </div>
        </div>
      )}
    </Panel>
  )
}
