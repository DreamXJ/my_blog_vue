---
title: Python asyncio 异步编程实战：从原理到 9 个踩坑点
description: 讲透事件循环、协程、await 机制，覆盖并发爬虫、超时控制、任务取消等实战场景。
date: 2026-07-31
category: Python
tags:
  - Python
  - asyncio
  - 异步
  - 实战
---

# Python asyncio 异步编程实战：从原理到 9 个踩坑点

`asyncio` 是 Python 处理 I/O 密集型任务（网络请求、数据库查询、文件读写）的利器。但它的心智模型和同步代码完全不同——"await 去哪了""任务怎么全卡住了"是高频困惑。本文从原理讲到实战，帮你彻底拿下 asyncio。

## 一、异步编程解决什么问题

**同步代码**：发起请求后干等响应，期间 CPU 闲置。

```python
import time
import requests

def fetch(url):
    r = requests.get(url)
    return r.status_code

# 串行请求 5 个 URL：总耗时 ≈ 5 × 单个请求耗时
start = time.time()
for url in urls:
    fetch(url)
print(f"耗时 {time.time() - start:.2f}s")
```

**异步代码**：发起请求后**让出 CPU 去干别的**，响应到了再回来继续。

```python
import asyncio
import aiohttp

async def fetch(session, url):
    async with session.get(url) as resp:
        return resp.status

async def main():
    async with aiohttp.ClientSession() as session:
        # 并发发起所有请求：总耗时 ≈ 单个请求耗时
        results = await asyncio.gather(*[fetch(session, u) for u in urls])
        return results

print(asyncio.run(main()))
```

**结论**：I/O 密集场景下，asyncio 能把耗时从 N×t 降到 ~1×t。但 **CPU 密集任务用 asyncio 不会加速**（见坑 7）。

## 二、核心概念

### 1. 事件循环（Event Loop）

异步调度的"总调度器"：不断检查就绪的任务并执行，I/O 未完成的任务挂起等待。

```
事件循环
  ├─ 任务 A：await 网络请求 → 挂起
  ├─ 任务 B：执行中 → 也 await 了 → 挂起
  ├─ 任务 A 的响应到了 → 恢复执行
  └─ ...
```

### 2. 协程（Coroutine）

用 `async def` 定义的函数是协程函数，调用它返回**协程对象**（不执行！）：

```python
async def hello():
    return "hi"

h = hello()        # 返回协程对象，函数体未执行
# 需要 await 或 asyncio.run 才会真正执行
print(asyncio.run(hello()))
```

### 3. await：让出控制权

`await` 挂在可等待对象上（协程、Future、Task），**遇到 await 就挂起当前协程，事件循环去跑别的任务**，await 的对象完成后恢复。

## 三、核心 API

### gather：并发执行多个任务

```python
async def main():
    # 并发执行，全部完成后返回结果列表
    results = await asyncio.gather(
        task1(),
        task2(),
        task3(),
    )
```

### create_task：后台任务

```python
async def main():
    # 创建任务但不等待，任务在后台运行
    bg = asyncio.create_task(long_task())
    await do_other_things()   # 与 long_task 并行
    await bg                  # 需要结果时再等
```

### 超时控制

```python
async def main():
    try:
        result = await asyncio.wait_for(slow_api(), timeout=5)
    except asyncio.TimeoutError:
        result = "超时兜底"
```

### 信号量：限制并发数

```python
sem = asyncio.Semaphore(10)  # 最多 10 个并发

async def fetch_one(session, url):
    async with sem:
        async with session.get(url) as resp:
            return resp.status
```

## 四、9 个高频踩坑点

## 坑 1：忘记 await，任务没执行

**踩坑现场**：`asyncio.gather(task1(), task2())` 少了 `await`，或 `asyncio.create_task` 后忘了保存引用，任务被 GC 回收根本不跑。

```python
# ❌ 忘 await：task 对象创建了但没执行
asyncio.gather(fetch(1), fetch(2))

# ❌ create_task 没保存引用：任务可能被垃圾回收
asyncio.create_task(long_task())

# ✅ 正确
await asyncio.gather(fetch(1), fetch(2))
task = asyncio.create_task(long_task())
await task
```

**坑**：`asyncio.create_task` 必须**持有引用**，否则任务可能被回收。CPython 会调度但不可靠，保持引用是规范做法。

## 坑 2：同步阻塞代码混入异步

**踩坑现场**：async 函数里用了 `time.sleep`、`requests.get`、`read()` 等同步阻塞调用，**整个事件循环被卡住**，其他协程全部停摆。

```python
async def bad():
    time.sleep(1)          # ❌ 阻塞事件循环！其他任务全停 1 秒
    requests.get(url)      # ❌ 同样阻塞

async def good():
    await asyncio.sleep(1)  # ✅ 让出控制权
    async with aiohttp.ClientSession() as s:  # ✅ 异步库
        await s.get(url)
```

**排查方法**：所有 I/O 都要用**异步版本**（aiohttp/httpx.AsyncClient/asyncpg/aiomysql）；无法避免的同步调用用 `asyncio.to_thread` 扔到线程池：

```python
result = await asyncio.to_thread(sync_blocking_func, arg)
```

## 坑 3：事件循环重复运行

