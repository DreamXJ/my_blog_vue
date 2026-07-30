import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Home', component: () => import('@/views/Home.vue'), meta: { title: '首页' } },
  { path: '/post/:slug', name: 'Post', component: () => import('@/views/Post.vue'), meta: { title: '文章' } },
  { path: '/archive', name: 'Archive', component: () => import('@/views/Archive.vue'), meta: { title: '归档' } },
  { path: '/projects', name: 'Projects', component: () => import('@/views/Projects.vue'), meta: { title: '项目' } },
  { path: '/about', name: 'About', component: () => import('@/views/About.vue'), meta: { title: '关于' } },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() { return { top: 0, behavior: 'smooth' } }
})

export default router
