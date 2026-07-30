<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useBlogStore } from '@/store/blog'
import ArticleCard from '@/components/ArticleCard.vue'
import LogoIcon from '@/components/LogoIcon.vue'

const store = useBlogStore()
const searchQuery = ref('')
const selectedTag = ref('')

onMounted(() => {
  if (store.articles.length === 0) {
    store.fetchData()
  }
})

const allTags = computed(() => {
  return Object.entries(store.tags)
    .map(([name, slugs]) => ({ name, count: slugs.length }))
    .sort((a, b) => b.count - a.count)
})

const featuredArticles = computed(() => {
  return store.articles.slice(0, 6)
})

const filteredArticles = computed(() => {
  let list = store.articles
  if (selectedTag.value) {
    list = store.getArticlesByTag(selectedTag.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.desc.toLowerCase().includes(q) ||
      (a.tags || []).some(t => t.toLowerCase().includes(q))
    )
  }
  return list
})

// 精选项目占位数据
const featuredProjects = [
  {
    name: 'MyBlog',
    desc: '下一代个人博客系统 — Vue3 + Vite + Tailwind CSS',
    tags: ['Vue3', 'Vite', 'Tailwind CSS'],
    url: 'https://github.com/yourusername/myblog2',
    gradient: 'from-[#3B82F6] to-[#8B5CF6]'
  },
  {
    name: 'AI Toolkit',
    desc: 'AI 开发工具集 — 自然语言处理与模型部署',
    tags: ['Python', 'AI', 'NLP'],
    url: '#',
    gradient: 'from-[#06B6D4] to-[#3B82F6]'
  },
  {
    name: 'Design System',
    desc: '企业级组件库与设计规范 — 高效构建产品界面',
    tags: ['React', 'Storybook', 'CSS'],
    url: '#',
    gradient: 'from-[#8B5CF6] to-[#06B6D4]'
  }
]

function openUrl(url) {
  if (url && url !== '#') {
    window.open(url, '_blank')
  }
}
</script>

