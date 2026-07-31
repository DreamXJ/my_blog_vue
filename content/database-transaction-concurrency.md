---
title: 数据库事务与并发控制：隔离级别、锁与 6 个实战坑
description: 从 ACID 与隔离级别讲起，覆盖悲观锁、乐观锁、死锁与常见事务踩坑场景。
date: 2026-07-31
category: 后端
tags:
  - 数据库
  - 事务
  - 并发控制
  - MySQL
---

# 数据库事务与并发控制：隔离级别、锁与 6 个实战坑

事务是后端数据一致性的基石。隔离级别选错了会出现脏读、幻读；锁用错了会死锁、锁等待超时。本文从理论到实战，把事务与并发控制讲透。

## 一、ACID 与隔离级别

### 四大特性

| 特性 | 含义 |
|------|------|
| A 原子性 | 要么全成功，要么全回滚 |
| C 一致性 | 事务前后数据完整性约束不被破坏 |
| I 隔离性 | 并发事务互不干扰（按隔离级别） |
| D 持久性 | 提交后数据不会丢失 |

### 四种隔离级别

| 级别 | 脏读 | 不可重复读 | 幻读 |
|------|------|-----------|------|
| READ UNCOMMITTED | 可能 | 可能 | 可能 |
| READ COMMITTED | 不会 | 可能 | 可能 |
| REPEATABLE READ（MySQL 默认） | 不会 | 不会 | 可能（InnoDB 用间隙锁解决） |
| SERIALIZABLE | 不会 | 不会 | 不会 |

**坑 1：别只看级别名字**——MySQL 的 RR（可重复读）通过 MVCC + 间隙锁，实际上解决了大部分幻读场景，性能损失小于 SERIALIZABLE，所以 MySQL 默认用 RR；而 Oracle/PostgreSQL 默认是 RC（读已提交），语义和默认值都不同，**跨数据库开发时默认行为要先确认**。

## 二、事务的 6 个实战坑

## 坑 1：Spring 事务自调用失效

**踩坑现场**：

```java
@Service
public class OrderService {
  @Transactional
  public void createOrder() {
    // ...
    this.deductStock(); // ❌ this 调用，@Transactional 不生效！
  }

  @Transactional
  public void deductStock() {
    // 这个方法的注解不会生效
  }
}
```

**原因**：`@Transactional` 依赖 AOP 代理，`this.xxx()` 是直接调用本对象方法，**绕过代理**。

**修复**：拆到另一个 Bean，或注入自身代理：

```java
@Service
public class OrderService {
  @Autowired
  private StockService stockService;

  @Transactional
  public void createOrder() {
    stockService.deductStock(); // ✅ 通过代理调用
  }
}
```

## 坑 2：事务里做远程调用（RPC/HTTP）

**踩坑现场**：事务内调第三方接口或发 MQ，外部系统响应慢，**数据库连接被长时间占用**，连接池耗尽；且外部调用失败不能回滚数据库事务。

**修复**：**事务边界要短**——远程调用放到事务提交之后（事务外）：

```java
@Transactional
public void createOrder(Order order) {
  orderDao.insert(order);   // 只做数据库操作
  // 不在这里调远程接口
}

public void createOrderFlow(Order order) {
  createOrder(order);       // 事务提交
  notifyService.send(order); // 事务外再通知
}
```

## 坑 3：事务传播行为与嵌套事务

**踩坑现场**：A 事务调 B 事务，B 抛异常，A 的 try/catch 捕获后继续，但整个事务已标记 rollback-only，最终提交时 UnexpectedRollbackException。

```java
@Transactional
public void doA() {
  try {
    doB(); // B 抛异常并被 B 自己回滚，但标记了 rollback-only
  } catch (Exception e) {
    // 想在这里继续，但外层事务已经 doomed
  }
}
```

**修复**：B 用 `REQUIRES_NEW`（独立新事务），或让 B 不抛异常（返回结果判断）：

```java
@Transactional(propagation = Propagation.REQUIRES_NEW)
public void doB() { /* 独立事务，失败不影响 A */ }
```

## 坑 4：隔离级别没选对导致的并发问题

**踩坑现场**：默认 RR 级别下，两个事务并发更新同一行——后提交的覆盖先提交的（丢失更新）。

**经典场景**：库存扣减：

```sql
-- 并发下两个事务都读到 stock=10
UPDATE stock SET count = count - 1 WHERE id = 1; -- 后提交的基于旧值覆盖
```

**修复**（选一）：

```sql
-- 方案一：乐观锁（版本号）
UPDATE stock SET count = count - 1, version = version + 1
WHERE id = 1 AND version = #{oldVersion};
-- 影响行数为 0 则说明被别人改了，重试

-- 方案二：悲观锁（行锁）
SELECT * FROM stock WHERE id = 1 FOR UPDATE;
-- 持有行锁直到事务结束，其他事务等待
```

**坑**：悲观锁的 `FOR UPDATE` 必须配合事务才有意义，且要确保查询走了索引（否则锁全表）。

## 坑 5：死锁

**踩坑现场**：报 `Deadlock found when trying to get lock; try restarting transaction`。

**原因**：两个事务按不同顺序锁同一批资源：

```
事务 A：锁 order → 等 user
事务 B：锁 user → 等 order
→ 互相等待，死锁
```

**修复**：

- **统一加锁顺序**：所有事务按相同顺序访问资源（如先 user 后 order）。
- 事务尽量短，减少锁持有时间。
- 死锁后**重试**：捕获异常后 sleep 随机时间重试（MySQL 会回滚死锁中的一方）。

## 坑 6：大事务

**踩坑现场**：一个事务处理 10 万条数据，或包含多个远程调用，长时间持有锁和连接。

**危害**：

- 锁等待超时（innodb_lock_wait_timeout 默认 50s）。
- 连接池被占满，其他请求全部排队。
- binlog/redo log 压力大，主从延迟。

**修复**：

- **批量拆小**：每批 1000 条提交一次。
- 只把必要操作放进事务，查询类操作放事务外。
- 监控长事务：`SELECT * FROM information_schema.innodb_trx` 找出超长事务。

## 三、MVCC 快照读与当前读

理解 MVCC 是理解隔离级别的关键：

- **快照读**（普通 SELECT）：读的是事务开始时的快照，不加锁。
- **当前读**（SELECT ... FOR UPDATE / UPDATE / DELETE）：读最新数据并加锁。

**坑**：RR 级别下快照读看不到其他事务新提交的数据，这是"可重复读"的保证；如果需要读到最新数据，要用当前读。

## 四、事务使用清单

- [ ] 事务方法必须是 public 且通过代理调用（跨 Bean）
- [ ] 事务内不做远程调用、不发通知
- [ ] 并发写用乐观锁/悲观锁，选型要按冲突频率
- [ ] 统一资源加锁顺序，防死锁
- [ ] 大事务拆批
- [ ] 设置合理的隔离级别（别默认裸奔）
- [ ] 事务超时与回滚条件明确（`rollbackFor = Exception.class`）

## 总结速查表

| 问题 | 解法 |
|------|------|
| 注解不生效 | 跨 Bean 调用 / 注入代理 |
| 事务内 RPC | 事务外做远程调用 |
| rollback-only | REQUIRES_NEW 独立事务 |
| 丢失更新 | 乐观锁（version）或悲观锁（FOR UPDATE） |
| 死锁 | 统一锁顺序 + 重试 |
| 大事务 | 拆批、缩短事务边界 |

事务的黄金原则：**事务要"短、小、快"**——短边界、小数据量、快完成。所有事务相关的问题，先检查这三点，再谈锁和隔离级别。
