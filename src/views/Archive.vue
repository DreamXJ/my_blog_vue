<script setup>
import { ref, computed, onMounted } from 'vue'
import { useBlogStore } from '@/store/blog'
import ArticleCard from '@/components/ArticleCard.vue'

const store = useBlogStore()
const selectedYear = ref('')

onMounted(() => {
  if (store.articles.length === 0) store.fetchData()
})

const years = computed(() => {
  const y = [...new Set(store.articles.map(a => a.date.slice(0, 4)))]
  return y.sort((a, b) => b - a)
})

const filteredArchives = computed(() => {
  if (!selectedYear.value) return store.archives
  return store.archives.filter(a => a.year === selectedYear.value)
})

function getArticlesBySlugs(slugs) {
  return slugs.map(slug => store.getArticleBySlug(slug)).filter(Boolean)
}
</script>

<template>
  <div class="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- 页面标题 -->
    <div class="mb-10">
      <h1 class="text-[1.75rem] sm:text-[2.2rem] font-bold text-white tracking-[-0.02em] mb-2">文章归档</h1>
      <p class="text-sm text-[#6B7280]">共 {{ store.articles.length }} 篇文章 · 按时间线整理</p>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="text-center py-20">
      <div class="inline-block w-8 h-8 border-2 border-[rgba(59,130,246,0.2)] border-t-[#3B82F6] rounded-full animate-spin"></div>
      <p class="text-sm text-[#6B7280] mt-4">加载中...</p>
    </div>

    <template v-else>
      <!-- 年份筛选 -->
      <div class="flex flex-wrap gap-2 mb-10">
        <button
          @click="selectedYear = ''"
          :class="['tag !rounded-lg !px-3 !py-1.5 !text-xs transition-all',
            !selectedYear ? 'tag-active' : ''
          ]"
        >
          全部年份
        </button>
        <button
          v-for="year in years"
          :key="year"
          @click="selectedYear = year"
          :class="['tag !rounded-lg !px-3 !py-1.5 !text-xs transition-all',
            selectedYear === year ? 'tag-active' : ''
          ]"
        >
          {{ year }}
        </button>
      </div>

      <!-- 时间线 -->
      <div v-if="filteredArchives.length > 0" class="space-y-10">
        <div v-for="archive in filteredArchives" :key="archive.label">
          <!-- 月份标题 -->
          <div class="flex items-center gap-3 mb-5">
            <div class="w-10 h-10 rounded-xl glass flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-[#3B82F6]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <div>
              <h2 class="text-base font-semibold text-white">{{ archive.label }}</h2>
              <span class="text-xs text-[#6B7280]">{{ archive.articles.length }} 篇</span>
            </div>
          </div>
          <!-- 文章卡片网格 -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <ArticleCard
              v-for="article in getArticlesBySlugs(archive.articles)"
              :key="article.slug"
              :article="article"
            />
          </div>
        </div>
      </div>

      <div v-else class="text-center py-20">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl glass flex items-center justify-center">
          <svg class="w-8 h-8 text-[#6B7280]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <p class="text-sm text-[#9CA3AF]">暂无归档数据</p>
      </div>
    </template>
  </div>
</template>
