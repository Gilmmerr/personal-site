export interface ProjectLink {
  label: string
  href: string
}

export interface Challenge {
  title: string
  detail: string
}

export interface Project {
  slug: string
  title: string
  summary: string
  year: string
  role: string
  cover: string
  glyph: string
  tags: string[]
  links: ProjectLink[]
  background: string
  approach: string[]
  challenges: Challenge[]
  outcome: string
}

export const projects: Project[] = [
  {
    slug: 'image-grab',
    title: '电商图片提取插件',
    summary: '在淘宝、京东、拼多多商品详情页一键抓取全部图片，新标签页勾选后批量保存为 PNG。',
    year: '2026.10',
    role: '独立完成 / 需求、开发、调试、部署',
    cover: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 55%, #0891b2 100%)',
    glyph: '🖼️',
    tags: ['Chrome MV3', 'JavaScript', 'Canvas', '跨域调试'],
    links: [{ label: '源码仓库', href: 'https://github.com/Gilmmerr/image-grab' }],
    background:
      '运营与美工从商品详情页取图，通常只能逐张右键另存，遇到懒加载的图还得先滚到底，取下来的 WebP / JPG 混在一起，还要再转一次格式。这个插件把这一段压成「点一次按钮」。',
    approach: [
      'Manifest V3 拆成四层：content 负责判定详情页与采集，background 负责消息中转与下载调度，gallery 负责新标签页的展示与勾选，manifest 只声明权限与匹配规则。',
      '详情页判定用三级模型：URL 正则 → 结构判据（og:type、主图容器）→ 兜底（图片数量与尺寸），避免平台改版或列表页误判。',
      '采集不按平台写 if-else，而是按属性清单轮询：currentSrc → src → data-src → data-original → data-lazy-src …，取到即停，新增平台只需加属性名。',
      '边滚边采：每步 0.8 屏、间隔 120ms、总时长上限 8 秒，解决虚拟列表滚过即回收导致漏图的问题。',
      '图片按 CDN 规则归一化去重：剥离 _800x800Q90、s100x100_jfs、?imageView2 一类尺寸后缀，同一张主图只留一份。',
      '转 PNG 走 createImageBitmap → OffscreenCanvas → convertToBlob，绘制前先填白底，避免透明图变黑。',
    ],
    challenges: [
      {
        title: '只能抓到首屏十几张',
        detail:
          '第一版直接扫 document.images，拿到的基本是占位图。原因是详情页图片走懒加载，未进入视口时真实地址只存在 data-src 里。改为自动分段滚动并在滚动过程中增量采集后解决。',
      },
      {
        title: '预览页图片大面积裂开',
        detail:
          '图片 CDN 校验 Referer，非本站来源直接 403。展示层加 referrerpolicy="no-referrer" 并补齐 host_permissions 后恢复；仍然失败的图保留占位但保留勾选状态，不影响批量下载。',
      },
      {
        title: '下载下来打不开',
        detail:
          '直接把原图地址交给 chrome.downloads，只会改扩展名，不会真的转码。改为在预览页用 Canvas 重绘后导出 blob，再把 blob URL 交给下载接口。',
      },
      {
        title: 'Service Worker 会休眠',
        detail:
          'MV3 的 background 空闲即回收，内存里的采集结果会丢。全部状态改存 storage.session，并且不在 SW 里调用 URL.createObjectURL（那里没有这个 API），blob URL 一律在预览页创建后把字符串传回。',
      },
    ],
    outcome:
      '三个平台的商品详情页都能一次取到全部主图与详情切片，勾选后批量得到真正的 PNG 文件。代码托管在 GitHub，需求与方案文档随仓库一起维护。',
  },
  {
    slug: 'student-manager',
    title: '学生管理系统',
    summary: '学生、课程、专业三张核心表的完整管理系统，Vue + Element UI 前端，Spring Boot + MyBatis 后端。',
    year: '2026.09',
    role: '独立完成 / 数据库设计、后端接口、前端页面',
    cover: 'linear-gradient(135deg, #0f172a 0%, #134e4a 55%, #065f46 100%)',
    glyph: '🗂️',
    tags: ['Vue 2', 'Element UI', 'Spring Boot', 'MyBatis', 'MySQL'],
    links: [],
    background:
      '数据库课程的综合作业，要求把课上讲的表设计、视图、存储函数、用户权限落到一个能跑的完整系统上，而不是只交一堆 SQL 语句。',
    approach: [
      '三张核心表：学生（register_no 主键，s_name / s_gender 等下划线命名）、课程（course_no、credit、term_no、major_no、course_type）、专业（major_no、major_name）。',
      '课程与专业的「编号」「名称」在接口层作为独立查询参数，前端下拉框按编号取值、按名称展示，避免只传名称导致重名匹配错误。',
      '统一命名转换：数据库下划线 → 后端驼峰 → 前端表单字段，转换只在一处做，避免字段错位这类最难查的问题。',
      '前端表格展示全部数据库列，不做人为隐藏，保证和表结构一一对应；分页与条件查询走服务端。',
      '用视图封装多表关联查询，用存储函数处理业务计算，再用独立的数据库用户做最小权限授权。',
    ],
    challenges: [
      {
        title: '字段名对不上导致保存失败',
        detail:
          '数据库是 s_name，前端表单提交的字段名不一致，后端接收后为 null。做法是：接口文档里固定字段契约，前端提交前统一转换，后端 DTO 显式映射，不再依赖框架的自动驼峰。',
      },
      {
        title: '表格列比数据库列少',
        detail:
          '最初前端只挑了常用的几列展示，验收时对不上表结构。改为按表结构逐列渲染，缺数据的单元格显示占位符而不是隐藏该列。',
      },
      {
        title: '课程与专业只能按名称查',
        detail:
          '编号被当成名称的附属字段，导致同名课程无法区分。把编号提升为独立查询参数，列表与详情都支持按编号精确定位。',
      },
    ],
    outcome:
      '系统可完成三类实体的增删改查、条件筛选与关联查询，数据库部分覆盖了视图、存储函数与用户授权，作为课程综合作业通过验收。',
  },
  {
    slug: 'watermark-tool',
    title: '图片水印助手',
    summary: '浏览器内完成批量加水印，支持文字与图片两种模式、五处预留位置、实时预览与批量导出。',
    year: '2026.06',
    role: '独立完成 / 交互设计与实现',
    cover: 'linear-gradient(135deg, #172554 0%, #1d4ed8 50%, #7c3aed 100%)',
    glyph: '💧',
    tags: ['Canvas', '批量处理', '本地计算'],
    links: [],
    background:
      '给图片加水印的工具大多要求上传到服务器，涉及原图外流的风险。这个应用全程在浏览器本地处理，图片不离开设备。',
    approach: [
      '单张与批量两条路径共用一套渲染逻辑，批量时按队列逐张处理并显示进度，单张失败不阻断整批。',
      '文字水印支持字号、透明度、旋转角度与五处预留位置；图片水印支持缩放与间距平铺。',
      '实时预览用低分辨率副本渲染，导出时再按原图尺寸重绘，兼顾流畅度与画质。',
      '批量重置、全屏预览、单张下载与批量导出都做了防重复点击处理。',
    ],
    challenges: [
      {
        title: '大批量处理时页面卡死',
        detail:
          '同步循环解码所有图片会阻塞主线程。改为队列 + 每张之间让出一帧，并在处理完立刻释放 ImageBitmap 与 object URL。',
      },
      {
        title: '预览与导出效果不一致',
        detail:
          '预览用了缩放后的画布，导出沿用同一尺寸导致清晰度下降。拆成两套尺寸：预览按容器宽高，导出按原图宽高，参数按比例换算。',
      },
    ],
    outcome:
      '交付前清除了所有示例残留代码，通过类型检查、代码规范与构建校验，支持文字与图片双模式水印的批量处理。',
  },
  {
    slug: 'personal-site',
    title: '个人展示网站',
    summary: '就是你正在看的这个站：React + TS + Vite + Tailwind，深色星空主题，纯静态部署。',
    year: '2026.10',
    role: '独立完成 / 设计、开发、部署',
    cover: 'linear-gradient(135deg, #0b0f1a 0%, #312e81 55%, #0e7490 100%)',
    glyph: '✨',
    tags: ['React 18', 'TypeScript', 'Vite', 'Tailwind'],
    links: [{ label: '源码仓库', href: 'https://github.com/Gilmmerr/personal-site' }],
    background:
      '作品散落在仓库、文档和聊天记录里，对外说明时只能临时拼链接。需要一个能长期维护、改内容成本极低的集中入口。',
    approach: [
      '内容与代码分离：站点信息、技能、项目在 src/data 下的 ts 文件里，博客是 src/content/posts 下的 md，新增文章只放文件。',
      '文章用 import.meta.glob 以 ?raw 在构建期读入，运行时零请求；frontmatter 手工解析，不引需要 Buffer polyfill 的库。',
      '路由用 HashRouter + base: "./"，任意静态托管的任意子路径都能跑，刷新与直达链接不会 404，不需要配 rewrite。',
      '星空背景用 Canvas：粒子数按视口宽度分档，页面隐藏时暂停 rAF，尊重 prefers-reduced-motion。',
      '滚动渐入用 IntersectionObserver + CSS 过渡，不引动画库，产物里没有额外 60KB。',
    ],
    challenges: [
      {
        title: 'TOC 点了不跳转',
        detail:
          '目录里的锚点是自己拼的 slug，正文标题则由 react-markdown 渲染，两边算法不一致。改为共用一个 slugify 函数，并用自定义 h2/h3 覆盖渲染输出同一个 id。',
      },
      {
        title: '中文锚点在 URL 里很难看',
        detail:
          '试过转拼音与编码成 UUID，前者要额外词典、后者无法阅读。最终保留中文字符，只去标点与空格，scrollIntoView 与浏览器都能正常处理。',
      },
      {
        title: '移动端星空掉帧',
        detail:
          '最初固定 120 颗粒子，手机上明显卡顿。按视口宽度分档（120 / 55），并在 visibilitychange 时暂停动画后恢复。',
      },
    ],
    outcome: '线上可访问，375 / 768 / 1440 三个宽度无横向滚动，构建产物 gzip 后不足 120KB。',
  },
]

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}
