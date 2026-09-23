<template>
  <el-container class="h-screen w-full bg-fill-light">
    <el-aside
      :width="isCollapse ? '64px' : '240px'"
      class="bg-surface border-r border-border transition-all duration-300 shadow-sm flex flex-col relative overflow-visible! z-20"
    >
      <div class="h-14 flex items-center border-b border-border-lighter bg-surface shrink-0 transition-all overflow-hidden" :class="isCollapse ? 'justify-center px-0' : 'justify-start px-4'">
        <div class="w-8 h-8 rounded-md bg-primary-soft flex shrink-0 items-center justify-center text-primary transition-all">
          <el-icon :size="18"><component :is="Icons.Grid" /></el-icon>
        </div>
        <div v-if="!isCollapse" class="ml-3 flex shrink-0 items-start gap-1.5 whitespace-nowrap">
          <span class="font-bold text-fg text-base tracking-wide leading-5">SECS Tools</span>
          <button
            type="button"
            class="-mt-1 inline-flex rounded border border-border bg-fill-light px-1.5 py-0.5 font-mono text-[10px] leading-none text-fg-muted"
            title="查看版本更新"
            aria-label="查看版本更新"
            @click="releaseNotesDialog?.open()"
          >
            {{ appVersion }}
          </button>
        </div>
      </div>

      <!-- 将搜索栏移出 el-menu，避免受到 el-menu 样式的污染 -->
      <div class="px-3 py-3 border-b border-border-lighter shrink-0" v-show="!isCollapse">
        <div class="relative" ref="searchContainer" style="position: relative;">
          <el-icon style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); z-index: 10; font-size: 16px; color: var(--el-text-color-placeholder);"><Search /></el-icon>
          <input
            v-model="searchQuery"
            @focus="isSearchFocused = true"
            @blur="handleSearchBlur"
            type="text"
            placeholder="快速搜索..."
            class="w-full bg-fill-light border border-border rounded-md py-1.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-fg-regular placeholder-fg-placeholder"
          />
          <span v-if="!searchQuery" style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%);" class="text-xs text-fg-placeholder bg-surface px-1 border border-border rounded shadow-sm">Ctrl K</span>

          <!-- 搜索结果下拉框 -->
          <div v-if="isSearchFocused && searchQuery" class="absolute left-0 right-0 top-full mt-1 bg-surface-overlay border border-border rounded-md shadow-lg z-50 max-h-64 overflow-y-auto py-1 custom-scrollbar">
            <template v-if="searchResults.length > 0">
              <div
                v-for="item in searchResults"
                :key="item.id"
                @mousedown.prevent="goToTool(item.path)"
                class="px-3 py-2 text-sm text-fg-regular hover:bg-primary-soft hover:text-primary cursor-pointer rounded-md mx-1 transition-colors flex items-center"
              >
                <el-icon class="mr-2 text-fg-placeholder"><component :is="Icons.Tools" /></el-icon>
                {{ item.name }}
              </div>
            </template>
            <div v-else class="px-3 py-4 text-sm text-fg-muted text-center">
              未找到相关工具
            </div>
          </div>
        </div>
      </div>

      <el-menu
        :default-active="activeMenu"
        class="flex-1 border-r-0 overflow-y-auto overflow-x-hidden no-scrollbar custom-menu"
        router
        :collapse="isCollapse"
        :collapse-transition="false"
      >
        <el-menu-item index="/">
          <el-icon><HomeFilled /></el-icon>
          <template #title>
            <span class="font-medium text-[13.5px]">主页</span>
          </template>
        </el-menu-item>

        <template v-for="category in toolsConfig" :key="category.id">
          <el-sub-menu v-if="category.id !== 'hidden-tools'" :index="category.id">
            <template #title>
              <el-icon><component :is="Icons[category.icon as keyof typeof Icons] || Icons.Tools" /></el-icon>
              <span class="font-medium text-[13.5px]">{{ category.name }}</span>
            </template>
            <template v-for="tool in category.tools" :key="tool.id">
              <el-menu-item v-if="!tool.hidden" :index="tool.path" class="text-[13px]">
                {{ tool.name }}
              </el-menu-item>
            </template>
          </el-sub-menu>
        </template>
      </el-menu>

      <!-- 侧边栏折叠把手 -->
      <div
        class="absolute -right-4 top-16 w-8 h-8 bg-surface border border-border rounded-full flex items-center justify-center cursor-pointer shadow-md text-fg-muted hover:text-primary hover:bg-primary-soft transition-all z-50 hover:scale-110"
        @click="isCollapse = !isCollapse"
      >
        <el-icon :size="16"><component :is="isCollapse ? Icons.ArrowRight : Icons.ArrowLeft" /></el-icon>
      </div>
    </el-aside>

    <el-container class="flex flex-col overflow-hidden bg-surface">
      <el-header class="bg-surface border-b border-border flex items-center px-6 h-14 z-10 sticky top-0">
        <div class="flex items-center justify-between gap-4 w-full">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }" class="font-medium text-fg">主页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentRouteName && currentRouteName !== 'Home'">{{ currentRouteName }}</el-breadcrumb-item>
          </el-breadcrumb>

          <a
            href="https://github.com/ColaTheCorruptingHeart/SecsTools"
            target="_blank"
            rel="noreferrer"
            class="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-fg-regular transition-colors hover:border-primary hover:bg-primary-soft hover:text-primary"
            aria-label="GitHub 仓库"
            title="GitHub 仓库"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              class="h-4 w-4 fill-current"
            >
              <path d="M12 2C6.477 2 2 6.589 2 12.248c0 4.526 2.865 8.367 6.839 9.722.5.095.683-.223.683-.495 0-.245-.009-.894-.014-1.754-2.782.617-3.369-1.385-3.369-1.385-.455-1.183-1.11-1.498-1.11-1.498-.908-.637.069-.624.069-.624 1.004.072 1.532 1.056 1.532 1.056.892 1.565 2.341 1.113 2.91.851.091-.664.349-1.113.635-1.369-2.22-.259-4.555-1.139-4.555-5.072 0-1.121.39-2.038 1.029-2.756-.103-.259-.446-1.301.098-2.712 0 0 .84-.277 2.75 1.053A9.38 9.38 0 0 1 12 6.82c.85.004 1.706.118 2.504.347 1.909-1.33 2.748-1.053 2.748-1.053.545 1.411.202 2.453.1 2.712.64.718 1.027 1.635 1.027 2.756 0 3.943-2.339 4.81-4.566 5.064.359.319.679.947.679 1.908 0 1.378-.012 2.489-.012 2.828 0 .274.18.595.688.494C19.138 20.611 22 16.772 22 12.248 22 6.589 17.523 2 12 2Z" />
            </svg>
            <span>GitHub</span>
          </a>
        </div>
      </el-header>

      <el-main class="bg-surface p-6 overflow-auto">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
      <ReleaseNotesDialog ref="releaseNotesDialog" />
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search, HomeFilled } from '@element-plus/icons-vue'
import * as Icons from '@element-plus/icons-vue'
import { toolsConfig, flatTools } from '../config/tools'
import { appVersion } from '../config/appVersion'
import ReleaseNotesDialog from '../components/ReleaseNotesDialog.vue'

