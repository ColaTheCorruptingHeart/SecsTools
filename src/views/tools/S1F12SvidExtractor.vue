<template>
  <div class="h-full flex flex-col gap-4" v-loading="loading" :element-loading-text="loadingText">
    <div class="bg-surface rounded-xl border border-border shadow-sm p-4">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div class="flex items-center gap-2">
          <div class="p-2 bg-primary-soft rounded-lg">
            <el-icon class="text-primary text-xl"><Document /></el-icon>
          </div>
          <div>
            <h2 class="text-lg font-semibold text-fg m-0">S1F12 SVID 提取</h2>
            <p class="text-xs text-fg-muted m-0 mt-0.5">粘贴 S1F12 报文，自动解析并提取 SVID List 内容</p>
          </div>
        </div>

        <div class="flex items-center gap-2 bg-fill-light p-1.5 rounded-lg border border-border-lighter flex-wrap">
          <el-button size="small" type="primary" class="!rounded-md shadow-sm" :loading="loading" :disabled="loading" @click="handleExtract">解析并提取</el-button>
          <el-button size="small" class="!rounded-md" :loading="exportHashing" :disabled="loading || exportHashing || !rows.length" @click="exportCsv">导出 CSV</el-button>
          <div class="w-px h-4 bg-border-strong mx-1"></div>
          <el-button size="small" type="danger" plain class="!rounded-md" :disabled="loading" @click="clearAll">清空</el-button>
        </div>
      </div>
    </div>

    <section v-if="diagnostics.length" class="svid-diagnostics" aria-label="SML 解析诊断">
      <button
        type="button"
        class="svid-diagnostics__toggle"
        :aria-expanded="diagnosticsOpen"
        @click="diagnosticsOpen = !diagnosticsOpen"
      >
        <span class="svid-diagnostics__title">
          <el-icon><WarningFilled /></el-icon>
          {{ diagnostics.length }} 项解析诊断
        </span>
        <el-icon><ArrowUp v-if="diagnosticsOpen" /><ArrowDown v-else /></el-icon>
      </button>
      <div v-if="diagnosticsOpen" class="svid-diagnostics__list">
        <button
          v-for="(diagnostic, index) in diagnostics"
          :key="`${diagnostic.code}-${diagnostic.start}-${index}`"
          type="button"
          class="svid-diagnostics__row"
          :class="{ 'svid-diagnostics__row--error': diagnostic.severity === 'error' }"
          @click="focusDiagnostic(diagnostic)"
        >
          <span>{{ diagnostic.line }}:{{ diagnostic.column }}</span>
          <span>{{ diagnostic.message }}</span>
        </button>
      </div>
    </section>

    <div class="flex-1 grid grid-cols-1 xl:grid-cols-[minmax(0,4fr)_minmax(0,6fr)] gap-4 min-h-0">
      <div class="bg-surface rounded-xl border border-border shadow-sm flex flex-col h-full overflow-hidden">
        <div class="bg-fill-light border-b border-border px-4 py-2 flex items-center justify-between gap-2">
          <span class="text-sm font-medium text-fg-regular">S1F12 原始报文</span>
        </div>
        <div class="flex-1 overflow-hidden relative">
          <textarea
            ref="sourceTextareaRef"
            class="source-textarea w-full h-full absolute inset-0"
            placeholder="请粘贴 S1F12 报文..."
            :disabled="loading"
            spellcheck="false"
          />
        </div>
      </div>

      <div class="bg-surface rounded-xl border border-border shadow-sm flex flex-col h-full overflow-hidden">
        <div class="bg-fill-light border-b border-border px-4 py-2 flex items-center justify-between gap-2">
          <span class="text-sm font-medium text-fg-regular">提取结果</span>
          <el-tag size="small" type="info" round>共 {{ rows.length }} 条</el-tag>
        </div>

        <div class="flex-1 overflow-hidden">
          <div v-if="rows.length" class="h-full">
            <el-auto-resizer>
              <template #default="{ width, height }">
                <el-table-v2
                  :columns="buildColumns(width)"
                  :data="rows"
                  :width="width"
                  :height="height"
                  :header-height="40"
                  :row-height="44"
                  fixed
                  class="svid-virtual-table"
                />
              </template>
            </el-auto-resizer>
          </div>
          <div v-else class="h-full flex items-center justify-center">
            <el-empty description="暂无提取结果" :image-size="60" />
          </div>
        </div>
      </div>
    </div>

    <ExportFileNameDialog
      v-model="exportDialogVisible"
      title="导出 S1F12 SVID"
      :machine-options="deviceOptions"
      fallback-segment="s1f12-svid"
      :log-date="exportTimestamp"
      :content-hash="exportContentHash"
      extension="csv"
      confirm-label="导出 CSV"
      machine-only
      machine-label="设备号"
      machine-placeholder="可选，可输入新设备号"
      date-label="时间戳"
      @deleteMachineOption="removeDeviceOption"
      @confirm="confirmCsvExport"
    />
  </div>
