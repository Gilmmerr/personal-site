# 个人展示网站

一个深色星空主题的个人站点：自我介绍、技能、项目作品与技术博客。
前端 React + Vite，内容存在本机 **MySQL**，由 **Spring Boot + MyBatis** 提供读写接口，后台改完即写库生效。

在线预览（静态快照）：**<部署地址>**

## 特性

- **深色 + 星空**：Canvas 粒子背景，支持视差与闪烁，移动端自动降粒子数，尊重 `prefers-reduced-motion`
- **内容存数据库**：站点信息、经历、技能、项目、文章全部存 MySQL 的分表结构，不再写死在前端代码里
- **在线后台**：访问 `/#/admin` 在线编辑全部内容，保存即写库，全站立即生效，支持 JSON 备份与恢复
- **博客体验**：Markdown 渲染、GFM 表格、代码高亮、自动生成右侧目录并高亮当前章节、上一篇/下一篇
- **零配置部署**：HashRouter + 相对 `base`，任意静态托管、任意子路径都能跑，刷新不 404
- **响应式**：375 / 768 / 1440 三档，移动端单列 + 汉堡菜单
- **无追踪**：不接统计脚本，留言表单只在本地存储

## 技术栈

| 层 | 选型 |
|---|---|
| 前端 | React 18 + TypeScript 5（严格模式）+ Vite 5 + Tailwind CSS 3.4 |
| 路由 | react-router-dom 6（HashRouter） |
| Markdown | react-markdown + remark-gfm + rehype-highlight |
| 后端 | Java 21 + Spring Boot 3.3.5 + MyBatis 3.0.3 |
| 数据库 | MySQL 8/9（库名 `personal_site`，16 张表） |

## 快速开始

### 1. 建库

```bash
mysql -u root -p < backend/src/main/resources/db/schema.sql
```

### 2. 配置本机密码

在 `backend/src/main/resources/application-local.yml` 写入自己的账号密码（该文件已被 `.gitignore` 排除）：

```yaml
spring:
  datasource:
    username: root
    password: 你的密码
```

### 3. 启动

```bash
npm install
npm run dev:full   # 同时起后端(8081) + 前端(5180)
```

也可以分开起：`npm run api` 只起后端，`npm run dev` 只起前端。

| 服务 | 地址 |
|---|---|
| 前端 | http://127.0.0.1:5180 |
| 后端 | http://127.0.0.1:8081/api/content |
| 后台 | http://127.0.0.1:5180/#/admin |

首次启动时，若 `site_profile` 表为空，后端会自动把 `db/seed.json` 灌进数据库（4 个项目 / 4 篇文章 / 4 组技能 / 4 段经历）。

其它命令：

```bash
npm run build           # 类型检查 + 打包到 dist/
npm run export:seed     # 把 src/data 导出成 backend 的 seed.json
npx vite build --outDir docs --emptyOutDir   # 重建 GitHub Pages 产物
```

Node ≥ 18、JDK ≥ 17、Maven ≥ 3.6。

## 目录结构

```
├── PRD.md                        产品需求文档
├── TECH_DESIGN.md                技术设计文档
├── AGENTS.md                     给 AI 编程工具的项目约定
├── backend/                      Spring Boot 后端
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/gilmmerr/site/
│       │   ├── controller/       ContentController：GET/PUT /api/content
│       │   ├── service/          ContentService（读拼装 / 写事务）、SeedService
│       │   ├── mapper/           ContentMapper + mapper/ContentMapper.xml
│       │   ├── model/            Content 及嵌套 DTO
│       │   └── config/           CORS、异常处理、启动灌种子
│       └── resources/
│           ├── application.yml          公共配置（端口 8081）
│           ├── application-local.yml    本机数据库密码（不提交）
│           ├── mapper/ContentMapper.xml SQL
│           └── db/schema.sql            建库建表 + seed.json 初始内容
├── public/
│   ├── avatar.svg                头像
│   ├── resume.html               可打印简历（Ctrl+P 存 PDF）
│   └── content.json              【可选】静态部署时的兜底内容
├── scripts/
│   ├── api.mjs                   启动 Spring Boot
│   ├── dev.mjs                   同时起前后端
│   └── export-seed.mjs           同 npm run export:seed
└── src/
    ├── data/                     默认内容（数据库为空时的兜底）
    ├── content/posts/            默认博客 Markdown
    ├── lib/content.ts            内容层：读接口 / 保存 / 重置
    ├── components/               首页各区块与导航、页脚
    └── pages/                    首页 / 项目详情 / 博客列表 / 博客详情 / admin 后台
```

