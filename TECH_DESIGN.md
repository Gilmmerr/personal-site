# 技术设计文档（TECH_DESIGN）

> 对应 PRD：v1.2　|　更新日期：2026-10-29

## 一、技术栈选择

### 1.1 结论

| 层 | 选型 | 理由 |
|---|---|---|
| 框架 | React 18 + TypeScript 5 | 组件化拆分区块，TS 把数据结构（项目、文章）约束住，改内容时不会漏字段 |
| 构建 | Vite 5 | 冷启动快，`import.meta.glob` 可直接把 md 文件编进产物，省掉一遍构建脚本 |
| 样式 | Tailwind CSS 3.4 | 深色主题靠少数几个色值，用 token 化配置比写 CSS 文件更不容易跑偏 |
| 路由 | react-router-dom 6（HashRouter） | 见 1.2 |
| Markdown | react-markdown 9 + remark-gfm + rehype-highlight | 纯前端渲染，无需服务端；GFM 支持表格与任务列表，代码块用 highlight.js 高亮 |
| 后端 | Java 21 + Spring Boot 3.3.5 + MyBatis 3.0.3 | 内容要能在线改且换设备一致，就需要落库；选 MyBatis 而非 JPA，是因为表结构简单、SQL 明确，写起来比一堆实体映射更直接 |
| 数据库 | MySQL 8/9，库 `personal_site`，16 张表 | 本机已有实例，结构化分表比存一坨 JSON 更好查、也好展示课程里学的建表与外键 |
| 部署 | 前端静态托管 + 后端本机运行 | 前端零运维；内容写接口只监听 `127.0.0.1`，不对外暴露 |

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
| JPA / Hibernate | 十几张展示型小表，实体 + 关联映射的代码量远超手写 SQL，且 N+1 难以一眼看出 |
| 云数据库 / 托管后端 | 内容只给自己维护，数据放本机 MySQL 足够，不用额外账号与费用 |
| 前后端同源部署 | 那要把前端也塞进 Spring Boot 静态目录，失去静态托管的 CDN 与零运维 |

## 二、项目结构

