# AGENTS.md

本文件面向 AI 编程工具（Codex / Copilot / Cursor / WorkBuddy 等），说明这个项目是什么、怎么跑、有哪些硬性约定。任何改动都应先读本文件。

## 一、项目是什么

个人展示网站。前端是 React 单页应用，呈现个人介绍、技能、项目作品与技术博客；内容存在本机 MySQL，由 `backend/` 下的 Spring Boot + MyBatis 提供读写接口，`/#/admin` 是在线编辑后台。

- 产品需求见 `PRD.md`
- 技术方案见 `TECH_DESIGN.md`
- 冲突时以 PRD 的功能范围、TECH_DESIGN 的技术选型为准

## 二、如何运行

```bash
# 首次：建库（16 张表），并在 backend/src/main/resources/application-local.yml 填自己的数据库密码
mysql -u root -p < backend/src/main/resources/db/schema.sql

npm install          # 安装前端依赖
npm run dev:full     # 同时起后端(8081) + 前端(5180)
npm run api          # 只起后端 Spring Boot
npm run dev          # 只起前端 Vite
npm run build        # 类型检查（tsc --noEmit）+ 打包到 dist/
npm run stop         # 停掉 5180 与 8081（按端口查进程再 kill，能收掉孤儿进程）
npm run check        # 体检：MySQL → 16 张表 → 后端接口 → 前端
npm run export:seed  # 改了 src/data 后，重新导出后端初始化用的 seed.json
```

要求 Node ≥ 18、JDK ≥ 17、Maven ≥ 3.6、MySQL 8/9。提交前必须保证前端 `npm run build` 通过、后端 `mvn -f backend/pom.xml compile` 通过。

## 三、技术栈（不可擅自替换）

| 项 | 版本 / 选型 |
|---|---|
| 框架 | React 18 + TypeScript 5（严格模式） |
| 构建 | Vite 5，`base: './'`，输出 `dist/` |
| 样式 | Tailwind CSS 3.4，配置在 `tailwind.config.js` |
| 路由 | react-router-dom 6，**HashRouter**（不要改成 BrowserRouter） |
| Markdown | react-markdown + remark-gfm + rehype-highlight |
| 后端 | Java 21 + Spring Boot 3.3.5 + MyBatis 3.0.3，端口固定 **8081** |
| 数据库 | MySQL 8/9，库名 `personal_site`，16 张表 |

禁止引入：Next.js、任何组件库（MUI / Ant Design / shadcn）、任何动画库（Framer Motion / GSAP）、任何图表库、JPA / Hibernate。需要动画用 CSS transition，需要图标用内联 SVG 或 emoji，数据库访问一律走 MyBatis。

新增依赖前先确认是否真有必要：能用 20 行代码解决的，不要装包。

## 四、目录结构与职责

```
backend/         Spring Boot 后端（独立 Maven 工程）
  controller/    ContentController：GET/PUT /api/content、reset、health
  service/       ContentService（读拼装 / 写事务）、SeedService（seed.json）
  mapper/        ContentMapper 接口 + resources/mapper/ContentMapper.xml 里的 SQL
  model/         Content 及嵌套 DTO，字段与前端 Content 一一对应
  config/        CORS、异常处理、启动灌种子
  resources/db/  schema.sql（建表）、seed.json（初始内容）
src/data/        默认内容（站点信息、技能、项目）——只作为兜底，不直接被组件引用
src/content/     博客 Markdown——新增文章只放文件，不改代码
src/lib/         纯函数与 hook（内容层 content.ts、文章解析、滚动渐入）
src/components/  可复用区块组件
src/pages/       路由页面（Home / ProjectDetail / BlogList / BlogPost）
src/pages/admin/ 内容管理台（只在 #/admin 时按需加载）
src/index.css    Tailwind 指令 + 全局样式 + 代码高亮主题
```

约束：

- **内容一律通过 `useContent()` 获取**（`src/lib/content.ts`），组件里不要再 `import { site } from '../data/site'`——否则后台改完内容，那一块不会更新；
- `components/` 里不写死内容，数据一律从 `useContent()` 或 props 拿；
- `lib/` 保持无副作用，不引 React 之外的依赖（hook 除外）；
- 路由只集中在 `App.tsx` 里声明；后台路由单独挂，不要套星空与页脚；
- 后台表单只改 `draft` 副本，落盘统一走 `saveContent()`（异步，返回 `{ ok, message }`），不要在面板里直接 `fetch`；
- 后端字段名必须与前端 `Content` 对齐；改结构时两边一起改，并在 `ContentMapper.xml` 用 `AS` 别名对上。

