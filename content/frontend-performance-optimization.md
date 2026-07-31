---
title: 前端性能优化实战：从指标到落地的 9 个优化点
description: 围绕 LCP、CLS、INP 等 Core Web Vitals，给出可落地的加载、渲染、运行时优化方案。
date: 2026-07-31
category: 前端
tags:
  - 性能优化
  - Web Vitals
  - 加载优化
  - 实战
---

# 前端性能优化实战：从指标到落地的 9 个优化点

性能优化最怕"玄学优化"——改了一堆，用户没感知。正确的姿势是：**先用指标量化，再按优先级动手**。本文围绕 Core Web Vitals 给出可落地的优化清单。

## 第一步：量化指标

用 Lighthouse（`npx lighthouse https://your-site.com`）或 Chrome DevTools 的 Performance 面板测量：

| 指标 | 含义 | 目标 |
|------|------|------|
| LCP | 最大内容绘制（首屏加载感知） | < 2.5s |
| CLS | 累积布局偏移（页面稳定性） | < 0.1 |
| INP | 交互到下一次绘制（响应性） | < 200ms |
| TTFB | 首字节时间 | < 800ms |

先跑一次基线，优化后对比，用数据说话。

## 优化点 1：资源加载——preload / prefetch / preconnect

```html
<!-- 关键资源提前加载 -->
<link rel="preload" href="/fonts/icon.woff2" as="font" crossorigin>
<!-- 页面即将用到的资源提前空闲加载 -->
<link rel="prefetch" href="/post/next-page">
<!-- 跨域连接提前建立 -->
<link rel="preconnect" href="https://api.example.com">
```

**坑**：preload 不要滥用，非关键资源 preload 反而抢带宽。

## 优化点 2：图片——懒加载 + 响应式 + 现代格式

```html
<!-- 懒加载：进入视口才加载 -->
<img src="thumb.webp" loading="lazy" decoding="async" />

<!-- 响应式：按屏幕宽度选择图片 -->
<img srcset="img-400w.webp 400w, img-800w.webp 800w"
     sizes="(max-width: 600px) 100vw, 800px" />
```

- 用 `webp` / `avif` 格式（体积降 30%-50%）。
- 给图片预留尺寸（`width`/`height` 或 aspect-ratio）**防 CLS**：
  ```css
  img { aspect-ratio: 16 / 9; }
  ```

## 优化点 3：字体——font-display 与子集化

**坑**：自定义字体加载慢导致文字不可见（FOIT）或布局跳动。

```css
@font-face {
  font-family: 'MyFont';
  src: url('myfont.woff2') format('woff2');
  font-display: swap; /* 先显示系统字体，加载完替换 */
}
```

- 用 `font-display: swap` 避免白屏。
- 用 woff2 子集（`unicode-range` 或字体工具裁剪）减小体积。

## 优化点 4：代码分割——路由懒加载

```javascript
// Vue Router 懒加载：每个路由独立 chunk
const routes = [
  { path: '/about', component: () => import('@/views/About.vue') },
]

// React 等价物
// const About = lazy(() => import('./About'))
```

首屏只加载需要的代码，其余按需加载。**坑**：懒加载组件体积不要过大，否则切换路由时白屏明显；过大的 chunk 继续用 `dynamic import` 拆分。

## 优化点 5：Tree Shaking 与依赖分析

- 用 `rollup-plugin-visualizer`（Vite）或 `webpack-bundle-analyzer` 看体积分布。
- 只引入需要的 API：`import { debounce } from 'lodash-es'` 而不是 `import _ from 'lodash'`。
- 关注 CDN 上 `lodash` 全量引入、`moment` 换 `dayjs`（体积小 90%+）这类"一个依赖顶半个页面"的问题。

## 优化点 6：缓存策略——hash 文件名 + 长缓存

构建产物带内容 hash（Vite 默认带 `[hash]`），静态资源可以放心设 `Cache-Control: max-age=31536000`（一年），HTML 不缓存或短缓存。这样**改代码只重新下载变更的文件**，其余命中缓存。

## 优化点 7：减少重排重绘

- 批量读写 DOM：用 `requestAnimationFrame` 或 DocumentFragment 合并操作。
- 避免在循环里读 `offsetWidth`（强制同步布局）。
- 动画只用 `transform` 和 `opacity`（合成层，不触发布局）。
- 大列表用虚拟滚动（如 `vue-virtual-scroller`）。

## 优化点 8：SSR / 预渲染 / 静态生成

内容型站点（博客、文档）用 SSG（如本项目）首屏即完整 HTML，无需等 JS 渲染：

- 优点：SEO 友好、首屏极快。
- 代价：交互需要 hydration，复杂应用维护成本上升。

动态站点折中方案：SSR（首屏服务端渲染）+ 客户端水合。

## 优化点 9：运行时——避免长任务阻塞主线程

INP 差通常因为**长任务**（超过 50ms 的主线程任务）阻塞了交互：

```javascript
// 大计算拆成小片，让出主线程
async function heavyWork(items) {
  for (let i = 0; i < items.length; i++) {
    process(items[i])
    if (i % 100 === 0) await new Promise(r => setTimeout(r, 0)) // 让出
  }
}
```

- 用 `Web Worker` 处理纯计算（图片处理、数据转换）。
- 事件监听器做防抖/节流，避免高频触发。

## 优化优先级建议

按"性价比"排序，多数项目按这个顺序做：

1. **图片优化**（懒加载 + webp + 尺寸）——改动小、收益大
2. **代码分割**（路由懒加载 + 体积分析）
3. **字体优化**（font-display: swap）
4. **缓存策略**（hash + 长缓存）
5. **长任务拆分**（INP）
6. **SSR/SSG 迁移**（重投入，收益也大）

## 总结

| 指标 | 主要手段 |
|------|---------|
| LCP | 图片/字体/代码加载优化 |
| CLS | 预留尺寸、字体 swap、避免插入内容 |
| INP | 长任务拆分、虚拟滚动、worker |
| TTFB | 缓存、CDN、SSR/SSG |

性能优化不是一次性的，建议把 Lighthouse 跑分接入 CI，**每次提交都检查指标回归**，防止优化成果被后续代码吃掉。