</template>

<script setup lang="ts">
import { ElInput, ElMessage } from 'element-plus'
import { ArrowDown, ArrowUp, Document, WarningFilled } from '@element-plus/icons-vue'
import { h, nextTick, ref } from 'vue'
import type { SmlDiagnostic } from './secsSml'
import ExportFileNameDialog from './log-timeline/components/ExportFileNameDialog.vue'
import {
  buildStructuredExportFileName,
  createExportTimestamp,
  createRangeExportContentHash,
  deleteRangeExportMachineOption,
  loadRangeExportMachineSettings,
  saveRangeExportMachineSettings
} from './log-timeline/rangeExport'

interface SvidRow {
  index: number
  svid: string
  svname: string
  units: string
  remark: string
}

const sourceTextareaRef = ref<HTMLTextAreaElement | null>(null)
const rows = ref<SvidRow[]>([])
const diagnostics = ref<SmlDiagnostic[]>([])
const diagnosticsOpen = ref(true)
const loading = ref(false)
const loadingText = '正在解析 S1F12 报文，请稍候...'
const savedDeviceSettings = loadRangeExportMachineSettings()
const deviceOptions = ref(savedDeviceSettings.machineIds)
const exportDialogVisible = ref(false)
const exportContent = ref('')
const exportContentHash = ref('')
const exportTimestamp = ref('')
const exportHashing = ref(false)
let exportHashRequestVersion = 0

const columnMinWidths = {
  index: 80,
  svid: 80,
  svname: 240,
  units: 140,
  remark: 260
} as const

const columnWeights = {
  index: 0.1,
  svid: 0.18,
  svname: 0.28,
  units: 0.16,
  remark: 0.28
} as const

type ExtractWorkerMessage =
  | { type: 'success'; rows: SvidRow[]; warnings?: string[]; diagnostics: SmlDiagnostic[] }
  | { type: 'error'; message: string }

function createTextCell(className: string) {
  return ({ cellData }: { cellData: string | number }) => h('div', { class: className }, String(cellData ?? ''))
}

function buildColumns(containerWidth: number) {
  const safeWidth = Math.max(containerWidth, 0)
  const totalMinWidth = Object.values(columnMinWidths).reduce((sum, width) => sum + width, 0)
  const extraWidth = Math.max(safeWidth - totalMinWidth, 0)

  const resolveWidth = (key: keyof typeof columnMinWidths) => {
    const minWidth = columnMinWidths[key]
    const weightedWidth = totalMinWidth + extraWidth > 0 ? safeWidth * columnWeights[key] : minWidth
    return Math.max(minWidth, Math.round(weightedWidth))
  }

  return [
    {
      key: 'index',
      dataKey: 'index',
      title: '序号',
      width: resolveWidth('index'),
      align: 'center',
      cellRenderer: createTextCell('table-cell table-cell-center')
    },
    {
      key: 'svid',
      dataKey: 'svid',
      title: 'SVID',
      width: resolveWidth('svid'),
      cellRenderer: createTextCell('table-cell')
    },
    {
      key: 'svname',
      dataKey: 'svname',
      title: 'SVNAME',
      width: resolveWidth('svname'),
      cellRenderer: createTextCell('table-cell')
    },
    {
      key: 'units',
      dataKey: 'units',
      title: 'UNITS',
      width: resolveWidth('units'),
      cellRenderer: createTextCell('table-cell')
    },
    {
      key: 'remark',
      dataKey: 'remark',
      title: '备注',
      width: resolveWidth('remark'),
      cellRenderer: ({ rowData }: { rowData: SvidRow }) => h('div', { class: 'table-input-cell' }, [
        h(ElInput, {
          modelValue: rowData.remark,
          size: 'small',
          placeholder: '可选备注',
          onInput: (value: string) => {
            rowData.remark = value
          }
        })
      ])
    }
  ]
}

