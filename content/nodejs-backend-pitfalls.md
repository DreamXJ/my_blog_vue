---
title: Node.js 后端开发踩坑：异步、内存与进程管理的 8 个教训
description: 从事件循环阻塞、内存泄漏、异常处理到 pm2 进程管理，总结 Node.js 服务端实战经验。
date: 2026-07-31
category: 后端
tags:
  - Node.js
  - 后端
  - 踩坑
  - 服务端
---

# Node.js 后端开发踩坑：异步、内存与进程管理的 8 个教训

Node.js 做后端很爽，但"单线程 + 事件驱动"的模型决定了它有一套完全不同于传统后端的坑。本文总结 8 个我在生产环境踩过的教训，覆盖异步、内存、异常、进程四类。

## 坑 1：阻塞事件循环 = 全站卡死

**踩坑现场**：接口偶尔出现几百毫秒甚至几秒的响应延迟，CPU 瞬时飙高。

**原因**：某个请求里跑了同步重计算（如大数组排序、正则回溯、`JSON.stringify` 大对象），把事件循环堵住，**所有请求一起排队**。

```javascript
// ❌ 同步大计算阻塞事件循环
app.get('/heavy', (req, res) => {
  const result = bigSyncComputation() // 期间整个进程无法处理任何请求
  res.json(result)
})
```

**修复**：CPU 密集任务交给 Worker Threads 或子进程：

```javascript
// ✅ worker_threads 分离计算
const { Worker } = require('worker_threads')
app.get('/heavy', (req, res) => {
  const worker = new Worker('./compute.js', { workerData: req.body })
  worker.once('message', (result) => res.json(result))
})
```

## 坑 2：回调里的异常被静默吞掉

**踩坑现场**：代码没崩，但请求卡死或数据错乱，日志里什么都没有。

**原因**：回调函数里的 `try/catch` 捕获不到异步阶段的异常；Promise 的 reject 没人接，直接变成 unhandledRejection。

```javascript
// ❌ try/catch 救不了异步回调
try {
  fs.readFile('/tmp/a.txt', (err, data) => {
    throw new Error('boom') // 这个异常 try/catch 接不到！
  })
} catch (e) { /* 永远不会执行 */ }
```

**修复**：进程级兜底 + Promise 化：

```javascript
// ✅ 进程级兜底（绝不裸奔）
process.on('uncaughtException', (err) => { log.error(err) })
process.on('unhandledRejection', (reason) => { log.error(reason) })

// ✅ 用 async/await + try/catch 处理业务异常
app.get('/x', async (req, res, next) => {
  try {
    const data = await db.query('...')
    res.json(data)
  } catch (e) {
    next(e) // 交给全局错误中间件
  }
})
```

## 坑 3：内存泄漏——最常见的元凶是全局缓存和闭包

**踩坑现场**：内存曲线持续上升，重启后回落，几天后又爆。

**常见泄漏点**：

- 全局对象无限追加数据（如把请求日志堆在内存数组里）。
- 闭包意外引用大对象（事件监听器、定时器回调持有外部引用）。
- 第三方库的缓存未设上限（如无限增长的 LRU）。

```javascript
// ❌ 无上限的内存日志
const logs = []
app.use((req, res, next) => { logs.push(req.body); next() })

// ✅ 有界队列 / 或直接落盘
const MAX = 1000
if (logs.length > MAX) logs.shift()
```

**修复**：用 `--max-old-space-size` 限制堆大小让 OOM 提前暴露；定期用 `--inspect` + Chrome DevTools 的 Memory 面板抓堆快照对比。

## 坑 4：JSON.stringify 大对象导致内存峰值

**踩坑现场**：接口返回大列表时内存瞬间暴涨，甚至 OOM。

**原因**：`JSON.stringify` 需要先构建完整字符串，大响应（几十 MB）会翻倍占用内存。

**修复**：分页、流式响应：

```javascript
// ✅ 流式输出，不整体驻留内存
const { Readable } = require('stream')
const stream = Readable.from(generateRows()) // 生成器逐条产出
stream.pipe(res)
```

## 坑 5：端口被占用 / EADDRINUSE

**踩坑现场**：`listen` 报 `EADDRINUSE`，服务起不来。

**原因**：上一个进程没退出，或开发时多次热重启残留。

**修复**：

```bash
# 查找占用端口的进程
lsof -i :3000
# 或 Windows
netstat -ano | findstr :3000

# 用 pm2 管理时先删旧进程
pm2 delete app
```

## 坑 6：环境变量直接进代码

**踩坑现场**：数据库密码、密钥写死在代码里，被提交到 Git 仓库泄露。

**修复**：使用 `dotenv` + `.env`（加入 .gitignore），或部署平台的环境变量：

```javascript
// .env（不提交）
DB_PASSWORD=xxx
JWT_SECRET=yyy

// 代码里
const dbPassword = process.env.DB_PASSWORD
if (!dbPassword) throw new Error('缺少 DB_PASSWORD 环境变量') // 启动即失败，别等到运行时
```

## 坑 7：进程崩溃后没人拉起

**踩坑现场**：一个未捕获异常导致进程退出，服务挂掉几小时没人发现。

**修复**：用进程管理器托管：

```bash
# pm2
pm2 start app.js -i max --name api-server
pm2 save && pm2 startup   # 开机自启
pm2 logs                  # 统一日志

# 或 Docker 部署，由编排层负责重启
```

**坑**：`pm2` 的 `-i max` 多实例模式下，**内存型 session 会失效**，需要用 Redis 共享存储（见坑 8）。

## 坑 8：多实例部署的本地状态陷阱

**踩坑现场**：pm2 起了 4 个实例，用户在 A 实例登录，下次请求被分到 B 实例，登录态丢失。

**原因**：内存 session / 内存缓存是进程本地的，多实例间不共享。

**修复**：会话和缓存外置到 Redis：

```javascript
// ✅ Redis 存储 session
const session = require('express-session')
const RedisStore = require('connect-redis')(session)
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
}))
```

## 总结速查表

| 坑 | 核心教训 |
|----|---------|
| 事件循环阻塞 | CPU 密集任务交给 worker/子进程 |
| 异步异常丢失 | async/await + 全局兜底监听 |
| 内存泄漏 | 缓存设上限、排查闭包引用 |
| 大响应 OOM | 分页或流式输出 |
| EADDRINUSE | 查端口、清理残留进程 |
| 密钥进代码 | 环境变量 + .env 不入库 |
| 进程无人管 | pm2 / Docker 托管 |
| 多实例状态丢失 | session/缓存放 Redis |

Node.js 后端的心法就一句话：**永远假设你的进程可能在任何时刻被打断**——异步异常要有兜底，状态要可迁移，进程要可恢复。把这四条做到位，Node 服务可以很稳。