## 后台管理

访问 `/#/admin`（页脚右下角「后台」也能进），默认口令 `admin888`，改 `src/lib/content.ts` 里的 `ADMIN_PASSWORD` 可替换。

| 模块 | 能改什么 |
|---|---|
| 概览 | 内容量统计、当前数据来源、后端连接状态 |
| 站点信息 | 姓名、方向、一句话介绍、邮箱、城市、头像、简历链接、简介段落、信息卡、社交链接 |
| 经历 | 关于区块的时间线，可增删与上下移动 |
| 技能 | 分组、说明、每个技能的图标 / 名称 / 熟练度 |
| 项目 | 卡片与详情全文：封面渐变、标签、背景、方案、难点、结果、外链 |
| 文章 | 标题、日期、标签、摘要、Markdown 正文（目录自动生成） |
| 数据 | 后端状态、导出 / 导入 `content.json`、回到上次保存、恢复初始内容 |

内容来源按优先级：

1. **数据库** —— `GET /api/content`（正常情况）
2. **静态快照** —— 站点根目录 `content.json`（没有后端时兜底）
3. **内置默认值** —— `src/data/*.ts` 与 `src/content/posts/*.md`

点「保存」= 把整份内容 `PUT /api/content`，后端在一个事务里覆盖 `personal_site` 库的各张表；刷新页面或换设备访问都是新内容。

## 接口

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/content` | 读取全部内容 |
| PUT | `/api/content` | 整体覆盖保存（事务） |
| POST | `/api/content/reset` | 恢复成 `seed.json` 的初始内容 |
| GET | `/api/health` | 连通性检查 |

只监听 `127.0.0.1:8081`，CORS 只放行 `localhost` / `127.0.0.1` 的页面。

## 怎么改内容

| 想改什么 | 改哪里 |
|---|---|
| 文案、经历、技能、项目、文章 | 打开 `/#/admin`（推荐，保存即写库） |
| 数据库结构 | `backend/src/main/resources/db/schema.sql` |
| 默认内容（新库初始化用） | `src/data/*.ts`、`src/content/posts/*.md`，然后 `npm run export:seed` |
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
| GitHub Pages | 构建产物放 `docs/` 目录启用（本仓库当前方式） |
| Cloudflare Pages | 连接仓库，框架选 Vite，构建命令 `npm run build`，输出目录 `dist` |
| Vercel | 导入仓库，自动识别 Vite |

改完代码要连带重建产物再提交：

```bash
npx vite build --outDir docs --emptyOutDir
```

**关于线上和数据库**：GitHub Pages 只能托管静态文件，跑不了 Spring Boot。线上站会走「静态快照 → 默认值」两级兜底，**不会连到本机数据库**，后台在线上保存也会失败（页面会显示黄色提示）。想让线上显示最新内容，在后台「数据」页下载 `content.json`，放进 `public/` 后重新构建即可。

## 文档

- [PRD.md](./PRD.md) — 做哪些功能、不做哪些
- [TECH_DESIGN.md](./TECH_DESIGN.md) — 选型理由、目录结构、数据模型、技术难点
- [AGENTS.md](./AGENTS.md) — 技术栈约束、代码风格、测试要求
