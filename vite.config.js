import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { marked } from 'marked'
import hljs from 'highlight.js'

marked.setOptions({
  breaks: true,
  gfm: true,
  highlight: function (code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try { return hljs.highlight(code, { language: lang }).value } catch (_) {}
    }
    return hljs.highlightAuto(code).value
  }
})

function blogPlugin() {
  const contentDir = path.resolve(process.cwd(), 'content')
  const publicDir = path.resolve(process.cwd(), 'public')
  const dataFile = path.join(publicDir, 'blog-data.json')
  const searchFile = path.join(publicDir, 'search-index.json')
  const sitemapFile = path.join(publicDir, 'sitemap.xml')
  const rssFile = path.join(publicDir, 'rss.xml')

  function walkMdFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    let files = []
    for (const e of entries) {
      const full = path.join(dir, e.name)
      if (e.isDirectory()) files = files.concat(walkMdFiles(full))
      else if (e.name.endsWith('.md')) files.push(full)
    }
    return files
  }

  function generateBlogData() {
    try {
      if (!fs.existsSync(contentDir)) return
      const mdFiles = walkMdFiles(contentDir)
      const articles = []
      for (const fp of mdFiles) {
        const raw = fs.readFileSync(fp, 'utf-8')
        const { data, content } = matter(raw)
        const slug = path.basename(fp, '.md')
        const html = marked.parse(content)
        let dateStr = ''
        if (data.date) {
          if (typeof data.date === 'string') dateStr = data.date.slice(0, 10)
          else if (data.date instanceof Date && !isNaN(data.date)) {
            const d = data.date
            dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
          }
        }
        if (!dateStr) dateStr = new Date().toISOString().slice(0, 10)
        articles.push({
          slug, title: data.title || slug, date: dateStr,
          tags: data.tags || [], desc: data.desc || data.description || '',
          category: data.category || '',
          readTime: data.readTime || Math.ceil(content.split(/\s+/).length / 300),
          cover: data.cover || '', html
        })
      }
      articles.sort((a, b) => a.date > b.date ? -1 : a.date < b.date ? 1 : 0)
      const tagMap = {}
      for (const a of articles) for (const t of a.tags) { if (!tagMap[t]) tagMap[t] = []; tagMap[t].push(a.slug) }
      const archiveMap = {}
      for (const a of articles) {
        const key = `${a.date.slice(0,4)}-${a.date.slice(5,7)}`
        if (!archiveMap[key]) archiveMap[key] = { year: a.date.slice(0,4), month: a.date.slice(5,7), label: `${a.date.slice(0,4)}年${a.date.slice(5,7)}月`, articles: [] }
        archiveMap[key].articles.push(a.slug)
      }
      const archives = Object.values(archiveMap).sort((a, b) => a.year !== b.year ? Number(b.year)-Number(a.year) : Number(b.month)-Number(a.month))
      const blogData = { articles, tags: tagMap, archives }

      const searchIndex = articles.map(a => ({ slug: a.slug, title: a.title, desc: a.desc, tags: a.tags, date: a.date }))

      fs.writeFileSync(dataFile, JSON.stringify(blogData, null, 2), 'utf-8')
      fs.writeFileSync(searchFile, JSON.stringify(searchIndex, null, 2), 'utf-8')

      const siteUrl = 'https://yourusername.github.io/myblog2'
      let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
      sitemap += `  <url><loc>${siteUrl}/</loc><priority>1.0</priority></url>\n`
      sitemap += `  <url><loc>${siteUrl}/archive</loc><priority>0.8</priority></url>\n`
      sitemap += `  <url><loc>${siteUrl}/about</loc><priority>0.6</priority></url>\n`
      for (const a of articles) sitemap += `  <url><loc>${siteUrl}/post/${a.slug}</loc><priority>0.9</priority></url>\n`
      sitemap += '</urlset>\n'
      fs.writeFileSync(sitemapFile, sitemap, 'utf-8')

      console.log(`[blog-plugin] ✓ ${articles.length} 篇文章`)
    } catch (err) { console.error('[blog-plugin] 失败:', err.message) }
  }

  return {
    name: 'blog-plugin',
    buildStart() { generateBlogData() },
    configureServer(server) {
      generateBlogData()
      if (fs.existsSync(contentDir))
        fs.watch(contentDir, { recursive: true }, (ev, fn) => { if (fn?.endsWith('.md')) { generateBlogData(); server.ws.send({ type: 'full-reload' }) } })
    }
  }
}

export default defineConfig({
  base: '/myblog2/',
  plugins: [vue(), blogPlugin()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  build: { outDir: 'dist', assetsDir: 'assets' }
})
