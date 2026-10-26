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
  version: '0.3.4',
  date: '2026-10-19',
  title: '大型 SECS 日志解析性能优化',
  summary: '',
  sections: [
    {
      title: '解析性能',
      items: [
        '优化了一些性能问题。',
      ],
    },
  ],
} as const satisfies ReleaseNote
