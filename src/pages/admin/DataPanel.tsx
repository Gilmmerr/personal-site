import { useRef } from 'react'
import {
  getDefaultContent,
  normalizeContent,
  resetContent,
  serializeContent,
  useContentSnapshot,
  validateContent,
  type ContentSource,
} from '../../lib/content'
import { Block, Btn, ConfirmButton, Panel, Tag } from './ui'
import { copyText, downloadText, formatTime } from './helpers'
import type { PanelProps } from './types'

const sourceLabel: Record<ContentSource, string> = {
  database: 'MySQL 数据库（/api/content）',
  snapshot: '静态快照 content.json',
  default: '内置默认内容',
}

export function DataPanel({ draft, setDraft, notify }: PanelProps) {
  const { source, content, apiReachable } = useContentSnapshot()
  const fileRef = useRef<HTMLInputElement>(null)

  const onExport = () => {
    downloadText('content.json', serializeContent(draft))
    notify('已导出 content.json，可作为备份，也可以放到 public/ 做静态兜底')
  }

  const onCopy = async () => {
    const ok = await copyText(serializeContent(draft))
    notify(ok ? '已复制完整 JSON 到剪贴板' : '复制失败，请改用下载', ok ? 'ok' : 'warn')
  }

  const onImport = (file: File | undefined) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as unknown
        const error = validateContent(parsed)
        if (error) {
          notify(`导入失败：${error}`, 'warn')
          return
        }
        setDraft(normalizeContent(parsed))
        notify('已载入文件内容，检查无误后点「保存」写入数据库')
      } catch {
        notify('导入失败：不是合法的 JSON 文件', 'warn')
      }
    }
    reader.readAsText(file)
  }

  const onRestoreSaved = () => {
    setDraft(JSON.parse(JSON.stringify(content)) as typeof draft)
    notify('已回到上一次保存的内容')
  }

  const onRestoreDefault = async () => {
    const result = await resetContent()
    if (result.ok && result.content) {
      setDraft(result.content)
      notify('数据库已恢复为初始内容')
      return
    }
    // 后端没起来时退化成「只填到编辑区」，至少不误导用户以为已经写库
    setDraft(getDefaultContent())
    notify(`${result.message}；已把初始内容填到编辑区`, 'warn')
  }

  return (
    <Panel
      title="数据与存储"
      desc="内容存在本机 MySQL 里，保存即写库。下面的导出用于备份，或给纯静态部署留一份兜底文件。"
    >
      <Block title="当前状态">
        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/[0.06] px-4 py-3">
            <dt className="text-[11px] uppercase tracking-wider text-paper/30">内容来源</dt>
            <dd className="mt-1.5 text-[13px] text-paper/80">{sourceLabel[source]}</dd>
          </div>
          <div className="rounded-xl border border-white/[0.06] px-4 py-3">
            <dt className="text-[11px] uppercase tracking-wider text-paper/30">后端状态</dt>
            <dd className="mt-1.5 flex items-center gap-2 text-[13px] text-paper/80">
              <span
                className={[
                  'h-1.5 w-1.5 rounded-full',
                  apiReachable ? 'bg-emerald-400' : 'bg-rose-400',
                ].join(' ')}
              />
              {apiReachable ? '已连接（127.0.0.1:8081）' : '未连接'}
            </dd>
          </div>
          <div className="rounded-xl border border-white/[0.06] px-4 py-3">
            <dt className="text-[11px] uppercase tracking-wider text-paper/30">最近保存</dt>
            <dd className="mt-1.5 text-[13px] text-paper/80">{formatTime(content.updatedAt)}</dd>
          </div>
          <div className="rounded-xl border border-white/[0.06] px-4 py-3">
            <dt className="text-[11px] uppercase tracking-wider text-paper/30">数据量</dt>
            <dd className="mt-1.5 text-[13px] text-paper/80">
              {content.projects.length} 个项目 · {content.posts.length} 篇文章 ·{' '}
              {content.skillGroups.length} 组技能 · {content.site.timeline.length} 段经历
            </dd>
          </div>
        </dl>
      </Block>

      <Block title="备份 / 迁移" desc="导出的 JSON 可以留着备份，也可以导入到另一台机器">
        <div className="flex flex-wrap gap-2">
          <Btn variant="primary" onClick={onExport}>
            下载 content.json
          </Btn>
          <Btn onClick={onCopy}>复制 JSON</Btn>
          <Btn onClick={() => fileRef.current?.click()}>导入 JSON 文件</Btn>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              onImport(e.target.files?.[0])
              e.target.value = ''
            }}
          />
        </div>
        <p className="mt-3 text-[11.5px] leading-relaxed text-paper/35">
          导入只替换编辑区内容，不会写库；确认无误后点右上角「保存」。
        </p>
      </Block>

      <Block title="恢复" desc="会直接改数据库，执行后无法撤销">
        <div className="flex flex-wrap gap-2">
          <Btn onClick={onRestoreSaved}>回到上次保存</Btn>
          <ConfirmButton onConfirm={() => void onRestoreDefault()} confirmLabel="确认覆盖数据库为初始内容？">
            恢复初始内容
          </ConfirmButton>
        </div>
      </Block>

      <Block title="数据是怎么走的">
        <ol className="space-y-3 text-[12.5px] leading-relaxed text-paper/60">
          <li className="flex gap-3">
            <Tag>1</Tag>
            <span>
              <b className="font-medium text-paper/85">点「保存」</b> —— 前端把整份内容
              <code className="mx-1 rounded bg-white/[0.07] px-1.5 py-0.5 font-mono text-[11.5px] text-accent2">
                PUT /api/content
              </code>
              发给 Spring Boot。
            </span>
          </li>
          <li className="flex gap-3">
            <Tag>2</Tag>
            <span>
              <b className="font-medium text-paper/85">后端写库</b> —— MyBatis 在一个事务里清空
              <code className="mx-1 rounded bg-white/[0.07] px-1.5 py-0.5 font-mono text-[11.5px]">personal_site</code>
              库的各张表，再按本次提交重建。
            </span>
          </li>
          <li className="flex gap-3">
            <Tag>3</Tag>
            <span>
              <b className="font-medium text-paper/85">站点读库</b> —— 刷新页面就是新内容；
              换台电脑打开也一致，不再依赖浏览器本地存储。
            </span>
          </li>
        </ol>
        <p className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3 text-[11.5px] leading-relaxed text-amber-200/80">
          说明：口令校验仍在前端完成，只能挡住误入。后端只监听 127.0.0.1 且 CORS 只放行本机页面，
          适合本地个人站点；要放到公网请先给接口加上服务端鉴权。
        </p>
      </Block>
    </Panel>
  )
}