**踩坑现场**：notebook 或测试里多次调用 `asyncio.run()`，报 "Event loop is closed" 或 "Cannot call asyncio.run() from a running event loop"。

**修复**：

- 进程内只 `asyncio.run()` 一次，业务逻辑都放协程里。
- 重复调度场景用 `asyncio.get_event_loop().run_until_complete()`（注意版本差异）。
- 测试用 `pytest-asyncio` 装饰器。

## 坑 4：gather 一个任务抛异常，其他任务也遭殃

**踩坑现场**：`gather` 中某个协程抛异常，整个 gather 立即抛错，其他任务的结果丢失（虽然它们可能还在跑）。

**修复**：`return_exceptions=True` 把异常收集为结果：

```python
results = await asyncio.gather(*tasks, return_exceptions=True)
for r in results:
    if isinstance(r, Exception):
        handle_error(r)
    else:
        process(r)
```

## 坑 5：取消任务没处理 CancelledError

**踩坑现场**：`wait_for` 超时、外部取消任务时，协程里清理代码没执行，资源泄漏。

**修复**：

```python
async def worker():
    try:
        while True:
            await do_work()
    except asyncio.CancelledError:
        # 清理资源后重新抛出（必须重新抛出！）
        await cleanup()
        raise
```

**坑**：`CancelledError` 在 Python 3.8+ 是 `BaseException` 的子类，**普通 `except Exception` 捕获不到**；且处理完必须 `raise` 重新抛出，否则取消失效。

## 坑 6：共享可变状态竞争

**踩坑现场**：多个协程同时修改同一个 dict/list，数据错乱。

```python
shared = {"count": 0}

async def inc():
    shared["count"] += 1  # ❌ 非原子操作，可能丢更新
```

**修复**：用 `asyncio.Lock` 保护共享状态，或改用无共享的架构（任务返回结果再汇总）：

```python
lock = asyncio.Lock()

async def inc():
    async with lock:
        shared["count"] += 1
```

## 坑 7：拿 asyncio 做 CPU 密集计算

**踩坑现场**：用 asyncio 并发跑大量计算任务，发现一点没提速——因为**同一时刻只有一个线程在执行**，CPU 计算本来就不释放 GIL。

**修复**：CPU 密集任务用**多进程**（`ProcessPoolExecutor`）：

```python
import asyncio
from concurrent.futures import ProcessPoolExecutor

async def main():
    loop = asyncio.get_running_loop()
    with ProcessPoolExecutor() as pool:
        results = await loop.run_in_executor(pool, heavy_compute, data)
```

## 坑 8：asyncio.run 里再调 asyncio.run

**踩坑现场**：协程内部又调用 `asyncio.run()` 跑另一个协程，报错。

**修复**：协程里用 `await` 直接调用其他协程，或 `asyncio.create_task`；**不要在协程里启动新的事件循环**。

## 坑 9：忽略 loop 关闭与连接泄漏

**踩坑现场**：每次请求新建 `ClientSession` 不关闭，报 "Unclosed client session" 警告，连接池泄漏。

**修复**：`ClientSession` 复用 + `async with` 自动关闭：

```python
async def main():
    async with aiohttp.ClientSession() as session:  # 会话级复用
        async with session.get(url) as resp:        # 请求级自动释放
            return await resp.text()
```

## 五、实战：并发爬虫完整示例

```python
import asyncio
import aiohttp

SEM_LIMIT = 10

async def fetch_one(session, sem, url):
    async with sem:
        try:
            async with session.get(url, timeout=aiohttp.ClientTimeout(10)) as resp:
                text = await resp.text()
                return url, resp.status, len(text)
        except Exception as e:
            return url, 0, str(e)

async def crawl(urls):
    sem = asyncio.Semaphore(SEM_LIMIT)
    timeout = aiohttp.ClientTimeout(total=30)
    async with aiohttp.ClientSession(timeout=timeout) as session:
        tasks = [fetch_one(session, sem, u) for u in urls]
        results = await asyncio.gather(*tasks, return_exceptions=True)
    return results

if __name__ == "__main__":
    urls = [f"https://example.com/page/{i}" for i in range(100)]
    results = asyncio.run(crawl(urls))
    for url, status, size in results:
        print(url, status, size)
```

**要点回顾**：信号量限并发、超时兜底、`return_exceptions=True` 防单点崩溃、`async with` 防泄漏。

## 总结速查表

| 场景 | 正确姿势 |
|------|---------|
| 并发 I/O | await asyncio.gather(...) |
| 后台任务 | task = create_task(); await task |
| 超时 | asyncio.wait_for(..., timeout) |
| 限并发 | asyncio.Semaphore(n) |
| 同步阻塞调用 | asyncio.to_thread() |
| 共享状态 | asyncio.Lock |
| CPU 密集 | ProcessPoolExecutor |
| 异常隔离 | gather(..., return_exceptions=True) |

asyncio 的心法：**"await 是让位，不是等待"**——每个 await 都是把 CPU 让给其他任务的机会。写异步代码时，脑子里要有事件循环的画面：哪个协程在跑、哪个在挂起、有没有同步调用在偷偷阻塞。想清楚这三件事，asyncio 就只剩性能收益没有心智负担。