## 五、代码风格

- TypeScript 严格模式，**不使用 `any`**；确需宽松时用 `unknown` 加类型收窄；
- 函数组件 + 具名导出（`export function Hero()`），不用默认导出（页面组件除外）；
- 组件文件名 PascalCase，工具文件 camelCase；
- 样式全部走 Tailwind 类名，不新增 `.css` 文件，不写内联 `style`（动态数值如进度条宽度、粒子坐标除外）；
- 类名顺序：布局 → 尺寸 → 颜色 → 状态 → 响应式；
- 条件类名用模板字符串或简单三元，不引 `clsx`；
- 注释写「为什么」，不写「是什么」；中文注释，不要写大段 JSDoc。

## 六、设计与交互约定

- 深色主题唯一，不实现亮色模式（v1.1 再议）；
- 色值只能取 `tailwind.config.js` 里的 token：`ink` `inkSoft` `paper` `muted` `accent` `accent2`；临时透明度用 `text-paper/70` 这种写法，不写死 `#fff`；
- 内容宽 `max-w-content`（1200px），区块上下间距 `py-24`（移动端 `py-16`）；
- 卡片统一：`rounded-2xl border border-white/[0.08] bg-white/[0.03]`，悬浮时描边提亮 + 上移 2px；
- 动效时长 200–400ms，缓动统一 `ease-smooth`；
- 所有新增区块必须适配 375px 宽度，不允许横向滚动。

## 七、测试要求

改动后至少自测以下项：

1. `npm run build` 通过，无 TS 报错；
2. 首页在 375 / 768 / 1440 三个宽度下无横向滚动、文字不重叠；
3. 移动端汉堡菜单能开合，点击菜单项后自动关闭；
4. 新增或修改的链接可点击且不 404（项目 slug 与文章文件名对应）；
5. 博客详情页 TOC 点击能跳到对应标题；
6. 弱网 / 刷新后直接访问 `/#/blog/xxx` 仍能正常渲染；
7. 后台：在 `/#/admin` 改一处文案并保存，回首页能立即看到；后台「数据」页显示「内容来源：MySQL 数据库」「已连接（127.0.0.1:8081）」；
8. 后台：`/#/admin?tab=projects` 这种带参数的地址刷新后仍停在对应模块；
9. 后端：`curl http://127.0.0.1:8081/api/content` 能返回完整结构；后台保存后 MySQL 里对应表的行数与内容跟着变；
10. 后端关掉时打开站点，首页仍能显示（退到静态快照 / 默认值），后台顶部出现黄色「没连上后端」提示。

## 八、注意事项

- **后端只服务内容读写**。不要往里塞用户系统、评论、上传；留言表单仍是前端演示，只做本地存储与提示，不得写成「已发送」；
- **不要改路由模式**。HashRouter 是部署零配置的前提，改成 BrowserRouter 会导致刷新 404；后台口令校验也只是前端逻辑，不要写成「安全登录」；
- **不要把数据库密码写进 `application.yml`**。密码只放 `application-local.yml`（已在 `.gitignore` 里），该文件不存在时用环境变量 `MYSQL_PASSWORD`；
- **不要给写接口放开跨域**。`WebConfig` 只放行 `localhost` / `127.0.0.1`，`server.address` 固定 `127.0.0.1`，不要改成 `0.0.0.0`；
- **不要在组件里写死个人信息**。姓名、邮箱、社交链接一律从 `useContent()` 读；
- **不要绕过内容层直连接口**。`saveContent()` / `resetContent()` 是唯一入口，面板里自己 `fetch` 会导致状态不同步；
- **不要依赖 `SERVER_PORT` 之类的外部变量决定端口**。启动脚本用 `--server.port=8081` 钉死，因为外部注入的 `SERVER__PORT` 会覆盖配置文件；
- **后台面板保持深色 + 同一套 token**，不要引入浅色主题或组件库；
- **不要删除 `prefers-reduced-motion` 分支**。关掉它会让开启无障碍选项的用户看到无谓动画；
- 修改 `PRD.md` 或 `TECH_DESIGN.md` 时同步更新本文件中的技术栈与目录说明；
- 提交信息用中文，格式 `feat: xxx` / `fix: xxx` / `docs: xxx`。
