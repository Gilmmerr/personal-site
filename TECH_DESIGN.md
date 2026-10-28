# 技术设计文档（TECH_DESIGN）

> 对应 PRD：v1.0　|　更新日期：2026-10-26

## 一、技术栈选择

### 1.1 结论

| 层 | 选型 | 理由 |
|---|---|---|
| 框架 | React 18 + TypeScript 5 | 组件化拆分区块，TS 把数据结构（项目、文章）约束住，改内容时不会漏字段 |
| 构建 | Vite 5 | 冷启动快，`import.meta.glob` 可直接把 md 文件编进产物，省掉一遍构建脚本 |
| 样式 | Tailwind CSS 3.4 | 深色主题靠少数几个色值，用 token 化配置比写 CSS 文件更不容易跑偏 |
| 路由 | react-router-dom 6（HashRouter） | 见 1.2 |
| Markdown | react-markdown 9 + remark-gfm + rehype-highlight | 纯前端渲染，无需服务端；GFM 支持表格与任务列表，代码块用 highlight.js 高亮 |
| 数据 | 本地 TS 文件 + Markdown 文件 | 内容量小，无后端需求，改文件即发布 |
| 部署 | 静态托管（Cloudflare Pages / 任意静态服务器） | 零运维、免费、自带 https 与 CDN |

### 1.2 为什么用 HashRouter 而不是 BrowserRouter

站点是纯静态托管，没有服务端做 rewrite。BrowserRouter 下直接访问或刷新 `/blog/xxx` 会 404，必须配置 SPA fallback，不同平台配置方式还不一样。

HashRouter 把路由放在 `#` 后面，服务器永远只请求 `index.html`，**刷新、直达链接、部署到任意子路径都不会 404**。代价是 URL 里带 `#`，对个人站点可接受。

配合 `vite.config.ts` 的 `base: './'`，产物可以放在域名根目录，也可以放在 `/portfolio/` 这类子路径下，不需要改配置。

### 1.3 没有选的东西

| 候选 | 未采用原因 |
|---|---|
| Next.js | 需要 SSR / SSG 才有意义，本站没有动态内容，构建链路反而更重 |
| Astro | 静态内容场景很合适，但项目要求以 React 为主线，且要演示组件与路由 |
| 组件库（MUI / Ant Design） | 深色定制成本高于手写；Tailwind 足够覆盖，且产物更小 |
| 动画库（Framer Motion / GSAP） | 只用到渐入与悬浮，CSS transition + IntersectionObserver 即可，不引 60KB 依赖 |
| 后端 / 数据库 | PRD 明确不做，评论、留言均为前端演示 |

## 二、项目结构

```
personal-site/
├── PRD.md                    产品需求文档
├── TECH_DESIGN.md            本文档
├── AGENTS.md                 给 AI 的项目说明与开发约定
├── index.html                入口 HTML（标题、描述、字体预连接）
├── vite.config.ts            构建配置：base、outDir
├── tailwind.config.js        设计 token：颜色、字体、圆角、动效曲线
├── tsconfig.json             TS 严格模式配置
├── public/
│   ├── avatar.svg            头像（SVG，随主题变色）
│   └── resume.html           可打印简历页，Ctrl+P 存 PDF
└── src/
    ├── main.tsx              挂载 + HashRouter
    ├── App.tsx               路由表 + 全局布局（星空、导航、页脚）
    ├── index.css             Tailwind 指令 + 全局样式 + 代码高亮主题
    ├── data/
    │   ├── site.ts           站点信息：姓名、方向、简介、社交、导航
    │   ├── skills.ts         技能分组与熟练度
    │   └── projects.ts       项目列表与详情（含 slug）
    ├── lib/
    │   ├── posts.ts          读取 md → 解析 frontmatter → 排序 → 生成 TOC
    │   └── useReveal.ts      滚动渐入 hook
    ├── components/
    │   ├── Starfield.tsx     Canvas 星空背景
    │   ├── Navbar.tsx        吸顶导航 + 移动端菜单 + 锚点高亮
    │   ├── Footer.tsx        页脚
    │   ├── SectionHeading.tsx 区块标题（eyebrow + 主标题 + 描述）
    │   ├── Hero.tsx          首屏
    │   ├── About.tsx         个人介绍 + 时间线
    │   ├── Skills.tsx        技能分组
    │   ├── Projects.tsx      项目卡片
    │   └── Contact.tsx       联系方式 + 留言表单
    ├── pages/
    │   ├── Home.tsx          首页（组合上述区块）
    │   ├── ProjectDetail.tsx 项目详情
    │   ├── BlogList.tsx      博客列表
    │   └── BlogPost.tsx      博客详情（正文 + TOC）
    └── content/posts/
        └── *.md              博客文章，frontmatter + 正文
```

## 三、数据模型

### 3.1 站点信息 `src/data/site.ts`

