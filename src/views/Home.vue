<script setup>
import { ref, computed, onMounted } from 'vue'
import { useBlogStore } from '@/store/blog'
import ArticleCard from '@/components/ArticleCard.vue'
import LogoIcon from '@/components/LogoIcon.vue'

const store = useBlogStore()
const MAX_LATEST = 9

onMounted(() => {
  if (store.articles.length === 0) {
    store.fetchData()
  }
})

// 首页最新文章：最多展示 9 篇
const latestArticles = computed(() => store.articles.slice(0, MAX_LATEST))
const hasMoreArticles = computed(() => store.articles.length > MAX_LATEST)

// 精选项目
const featuredProjects = [
  {
    name: 'MyBlog',
    desc: '下一代个人博客系统 — Vue3 + Vite + Tailwind CSS',
    tags: ['Vue3', 'Vite', 'Tailwind CSS'],
    url: 'https://dreamxj.github.io/my_blog_vue/'
  },
  {
    name: 'AI Toolkit',
    desc: 'AI 开发工具集 — 自然语言处理与模型部署',
    tags: ['Python', 'AI', 'NLP'],
    url: '#'
  },
  {
    name: 'Design System',
    desc: '企业级组件库与设计规范 — 高效构建产品界面',
    tags: ['React', 'Storybook', 'CSS'],
    url: '#'
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
    <section class="relative pt-20 sm:pt-24 pb-14 sm:pb-16">

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
            <router-link to="/articles" class="btn-primary">
              浏览文章
              <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </router-link>
            <router-link to="/about" class="btn-secondary">
              关于我
            </router-link>
          </div>

          <!-- 数据统计 -->
          <div class="inline-flex items-center gap-7 sm:gap-9 mt-10 px-6 sm:px-8 py-4 rounded-2xl glass border border-[rgba(59,130,246,0.08)] justify-center lg:justify-start shadow-glow-sm">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-[rgba(59,130,246,0.1)] flex items-center justify-center shrink-0">
                <svg class="w-4 h-4 text-[#60A5FA]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </div>
              <div class="text-left">
                <div class="text-xl font-bold text-gradient leading-none">{{ store.articles.length }}</div>
                <div class="text-[0.7rem] text-[#6B7280] mt-1">文章</div>
              </div>
            </div>
            <div class="w-px h-9 bg-[rgba(255,255,255,0.06)]"></div>
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-[rgba(139,92,246,0.1)] flex items-center justify-center shrink-0">
                <svg class="w-4 h-4 text-[#A78BFA]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
              </div>
              <div class="text-left">
                <div class="text-xl font-bold text-gradient leading-none">{{ Object.keys(store.tags).length }}</div>
                <div class="text-[0.7rem] text-[#6B7280] mt-1">标签</div>
              </div>
            </div>
            <div class="w-px h-9 bg-[rgba(255,255,255,0.06)]"></div>
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-[rgba(6,182,212,0.1)] flex items-center justify-center shrink-0">
                <svg class="w-4 h-4 text-[#22D3EE]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <div class="text-left">
                <div class="text-xl font-bold text-gradient leading-none">{{ store.archives.length }}</div>
                <div class="text-[0.7rem] text-[#6B7280] mt-1">归档</div>
              </div>
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
      <!-- ── 最新文章列表 ── -->
      <div v-if="latestArticles.length > 0">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-white">最新文章</h2>
          <span class="text-xs text-[#6B7280]">最新 {{ latestArticles.length }} 篇</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <ArticleCard
            v-for="article in latestArticles"
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
      <div v-if="hasMoreArticles" class="text-center mt-10">
        <router-link to="/archive" class="btn-secondary !inline-flex">
          查看全部文章（共 {{ store.articles.length }} 篇）
          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </router-link>
      </div>
    </template>
  </div>
</template>