```
personal-site/
├── PRD.md                    产品需求文档
├── TECH_DESIGN.md            本文档
├── AGENTS.md                 给 AI 的项目说明与开发约定
├── index.html                入口 HTML（标题、描述、字体预连接）
├── vite.config.ts            构建配置：base、outDir、/api 代理到 8081
├── tailwind.config.js        设计 token：颜色、字体、圆角、动效曲线
├── tsconfig.json             TS 严格模式配置
├── backend/                  Spring Boot 后端（独立的 Maven 工程）
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/gilmmerr/site/
│       │   ├── SiteApplication.java
│       │   ├── controller/ContentController.java   GET/PUT /api/content、reset、health
│       │   ├── service/ContentService.java         读：多表拼装；写：事务内清空重建
│       │   ├── service/SeedService.java            seed.json 载入与首次灌库
│       │   ├── mapper/ContentMapper.java           查询/写入方法定义
│       │   ├── model/Content.java                  DTO，与前端 Content 一一对应
│       │   └── config/                             CORS、异常处理、启动钩子
│       └── resources/
│           ├── application.yml                     端口 8081、数据源、Jackson、MyBatis
│           ├── application-local.yml               本机数据库密码（不提交）
│           ├── mapper/ContentMapper.xml            全部 SQL
│           └── db/schema.sql                       16 张表的建表语句
│           └── db/seed.json                        初始内容（由 export:seed 生成）
├── scripts/
│   ├── api.mjs               启动 Spring Boot（自动找 Maven）
│   ├── dev.mjs               同时起后端与 Vite
│   └── export-seed.mjs       借 Vite SSR 把 src/data 导成 seed.json
├── public/
│   ├── avatar.svg            头像（SVG，随主题变色）
│   ├── resume.html           可打印简历页，Ctrl+P 存 PDF
│   └── content.json          【可选】纯静态部署时的兜底内容
└── src/
    ├── main.tsx              初始化内容层 → 挂载 React
    ├── App.tsx               路由表 + 站点外壳（星空、导航、页脚）；/admin 不套壳
    ├── index.css             Tailwind 指令 + 全局样式 + 代码高亮主题
    ├── data/
    │   ├── site.ts           站点信息（数据库为空时的兜底默认值）
    │   ├── skills.ts         技能分组与熟练度（默认值）
    │   └── projects.ts       项目列表与详情（默认值）
    ├── lib/
    │   ├── content.ts        内容层：读 /api/content、保存、重置，useContent()
    │   ├── posts.ts          读取 md → 解析 frontmatter → 生成 TOC 与阅读时长
    │   └── useReveal.ts      滚动渐入 hook（含新增节点的补扫）
    ├── components/           首页区块组件（一律通过 useContent 取数据）
    ├── pages/
    │   ├── Home.tsx          首页（组合上述区块）
    │   ├── ProjectDetail.tsx 项目详情
    │   ├── BlogList.tsx      博客列表
    │   ├── BlogPost.tsx      博客详情（正文 + TOC）
    │   └── admin/            内容管理台（按需加载，不进访客首屏）
    │       ├── AdminPage.tsx 登录 + 外壳 + 保存状态 + ?tab= 深链
    │       ├── OverviewPanel.tsx  数据概览
    │       ├── SitePanel.tsx      站点信息编辑
    │       ├── TimelinePanel.tsx  经历时间线
    │       ├── SkillsPanel.tsx    技能分组与熟练度
    │       ├── ProjectsPanel.tsx  项目列表 + 详情编辑
    │       ├── PostsPanel.tsx     文章 Markdown 编辑
    │       ├── DataPanel.tsx      后端状态、备份与恢复
    │       ├── ui.tsx             表单控件（Field / TextInput / Btn / Block …）
    │       ├── helpers.ts         不可变数组操作、下载、复制
    │       └── types.ts           PanelProps 与 TabKey
    └── content/posts/
        └── *.md              默认博客文章，frontmatter + 正文
```

## 三、数据模型

前端对外仍然只认一个 `Content` 结构（`src/lib/content.ts` 与 `backend/.../model/Content.java` 字段一一对应），数据库是它的拆解存储。

### 3.1 Content（接口出入参）

```ts
interface Content {
  version: number
  updatedAt: string
  site: SiteInfo
  skillGroups: SkillGroup[]
  projects: Project[]
  posts: Post[]
}
```

### 3.2 MySQL 表结构（库 `personal_site`）

「一主多从」的展示型数据，用 16 张表拆开存，排序统一用 `sort_no`：

| 表 | 说明 | 关键列 |
|---|---|---|
| `site_profile` | 站点基本信息，固定一行 `id=1` | name, role, tagline, email, location, avatar, resume_url, updated_at |
| `site_intro` | 自我介绍段落 | sort_no, content |
| `site_fact` | 关于区块信息卡 | sort_no, label, value |
| `site_social` | 社交链接 | sort_no, label, href, icon |
| `site_nav` | 顶部导航 | sort_no, label, anchor, path |
| `timeline_item` | 经历时间线 | sort_no, period, title, org, descr |
| `skill_group` | 技能分组 | sort_no, title, descr |
| `skill_item` | 单个技能，外键 → skill_group | group_id, sort_no, name, icon, level |
| `project` | 项目主表，slug 唯一 | sort_no, slug, title, summary, project_year, role, cover, glyph, background, outcome |
| `project_tag` / `project_link` / `project_step` / `project_challenge` | 项目的标签、外链、方案、难点 | project_id + sort_no |
| `post` | 博客文章，slug 唯一 | sort_no, slug, title, publish_date, summary, body |
| `post_tag` | 文章标签 | post_id, sort_no, tag |
| `site_meta` | 内容版本信息 | k, v |

设计取舍：

