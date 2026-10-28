export interface SkillItem {
  name: string
  icon: string
  level: number
}

export interface SkillGroup {
  group: string
  desc: string
  items: SkillItem[]
}

export const skillGroups: SkillGroup[] = [
  {
    group: '前端开发',
    desc: '日常主力，组件拆分、状态管理与响应式布局',
    items: [
      { name: 'HTML / CSS', icon: '🎨', level: 90 },
      { name: 'JavaScript (ES6+)', icon: '🟨', level: 85 },
      { name: 'TypeScript', icon: '🔷', level: 78 },
      { name: 'React', icon: '⚛️', level: 76 },
      { name: 'Vue 2 / Element UI', icon: '💚', level: 74 },
      { name: 'Tailwind CSS', icon: '🌬️', level: 82 },
    ],
  },
  {
    group: '后端与数据',
    desc: '能独立把接口写到可联调的程度',
    items: [
      { name: 'Java / Spring Boot', icon: '☕', level: 70 },
      { name: 'MyBatis', icon: '🧩', level: 70 },
      { name: 'MySQL', icon: '🗄️', level: 76 },
      { name: 'RESTful 接口设计', icon: '🔌', level: 72 },
    ],
  },
  {
    group: '工程化',
    desc: '从写代码到交付上线的一条链路',
    items: [
      { name: 'Vite / 构建配置', icon: '⚡', level: 74 },
      { name: 'Git / GitHub', icon: '🌿', level: 80 },
      { name: 'Chrome 扩展 (MV3)', icon: '🧱', level: 72 },
      { name: '静态站部署', icon: '🚀', level: 70 },
    ],
  },
  {
    group: '方法与工具',
    desc: '决定产出质量的部分，比工具本身更重要',
    items: [
      { name: '需求拆解与 PRD 撰写', icon: '📝', level: 85 },
      { name: 'AI 辅助编程', icon: '🤖', level: 88 },
      { name: '浏览器调试与排错', icon: '🔍', level: 80 },
      { name: 'Figma / 设计还原', icon: '🖌️', level: 62 },
    ],
  },
]
