<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { useBlogStore } from '@/store/blog'
import ArticleCard from '@/components/ArticleCard.vue'

const route = useRoute()
const router = useRouter()
const store = useBlogStore()

const article = ref(null)
const relatedArticles = ref([])

onMounted(async () => {
  if (store.articles.length === 0) {
    await store.fetchData()
  }
  loadArticle()
})

watch(() => route.params.slug, () => {
  loadArticle()
})

function loadArticle() {
  const slug = route.params.slug
  article.value = store.getArticleBySlug(slug)
  if (!article.value) {
    router.replace('/')
    return
  }
  relatedArticles.value = store.getRelatedArticles(slug, 3)

  nextTick(() => {
    enhanceCodeBlocks()
    renderMermaid()
    handleImages()
  })
}

// ── 代码块美化 ──
function enhanceCodeBlocks() {
  document.querySelectorAll('.article-content pre').forEach((pre, idx) => {
    if (pre.closest('.code-block-wrapper')) return

    const code = pre.querySelector('code')
    if (!code) return

    const lang = (code.className.match(/language-(\w+)/) || [])[1] || ''
    const codeText = code.textContent || ''
    const lines = codeText.split('\n')
    if (lines[lines.length - 1] === '') lines.pop()

    const wrapper = document.createElement('div')
    wrapper.className = 'code-block-wrapper'

    const header = document.createElement('div')
    header.className = 'code-header'
    const langLabel = document.createElement('span')
    langLabel.className = 'lang-label'
    langLabel.textContent = lang || 'code'
    header.appendChild(langLabel)

    const copyBtn = document.createElement('button')
    copyBtn.className = 'copy-btn'
    copyBtn.innerHTML = '<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg><span>复制</span>'
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(codeText).then(() => {
        copyBtn.innerHTML = '<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg><span>已复制</span>'
        setTimeout(() => {
          copyBtn.innerHTML = '<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg><span>复制</span>'
        }, 2000)
      })
    })
    header.appendChild(copyBtn)

    const body = document.createElement('div')
    body.className = 'code-body'

    const lineNum = document.createElement('div')
    lineNum.className = 'line-numbers'
    for (let i = 0; i < lines.length; i++) {
      const span = document.createElement('span')
      span.textContent = i + 1
      lineNum.appendChild(span)
    }

    pre.parentNode?.insertBefore(wrapper, pre)
    body.appendChild(lineNum)
    body.appendChild(pre)
    wrapper.appendChild(header)
    wrapper.appendChild(body)
  })
}

// ── Mermaid ──
async function renderMermaid() {
  try {
    const mermaid = (await import('mermaid')).default
    mermaid.initialize({
      theme: 'dark',
      themeVariables: {
        primaryColor: '#1e293b',
        primaryTextColor: '#c9d1d9',
        lineColor: '#3B82F6',
        secondaryColor: '#0d1117',
        tertiaryColor: '#1e293b',
      },
      startOnLoad: false
    })
    const els = document.querySelectorAll('.article-content pre code.language-mermaid')
    els.forEach(async (el, idx) => {
      const pre = el.closest('pre')
      if (!pre) return
      const code = el.textContent || ''
      const wrapper = document.createElement('div')
      wrapper.className = 'mermaid-wrapper'
      const mermaidEl = document.createElement('div')
      mermaidEl.className = 'mermaid'
      mermaidEl.id = `mermaid-${Date.now()}-${idx}`
      mermaidEl.textContent = code
      wrapper.appendChild(mermaidEl)
      pre.parentNode?.replaceChild(wrapper, pre)
      try {
        await mermaid.run({ nodes: [mermaidEl] })
      } catch (_) {}
    })
  } catch (_) {}
}

