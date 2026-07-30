---
title: Vue 3 组合式 API 入门指南
description: 系统学习 Vue 3 组合式 API，包括 ref、reactive、computed、watch 等核心概念。
date: 2026-07-25
category: Vue
tags:
  - Vue3
  - 前端
---

# Vue 3 组合式 API 入门指南

Vue 3 引入了 **组合式 API（Composition API）**，这是对 Vue 2 选项式 API 的一次重大升级。

## 为什么需要组合式 API？

在 Vue 2 中，随着组件复杂度提升，选项式 API 会导致逻辑分散——同一个功能的代码分散在 `data`、`methods`、`computed`、`watch` 中。

组合式 API 让我们可以**按功能组织代码**，而不是按选项类型。

## 核心 API

### `ref` — 响应式基础

`ref` 用于创建基本类型的响应式数据：

```vue
<script setup>
import { ref } from "vue";

const count = ref(0);

function increment() {
  count.value++; // 必须通过 .value 访问
}
</script>

<template>
  <button @click="increment">点击数：{{ count }}</button>
</template>
```

### `reactive` — 对象响应式

`reactive` 用于创建对象类型的响应式数据：

```javascript
import { reactive } from "vue";

const user = reactive({
  name: "DreamXJ",
  age: 25,
  tags: ["前端", "Vue"],
});

// 直接修改，无需 .value
user.age = 26;
user.tags.push("JavaScript");
```

### `computed` — 计算属性

```javascript
import { ref, computed } from "vue";

const firstName = ref("张");
const lastName = ref("三");

const fullName = computed(() => {
  return `${firstName.value}${lastName.value}`;
});
```

### `watch` — 监听器

```javascript
import { ref, watch, watchEffect } from "vue";

const keyword = ref("");

// 监听单个源
watch(keyword, (newVal, oldVal) => {
  console.log(`搜索关键词从 "${oldVal}" 变为 "${newVal}"`);
});

// watchEffect — 自动追踪依赖
watchEffect(() => {
  console.log(`当前关键词：${keyword.value}`);
});
```

## 总结

组合式 API 带来的核心优势：

1. **更好的逻辑复用** — 通过 composables（组合函数）
2. **更灵活的组织方式** — 按功能聚集代码
3. **更小的生产包体积** — `<script setup>` 的编译优化
