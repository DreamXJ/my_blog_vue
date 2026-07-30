import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBlogStore = defineStore('blog', () => {
  const articles = ref([])
  const tags = ref({})
  const archives = ref([])
  const loading = ref(true)
  const error = ref(null)

  async function fetchData() {
    loading.value = true
    error.value = null
    try {
      const resp = await fetch('./blog-data.json?' + Date.now())
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      const data = await resp.json()
      articles.value = data.articles || []
      tags.value = data.tags || {}
      archives.value = data.archives || []
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  function getArticleBySlug(slug) {
    return articles.value.find(a => a.slug === slug) || null
  }

  function getArticlesByTag(tag) {
    if (!tags.value[tag]) return []
    return tags.value[tag].map(s => getArticleBySlug(s)).filter(Boolean)
  }

  function getRelatedArticles(currentSlug, limit = 3) {
    const cur = getArticleBySlug(currentSlug)
    if (!cur) return []
    const map = new Map()
    for (const tag of cur.tags) {
      for (const a of getArticlesByTag(tag)) {
        if (a.slug !== currentSlug && !map.has(a.slug)) map.set(a.slug, a)
      }
    }
    return Array.from(map.values()).slice(0, limit)
  }

  return { articles, tags, archives, loading, error, fetchData, getArticleBySlug, getArticlesByTag, getRelatedArticles }
})
