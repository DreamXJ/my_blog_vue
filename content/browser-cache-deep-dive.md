---
title: 浏览器缓存机制详解：强缓存、协商缓存与 6 个踩坑点
description: 彻底搞懂 Cache-Control、ETag、Last-Modified 的配合关系，以及缓存失效、更新不及时等实战问题。
date: 2026-07-31
category: 前端
tags:
  - 浏览器缓存
  - HTTP
  - 性能
  - 踩坑
---

# 浏览器缓存机制详解：强缓存、协商缓存与 6 个踩坑点

浏览器缓存是前端性能的第一道免费红利，但配置错了会带来"改了代码不生效""用户看到旧版本"等经典问题。本文讲透缓存全链路，并给出每个坑的解法。

## 一、两种缓存模式

### 1. 强缓存（不发请求）

命中后直接使用本地副本，**完全不发请求**。由响应头控制：

| 响应头 | 说明 |
|--------|------|
| `Cache-Control: max-age=3600` | 缓存 1 小时（现代标准，优先级最高） |
| `Expires: <日期>` | 老式绝对过期时间，与 max-age 同时存在时被忽略 |

```http
HTTP/1.1 200 OK
Cache-Control: public, max-age=31536000
```

### 2. 协商缓存（发请求，问服务器）

每次都发请求，带校验字段，服务器判断资源是否变化：

| 请求头 | 响应头 | 机制 |
|--------|--------|------|
| `If-None-Match: <etag>` | `ETag: <etag>` | 内容 hash，最精确 |
| `If-Modified-Since: <date>` | `Last-Modified: <date>` | 最后修改时间，秒级精度，可能不准确 |

命中协商缓存返回 `304 Not Modified`（体积极小），未命中返回 `200 + 新资源`。

## 二、完整决策流程

```
请求发出
  ├─ 强缓存命中（Cache-Control 未过期）→ 直接用本地副本，不发请求 ✅
  ├─ 强缓存失效 → 发请求，带协商字段
  │    ├─ 协商缓存命中 → 304，用本地副本
  │    └─ 协商缓存未命中 → 200，更新本地副本
```

## 三、6 个高频踩坑点

## 坑 1：改了代码，用户还是旧版本

**踩坑现场**：发版后用户强制刷新才能看到新内容，甚至怎么刷都是旧的。

**原因**：HTML 被强缓存了。浏览器对 HTML 默认可能使用启发式缓存，或服务器给 HTML 设了很长的 `max-age`。

**修复**：

```http
# HTML 永远协商缓存或短缓存
Cache-Control: no-cache   # 每次都要验证（用协商缓存）
# 或
Cache-Control: max-age=0, must-revalidate
```

核心原则：**HTML 不设长缓存，带 hash 的静态资源（js/css/img）设一年长缓存**。

## 坑 2：hash 文件名没变，资源不更新

**踩坑现场**：构建产物文件名没带内容 hash（或 hash 只基于文件名），静态资源长缓存导致永远不更新。

**修复**：确保构建工具输出内容 hash 文件名：

```javascript
// Vite 默认：assets/[name]-[hash][extname]
// Webpack 配置
output: {
  filename: '[name].[contenthash].js', // contenthash 基于内容
}
```

**坑**：`[hash]`（webpack）是基于构建的，每次构建都变；`[contenthash]` 才是基于文件内容的。用错会导致"没改的代码也重新下载"或"改了却不更新"。

## 坑 3：CDN 节点缓存没及时刷新

**踩坑现场**：源站更新了，但 CDN 边缘节点还在给用户返回旧文件。

**原因**：CDN 有自己的缓存策略，源站的 `Cache-Control` 没覆盖到，或 CDN 配置了较长的缓存时间。

**修复**：

- 静态资源同样用内容 hash 文件名，CDN 天然识别新 URL。
- HTML 在 CDN 上设置 `no-cache`，或用 CDN 的刷新/预热功能。
- 注意 CDN 可能忽略源站头，需在 CDN 控制台配置缓存规则。

## 坑 4：协商缓存中 Last-Modified 不准确

**踩坑现场**：文件内容变了但 `Last-Modified` 没变（秒级精度内修改），用户拿到旧内容；或服务器时间不准。

**修复**：优先使用 `ETag`（内容指纹）。Nginx 默认生成 ETag，但**坑**：Nginx 的 ETag 基于 mtime + size，如果修改后内容和大小恰好没变（如同内容不同时间），也可能误判。生产环境建议用基于内容 hash 的 ETag。

## 坑 5：加了 no-cache 却被浏览器无视

**踩坑现场**：响应头明明有 `Cache-Control: no-cache`，浏览器还是直接用本地缓存。

**原因**：多个响应头冲突时行为复杂；或用户手动"刷新"与"强制刷新"行为不同（F5 会重新验证，Ctrl+F5 直接绕过缓存）。

**修复**：只保留一个权威的 `Cache-Control`，配合 `Pragma`（老协议，兼容古董浏览器）时注意优先级。检查响应头是否被代理/中间件改写。

## 坑 6：Service Worker 缓存把更新"锁死"

**踩坑现场**：Service Worker 缓存了旧版本，即使服务器和 HTTP 缓存都更新了，用户依然加载旧页面。

**原因**：SW 的缓存优先级高于 HTTP 缓存，且默认策略（如 cache-first）会一直用旧缓存，直到 SW 文件本身更新。

**修复**：

```javascript
// 更新 SW 版本号/文件 hash，触发 activate 后清理旧缓存
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
})
```

SW 更新策略推荐 **stale-while-revalidate**（先返回缓存，后台更新），兼顾速度与新鲜度。

## 四、实战配置模板

### Nginx

```nginx
# HTML：协商缓存
location / {
  add_header Cache-Control "no-cache, must-revalidate";
}

# 带 hash 的静态资源：一年强缓存
location /assets/ {
  add_header Cache-Control "public, max-age=31536000, immutable";
  add_header ETag "";
}
```

### 前端 HTML 引用

```html
<!-- 配合 hash 文件名，改代码只重新加载变更文件 -->
<script src="/assets/app-3f8a2c.js"></script>
```

## 总结速查表

| 场景 | 正确姿势 |
|------|---------|
| HTML | `no-cache`（协商缓存） |
| 带 hash 静态资源 | `max-age=31536000, immutable` |
| 文件名 | 用 contenthash（内容指纹） |
| 协商缓存 | 优先 ETag，Last-Modified 兜底 |
| CDN | 资源 hash URL + HTML 不缓存 |
| Service Worker | stale-while-revalidate + 版本清理 |

缓存的核心心智模型：**"能缓存的内容使劲缓存，不能缓存的内容（HTML）绝不缓存，变更的内容用 hash 让 URL 变化"**。把这三条做到位，缓存带来的收益和坑都能同时掌控。
