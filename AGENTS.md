# AGENTS.md

本文件面向 AI 编程工具（Codex / Copilot / Cursor / WorkBuddy 等），说明这个项目是什么、怎么跑、有哪些硬性约定。任何改动都应先读本文件。

## 一、项目是什么

个人展示网站。纯静态单页应用，用于呈现个人介绍、技能、项目作品与技术博客。没有服务端，没有数据库，没有用户系统。

- 产品需求见 `PRD.md`
- 技术方案见 `TECH_DESIGN.md`
- 冲突时以 PRD 的功能范围、TECH_DESIGN 的技术选型为准

## 二、如何运行

```bash
npm install          # 安装依赖
npm run dev          # 开发服务，默认 http://localhost:5173
npm run build        # 类型检查（tsc --noEmit）+ 打包到 dist/
npm run preview      # 预览 dist/ 产物
```

要求 Node ≥ 18。提交前必须保证 `npm run build` 通过，不允许提交带类型错误或未使用变量的代码。

## 三、技术栈（不可擅自替换）

| 项 | 版本 / 选型 |
|---|---|
| 框架 | React 18 + TypeScript 5（严格模式） |
| 构建 | Vite 5，`base: './'`，输出 `dist/` |
| 样式 | Tailwind CSS 3.4，配置在 `tailwind.config.js` |
| 路由 | react-router-dom 6，**HashRouter**（不要改成 BrowserRouter） |
| Markdown | react-markdown + remark-gfm + rehype-highlight |

禁止引入：Next.js、任何组件库（MUI / Ant Design / shadcn）、任何动画库（Framer Motion / GSAP）、任何图表库。需要动画用 CSS transition，需要图标用内联 SVG 或 emoji。

新增依赖前先确认是否真有必要：能用 20 行代码解决的，不要装包。

## 四、目录结构与职责

```
src/data/        内容数据（站点信息、技能、项目）——改内容改这里
src/content/     博客 Markdown——新增文章只放文件，不改代码
src/lib/         纯函数与 hook（文章解析、滚动渐入）
src/components/  可复用区块组件
src/pages/       路由页面（Home / ProjectDetail / BlogList / BlogPost）
src/index.css    Tailwind 指令 + 全局样式 + 代码高亮主题
```

约束：

- `components/` 里不写死内容，数据一律从 `data/` 或 props 拿；
- `lib/` 保持无副作用，不引 React 之外的依赖（hook 除外）；
- 路由只集中在 `App.tsx` 里声明。

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
6. 弱网 / 刷新后直接访问 `/#/blog/xxx` 仍能正常渲染。

## 八、注意事项

- **不要引入后端**。留言表单是前端演示，提交后只做本地存储与提示，不得写成「已发送」；
- **不要改路由模式**。HashRouter 是部署零配置的前提，改成 BrowserRouter 会导致刷新 404；
- **不要在组件里写死个人信息**。姓名、邮箱、社交链接一律从 `src/data/site.ts` 读；
- **不要删除 `prefers-reduced-motion` 分支**。关掉它会让开启无障碍选项的用户看到无谓动画；
- 修改 `PRD.md` 或 `TECH_DESIGN.md` 时同步更新本文件中的技术栈与目录说明；
- 提交信息用中文，格式 `feat: xxx` / `fix: xxx` / `docs: xxx`。