function runExtractWorker(text: string) {
  return new Promise<{ rows: SvidRow[]; warnings: string[]; diagnostics: SmlDiagnostic[] }>((resolve, reject) => {
    const worker = new Worker(new URL('./s1f12SvidExtractor.worker.ts', import.meta.url), { type: 'module' })

    const cleanup = () => {
      worker.onmessage = null
      worker.onerror = null
      worker.terminate()
    }

    worker.onmessage = (event: MessageEvent<ExtractWorkerMessage>) => {
      cleanup()

      if (event.data.type === 'success') {
        resolve({
          rows: event.data.rows,
          warnings: event.data.warnings || [],
          diagnostics: event.data.diagnostics
        })
        return
      }

      reject(new Error(event.data.message))
    }

    worker.onerror = (event) => {
      cleanup()
      reject(new Error(event.message || '解析失败，请检查报文格式'))
    }

    worker.postMessage(text)
  })
}

function getSourceText() {
  return sourceTextareaRef.value?.value ?? ''
}

async function handleExtract() {
  const sourceText = getSourceText()

  if (!sourceText.trim()) {
    ElMessage.warning('请先粘贴 S1F12 报文')
    return
  }

  if (loading.value) return

  loading.value = true
  resetExportState()
  rows.value = []
  diagnostics.value = []

  try {
    await nextTick()
    const extracted = await runExtractWorker(sourceText)
    rows.value = extracted.rows
    diagnostics.value = extracted.diagnostics
    diagnosticsOpen.value = extracted.diagnostics.length > 0
    if (extracted.warnings.length) {
      ElMessage.warning(extracted.warnings[0] || '报文存在可恢复的解析警告')
    }

    if (!rows.value.length) {
      ElMessage.warning('未在 [0][i][0..2] 位置提取到有效数据，请确认报文结构')
      return
    }

    ElMessage.success(`提取完成，共 ${rows.value.length} 条`)
  } catch (error) {
    rows.value = []
    diagnostics.value = []
    ElMessage.error(error instanceof Error ? error.message : '解析失败，请检查报文格式')
  } finally {
    loading.value = false
  }
}

async function focusDiagnostic(diagnostic: SmlDiagnostic) {
  const textarea = sourceTextareaRef.value
  if (!textarea) return
  await nextTick()
  textarea.focus()
  textarea.setSelectionRange(
    Math.min(diagnostic.start, textarea.value.length),
    Math.min(Math.max(diagnostic.start + 1, diagnostic.end), textarea.value.length)
  )
  const lineHeight = Number.parseFloat(window.getComputedStyle(textarea).lineHeight) || 22
  textarea.scrollTop = Math.max(0, (diagnostic.line - 3) * lineHeight)
}

