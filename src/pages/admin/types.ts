import type { Dispatch, SetStateAction } from 'react'
import type { Content } from '../../lib/content'

export interface PanelProps {
  draft: Content
  setDraft: Dispatch<SetStateAction<Content>>
  notify: (text: string, tone?: 'ok' | 'warn') => void
}

export type TabKey = 'overview' | 'site' | 'timeline' | 'skills' | 'projects' | 'posts' | 'data'