const route = useRoute()
const router = useRouter()
const isCollapse = ref(false)
const releaseNotesDialog = ref<{ open: () => void } | null>(null)

const searchQuery = ref('')
const isSearchFocused = ref(false)

const syncCollapseState = (path: string) => {
  isCollapse.value = path !== '/home'
}

const activeMenu = computed(() => {
  return route.path
})

const currentRouteName = computed(() => {
  return route.meta.title || route.name || ''
})

const searchResults = computed(() => {
  if (!searchQuery.value) return []
  const query = searchQuery.value.toLowerCase()
  return flatTools.filter(t =>
    t.name.toLowerCase().includes(query) ||
    t.desc.toLowerCase().includes(query)
  )
})

const goToTool = (path: string) => {
  router.push(path)
  searchQuery.value = ''
  isSearchFocused.value = false
}

const handleSearchBlur = () => {
  // Use a slight delay to allow mousedown event to fire to goToTool before closing
  setTimeout(() => {
    isSearchFocused.value = false
  }, 150)
}

// Ctrl+K to focus search
const handleKeydown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    isCollapse.value = false
    setTimeout(() => {
      const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement
      if (searchInput) searchInput.focus()
    }, 100)
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

watch(
  () => route.path,
  (path) => {
    syncCollapseState(path)
  },
  { immediate: true }
)

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* 隐藏原生滚动条但允许滚动 */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* 自定义轻量滚动条 */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--el-border-color-darker);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: var(--el-text-color-placeholder);
}

/* 自定义菜单样式覆盖以匹配截图风格 */
.custom-menu :deep(.el-menu-item) {
  height: 40px;
  line-height: 40px;
  margin: 4px 12px;
  border-radius: 6px;
  color: var(--el-text-color-regular);
  min-width: 0;
}
.custom-menu :deep(.el-menu-item.is-active) {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-weight: 500;
}
.custom-menu :deep(.el-menu-item:hover) {
  background-color: var(--el-fill-color-light);
}
.custom-menu :deep(.el-sub-menu__title) {
  height: 40px;
  line-height: 40px;
  margin: 4px 12px;
  border-radius: 6px;
  color: var(--el-text-color-regular);
  min-width: 0;
}
.custom-menu :deep(.el-sub-menu__title:hover) {
  background-color: var(--el-fill-color-light);
}
.custom-menu :deep(.el-icon) {
  margin-right: 12px;
  font-size: 16px;
  color: var(--el-text-color-placeholder);
}

/* 侧边栏折叠时的特殊样式处理，防止内容溢出或挤压 */
.custom-menu.el-menu--collapse {
  width: 100%;
}
.custom-menu.el-menu--collapse :deep(.el-menu-item) {
  margin: 12px auto !important;
  border-radius: 8px !important;
  width: 48px !important;
  height: 48px !important;
  line-height: 48px !important;
  min-height: 48px !important;
  padding: 0 !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  box-sizing: border-box !important;
}
.custom-menu.el-menu--collapse :deep(.el-sub-menu) {
  margin: 12px auto !important;
  display: flex !important;
  justify-content: center !important;
}
.custom-menu.el-menu--collapse :deep(.el-sub-menu__title) {
  margin: 0 !important;
  border-radius: 8px !important;
  width: 48px !important;
  height: 48px !important;
  line-height: 48px !important;
  min-height: 48px !important;
  padding: 0 !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  box-sizing: border-box !important;
}
.custom-menu.el-menu--collapse :deep(.el-tooltip__trigger) {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  width: 48px !important;
  height: 48px !important;
  padding: 0 !important;
  box-sizing: border-box !important;
}
.custom-menu.el-menu--collapse :deep(.el-icon) {
  margin: 0 !important;
  width: auto !important;
}
/* 强制隐藏折叠时的右侧箭头与文字 */
.custom-menu.el-menu--collapse :deep(.el-sub-menu__icon-arrow),
.custom-menu.el-menu--collapse :deep(span) {
  display: none !important;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