function escapeCsvCell(value: string) {
  const normalized = value.replace(/\r?\n/g, ' ')
  if (/[",\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`
  }

  return normalized
}

function buildCsvExportContent() {
  const header = ['序号', 'SVID', 'SVNAME', 'UNITS', '备注']
  const content = [
    header.join(','),
    ...rows.value.map(row => [
      String(row.index),
      escapeCsvCell(row.svid),
      escapeCsvCell(row.svname),
      escapeCsvCell(row.units),
      escapeCsvCell(row.remark)
    ].join(','))
  ].join('\n')

  return '\uFEFF' + content
}

async function exportCsv() {
  if (!rows.value.length) {
    ElMessage.warning('当前没有可导出的数据')
    return
  }

  if (exportHashing.value) return

  const nextExportContent = buildCsvExportContent()
  const requestVersion = ++exportHashRequestVersion
  exportHashing.value = true

  try {
    const contentHash = await createRangeExportContentHash(nextExportContent)
    if (requestVersion !== exportHashRequestVersion) return

    exportContent.value = nextExportContent
    exportContentHash.value = contentHash
    exportTimestamp.value = createExportTimestamp()
    exportDialogVisible.value = true
  } catch (error) {
    if (requestVersion === exportHashRequestVersion) {
      ElMessage.error(`生成导出文件信息失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  } finally {
    if (requestVersion === exportHashRequestVersion) {
      exportHashing.value = false
    }
  }
}

function confirmCsvExport({ machineId }: { machineId: string, batchId: string }) {
  if (!exportContent.value || !exportContentHash.value || !exportTimestamp.value) {
    ElMessage.warning('导出信息已失效，请重新导出')
    exportDialogVisible.value = false
    return
  }

  const fileName = buildStructuredExportFileName({
    machineId,
    batchId: '',
    fallbackSegment: 's1f12-svid',
    logDate: exportTimestamp.value,
    contentHash: exportContentHash.value,
    extension: 'csv'
  })
  const savedSettings = saveRangeExportMachineSettings(machineId, deviceOptions.value)
  deviceOptions.value = savedSettings.machineIds

  const blob = new Blob([exportContent.value], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  exportDialogVisible.value = false
  ElMessage.success('CSV 导出成功')
}

function removeDeviceOption(machineId: string) {
  const savedSettings = deleteRangeExportMachineOption(machineId, deviceOptions.value)
  deviceOptions.value = savedSettings.machineIds
}

function resetExportState() {
  exportHashRequestVersion += 1
  exportDialogVisible.value = false
  exportContent.value = ''
  exportContentHash.value = ''
  exportTimestamp.value = ''
  exportHashing.value = false
}

function clearAll() {
  if (loading.value) return

  if (sourceTextareaRef.value) {
    sourceTextareaRef.value.value = ''
  }
  resetExportState()
  rows.value = []
  diagnostics.value = []
}
</script>

<style scoped>
.source-textarea {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  height: 100%;
  width: 100%;
  border: none;
  outline: none;
  padding: 1rem;
  font-size: 14px;
  line-height: 1.6;
  background-color: transparent;
  resize: none;
}

.source-textarea:disabled {
  cursor: not-allowed;
  color: var(--el-text-color-secondary);
  background-color: var(--el-fill-color-light);
}

.svid-diagnostics {
  overflow: hidden;
  border: 1px solid var(--el-color-warning-light-5);
  border-radius: 6px;
  background: var(--el-color-warning-light-9);
}

.svid-diagnostics__toggle {
  display: flex;
  width: 100%;
  min-height: 38px;
  align-items: center;
  justify-content: space-between;
  border: 0;
  background: transparent;
  padding: 7px 12px;
  color: var(--el-color-warning);
  cursor: pointer;
}

.svid-diagnostics__title {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 650;
}

.svid-diagnostics__list {
  max-height: 116px;
  overflow: auto;
  border-top: 1px solid var(--el-color-warning-light-5);
  background: var(--el-bg-color);
}

.svid-diagnostics__row {
  display: grid;
  width: 100%;
  grid-template-columns: 58px minmax(0, 1fr);
  gap: 8px;
  border: 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
  border-left: 3px solid var(--el-color-warning);
  background: transparent;
  padding: 6px 10px;
  color: var(--el-text-color-regular);
  font-size: 12px;
  line-height: 18px;
  text-align: left;
  cursor: pointer;
}

.svid-diagnostics__row--error {
  border-left-color: var(--el-color-danger);
}

.svid-diagnostics__row:hover,
.svid-diagnostics__row:focus-visible {
  background: var(--el-fill-color-light);
  outline: none;
}

.svid-virtual-table :deep(.el-table-v2__header-cell),
.svid-virtual-table :deep(.el-table-v2__row-cell) {
  border-bottom: 1px solid var(--el-border-color);
  border-right: 1px solid var(--el-border-color);
}

.svid-virtual-table :deep(.el-table-v2__header-cell) {
  background: var(--el-fill-color-light);
  color: var(--el-text-color-regular);
  font-weight: 500;
}

.svid-virtual-table :deep(.el-table-v2__row-cell) {
  background: var(--el-bg-color);
}

.svid-virtual-table :deep(.el-table-v2__row:hover .el-table-v2__row-cell) {
  background: var(--el-fill-color-light);
}

.table-cell,
.table-input-cell {
  display: flex;
  align-items: center;
  height: 100%;
  width: 100%;
  padding: 0 8px;
}

.table-cell {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 13px;
}

.table-cell-center {
  justify-content: center;
}

.table-input-cell :deep(.el-input) {
  width: 100%;
}

.table-input-cell :deep(.el-input__wrapper) {
  padding: 0 8px;
}
</style>