- **列名避开保留字**：`year` → `project_year`，`date` → `publish_date`，`desc` → `descr`，`group` 只作表名后缀，避免到处加反引号。
- **子表都挂外键 + `ON DELETE CASCADE`**：即使业务层漏删，也不会留孤儿行。
- **字符集统一 utf8mb4**：技能图标里有 emoji，utf8 三字节存不下。
- **不建「内容版本表」**：只保留 `updated_at`；要历史版本得另做，当前需求不需要。

### 3.3 默认内容与 seed

`src/data/*.ts` 与 `src/content/posts/*.md` 仍保留，但角色变成「新库初始化用的种子」：

```bash
npm run export:seed   # 借 Vite 的 ssrLoadModule 跑 content.ts，导出 backend/.../db/seed.json
```

后端启动时若 `site_profile` 为空就自动灌入，前台不会看到空白站。直接跑 Vite 导出的原因是：`src/data` 是 TS、文章用 `import.meta.glob`，Node 直接加载不了，而 Vite 能按前端同样的规则解析。

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

### 4.7 内容层的三级来源

内容必须能在线改、并且换设备看到同一份，所以真正的数据源是数据库；但静态部署时没有后端，仍要能显示，于是保留两级兜底：

| 优先级 | 来源 | 生效范围 |
|---|---|---|
| 高 | `GET /api/content`（Spring Boot → MySQL） | 有后端时一律以它为准 |
| 中 | 站点根目录 `content.json` | 纯静态部署时的快照 |
| 低 | `src/data/*.ts`、`src/content/posts/*.md` 打包进来的默认值 | 兜底，永远可用 |

```ts
// 组件只认这一个入口，不直接 import 数据文件
const { site, projects, posts, skillGroups } = useContent()
```

- 启动时 `main.tsx` 先 `await initContent()` 再渲染，避免首屏先闪默认文案；
- 判断「接口有没有内容」不能只看 HTTP 200：表为空时后端会返回空壳结构，所以再加一条 `site.name` 与 `projects.length` 都为空则视为未命中，继续往下一级退；
- 外部 JSON（接口返回、导入的文件）一律过 `normalizeContent()`：缺字段补默认值、类型不对的丢弃、数值夹在 0–100，防止手改坏文件导致白屏；
- 状态用 `useSyncExternalStore` 维护，保存成功后把后端回写的内容整体替换进快照，所有订阅组件一起重渲染，不需要刷新页面；
- 后台路由 `/admin` 单独懒加载（约 37KB），并使用独立外壳——星空 Canvas、导航、页脚都不挂载。

后台编辑器维护一份 `draft` 副本，与当前内容做 `JSON.stringify` 比较（忽略 `updatedAt`）来驱动「未保存」标记；离开页面时通过 `beforeunload` 拦截；`Ctrl + S` 与保存按钮走同一个异步函数，保存中按钮禁用避免重复提交。

### 4.8 后端：多表拼装与事务覆盖写

**读**：`ContentService.readContent()` 依次查 15 次（主表 + 各子表），把扁平行按 `projectId` / `groupId` / `postId` 归拢成嵌套结构。MyBatis 返回 `Map`，用 `AS` 别名直接给成前端要的字段名（`project_year AS year`、`descr AS desc`），省掉十几套实体类。

> 取 Map 的 key 做了大小写容错：不同 MySQL 驱动/版本返回的列标签大小写不一定一致，`pick()` 会忽略大小写匹配。

**写**：后台是「整份内容一起保存」的交互，所以采用覆盖写——一个 `@Transactional` 里先按子表→主表顺序清空，再按本次提交重建：

```java
@Transactional
public Content saveContent(Content input) {
    clearAll();                      // 15 条 DELETE，先子后主
    mapper.upsertProfile(profile);   // 固定一行，insert ... on duplicate key update
    writeIntros(...); writeSkillGroups(...); writeProjects(...); writePosts(...);
    mapper.upsertMeta("updatedAt", now);
    return readContent();            // 回写带数据库时间戳的最终内容
}
```