<template>
  <div class="max-w-content mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative">
    <!-- ── Hero 内容区 ── -->
    <section class="relative pt-20 sm:pt-24">

      <div class="relative flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
        <!-- 左侧文字 -->
        <div class="flex-1 text-center lg:text-left">
          <!-- 头像徽章 -->
          <div class="inline-flex items-center gap-3 mb-6 px-3 py-1.5 rounded-full glass border border-[rgba(59,130,246,0.06)]">
            <LogoIcon :size="24" />
            <span class="text-xs text-[#9CA3AF] tracking-wide">开发者 & 创造者</span>
          </div>

          <!-- 主标题 -->
          <h1 class="text-[2.2rem] sm:text-[2.8rem] lg:text-[3.2rem] font-bold leading-[1.1] tracking-[-0.03em] text-white mb-5">
            一行代码，<br />
            <span class="text-gradient">构建未来</span><br />
            这就是我的方式。
          </h1>

          <!-- 副标题 -->
          <p class="text-base sm:text-lg text-[#9CA3AF] leading-relaxed max-w-lg mx-auto lg:mx-0 mb-8">
            记录技术实践、项目复盘与产品思考。<br />
            用代码、AI 和产品思维构建数字世界。
          </p>

          <!-- CTA -->
          <div class="flex flex-wrap items-center gap-3 justify-center lg:justify-start">
            <router-link to="/archive" class="btn-primary">
              浏览文章
              <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </router-link>
            <router-link to="/about" class="btn-secondary">
              关于我
            </router-link>
          </div>

          <!-- 数据统计 -->
          <div class="flex items-center gap-6 sm:gap-8 mt-8 pt-6 border-t border-[rgba(255,255,255,0.04)] justify-center lg:justify-start">
            <div class="text-center">
              <div class="text-lg font-semibold text-white">{{ store.articles.length }}</div>
              <div class="text-xs text-[#6B7280] mt-0.5">文章</div>
            </div>
            <div class="w-px h-8 bg-[rgba(255,255,255,0.04)]"></div>
            <div class="text-center">
              <div class="text-lg font-semibold text-white">{{ Object.keys(store.tags).length }}</div>
              <div class="text-xs text-[#6B7280] mt-0.5">标签</div>
            </div>
            <div class="w-px h-8 bg-[rgba(255,255,255,0.04)]"></div>
            <div class="text-center">
              <div class="text-lg font-semibold text-white">{{ store.archives.length }}</div>
              <div class="text-xs text-[#6B7280] mt-0.5">归档</div>
            </div>
          </div>
        </div>

        <!-- 右侧抽象几何 -->
        <div class="hidden lg:block flex-shrink-0 relative w-72 h-72">
          <div class="absolute inset-0 bg-gradient-hero rounded-full blur-[60px] opacity-40"></div>
          <div class="absolute top-8 left-8 w-56 h-56 rounded-3xl glass border border-[rgba(59,130,246,0.06)] flex items-center justify-center">
            <div class="grid grid-cols-3 gap-3 p-6">
              <div v-for="i in 9" :key="i" class="w-10 h-10 rounded-xl glass" :style="{
                background: `rgba(${59 + (i%3)*30}, ${130 - (i%2)*40}, ${246 - (i%3)*50}, ${0.04 + i*0.01})`,
                animationDelay: `${i * 0.1}s`
              }"></div>
            </div>
          </div>
          <!-- 浮动装饰点 -->
          <div class="absolute top-0 right-4 w-2 h-2 rounded-full bg-[#3B82F6]/30 animate-float" style="animation-delay: 0s;"></div>
          <div class="absolute bottom-8 left-0 w-1.5 h-1.5 rounded-full bg-[#8B5CF6]/30 animate-float" style="animation-delay: 2s;"></div>
          <div class="absolute top-20 -right-2 w-1 h-1 rounded-full bg-[#06B6D4]/30 animate-float" style="animation-delay: 4s;"></div>
        </div>
      </div>
    </section>

    <!-- ── 精选项目 ── -->
    <section v-if="featuredProjects.length > 0" class="mb-16">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-semibold text-white">精选项目</h2>
        <router-link to="/projects" class="text-sm text-[#60A5FA] hover:text-white transition-colors flex items-center gap-1">
          查看全部
          <svg class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </router-link>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          v-for="proj in featuredProjects"
          :key="proj.name"
          @click="openUrl(proj.url)"
          class="glass-card rounded-g2xl p-5 cursor-pointer group"
        >
          <div class="w-9 h-9 rounded-xl bg-gradient-primary mb-4 flex items-center justify-center text-white text-xs font-bold shadow-glow-sm group-hover:shadow-glow transition-shadow duration-300">
            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          </div>
          <h3 class="text-sm font-semibold text-white mb-1.5 group-hover:text-[#60A5FA] transition-colors">{{ proj.name }}</h3>
          <p class="text-xs text-[#9CA3AF] leading-relaxed mb-3">{{ proj.desc }}</p>
          <div class="flex flex-wrap gap-1.5">
            <span v-for="tag in proj.tags" :key="tag" class="tag !text-[0.6rem]">{{ tag }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Loading -->
    <div v-if="store.loading" class="text-center py-20">
      <div class="inline-block w-8 h-8 border-2 border-[rgba(59,130,246,0.2)] border-t-[#3B82F6] rounded-full animate-spin"></div>
      <p class="text-sm text-[#6B7280] mt-4">加载中...</p>
    </div>

    <template v-else>
      <!-- ── 标签筛选 ── -->
      <div v-if="allTags.length > 0" class="mb-8">
        <div class="flex flex-wrap gap-2">
          <button
            @click="selectedTag = ''"
            :class="['tag !rounded-lg !px-3 !py-1.5 !text-xs transition-all',
              !selectedTag ? 'tag-active' : ''
            ]"
          >
            全部
          </button>
          <button
            v-for="tag in allTags"
            :key="tag.name"
            @click="selectedTag = tag.name"
            :class="['tag !rounded-lg !px-3 !py-1.5 !text-xs transition-all',
              selectedTag === tag.name ? 'tag-active' : ''
            ]"
          >
            {{ tag.name }}
            <span class="ml-1 opacity-60">({{ tag.count }})</span>
          </button>
        </div>
      </div>

      <!-- ── 文章列表 ── -->
      <div v-if="filteredArticles.length > 0">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-white">
            {{ selectedTag ? `#${selectedTag}` : '最新文章' }}
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

      <!-- ── 空状态 ── -->
      <div v-else class="text-center py-20">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl glass flex items-center justify-center">
          <svg class="w-8 h-8 text-[#6B7280]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <p class="text-sm text-[#9CA3AF]">暂无文章</p>
        <p class="text-xs text-[#6B7280] mt-1">请在 content 目录下创建 .md 文件</p>
      </div>

      <!-- ── 查看更多 ── -->
      <div v-if="store.articles.length > 6 && !selectedTag && !searchQuery" class="text-center mt-10">
        <router-link to="/archive" class="btn-secondary !inline-flex">
          查看全部文章
          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </router-link>
      </div>
    </template>
  </div>
</template>
