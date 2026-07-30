---
title: JavaScript 异步编程：从回调到 async/await
description: 深入理解 JavaScript 异步编程的演进历程，掌握 Promise、async/await 等核心概念。
date: 2026-07-20
category: 前端
tags:
  - JavaScript
  - 异步编程
  - 进阶
---

# JavaScript 异步编程：从回调到 async/await

JavaScript 的异步编程经历了从回调函数到 Promise，再到 async/await 的演进。

## 回调函数（Callback）

最早期的异步处理方式：

```javascript
function fetchData(callback) {
  setTimeout(() => {
    callback(null, { id: 1, name: 'DreamXJ' })
  }, 1000)
}

fetchData((err, data) => {
  if (err) {
    console.error('出错了:', err)
    return
  }
  console.log('数据:', data)
})
```

回调函数的缺点：**回调地狱（Callback Hell）**——多层嵌套导致代码难以阅读。

## Promise

Promise 解决了回调地狱的问题：

```javascript
function fetchData() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ id: 1, name: 'DreamXJ' })
    }, 1000)
  })
}

// 链式调用
fetchData()
  .then(data => {
    console.log('数据:', data)
    return fetchData() // 再次请求
  })
  .then(moreData => {
    console.log('更多数据:', moreData)
  })
  .catch(err => {
    console.error('出错了:', err)
  })
```

### Promise 的三种状态

- **pending**（进行中）
- **fulfilled**（已成功）
- **rejected**（已失败）

## async/await

async/await 是 Promise 的语法糖，让异步代码看起来像同步代码：

```javascript
async function getData() {
  try {
    const data = await fetchData()
    console.log('数据:', data)
    
    const moreData = await fetchData()
    console.log('更多数据:', moreData)
    
    return data
  } catch (err) {
    console.error('出错了:', err)
  }
}

// 调用
getData()
```

## 实际应用

在 Vue 3 中结合 async/await 和生命周期：

```vue
<script setup>
import { ref, onMounted } from 'vue'

const posts = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await fetch('/api/posts')
    posts.value = await res.json()
  } catch (err) {
    console.error('加载文章失败:', err)
  } finally {
    loading.value = false
  }
})
</script>
```

## 总结

| 方式 | 优点 | 缺点 |
|------|------|------|
| 回调函数 | 简单直接 | 回调地狱 |
| Promise | 链式调用，错误处理 | 仍有嵌套 |
| async/await | 最直观，像同步代码 | 需 try/catch 错误处理 |