- 覆盖写而不是逐条 diff：数据量在几十条量级，差量比对带来的复杂度远高于收益，而且不会残留孤儿行；
- 自增 id 用 `useGeneratedKeys` 回填到 `Map`，父行插入后立刻拿到 `id` 再插子行；
- `INSERT ... AS new ON DUPLICATE KEY UPDATE` 用 MySQL 8.0.19+ 的别名写法，`VALUES()` 在 8.0.20 起已废弃；
- `updated_at` 由数据库 `ON UPDATE CURRENT_TIMESTAMP` 维护，接口再用 `DATE_FORMAT` 输出成 `2026-10-29T16:48:00`，前端 `new Date()` 能直接解析。

**端口**：后端固定 8081。踩过的坑是——外部环境注入了 `SERVER__PORT`，Spring 的宽松绑定会把它当成 `server.port` 且优先级高于 `application.yml`，服务就被挤到一个随机端口上。启动脚本显式带 `--server.port=8081`（命令行参数优先级最高）来钉死。

**安全边界**：写接口只绑定 `127.0.0.1`，CORS 仅放行 `localhost` / `127.0.0.1` 来源；后台口令仍在前端校验，只能挡误入，不构成真正的鉴权。要放公网必须先加服务端鉴权。

## 五、构建与部署

```bash
# 首次：建库 + 填 application-local.yml 里的密码
mysql -u root -p < backend/src/main/resources/db/schema.sql

npm install        # 安装前端依赖
npm run dev:full   # 同时起后端(8081) + 前端(5180)
npm run api        # 只起后端
npm run dev        # 只起前端
npm run build      # 类型检查 + 产出 dist/
npm run preview    # 本地预览构建产物（同样把 /api 代理到 8081）
```

前端部署方式（任选其一）：

| 平台 | 步骤要点 |
|---|---|
| Cloudflare Pages | 连接 GitHub 仓库 → 框架选 Vite → 构建命令 `npm run build` → 输出目录 `dist` |
| Vercel | 导入仓库，自动识别 Vite，其余默认 |
| GitHub Pages | 构建产物推 `gh-pages` 分支，或把 `dist` 放 `docs/` 并从该目录启用 |

因为用 HashRouter，**不需要配置任何 rewrite / fallback 规则**。

后端不进静态托管：它读写本机 MySQL，只在本地跑。线上静态站走 `content.json` / 默认值兜底，后台在线上会显示「没连上后端」的黄色提示。

| 平台 | 步骤要点 |
|---|---|
| Cloudflare Pages | 连接 GitHub 仓库 → 框架选 Vite → 构建命令 `npm run build` → 输出目录 `dist` |
| Vercel | 导入仓库，自动识别 Vite，其余默认 |
| GitHub Pages | 构建产物推 `gh-pages` 分支，或把 `dist` 放 `docs/` 并从该目录启用 |

因为用 HashRouter，**不需要配置任何 rewrite / fallback 规则**。

## 六、已知取舍

| 取舍 | 说明 |
|---|---|
| 留言表单无后端 | 只做前端校验 + 本地存储 + 明确提示，不伪装成已发送 |
| 不留评论系统 | 需要第三方服务与账号，与「不接入第三方追踪」冲突 |
| 用 HashRouter | 接受 URL 带 `#`，换取零配置部署 |
| 后台口令在前端校验 | 口令写在打包后的 JS 里，只能挡住误入。真正的防护靠后端只监听回环地址 + CORS 白名单，不构成鉴权 |
| 内容整体覆盖写 | 每次保存清空重建十几张表。数据量小、交互是整份保存，比逐条 diff 简单可靠；代价是无法直接看出「这一次改了哪一行」 |
| 线上静态站读不到数据库 | GitHub Pages 跑不了 Spring Boot，线上走 `content.json` / 默认值兜底；要让线上跟着库走，得把后端部署到服务器并改前端 API 地址 |
| 本机密码放 `application-local.yml` | 该文件在 `.gitignore` 里，换机器要自己新建一份；换来的是密码不进公开仓库 |
| 手写组件而非引库 | 多写约 300 行样式，换来更小的产物和完整的深色控制力 |
