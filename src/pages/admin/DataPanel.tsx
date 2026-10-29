import { useRef } from 'react'
import {
  discardDraft,
  getDefaultContent,
  normalizeContent,
  serializeContent,
  useContentSnapshot,
  validateContent,
} from '../../lib/content'
import { Block, Btn, ConfirmButton, Panel, Tag } from './ui'
import { copyText, downloadText, formatTime } from './helpers'
import type { PanelProps } from './types'

const sourceLabel = {
  default: '默认内容（代码里的初始数据）',
  published: '已发布的 content.json',
  draft: '本地草稿（当前浏览器）',
}

export function DataPanel({ draft, setDraft, notify }: PanelProps) {
  const { source, content } = useContentSnapshot()
  const fileRef = useRef<HTMLInputElement>(null)

  const onExport = () => {
    downloadText('content.json', serializeContent(draft))
    notify('已导出 content.json，放进 public/ 后重新部署即可对所有访客生效')
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
        notify('已载入文件内容，检查无误后点「保存」生效')
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

  const onRestoreDefault = () => {
    setDraft(getDefaultContent())
    notify('已载入站点初始内容，点「保存」后生效')
  }

  const onDiscard = async () => {
    await discardDraft()
    notify('已清除本地草稿，站点回到线上 / 默认内容')
  }

  return (
    <Panel
      title="数据与发布"
      desc="后台是纯前端实现，内容存在浏览器里。想让所有访客看到改动，需要导出 content.json 并重新部署。"
    >
      <Block title="当前状态">
        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/[0.06] px-4 py-3">
            <dt className="text-[11px] uppercase tracking-wider text-paper/30">内容来源</dt>
            <dd className="mt-1.5 text-[13px] text-paper/80">{sourceLabel[source]}</dd>
          </div>
          <div className="rounded-xl border border-white/[0.06] px-4 py-3">
            <dt className="text-[11px] uppercase tracking-wider text-paper/30">最近保存</dt>
            <dd className="mt-1.5 text-[13px] text-paper/80">{formatTime(content.updatedAt)}</dd>
          </div>
          <div className="rounded-xl border border-white/[0.06] px-4 py-3">
            <dt className="text-[11px] uppercase tracking-wider text-paper/30">数据量</dt>
            <dd className="mt-1.5 text-[13px] text-paper/80">
              {content.projects.length} 个项目 · {content.posts.length} 篇文章 ·{' '}
              {content.skillGroups.length} 组技能
            </dd>
          </div>
          <div className="rounded-xl border border-white/[0.06] px-4 py-3">
            <dt className="text-[11px] uppercase tracking-wider text-paper/30">导出体积</dt>
            <dd className="mt-1.5 text-[13px] text-paper/80">
              {(new Blob([serializeContent(draft)]).size / 1024).toFixed(1)} KB
            </dd>
          </div>
        </dl>
      </Block>

      <Block title="导出 / 导入" desc="导出的文件可以直接当备份，也可以放进项目里发布">
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
          导入只替换编辑区内容，不会立即上线；确认无误后点右上角「保存」。
        </p>
      </Block>

      <Block title="重置" desc="下面两个操作只影响当前浏览器，不会改动仓库里的文件">
        <div className="flex flex-wrap gap-2">
          <Btn onClick={onRestoreSaved}>回到上次保存</Btn>
          <ConfirmButton onConfirm={onRestoreDefault} confirmLabel="确认载入默认内容？">
            载入站点初始内容
          </ConfirmButton>
          <ConfirmButton onConfirm={() => void onDiscard()} confirmLabel="确认清除本地草稿？">
            清除本地草稿
          </ConfirmButton>
        </div>
      </Block>

      <Block title="改动怎么才能让别人看到">
        <ol className="space-y-3 text-[12.5px] leading-relaxed text-paper/60">
          <li className="flex gap-3">
            <Tag>1</Tag>
            <span>
              <b className="font-medium text-paper/85">点「保存」</b> —— 写入浏览器 localStorage，
              当前这台电脑打开站点立刻是新内容，方便反复微调。
            </span>
          </li>
          <li className="flex gap-3">
            <Tag>2</Tag>
            <span>
              <b className="font-medium text-paper/85">点「下载 content.json」</b> —— 把文件放到项目
              <code className="mx-1 rounded bg-white/[0.07] px-1.5 py-0.5 font-mono text-[11.5px] text-accent2">
                public/content.json
              </code>
              ，构建时会被复制到站点根目录。
            </span>
          </li>
          <li className="flex gap-3">
            <Tag>3</Tag>
            <span>
              <b className="font-medium text-paper/85">提交并重新部署</b> —— 站点启动时读取这个文件，
              所有访客看到的就是后台里编辑过的内容。
            </span>
          </li>
        </ol>
        <p className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3 text-[11.5px] leading-relaxed text-amber-200/80">
          说明：口令校验在浏览器里完成，只能挡住误入，算不上真正的安全边界。要多人协作或保护敏感内容，
          需要接一个带鉴权的后端接口。
        </p>
      </Block>
    </Panel>
  )
}
