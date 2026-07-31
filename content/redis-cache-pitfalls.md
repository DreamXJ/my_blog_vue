---
title: Redis 缓存实战：穿透、击穿、雪崩与 7 个踩坑点
description: 从缓存三大经典问题的原理与解法讲起，覆盖过期策略、序列化、分布式锁等实战细节。
date: 2026-07-31
category: 后端
tags:
  - Redis
  - 缓存
  - 高并发
  - 踩坑
---

# Redis 缓存实战：穿透、击穿、雪崩与 7 个踩坑点

"Redis 用来做缓存"是后端入门第一课，但缓存用不好会带来穿透、击穿、雪崩三座大山，甚至把数据库打挂。本文从三大经典问题讲起，覆盖实战中的高频坑。

## 一、三大经典问题

### 1. 缓存穿透：查不存在的数据

**现象**：请求查询缓存和数据库都没有的数据（如恶意构造的 ID），每次都打数据库。

**解法**：

```python
# 方案一：缓存空值（简单有效）
value = cache.get(key)
if value is None:
    value = db.query(key)
    if value is None:
        cache.set(key, EMPTY_MARK, ex=60)  # 空值也缓存，短期过期
    else:
        cache.set(key, value, ex=3600)
```

- 方案二：**布隆过滤器**（拦截不存在的 key，适合海量 ID 场景）。
- 方案三：参数合法性校验（如 ID 范围、格式校验）——先挡住明显非法请求。

### 2. 缓存击穿：热点 key 过期瞬间

**现象**：某个**热点 key** 过期瞬间，大量并发请求同时打到数据库。

**解法**：

- **互斥锁**（只放一个请求去查库，其余等待）：

```python
value = cache.get(key)
if value is None:
    if redis.setnx(lock_key, 1, ex=5):  # 抢到锁的才查库
        value = db.query(key)
        cache.set(key, value, ex=3600)
        redis.delete(lock_key)
    else:
        time.sleep(0.05)
        value = cache.get(key)  # 重试读取
```

- **逻辑过期**：缓存永不过期，value 里带过期时间戳，后台线程异步刷新。
- **预热**：热点 key 定期提前刷新，避免过期。

### 3. 缓存雪崩：大量 key 同时过期

**现象**：大量 key 在同一时刻过期（如统一设置 1 小时），请求全部压向数据库。

**解法**：

- 过期时间加**随机抖动**：

```python
import random
cache.set(key, value, ex=3600 + random.randint(0, 300))
```

- 多级缓存（本地缓存 + Redis，本地挡一层）。
- 服务降级/熔断：DB 压力大时直接返回兜底数据。

## 二、7 个实战踩坑点

## 坑 1：缓存与数据库一致性问题（双写）

**踩坑现场**：先更新数据库再删缓存，或反过来，都存在窗口期读到旧数据。

**主流方案**：

```
方案 A：Cache Aside（旁路缓存）——推荐
更新 DB → 删除缓存（不是更新缓存！）
读：先读缓存，miss 则读 DB 并回填
```

**为什么删而不是更新缓存**：更新缓存可能写进脏数据（并发写覆盖），删除更安全——下次读取时自然重建。

**坑**：删除缓存也可能失败（删缓存时 Redis 挂了）。**最终一致方案**：删除失败就重试，或订阅 binlog 异步删除（如 Canal）。

## 坑 2：序列化问题：默认序列化出乱码

**踩坑现场**：Java 的 Spring Data Redis 默认 JDK 序列化，key/value 存进去是一堆 `\xAC\xED` 乱码，用命令行看不到、别的服务读不了。

**修复**：统一 JSON 序列化，key 用 StringRedisSerializer，value 用 Jackson/Gson：

```java
// 配置 Jackson 序列化器
redisTemplate.setKeySerializer(new StringRedisSerializer());
redisTemplate.setHashKeySerializer(new StringRedisSerializer());
redisTemplate.setValueSerializer(new GenericJackson2JsonRedisSerializer());
```

