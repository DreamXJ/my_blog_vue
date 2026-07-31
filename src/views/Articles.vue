<script setup>
import { ref, computed, onMounted } from 'vue'
import { useBlogStore } from '@/store/blog'
import ArticleCard from '@/components/ArticleCard.vue'
import ArticleNav from '@/components/ArticleNav.vue'

const store = useBlogStore()
const selectedTag = ref('')

onMounted(() => {
  if (store.articles.length === 0) store.fetchData()
})

const filteredArticles = computed(() => {
  if (!selectedTag.value) return store.articles
  return store.getArticlesByTag(selectedTag.value)
})
</script>

<template>
  <div class="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- 页面标题 -->
    <div class="mb-8">
      <h1 class="text-[1.75rem] sm:text-[2.2rem] font-bold text-white tracking-[-0.02em] mb-2">文章</h1>
      <p class="text-sm text-[#6B7280]">共 {{ store.articles.length }} 篇文章 · 按标签筛选</p>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="text-center py-20">
      <div class="inline-block w-8 h-8 border-2 border-[rgba(59,130,246,0.2)] border-t-[#3B82F6] rounded-full animate-spin"></div>
      <p class="text-sm text-[#6B7280] mt-4">加载中...</p>
    </div>

    <template v-else>
      <!-- 标签筛选导航 -->
      <ArticleNav v-model="selectedTag" />

      <!-- 文章列表 -->
      <div v-if="filteredArticles.length > 0">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-white">
            {{ selectedTag ? `#${selectedTag}` : '全部文章' }}
          </h2>
          <span class="text-xs text-[#6B7280]">{{ filteredArticles.length }} 篇</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <ArticleCard
            v-for="article in filteredArticles"
            :key="article.slug"
            :article="article"
          />
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="text-center py-20">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl glass flex items-center justify-center">
          <svg class="w-8 h-8 text-[#6B7280]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <p class="text-sm text-[#9CA3AF]">暂无文章</p>
        <p class="text-xs text-[#6B7280] mt-1">请在 content 目录下创建 .md 文件</p>
      </div>
    </template>
  </div>
</template>
