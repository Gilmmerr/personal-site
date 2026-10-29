import type { SiteInfo } from '../../lib/content'
import type { Social } from '../../data/site'
import { Block, Btn, ConfirmButton, Field, Panel, SubHeader, TextArea, TextInput } from './ui'
import { fromLines, insertAt, removeAt, replaceAt, toLines } from './helpers'
import type { PanelProps } from './types'

export function SitePanel({ draft, setDraft }: PanelProps) {
  const { site } = draft

  const setSite = (patch: Partial<SiteInfo>) =>
    setDraft((prev) => ({ ...prev, site: { ...prev.site, ...patch } }))

  const setSocial = (index: number, patch: Partial<Social>) =>
    setSite({ socials: replaceAt(site.socials, index, { ...site.socials[index], ...patch }) })

  const setFact = (index: number, patch: Partial<{ label: string; value: string }>) =>
    setSite({ facts: replaceAt(site.facts, index, { ...site.facts[index], ...patch }) })

  return (
    <Panel
      title="站点信息"
      desc="首页首屏、导航栏、页脚、关于区块的文案都在这里。改完点右上角「保存」，当前浏览器立即生效。"
    >
      <Block title="基础信息" desc="这些字段会出现在首屏大标题、导航栏品牌名和页脚版权里">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="名字 / 昵称" hint="显示在首屏与页脚">
            <TextInput value={site.name} onChange={(e) => setSite({ name: e.target.value })} />
          </Field>
          <Field label="角色定位" hint="首屏大标题下方那行">
            <TextInput value={site.role} onChange={(e) => setSite({ role: e.target.value })} />
          </Field>
          <Field label="一句话介绍" hint="首屏的副标题" className="sm:col-span-2">
            <TextInput value={site.tagline} onChange={(e) => setSite({ tagline: e.target.value })} />
          </Field>
          <Field label="邮箱">
            <TextInput
              value={site.email}
              onChange={(e) => setSite({ email: e.target.value })}
              placeholder="you@example.com"
            />
          </Field>
          <Field label="所在城市">
            <TextInput value={site.location} onChange={(e) => setSite({ location: e.target.value })} />
          </Field>
        </div>
      </Block>

      <Block title="头像与简历" desc="填相对路径或完整网址，留空则不显示对应入口">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="头像地址">
            <TextInput
              value={site.avatar}
              onChange={(e) => setSite({ avatar: e.target.value })}
              placeholder="./avatar.svg"
            />
          </Field>
          <Field label="简历链接">
            <TextInput
              value={site.resumeUrl}
              onChange={(e) => setSite({ resumeUrl: e.target.value })}
              placeholder="./resume.html"
            />
          </Field>
        </div>
      </Block>

      <Block
        title="关于我 · 正文"
        desc="一段一行，第一段字号更大，建议第一篇写定位，后两篇写经历与近况"
      >
        <Field label="段落">
          <TextArea
            rows={7}
            value={toLines(site.intro)}
            onChange={(e) => setSite({ intro: fromLines(e.target.value) })}
          />
        </Field>
        <p className="mt-2 text-[11.5px] text-paper/30">当前 {site.intro.length} 段</p>
      </Block>

      <Block
        title="关于我 · 信息卡"
        desc="右侧四张小卡片，键值各占一行"
        actions={
          <Btn
            variant="ghost"
            onClick={() => setSite({ facts: [...site.facts, { label: '新标签', value: '' }] })}
          >
            + 添加
          </Btn>
        }
      >
        <div className="space-y-2">
          {site.facts.map((fact, index) => (
            <div key={index} className="grid gap-2 sm:grid-cols-[150px_1fr_auto]">
              <TextInput
                value={fact.label}
                onChange={(e) => setFact(index, { label: e.target.value })}
                placeholder="标签"
              />
              <TextInput
                value={fact.value}
                onChange={(e) => setFact(index, { value: e.target.value })}
                placeholder="内容"
              />
              <ConfirmButton onConfirm={() => setSite({ facts: removeAt(site.facts, index) })}>
                删除
              </ConfirmButton>
            </div>
          ))}
          {site.facts.length === 0 && (
            <p className="text-[12px] text-paper/30">还没有信息卡，点右上角「+ 添加」。</p>
          )}
        </div>
      </Block>

      <Block
        title="社交链接"
        desc="首屏、联系区块、页脚都会同步，图标按类型自动匹配"
        actions={
          <Btn
            variant="ghost"
            onClick={() =>
              setSite({
                socials: [...site.socials, { label: '新链接', href: 'https://', icon: 'link' }],
              })
            }
          >
            + 添加
          </Btn>
        }
      >
        <div className="space-y-2">
          {site.socials.map((social, index) => (
            <div key={index} className="rounded-xl border border-white/[0.06] p-3">
              <SubHeader
                index={index}
                title={social.label}
                actions={
                  <>
                    <Btn variant="subtle" onClick={() => setSite({ socials: insertAt(site.socials, index, social) })}>
                      复制
                    </Btn>
                    <ConfirmButton onConfirm={() => setSite({ socials: removeAt(site.socials, index) })}>
                      删除
                    </ConfirmButton>
                  </>
                }
              />
              <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1.6fr_110px]">
                <TextInput
                  value={social.label}
                  onChange={(e) => setSocial(index, { label: e.target.value })}
                  placeholder="显示名称"
                />
                <TextInput
                  value={social.href}
                  onChange={(e) => setSocial(index, { href: e.target.value })}
                  placeholder="https:// 或 mailto:"
                />
                <select
                  value={social.icon}
                  onChange={(e) => setSocial(index, { icon: e.target.value as Social['icon'] })}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[13.5px] text-paper focus:border-accent2/60 focus:outline-none"
                >
                  <option value="github">GitHub 图标</option>
                  <option value="mail">邮件图标</option>
                  <option value="link">通用链接</option>
                </select>
              </div>
            </div>
          ))}
          {site.socials.length === 0 && (
            <p className="text-[12px] text-paper/30">还没有社交链接，导航栏右侧的图标会消失。</p>
          )}
        </div>
      </Block>
    </Panel>
  )
}
