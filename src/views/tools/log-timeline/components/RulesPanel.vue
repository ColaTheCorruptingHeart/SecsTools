<template>
  <div class="lg:w-64 xl:w-72 flex-shrink-0 bg-surface rounded-xl border border-border shadow-sm flex flex-col h-[500px] lg:h-full overflow-hidden">
    <div class="bg-fill-light border-b border-border p-2 font-medium text-sm grid grid-cols-[minmax(0,1fr)_72px_auto] items-center gap-1.5 text-fg-regular flex-none">
      <div class="min-w-0 truncate">
        <span>CEID匹配规则</span>
      </div>
      <div class="w-[72px] min-w-0">
        <el-select :model-value="ceidMatchMode" size="small" class="w-full" @update:model-value="onCeidMatchModeChange">
          <el-option label="S6F11" value="S6F11" />
          <el-option label="S6F3" value="S6F3" />
          <el-option label="自定义" value="CUSTOM" />
        </el-select>
      </div>
      <el-button size="small" type="primary" plain @click="emit('openCeidImport')">导入</el-button>
    </div>
    <div class="flex-1 overflow-auto p-2 custom-scrollbar border-b border-border min-h-0">
      <div v-if="rulesList.length > 0" class="flex flex-col gap-2">
        <div v-for="(rule, index) in rulesList" :key="index" class="flex items-center gap-2 bg-fill-light p-1.5 rounded border border-border transition-opacity" :class="{ 'opacity-40': rule.enabled === false }">
          <el-checkbox v-model="rule.enabled" size="small" @change="emit('rulesChanged')" style="margin-right: 0;" />
          <el-color-picker v-model="rule.color" size="small" @change="emit('highlightChanged')" :disabled="rule.enabled === false" :predefine="predefineColors" />
          <div class="flex-1 min-w-0 flex items-baseline gap-1.5 overflow-hidden">
            <div class="text-[11px] font-mono font-bold text-fg-regular shrink-0">{{ rule.ceid }}</div>
            <div class="text-[10px] text-fg-muted truncate" :title="rule.desc">{{ rule.desc }}</div>
          </div>
          <el-button type="danger" link @click="emit('removeRule', index)" class="!p-1">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
      <el-empty v-else description="暂无规则" :image-size="40" />
    </div>

    <div class="bg-fill-light border-b border-border p-2 font-medium text-sm flex justify-between items-center text-fg-regular flex-none">
      <span>SxFy匹配规则</span>
      <el-button size="small" type="primary" plain @click="emit('openSxFyAdd')">添加</el-button>
    </div>
    <div class="flex-1 overflow-auto p-2 custom-scrollbar min-h-0">
      <div v-if="sxfyList.length > 0" class="flex flex-col gap-2">
        <div v-for="(rule, index) in sxfyList" :key="rule.id" class="flex items-center gap-2 bg-fill-light p-1.5 rounded border border-border transition-opacity" :class="{ 'opacity-40': rule.enabled === false }">
          <el-checkbox v-model="rule.enabled" size="small" @change="emit('rulesChanged')" style="margin-right: 0;" />
          <el-color-picker v-model="rule.color" size="small" @change="emit('highlightChanged')" :disabled="rule.enabled === false" :predefine="predefineColors" />
          <div class="flex-1 min-w-0 flex flex-col justify-center overflow-hidden">
            <div class="text-[11px] font-mono font-bold text-fg-regular shrink-0">S{{ rule.s }}F{{ rule.f }}</div>
            <div class="text-[9px] text-fg-muted truncate" :title="rule.keyPos ? `位置: ${rule.keyPos}` : '任意位置'">{{ rule.keyPos ? `[Pos: ${rule.keyPos}]` : '' }} {{ rule.desc }}</div>
          </div>
          <el-button type="primary" link @click="emit('openSxFyEdit', rule)" class="!p-1">
            <el-icon><Edit /></el-icon>
          </el-button>
          <el-button type="danger" link @click="emit('removeSxFyRule', index)" class="!p-1">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
      <el-empty v-else description="暂无SxFy规则" :image-size="40" />
    </div>

    <div class="p-2 border-t border-border flex-none flex flex-col gap-2 bg-fill-light">
      <div class="flex gap-2">
        <el-button class="flex-1 !ml-0" size="small" @click="emit('triggerJsonImport')">导入规则</el-button>
        <el-button class="flex-1 !ml-0" size="small" :loading="exportLoading" :disabled="exportLoading" @click="emit('exportJsonConfig')">导出规则</el-button>
      </div>
      <div class="flex gap-2">
        <el-button class="w-full" size="small" type="primary" @click="emit('rulesChanged')" :disabled="!hasLogContent">重新分析全记录</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Delete, Edit } from '@element-plus/icons-vue'
import type { CeidMatchMode, RuleItem, SxFyRuleItem } from '../types'

const props = defineProps<{
  ceidMatchMode: CeidMatchMode
  rulesList: RuleItem[]
  sxfyList: SxFyRuleItem[]
  predefineColors: string[]
  hasLogContent: boolean
  exportLoading: boolean
}>()

const emit = defineEmits<{
  openCeidImport: []
  updateCeidMatchMode: [mode: CeidMatchMode]
  openCustomCeid: []
  openSxFyAdd: []
  openSxFyEdit: [rule: SxFyRuleItem]
  removeRule: [index: number]
  removeSxFyRule: [index: number]
  triggerJsonImport: []
  exportJsonConfig: []
  rulesChanged: []
  highlightChanged: []
}>()

const onCeidMatchModeChange = (value: string | number | boolean | undefined) => {
  if (value === 'CUSTOM') {
    emit('openCustomCeid')
    return
  }

  if (value === 'S6F11' || value === 'S6F3') {
    if (value !== props.ceidMatchMode) {
      emit('updateCeidMatchMode', value)
    }
    return
  }

  emit('updateCeidMatchMode', props.ceidMatchMode)
}
</script>
