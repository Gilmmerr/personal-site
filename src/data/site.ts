export interface Social {
  label: string
  href: string
  icon: 'github' | 'mail' | 'link'
}

export interface TimelineItem {
  period: string
  title: string
  org: string
  desc: string
}

export interface NavItem {
  label: string
  id?: string
  to?: string
}

export const site = {
  name: 'Gilmmerr',
  role: '前端开发 / 工程实践',
  tagline: '把模糊的想法，拆成能跑起来的东西。',
  // TODO: 换成你的真实邮箱
  email: 'gilmmerr@example.com',
  location: '中国 · 杭州',
  avatar: './avatar.svg',
  intro: [
    '我是 Gilmmerr，在读计算机相关专业，主要精力放在前端与全栈方向。习惯把需求先写成文档，再让 AI 按文档实现，最后自己逐条验收——写文档这一步看着慢，实际能省掉大量返工。',
    '做过的东西跨度不算小：Chrome 扩展、Vue + Spring Boot 的管理系统、纯静态的个人站点。共同点是都会把踩过的坑记下来，所以这个站里的文章多是「怎么排查」，而不是「怎么用」。',
    '目前在找一个能长期做下去的前端方向，也在持续补工程化与后端基础。',
  ],
  socials: [
    { label: 'GitHub', href: 'https://github.com/Gilmmerr', icon: 'github' },
    { label: '邮箱', href: 'mailto:gilmmerr@example.com', icon: 'mail' },
  ] as Social[],
  nav: [
    { label: '首页', id: 'home' },
    { label: '关于', id: 'about' },
    { label: '技能', id: 'skills' },
    { label: '项目', id: 'projects' },
    { label: '博客', to: '/blog' },
    { label: '联系', id: 'contact' },
  ] as NavItem[],
  timeline: [
    {
      period: '2026.10 — 至今',
      title: '实习 · AI 编程实践',
      org: '技术部',
      desc: '按「需求研究 → PRD → 技术设计 → AGENTS.md → 分步实现 → 部署」的流程独立完成两个项目：Chrome 电商图片提取插件与个人展示站，代码托管在 GitHub，站点部署在静态平台。',
    },
    {
      period: '2026.09 — 2026.10',
      title: '学生管理系统（课程项目）',
      org: '数据库课程',
      desc: 'Vue + Element UI 做前端，Spring Boot + MyBatis + MySQL 做后端，完成学生、课程、专业三张核心表的增删改查与权限设计，重点处理下划线命名与驼峰命名的字段映射。',
    },
    {
      period: '2026.06 — 2026.09',
      title: '低代码应用实践',
      org: '妙搭',
      desc: '用平台能力做了图片水印助手与 AI 翻译助手两个小应用，全部在浏览器本地处理，不上传原图，交付时通过了类型检查与构建校验。',
    },
    {
      period: '2024.09 — 至今',
      title: '本科在读',
      org: '计算机相关专业',
      desc: '主修数据结构、数据库原理、计算机网络。课外以项目驱动学习，习惯用真实需求倒逼补齐知识。',
    },
  ] as TimelineItem[],
  resumeUrl: './resume.html',
}