```ts
interface SiteInfo {
  name: string          // 姓名 / 昵称
  role: string          // 方向，如「前端开发」
  tagline: string       // 一句话介绍
  intro: string[]       // 个人简介段落
  email: string
  location: string
  socials: { label: string; href: string; icon: string }[]
  nav: { id: string; label: string }[]
  timeline: { period: string; title: string; org: string; desc: string }[]
}
```

### 3.2 技能 `src/data/skills.ts`

```ts
interface SkillGroup {
  group: string                                   // 分组名
  desc: string
  items: { name: string; icon: string; level: number }[]  // level 0-100
}
```

### 3.3 项目 `src/data/projects.ts`

```ts
interface Project {
  slug: string            // 路由用，唯一
  title: string
  summary: string         // 卡片摘要
  year: string
  role: string            // 我的职责
  cover: string           // 封面：渐变 CSS 或图片地址
  tags: string[]
  links: { label: string; href: string }[]
  background: string      // 项目背景
  approach: string[]      // 技术方案要点（列表）
  challenges: { title: string; detail: string }[]  // 难点与解决
  outcome: string         // 结果
}
```

### 3.4 文章 `src/content/posts/*.md`

```md
---
title: 标题
date: 2026-10-27
tags: 工程实践, AI 编程
summary: 一句话摘要，列表页展示
---

正文（支持 GFM 表格、代码块）
```

解析在 `lib/posts.ts`：`import.meta.glob` 以 `?raw` 读入全部 md，手工解析 `---` 之间的键值对（不引 gray-matter，后者在浏览器端需要 Buffer polyfill），按 `date` 倒序导出。

## 四、关键技术点

### 4.1 Markdown 编译期注入

```ts
const modules = import.meta.glob('../content/posts/*.md', { query: '?raw', import: 'default', eager: true })
```

`eager: true` 让文章在构建时成为静态字符串，运行时零请求。新增文章只需放文件，无需改任何索引代码——这是 PRD「新增 md 自动进列表」的实现基础。

### 4.2 TOC 与标题锚点一致性

TOC 从原始 markdown 里正则提取 `## / ###` 行；正文渲染时通过 `components.h2/h3` 覆盖，用同一个 `slugify()` 计算结果作为 `id`。两处共用同一函数，才能保证点击目录一定跳得到。

中文标题的 slug：保留中文字符，空格转 `-`，去掉标点。这样 URL 里会出现中文锚点，浏览器与 `scrollIntoView` 都能正确处理。

### 4.3 滚动渐入不引动画库

`useReveal`：`IntersectionObserver` 观察元素，进入视口后加 `is-visible` 类，CSS 里用 `opacity` + `translateY` 过渡。`threshold: 0.15`，`rootMargin: '0px 0px -60px 0px'`，触发后 `unobserve` 避免重复计算。

### 4.4 星空 Canvas 的性能控制

- 粒子数按视口宽度分档（120 / 55），避免移动端每帧绘制过多精灵；
- 用 `requestAnimationFrame`，页面 `visibilitychange` 隐藏时暂停，省电；
- `prefers-reduced-motion: reduce` 时只绘制一帧静态星点；
- 尺寸变化做 150ms 防抖重建，避免拖动窗口时反复分配 canvas。

### 4.5 导航锚点高亮

`IntersectionObserver` 观察各 section，取当前与视口顶部相交的最后一个区块作为 active，比监听 scroll 计算 `offsetTop` 更稳，也不用处理懒加载导致的高度变化。

### 4.6 复制邮箱的降级

优先 `navigator.clipboard.writeText`（需 https 或 localhost）；失败时退回隐藏 `textarea` + `document.execCommand('copy')`，再失败则提示手动选择。按钮文案在成功后切换为「已复制」并在 1.6s 后复原。

## 五、构建与部署

```bash
npm install        # 安装依赖
npm run dev        # 本地开发 http://localhost:5173
npm run build      # 类型检查 + 产出 dist/
npm run preview    # 本地预览构建产物
```

部署方式（任选其一）：

| 平台 | 步骤要点 |
|---|---|
| Cloudflare Pages | 连接 GitHub 仓库 → 框架选 Vite → 构建命令 `npm run build` → 输出目录 `dist` |
| Vercel | 导入仓库，自动识别 Vite，其余默认 |
| GitHub Pages | 构建产物推 `gh-pages` 分支，或把 `dist` 放 `docs/` 并从该目录启用 |

因为用 HashRouter，**不需要配置任何 rewrite / fallback 规则**。

## 六、已知取舍

| 取舍 | 说明 |
|---|---|
| 留言表单无后端 | 静态站无法真正发信，改为校验 + 本地存储 + 明确提示，不伪装成已发送 |
| 不留评论系统 | 需要第三方服务与账号，与「不接入第三方追踪」冲突 |
| 用 HashRouter | 接受 URL 带 `#`，换取零配置部署 |
| 手写组件而非引库 | 多写约 300 行样式，换来更小的产物和完整的深色控制力 |
