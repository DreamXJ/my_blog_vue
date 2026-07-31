---
title: 高并发限流与熔断：计数器、令牌桶、滑动窗口实战
description: 对比固定窗口、滑动窗口、令牌桶、漏桶四种限流算法，并讲解分布式限流与熔断降级方案。
date: 2026-07-31
category: 后端
tags:
  - 限流
  - 熔断
  - 高并发
  - 架构
---

# 高并发限流与熔断：计数器、令牌桶、滑动窗口实战

高并发系统必须回答一个问题：**流量超过承载能力时怎么办？** 答案是限流 + 熔断。本文讲透四种限流算法、分布式限流方案，以及熔断降级的落地。

## 一、为什么需要限流

- **保护数据库**：避免瞬时流量打爆 MySQL/Redis。
- **保护下游**：第三方接口、依赖服务有 QPS 上限。
- **公平性**：防止个别调用方拖垮整体服务。

## 二、四种限流算法对比

### 1. 固定窗口计数器（最简单）

```
1 分钟内最多 100 次请求：
count++ → count > 100 则拒绝 → 窗口结束重置 count
```

```python
import time

window = 60
limit = 100
count = 0
window_start = time.time()

def allow():
    global count, window_start
    now = time.time()
    if now - window_start >= window:
        window_start = now
        count = 0
    count += 1
    return count <= limit
```

**缺点**：**临界问题**——第 59 秒 100 个请求 + 第 61 秒 100 个请求，实际 2 秒内放过了 200 个，远超阈值。

### 2. 滑动窗口计数器（改良版）

把窗口切成小格子，统计"当前时刻往前一个窗口"的请求数：

```python
import time
from collections import deque

WINDOW = 60
LIMIT = 100
SLOT = 10  # 每 10 秒一格

slots = deque()  # 存储 (slot_start, count)

def allow():
    now = time.time()
    slot_start = int(now // SLOT) * SLOT
    # 清理窗口外的格子
    while slots and slots[0][0] <= now - WINDOW:
        slots.popleft()
    # 当前格子计数
    if slots and slots[-1][0] == slot_start:
        slots[-1] = (slot_start, slots[-1][1] + 1)
    else:
        slots.append((slot_start, 1))
    total = sum(c for _, c in slots)
    return total <= LIMIT
```

**优点**：缓解临界问题，格子越细越平滑（也更耗内存）。

### 3. 令牌桶（平滑突发流量）

```
桶里有令牌（每秒补充 rate 个），请求取令牌，没令牌则拒绝/等待
```

```python
import time

rate = 10       # 每秒补充 10 个令牌
capacity = 100  # 桶容量
tokens = capacity
last = time.time()

def allow():
    global tokens, last
    now = time.time()
    tokens = min(capacity, tokens + (now - last) * rate)  # 补充
    last = now
    if tokens >= 1:
        tokens -= 1
        return True
    return False
```

**优点**：允许**短时突发**（桶里的存量），整体速率平滑。**这是最常用的算法**（Guava RateLimiter、Redis 实现都基于此）。

### 4. 漏桶（严格匀速）

```
请求进桶，底部按固定速率漏水（处理），桶满则丢弃
```

**优点**：**输出绝对匀速**，适合保护下游有严格速率要求的系统。
**缺点**：不能应对突发流量（突发会被丢弃或排队）。

### 选型建议

| 场景 | 算法 |
|------|------|
| 接口总 QPS 保护 | 滑动窗口 / 令牌桶 |
| 允许突发（如秒杀瞬间） | 令牌桶 |
| 下游严格匀速（如短信网关） | 漏桶 |
| 简单兜底 | 固定窗口 |

## 三、分布式限流

单机限流在集群下失效（每个节点各自计数，总量放大 N 倍）。

### 方案一：Redis + Lua（原子计数）

```lua
-- 滑动窗口的 Redis 实现（固定窗口简化版，生产建议用 ZSET 滑动窗口）
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

local count = redis.call('INCR', key)
if count == 1 then
  redis.call('EXPIRE', key, window)
end
if count > limit then
  return 0  -- 拒绝
end
return 1
```

```javascript
// 调用
const ok = await redis.eval(script, 1, `rate:${userId}:${minute}`, limit, window, Date.now())
```

**坑 1：Redis 是单点**——限流 Redis 挂了怎么办？做多级限流（本地限流兜底）+ 限流组件高可用。

**坑 2：key 设计**——按用户、按 IP、按接口分别限流，粒度要按业务定：

```javascript
// 全局限流：rate:global
// 用户级：  rate:user:{userId}
// 接口级：  rate:api:{path}
```

### 方案二：网关层限流（Nginx/网关）

```nginx
# Nginx 令牌桶限流：每 IP 每秒 5 个请求，突发 10
limit_req_zone $binary_remote_addr zone=api:10m rate=5r/s;
location /api/ {
  limit_req zone=api burst=10 nodelay;
}
```

网关限流是**第一道防线**，应用层限流是**第二道防线**，两层配合。

## 四、熔断与降级

限流是"控制入口流量"，熔断是"保护故障下游"。

### 熔断器三态

```
关闭（正常）→ 失败率达到阈值 → 打开（直接拒绝，快速失败）
打开 → 过冷却时间 → 半开（试探少量请求）→ 成功则关闭，失败则继续打开
```

### 落地（Resilience4j 示例）

```java
@CircuitBreaker(name = "payService", fallbackMethod = "payFallback")
public String pay(Order order) {
  return payService.call(order);
}

public String payFallback(Order order, Throwable t) {
  return "支付服务暂不可用，请稍后重试"; // 降级返回
}
```

配置要点：

```
failureRateThreshold: 50%    # 失败率超 50% 熔断
slowCallDurationThreshold: 2s # 慢调用算失败
slidingWindowSize: 20         # 统计窗口
waitDurationInOpenState: 10s  # 熔断打开后 10 秒再试探
```

### 降级策略

- **返回兜底数据**：如热门榜单返回缓存版本。
- **默认值**：配置读失败用默认配置。
- **排队限速**：超出部分排队等待。

## 五、完整实践清单

- [ ] 明确限流维度（全局/用户/IP/接口）与阈值（压测得出的 QPS 上限）
- [ ] 分布式限流用 Redis + Lua 原子操作
- [ ] 网关限流 + 应用限流两层
- [ ] 下游服务接熔断 + 降级兜底
- [ ] 限流/熔断触发要有监控告警和日志

## 总结速查表

| 场景 | 方案 |
|------|------|
| 简单接口保护 | 固定窗口计数 |
| 精准限流 | 滑动窗口（ZSET 实现） |
| 允许突发 | 令牌桶 |
| 下游严格匀速 | 漏桶 |
| 集群环境 | Redis + Lua 原子计数 |
| 下游故障 | 熔断 + 降级 |

限流和熔断的核心理念：**系统要优雅地拒绝，而不是崩溃地失败**。宁可返回"请求过于频繁"，也不能让数据库雪崩、让整条链路互相拖垮。压测定阈值、分层布防、失败必降级——这三点做到位，高并发系统就有了底线。
