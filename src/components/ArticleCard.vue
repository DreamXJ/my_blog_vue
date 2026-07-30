<script setup>
defineProps({
  article: {
    type: Object,
    required: true
  }
})

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}年${String(d.getMonth() + 1).padStart(2, '0')}月${String(d.getDate()).padStart(2, '0')}日`
}
</script>

<template>
  <router-link
    :to="'/post/' + article.slug"
    class="glass-card rounded-g2xl overflow-hidden group flex flex-col"
  >
    <!-- 封面图 -->
    <div v-if="article.cover" class="aspect-[16/9] overflow-hidden">
      <img
        :src="article.cover"
        :alt="article.title"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
    </div>

    <div class="p-5 flex flex-col flex-1">
      <!-- 发布日期 + 阅读时间 -->
      <div class="flex items-center justify-between mb-3">
        <time class="text-xs text-[#6B7280]">{{ formatDate(article.date) }}</time>
        <span class="text-xs text-[#6B7280]">{{ article.readTime || 1 }} 分钟阅读</span>
      </div>

      <!-- 标题 -->
      <h3 class="text-base font-semibold text-white mb-2 line-clamp-2 group-hover:text-[#60A5FA] transition-colors duration-300">
        {{ article.title }}
      </h3>

      <!-- 描述 -->
      <p class="text-sm text-[#9CA3AF] leading-relaxed mb-4 line-clamp-2 flex-1">
        {{ article.desc || '暂无描述' }}
      </p>

      <!-- 标签 -->
      <div class="flex flex-wrap gap-1.5">
        <span
          v-for="tag in (article.tags || []).slice(0, 3)"
          :key="tag"
          class="tag"
        >
          {{ tag }}
        </span>
        <span v-if="article.tags && article.tags.length > 3" class="text-xs text-[#6B7280] self-center ml-1">
          +{{ article.tags.length - 3 }}
        </span>
      </div>
    </div>
  </router-link>
</template>