**坑**：不同语言/服务之间共享 Redis 数据，序列化格式必须统一（JSON 或自定义协议）。

## 坑 3：大 key / 热 key 问题

**坑 1：大 key**——单个 value 超过 10KB 甚至 MB 级（如把整个列表塞进一个 key）。删除/读取阻塞 Redis 单线程，导致其他请求延迟。

**修复**：拆分 key（按分片）、限制单 key 大小、用 `UNLINK`（异步删除）代替 `DEL`。

**坑 2：热 key**——某个 key 被海量请求命中，单节点打满。用**本地缓存兜底**或读写分离分担。

## 坑 4：缓存雪崩后的"缓存穿透"叠加

**踩坑现场**：雪崩瞬间 DB 被打挂，DB 返回异常，缓存没回填成功，所有请求继续穿透打 DB——死循环。

**修复**：回填失败要有保护：

```python
try:
    value = db.query(key)
    cache.set(key, value, ex=3600)
except Exception:
    # 兜底：短暂缓存错误标记，避免持续穿透
    cache.set(key, FALLBACK, ex=10)
```

## 坑 5：分布式锁的坑（误删锁 / 锁过期）

**踩坑现场**：A 线程拿到锁，业务超时锁自动过期，B 线程拿到锁，A 执行完 `DEL` 把 B 的锁删了。

**修复**：**删除前校验锁标识（value 存唯一 token）**，并用 Lua 保证原子性：

```lua
-- 校验并删除（原子操作）
if redis.call('get', KEYS[1]) == ARGV[1] then
  return redis.call('del', KEYS[1])
else
  return 0
end
```

**坑**：锁过期时间要大于业务最长执行时间；复杂场景用 Redisson 的看门狗自动续期。

## 坑 6：缓存过期时间设太短/太长

**坑 1：太短**——热点数据频繁过期，缓存形同虚设，全部打 DB。
**坑 2：太长**——数据更新后用户长时间看到旧数据。

**修复**：按业务容忍度定过期时间：允许轻微延迟的数据（如文章详情）可设 1 小时+；强一致的数据（余额）不要走缓存，或过期时间极短 + 主动更新。

## 坑 7：Redis 持久化配置不当导致重启丢数据

**踩坑现场**：服务器重启后缓存全丢（无所谓，缓存可以重建）；但**如果 Redis 承担了持久化角色（如 session、订单号），丢失就是事故**。

**修复**：按角色配置持久化：

- 纯缓存：`AOF no` + `RDB` 定时快照即可。
- 承载状态数据：开 AOF（`appendonly yes`，`appendfsync everysec`）。
- **原则：Redis 只放可重建的缓存，关键数据永远在 DB**。

## 三、监控与运维要点

```bash
# 常用监控命令
redis-cli info memory    # 内存使用
redis-cli --bigkeys      # 找出大 key（生产慎用，会阻塞，建议用 scan 版工具）
redis-cli info stats     # 命中率 hits/misses
```

- **命中率监控**：命中率低于 80% 说明缓存设计有问题。
- **内存监控**：设 `maxmemory` + 淘汰策略 `allkeys-lru`，防 OOM 拖垮进程。

## 四、总结速查表

| 问题 | 现象 | 解法 |
|------|------|------|
| 穿透 | 查不存在的数据打爆 DB | 空值缓存 / 布隆过滤器 |
| 击穿 | 热点 key 过期瞬间 | 互斥锁 / 逻辑过期 |
| 雪崩 | 大量 key 同时过期 | 过期时间加随机值 / 多级缓存 |
| 不一致 | 双写窗口读旧数据 | Cache Aside + 删除缓存 |
| 大 key | 阻塞单线程 | 拆分 / UNLINK |
| 锁误删 | 锁过期后删错 | token 校验 + Lua |

缓存的核心心智模型：**缓存是"加速层"不是"存储层"**——任何缓存数据都要能接受丢失并从 DB 重建；缓存永远要考虑"DB 打挂了怎么办"。想清楚这两点，三座大山基本都能拆解成具体方案。
