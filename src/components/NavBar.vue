<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useBlogStore } from '@/store/blog'
import LogoIcon from '@/components/LogoIcon.vue'

const props = defineProps({
  scrolled: Boolean
})

const router = useRouter()
const route = useRoute()
const mobileOpen = ref(false)
const searchOpen = ref(false)
const searchQuery = ref('')
const searchResults = ref([])
const searchFocused = ref(false)
const themeMenuOpen = ref(false)

// 亮暗切换
const isDark = ref(true)

// 当前主题色板
const currentTheme = ref('nordic')

const themes = [
  { id: 'nordic', name: '北欧极光', color: '#3B82F6', desc: '冷静 · 专业' },
  { id: 'sakura', name: '暮色樱花', color: '#F472B6', desc: '柔和 · 浪漫' },
  { id: 'forest', name: '森林冠层', color: '#34D399', desc: '自然 · 沉静' },
  { id: 'slate', name: '石墨灰调', color: '#94A3B8', desc: '极简 · 高级' },
  { id: 'ruby', name: '落日红宝', color: '#FB7185', desc: '热情 · 大胆' },
]

onMounted(() => {
  // 恢复主题色板
  const savedTheme = localStorage.getItem('colorTheme') || 'nordic'
  currentTheme.value = savedTheme
  document.documentElement.className = 'theme-' + savedTheme

  // 恢复亮暗模式
  const saved = localStorage.getItem('theme')
  isDark.value = saved !== 'light'
  if (saved === 'light') {
    document.documentElement.classList.add('light')
  }
})

function toggleTheme() {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.remove('light')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.add('light')
    localStorage.setItem('theme', 'light')
  }
}

function selectTheme(themeId) {
  currentTheme.value = themeId
  // 重置 html 类名并设置新主题
  document.documentElement.className = 'theme-' + themeId
  // 如果当前是亮色模式，保留 light 类
  if (!isDark.value) {
    document.documentElement.classList.add('light')
  }
  localStorage.setItem('colorTheme', themeId)
  themeMenuOpen.value = false
}

// 监听路由变化关闭菜单
watch(() => route.path, () => {
  mobileOpen.value = false
  searchOpen.value = false
  themeMenuOpen.value = false
})

// 搜索逻辑
const store = useBlogStore()

function handleSearch() {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }
  const q = searchQuery.value.trim().toLowerCase()
  const articles = store.articles
  searchResults.value = articles.filter(a =>
    a.title.toLowerCase().includes(q) ||
    a.desc.toLowerCase().includes(q) ||
    (a.tags || []).some(t => t.toLowerCase().includes(q))
  ).slice(0, 8)
}

function goToArticle(slug) {
  searchOpen.value = false
  searchQuery.value = ''
  searchResults.value = []
  router.push(`/post/${slug}`)
}

function openSearch() {
  searchOpen.value = true
  searchQuery.value = ''
  searchResults.value = []
  // 加载文章数据
  if (store.articles.length === 0) {
    store.fetchData()
  }
  setTimeout(() => {
    document.getElementById('search-input')?.focus()
  }, 100)
}

// 键盘快捷键
function handleKeydown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    searchOpen.value ? (searchOpen.value = false) : openSearch()
  }
  if (e.key === 'Escape') {
    searchOpen.value = false
    mobileOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

const navLinks = [
  { path: '/', label: '首页' },
  { path: '/archive', label: '归档' },
  { path: '/projects', label: '项目' },
  { path: '/about', label: '关于' },
]

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

// 搜索框点击外部关闭
const searchRef = ref(null)
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (searchRef.value && !searchRef.value.contains(e.target)) {
      searchFocused.value = false
    }
  })
})
</script>