// ── 图片点击放大 ──
function handleImages() {
  const imgs = document.querySelectorAll('.article-content img')
  imgs.forEach(img => {
    img.loading = 'lazy'
    img.style.cursor = 'zoom-in'
    img.addEventListener('click', () => {
      const overlay = document.createElement('div')
      overlay.className = 'fixed inset-0 z-overlay bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm'
      overlay.style.animation = 'fadeIn 0.2s ease'
      overlay.innerHTML = `<img src="${img.src}" class="max-w-[90vw] max-h-[90vh] rounded-g2xl shadow-2xl" />`
      overlay.addEventListener('click', () => overlay.remove())
      document.body.appendChild(overlay)
    })
  })
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y} 年 ${m} 月 ${day} 日`
}

onBeforeRouteLeave((to, from, next) => {
  document.querySelectorAll('.fixed.inset-0.z-overlay').forEach(el => el.remove())
  next()
})
</script>

<template>
  <div class="max-w-reading mx-auto px-4 sm:px-6 py-12">
    <!-- 文章不存在 -->
    <div v-if="!article" class="text-center py-20">
      <div class="w-16 h-16 mx-auto mb-4 rounded-2xl glass flex items-center justify-center">
        <svg class="w-8 h-8 text-[#6B7280]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
      </div>
      <p class="text-base text-[#9CA3AF]">文章不存在</p>
      <router-link to="/" class="mt-4 inline-block text-sm text-[#60A5FA] hover:text-white transition-colors">返回首页</router-link>
    </div>

    <template v-else>
      <!-- 文章头部 -->
      <header class="mb-10">
        <!-- 标签 -->
        <div class="flex flex-wrap gap-2 mb-4">
          <router-link
            v-for="tag in article.tags"
            :key="tag"
            :to="{ path: '/', query: { tag } }"
            class="tag"
          >
            {{ tag }}
          </router-link>
        </div>

        <!-- 标题 -->
        <h1 class="text-[1.75rem] sm:text-[2.2rem] font-bold text-white leading-[1.2] tracking-[-0.02em] mb-5">
          {{ article.title }}
        </h1>

        <!-- 元信息 -->
        <div class="flex flex-wrap items-center gap-5 text-sm text-[#6B7280]">
          <span class="flex items-center gap-1.5">
            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {{ formatDate(article.date) }}
          </span>
          <span class="flex items-center gap-1.5">
            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            {{ article.readTime }} 分钟
          </span>
          <span v-if="article.tags && article.tags.length" class="flex items-center gap-1.5">
            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
            {{ article.tags.length }} 个标签
          </span>
        </div>

        <!-- 封面图 -->
        <div v-if="article.cover" class="mt-8">
          <img
            :src="article.cover"
            :alt="article.title"
            class="w-full rounded-g2xl object-cover max-h-[400px] border border-[rgba(255,255,255,0.04)]"
            loading="lazy"
          />
        </div>
      </header>

      <!-- 文章正文 -->
      <article
        class="article-content"
        v-html="article.html"
      ></article>

      <!-- 文末标签 -->
      <div class="mt-12 pt-6 border-t border-[rgba(255,255,255,0.04)]">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-sm text-[#6B7280]">标签：</span>
          <router-link
            v-for="tag in article.tags"
            :key="tag"
            :to="{ path: '/', query: { tag } }"
            class="tag"
          >
            {{ tag }}
          </router-link>
        </div>
      </div>

      <!-- 作者信息 -->
      <div class="mt-8 p-5 rounded-g2xl glass-card flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-bold shadow-glow-sm shrink-0">
          A
        </div>
        <div>
          <div class="text-sm font-semibold text-white mb-0.5">DreamXj</div>
          <p class="text-xs text-[#6B7280] leading-relaxed">开发者 · 技术写作者 · AI 实践者</p>
        </div>
      </div>

      <!-- 相关文章 -->
      <div v-if="relatedArticles.length > 0" class="mt-12 pt-6 border-t border-[rgba(255,255,255,0.04)]">
        <h3 class="text-base font-semibold text-white mb-5">相关文章</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ArticleCard
            v-for="rel in relatedArticles"
            :key="rel.slug"
            :article="rel"
          />
        </div>
      </div>

      <!-- 返回顶部 -->
      <div class="mt-12 text-center">
        <router-link to="/" class="btn-ghost !inline-flex">
          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          返回首页
        </router-link>
      </div>
    </template>
  </div>
</template>
