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
  version: '0.3.3',
  date: '2026-10-14',
  title: '日志时间线导航与页面滚动优化',
  summary: '本次更新增强了日志时间线的选中反馈和键盘导航，并修复首页滚动区域的边距与底部留白问题。',
  sections: [
    {
      title: '日志时间线',
      items: [
        '当前时间线项目新增醒目的完整高亮边框，点击、日志反向定位和键盘移动时会同步更新选中状态。',
        '时间线获得焦点后可使用上下方向键逐项选择，并可通过 Ctrl+上下方向键快速跳转到上一个或下一个相同 CEID/SxFy 项。',
        '时间戳前新增连续序号，筛选后按当前结果重新编号；同时缩短列表与右侧滚动条之间的空隙。',
      ],
    },
  ],
} as const satisfies ReleaseNote