<template>
  <header
    :class="[
      'glass-nav fixed top-0 left-0 right-0 z-navbar',
      scrolled ? 'scrolled' : ''
    ]"
  >
    <nav class="max-w-content mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <!-- Logo -->
      <router-link
        to="/"
        class="flex items-center gap-3 text-white font-semibold text-lg hover:opacity-80 transition-opacity group"
      >
        <LogoIcon :size="32" class="group-hover:opacity-80 transition-opacity" />
        <span class="hidden sm:inline tracking-tight">DreamXj</span>
      </router-link>

      <!-- 桌面导航 -->
      <div class="hidden md:flex items-center gap-1">
        <router-link
          v-for="link in navLinks"
          :key="link.path"
          :to="link.path"
          :class="[
            'px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200',
            isActive(link.path)
              ? 'text-[#60A5FA] bg-[rgba(59,130,246,0.06)]'
              : 'text-[#9CA3AF] hover:text-white hover:bg-[rgba(255,255,255,0.03)]'
          ]"
        >
          {{ link.label }}
        </router-link>

        <!-- 分割线 -->
        <span class="mx-2 w-px h-5 bg-[rgba(255,255,255,0.04)]"></span>

        <!-- 搜索按钮 -->
        <button
          @click="openSearch"
          class="p-2 rounded-lg text-[#9CA3AF] hover:text-white hover:bg-[rgba(255,255,255,0.03)] transition-all focus-ring"
          title="搜索 (Ctrl+K)"
        >
          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        </button>

        <!-- 主题选择器 -->
        <div class="relative ml-0.5">
          <button
            @click="themeMenuOpen = !themeMenuOpen"
            class="p-2 rounded-lg text-[#9CA3AF] hover:text-white hover:bg-[rgba(255,255,255,0.03)] transition-all focus-ring"
            title="切换主题色板"
          >
            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          </button>
          <!-- 下拉菜单 -->
          <div v-if="themeMenuOpen"
            class="absolute right-0 top-full mt-2 w-44 glass-card !rounded-xl !p-1.5 z-modal animate-scale-in"
            @click.stop
          >
              <button
                v-for="t in themes"
                :key="t.id"
                @click="selectTheme(t.id)"
                :class="[
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all text-left',
                  currentTheme === t.id
                    ? 'bg-[rgba(255,255,255,0.05)] text-white'
                    : 'text-[#9CA3AF] hover:text-white hover:bg-[rgba(255,255,255,0.03)]'
                ]"
              >
                <span class="w-3.5 h-3.5 rounded-full shrink-0" :style="{ background: t.color }"></span>
                <span class="flex-1">{{ t.name }}</span>
                <span class="text-[0.55rem] text-[#6B7280]">{{ t.desc }}</span>
              </button>
              <!-- 分隔线 -->
              <div class="mx-2 my-1 h-px bg-[rgba(255,255,255,0.04)]"></div>
              <!-- 亮暗切换 -->
              <button
                @click="toggleTheme"
                class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all text-left text-[#9CA3AF] hover:text-white hover:bg-[rgba(255,255,255,0.03)]"
              >
                <span class="w-3.5 h-3.5 rounded-full shrink-0 flex items-center justify-center text-[0.55rem] bg-[rgba(255,255,255,0.04)]">
                  {{ isDark ? '☀' : '☾' }}
                </span>
                <span class="flex-1">{{ isDark ? '亮色模式' : '暗色模式' }}</span>
                <span class="text-[0.55rem] text-[#6B7280]">{{ isDark ? '切换' : '切换' }}</span>
              </button>
            </div>
        </div>
    </div>

      <!-- 移动端右侧 -->
      <div class="flex md:hidden items-center gap-1">
        <button
          @click="openSearch"
          class="p-2 rounded-lg text-[#9CA3AF] hover:text-white transition-all"
        >
          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        </button>
        <button
          @click="mobileOpen = !mobileOpen"
          class="p-2 rounded-lg text-[#9CA3AF] hover:text-white transition-all"
        >
          <svg v-if="!mobileOpen" class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          <svg v-else class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </nav>

    <!-- 移动端下拉菜单 -->
    <transition name="mobile-menu">
      <div
        v-if="mobileOpen"
        class="md:hidden border-t border-[rgba(255,255,255,0.04)]"
        :style="{ background: isDark ? 'rgba(15,18,24,0.95)' : 'rgba(247,248,251,0.98)', backdropFilter: 'blur(20px)' }"
      >
        <div class="px-4 py-3 space-y-1">
          <router-link
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            :class="[
              'block px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
              isActive(link.path)
                ? 'text-[#60A5FA] bg-[rgba(59,130,246,0.06)]'
                : 'text-[#9CA3AF] hover:text-white hover:bg-[rgba(255,255,255,0.03)]'
            ]"
          >
            {{ link.label }}
          </router-link>
        </div>
      </div>
    </transition>

    <!-- 搜索弹窗 -->
    <transition name="search-modal">
      <div v-if="searchOpen" class="fixed inset-0 z-modal flex items-start justify-center pt-[15vh]" @click.self="searchOpen = false">
        <!-- 遮罩 -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="searchOpen = false"></div>
        <!-- 弹窗 -->
        <div ref="searchRef" class="relative w-full max-w-lg mx-4 glass-card !rounded-2xl overflow-hidden animate-scale-in">
          <!-- 搜索输入 -->
          <div class="flex items-center gap-3 px-4 py-3 border-b border-[rgba(255,255,255,0.04)]">
            <svg class="w-4 h-4 text-[#6B7280] shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input
              id="search-input"
              v-model="searchQuery"
              @input="handleSearch"
              @focus="searchFocused = true"
              placeholder="搜索文章标题、描述或标签..."
              class="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-[#6B7280] search-input"
            />
            <span class="text-[0.6rem] text-[#6B7280] bg-[rgba(255,255,255,0.03)] px-1.5 py-0.5 rounded">ESC</span>
          </div>
          <!-- 搜索结果 -->
          <div class="max-h-72 overflow-y-auto">
            <div v-if="searchQuery && searchResults.length === 0" class="px-4 py-8 text-center text-sm text-[#6B7280]">
              未找到相关文章
            </div>
            <div v-if="!searchQuery" class="px-4 py-8 text-center text-sm text-[#6B7280]">
              输入关键词开始搜索...
            </div>
            <div v-for="result in searchResults" :key="result.slug">
              <button
                @click="goToArticle(result.slug)"
                class="w-full text-left px-4 py-3 hover:bg-[rgba(59,130,246,0.04)] transition-colors border-b border-[rgba(255,255,255,0.02)] last:border-none"
              >
                <div class="text-sm font-medium text-white mb-0.5 line-clamp-1">{{ result.title }}</div>
                <div class="text-xs text-[#6B7280] line-clamp-1">{{ result.desc || '暂无描述' }}</div>
                <div class="flex gap-1.5 mt-1.5">
                  <span v-for="tag in (result.tags || []).slice(0, 3)" :key="tag" class="tag !text-[0.6rem] !py-0 !px-1.5">
                    {{ tag }}
                  </span>
                </div>
              </button>
            </div>
          </div>
          <!-- 搜索快捷提示 -->
          <div class="px-4 py-2 border-t border-[rgba(255,255,255,0.03)] flex items-center gap-4 text-[0.6rem] text-[#6B7280]">
            <span class="flex items-center gap-1"><kbd class="bg-[rgba(255,255,255,0.04)] px-1 py-0.5 rounded text-[0.55rem]">↑↓</kbd> 导航</span>
            <span class="flex items-center gap-1"><kbd class="bg-[rgba(255,255,255,0.04)] px-1 py-0.5 rounded text-[0.55rem]">Enter</kbd> 打开</span>
            <span class="flex items-center gap-1 ml-auto"><kbd class="bg-[rgba(255,255,255,0.04)] px-1 py-0.5 rounded text-[0.55rem]">Esc</kbd> 关闭</span>
          </div>
        </div>
      </div>
    </transition>
  </header>
</template>

<style scoped>
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.mobile-menu-enter-from,
.mobile-menu-leave-to {
  max-height: 0;
  opacity: 0;
}
.mobile-menu-enter-to,
.mobile-menu-leave-from {
  max-height: 300px;
  opacity: 1;
}

.search-modal-enter-active {
  transition: opacity 0.2s ease;
}
.search-modal-leave-active {
  transition: opacity 0.15s ease;
}
.search-modal-enter-from,
.search-modal-leave-to {
  opacity: 0;
}
</style>
