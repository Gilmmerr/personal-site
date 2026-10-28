# 个人展示网站

一个深色星空主题的个人站点：自我介绍、技能、项目作品与技术博客。纯静态，无后端。

在线访问：**<部署地址>**

## 特性

- **深色 + 星空**：Canvas 粒子背景，支持视差与闪烁，移动端自动降粒子数，尊重 `prefers-reduced-motion`
- **内容与代码分离**：技能、项目在 `src/data`，博客是 `src/content/posts` 下的 Markdown，新增文章只放文件
- **博客体验**：Markdown 渲染、GFM 表格、代码高亮、自动生成右侧目录并高亮当前章节、上一篇/下一篇
- **零配置部署**：HashRouter + 相对 `base`，任意静态托管、任意子路径都能跑，刷新不 404
- **响应式**：375 / 768 / 1440 三档，移动端单列 + 汉堡菜单
- **无追踪**：不接统计脚本，留言表单只在本地校验与存储

## 技术栈

| 项 | 选型 |
|---|---|
| 框架 | React 18 + TypeScript 5（严格模式） |
| 构建 | Vite 5 |
| 样式 | Tailwind CSS 3.4 |
| 路由 | react-router-dom 6（HashRouter） |
| Markdown | react-markdown + remark-gfm + rehype-highlight |

## 快速开始

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 类型检查 + 打包到 dist/
npm run preview  # 预览构建产物
```

Node ≥ 18。

## 目录结构

```
├── PRD.md                产品需求文档
├── TECH_DESIGN.md        技术设计文档
├── AGENTS.md             给 AI 编程工具的项目约定
├── public/
│   ├── avatar.svg        头像
│   └── resume.html       可打印简历（Ctrl+P 存 PDF）
└── src/
    ├── data/             站点信息、技能、项目数据
    ├── content/posts/    博客文章（Markdown）
    ├── lib/              文章解析、滚动渐入、工具函数
    ├── components/       首页各区块与导航、页脚
    └── pages/            首页 / 项目详情 / 博客列表 / 博客详情
```

## 怎么改内容

| 想改什么 | 改哪里 |
|---|---|
| 姓名、方向、邮箱、社交链接、经历时间线 | `src/data/site.ts` |
| 技能分组与熟练度 | `src/data/skills.ts` |
| 项目列表与详情 | `src/data/projects.ts` |
| 新增一篇博客 | 在 `src/content/posts/` 新建 `.md`，写 frontmatter 即可 |
| 主题色、字体、圆角 | `tailwind.config.js` |
| 简历 | `public/resume.html` |

博客文件的 frontmatter 格式：

```md
---
title: 标题
date: 2026-10-28
tags: 标签一, 标签二
summary: 一句话摘要，列表页展示
---
```

## 部署

因为使用 HashRouter，不需要配置任何 rewrite 规则。

| 平台 | 要点 |
|---|---|
| Cloudflare Pages | 连接仓库，框架选 Vite，构建命令 `npm run build`，输出目录 `dist` |
| Vercel | 导入仓库，自动识别 Vite |
| GitHub Pages | 构建产物推 `gh-pages` 分支，或放 `docs/` 目录启用 |

## 文档

- [PRD.md](./PRD.md) — 做哪些功能、不做哪些
- [TECH_DESIGN.md](./TECH_DESIGN.md) — 选型理由、目录结构、数据模型、技术难点
- [AGENTS.md](./AGENTS.md) — 技术栈约束、代码风格、测试要求
