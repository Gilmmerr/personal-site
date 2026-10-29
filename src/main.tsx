import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { initContent } from './lib/content'
import 'highlight.js/styles/github-dark.css'
import './index.css'

// 先把内容准备好再渲染：内容层会读本地草稿 / 线上 content.json，
// 放在渲染之前可以避免首屏先闪一版默认文案再跳成实际内容
async function bootstrap() {
  await initContent()

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}

void bootstrap()
