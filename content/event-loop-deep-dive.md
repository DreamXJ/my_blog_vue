---
title: JavaScript 事件循环：宏任务、微任务与 5 个必考踩坑点
description: 用执行顺序实例吃透事件循环机制，覆盖 setTimeout、Promise、async/await、requestAnimationFrame 的经典陷阱。
date: 2026-07-31
category: 前端
tags:
  - JavaScript
  - 事件循环
  - 异步
  - 踩坑
---

# JavaScript 事件循环：宏任务、微任务与 5 个必考踩坑点

事件循环是 JS 面试必考、生产必踩的主题。很多人背过"微任务先于宏任务"，但一到 `async/await` 与 Promise 混合的题目就错。本文用一个统一模型讲清楚，再给出 5 个高频踩坑场景。

## 核心模型

JavaScript 是单线程的，通过**事件循环**调度任务：

1. **执行栈**：同步代码依次执行，执行完毕为空。
2. **微任务队列（microtask）**：`Promise.then/catch/finally`、`queueMicrotask`、`MutationObserver`。**每次执行栈清空后立即清空整个微任务队列**。
3. **宏任务队列（macrotask/task）**：`setTimeout`、`setInterval`、`I/O`、`UI 渲染`、`requestAnimationFrame`（渲染前）。

执行顺序口诀：**同步代码 → 微任务 → 宏任务 → （渲染）→ 微任务 → 宏任务……**，且**每个宏任务结束后都要清空一次微任务队列**。

## 必考题 1：经典顺序

```javascript
console.log('1') // 同步

setTimeout(() => console.log('2'), 0) // 宏任务

Promise.resolve().then(() => console.log('3')) // 微任务

console.log('4') // 同步
```

输出：`1 4 3 2`。同步先跑完，然后清微任务（3），最后才执行宏任务（2）。

## 必考题 2：async/await 的"陷阱"

```javascript
async function foo() {
  console.log('A')
  await Promise.resolve()
  console.log('B')
}
foo()
console.log('C')
```

输出：`A C B`。很多人以为 `B` 在 `C` 之前，实际 `await` 会把后续代码**包装成微任务**，所以 `B` 一定在同步代码 `C` 之后。

## 踩坑点 1：setTimeout 0 不是立即执行

**踩坑现场**：用 `setTimeout(fn, 0)` 想"立刻"执行，结果排到了所有微任务之后，还受到浏览器最小延迟（HTML 规范约 4ms，未激活页面可能 1000ms）影响。

**修复**：

```javascript
// 需要尽快执行且不阻塞：用微任务
queueMicrotask(fn)
// 或 Promise.resolve().then(fn)

// 需要下一帧渲染后执行
requestAnimationFrame(fn)
```

## 踩坑点 2：Promise 构造函数内的代码是同步的

```javascript
new Promise((resolve) => {
  console.log('sync') // 立即同步执行！
  resolve()
}).then(() => console.log('micro'))

console.log('after')
```

输出：`sync after micro`。`Promise` 的 executor 是同步调用的，只有 `.then` 回调才进微任务队列。

## 踩坑点 3：then 链中的返回值决定下一环

```javascript
Promise.resolve()
  .then(() => { throw new Error('boom') }) // 返回 rejected promise
  .then(() => console.log('不会执行'))
  .catch(e => console.log('捕获:', e.message)) // ✅ 捕获
  .finally(() => console.log('finally 一定执行'))
```

- `.then` 回调**抛错**会转为 rejected 传给下游。
- 回调**返回值**会作为下一个 then 的参数。
- 回调**返回 Promise** 会等它 settle 后再继续。

**踩坑点 4：for 循环里的 setTimeout 闭包问题**

```javascript
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0) // 3 3 3 ❌
}
```

**原因**：`var` 无块级作用域，所有回调共享同一个 `i`，循环结束时 `i` 已是 3。

**修复**：

```javascript
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0) // 0 1 2 ✅ let 块级作用域
}
// 或使用 IIFE / 箭头函数包裹
```

## 踩坑点 5：requestAnimationFrame 与 setTimeout 的渲染时机

**踩坑现场**：用 `setTimeout` 做动画掉帧，或 `requestAnimationFrame` 里改样式但画面没立即更新。

**原因**：`requestAnimationFrame` 在**每次绘制前**执行，浏览器会合并同一帧内的样式变更；`setTimeout` 不保证与渲染节奏同步，可能一帧执行多次或卡顿。

**修复**：动画一律用 `requestAnimationFrame`；需要在帧间做测量时用 `requestAnimationFrame` 配合双回调（先测后画）。

## 事件循环与渲染的关系

一个简化版的浏览器循环：

```
执行栈清空 → 清空微任务 → 是否到渲染时机？→ 是：执行 rAF → 渲染 → 否：继续取宏任务
```

注意：`微任务队列在渲染前清空`，所以用微任务改 DOM 通常不会造成额外重排（同一帧内合并）。

## 终极综合题

```javascript
setTimeout(() => console.log('t1'), 0)

Promise.resolve().then(() => {
  console.log('p1')
  setTimeout(() => console.log('t2'), 0)
})

queueMicrotask(() => console.log('q1'))

console.log('sync')
```

逐步推导：

1. 同步：`sync`
2. 清空微任务：`p1`、`q1`（按入队顺序，p1 先入队）
3. 执行宏任务：`t1`
4. 宏任务 t1 执行完，清空微任务（没有）
5. 下一轮宏任务：`t2`

输出：`sync p1 q1 t1 t2`。注意 `p1` 里注册的 `t2` 属于**新的宏任务**，排在 `t1` 之后。

## 总结速查

| 场景 | 结论 |
|------|------|
| 微任务 vs 宏任务 | 每个宏任务后先清空微任务 |
| await 后代码 | 被包装为微任务，晚于同步代码 |
| new Promise 回调 | 同步执行 |
| then 回调抛错 | 转 rejected，被 catch 捕获 |
| var + setTimeout | 闭包共享变量，用 let 或 IIFE |
| 动画 | 用 requestAnimationFrame |

吃透事件循环没有捷径，建议把上面的题目在浏览器 console 里各跑一遍，亲眼确认输出，比死记结论牢固得多。
