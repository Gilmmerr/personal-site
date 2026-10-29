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
│   ├── resume.html           可打印简历页，Ctrl+P 存 PDF
│   └── content.json          【可选】后台导出的内容文件，存在即覆盖默认文案
└── src/
    ├── main.tsx              初始化内容层 → 挂载 React
    ├── App.tsx               路由表 + 站点外壳（星空、导航、页脚）；/admin 不套壳
    ├── index.css             Tailwind 指令 + 全局样式 + 代码高亮主题
    ├── data/
    │   ├── site.ts           站点信息：姓名、方向、简介、社交、导航（默认值）
    │   ├── skills.ts         技能分组与熟练度（默认值）
    │   └── projects.ts       项目列表与详情（默认值）
    ├── lib/
    │   ├── content.ts        内容层：合并默认 / content.json / 本地草稿，useContent()
    │   ├── posts.ts          读取 md → 解析 frontmatter → 生成 TOC 与阅读时长
    │   └── useReveal.ts      滚动渐入 hook（含新增节点的补扫）
    ├── components/           首页区块组件（一律通过 useContent 取数据）
    ├── pages/
    │   ├── Home.tsx          首页（组合上述区块）
    │   ├── ProjectDetail.tsx 项目详情
    │   ├── BlogList.tsx      博客列表
    │   ├── BlogPost.tsx      博客详情（正文 + TOC）
    │   └── admin/            内容管理台（按需加载，不进访客首屏）
    │       ├── AdminPage.tsx 登录 + 外壳 + 保存/未保存状态 + ?tab= 深链
    │       ├── OverviewPanel.tsx  数据概览
    │       ├── SitePanel.tsx      站点信息编辑
    │       ├── TimelinePanel.tsx  经历时间线
    │       ├── SkillsPanel.tsx    技能分组与熟练度
    │       ├── ProjectsPanel.tsx  项目列表 + 详情编辑
    │       ├── PostsPanel.tsx     文章 Markdown 编辑
    │       ├── DataPanel.tsx      导入导出与重置
    │       ├── ui.tsx             表单控件（Field / TextInput / Btn / Block …）
    │       ├── helpers.ts         不可变数组操作、下载、复制
    │       └── types.ts           PanelProps 与 TabKey
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

### 4.7 内容层与后台管理的三级数据源

站点是纯静态的，没有服务端，又要让内容能被在线编辑，因此把内容抽成一层，按优先级合并：

| 优先级 | 来源 | 生效范围 |
|---|---|---|
| 高 | `localStorage['personal-site:content:draft']` | 当前浏览器立即生效，用于反复微调 |
| 中 | 站点根目录的 `content.json` | 所有访客，部署后生效 |
| 低 | `src/data/*.ts`、`src/content/posts/*.md` 打包进来的默认值 | 兜底，永远可用 |

```ts
// 组件只认这一个入口，不直接 import 数据文件
const { site, projects, posts, skillGroups } = useContent()
```

- 启动时 `main.tsx` 先 `await initContent()` 再渲染，避免首屏先闪默认文案；
- `content.json` 用 `new URL('content.json', document.baseURI)` 取绝对地址，`base: './'` 与子路径部署都能命中；
- 外部 JSON 一律过 `normalizeContent()`：缺字段补默认值、类型不对的丢弃、数值夹在 0–100，防止手改坏文件导致白屏；
- 状态用 `useSyncExternalStore` 维护，`saveDraft()` 写入 localStorage 后同一个快照对象通知所有订阅组件重渲染，不需要刷新页面；
- 后台的路由 `/admin` 单独懒加载（约 37KB），并使用独立外壳——星空 Canvas、导航、页脚都不挂载。

后台编辑器维护一份 `draft` 副本，保存前与当前内容做 `JSON.stringify` 比较（忽略 `updatedAt`）来驱动「未保存」标记；离开页面时通过 `beforeunload` 拦截。

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
| 后台口令在前端校验 | 口令写在打包后的 JS 里，只能挡住误入。真正需要防护时换成带鉴权的接口，但那要求有服务端 |
| 后台改动默认只在本机 | 纯静态站无法直接写服务器文件，故需「导出 content.json → 提交 → 重新部署」一步；换来的是不改部署方式、不引数据库 |
| 手写组件而非引库 | 多写约 300 行样式，换来更小的产物和完整的深色控制力 |
