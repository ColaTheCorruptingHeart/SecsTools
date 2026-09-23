export interface ReleaseNoteSection {
  title: string
  items: readonly string[]
}

export interface ReleaseNote {
  version: string
  date: string
  title: string
  summary: string
  sections: readonly ReleaseNoteSection[]
}

export const RELEASE_ACKNOWLEDGEMENT_STORAGE_KEY = 'secs-tools:last-acknowledged-release'

export const latestRelease = {
  version: '0.3.2',
  date: '2026-09-23',
  title: 'SML 构造器与导出体验升级',
  summary: '本次更新完善了可视化 SML 构造、GEM 模板、日志交互与结构化导出，并统一全站视觉规范。',
  sections: [
    {
      title: 'SML 构造器',
      items: [
        '新增可视化 SML 构造器，可编辑节点类型、标签和值，自动维护 List 项数，并提供严格校验与源码应用。',
        '内置常用 GEM 报文模板，支持字符长度标识、引号策略以及节点复制、缩进、移动和折叠。',
      ],
    },
    {
      title: '日志分析与导出',
      items: [
        '消息块悬停高亮与文本拖选现在可以同时清晰显示，时间线与构造器右键菜单统一样式并补充操作图标。',
        '规则导出新增设备号、时间戳和内容哈希命名；标记区间、命中报文和报文集继续使用可追溯的结构化文件名。',
        '设备号与机台号支持保存在浏览器本地，可在后续导出时直接复用或删除。',
      ],
    },
    {
      title: 'S1F12 SVID 提取',
      items: [
        'CSV 导出新增自定义命名弹窗，仅需填写设备号，时间戳与内容哈希自动生成。',
        '桌面端原始报文与提取结果调整为 4:6，结果表格获得更多展示空间。',
      ],
    },
    {
      title: '视觉与文档',
      items: [
        '全站界面统一使用 Element Plus 语义色，同时保留数据类型、日志规则与差异标记的业务辨识色。',
        '重写 README、贡献指南、安全策略与 SML 解析器说明，补充开发、部署和解析契约。',
      ],
    },
  ],
} as const satisfies ReleaseNote
