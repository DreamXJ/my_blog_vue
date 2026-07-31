---
title: 后端 API 设计规范与幂等性：7 个实战踩坑点
description: 从 RESTful 设计、状态码、错误处理到幂等性设计，总结后端接口设计的完整规范。
date: 2026-07-31
category: 后端
tags:
  - API 设计
  - RESTful
  - 幂等性
  - 后端
---

# 后端 API 设计规范与幂等性：7 个实战踩坑点

接口是后端的门面。设计得好，前后端联调顺畅、系统稳定；设计得差，处处踩坑返工。本文从 RESTful 规范、错误处理到幂等性，给出可直接落地的实践。

## 一、RESTful 基础规范

### 资源与动词

```
GET    /api/users          # 查询列表
GET    /api/users/123      # 查询单个
POST   /api/users          # 创建
PUT    /api/users/123      # 全量更新
PATCH  /api/users/123      # 部分更新
DELETE /api/users/123      # 删除
```

**坑 1：动词滥用**——用 `/api/getUserList`、`/api/deleteUserById` 这类"动词式" URL。RESTful 的核心是**用 HTTP 方法表达动作，URL 只表达资源**。动词进 URL 会导致语义混乱、难以统一处理。

### 查询、分页、排序

```
GET /api/users?page=1&pageSize=20&sort=-created_at&filter=active
```

- 分页参数统一：`page`（页码）/ `pageSize`（每页数），或游标 `cursor`。
- 排序字段用 `-` 前缀表示降序。

## 二、响应格式统一

### 统一包装

```json
{
  "code": 0,
  "message": "success",
  "data": { "id": 123, "name": "DreamXJ" }
}
```

**坑 2：code 语义混乱**——有人用 HTTP 状态码，有人用业务码，前端要写两套判断。规范：

- **HTTP 状态码**表达传输层语义（200/400/401/403/404/500）。
- **业务 code**表达业务语义（0 成功、1001 参数错误、2001 余额不足等）。
- 前端只判断 `code === 0` 判定业务成功，HTTP 状态码辅助排查。

### 错误信息要可读

```json
{
  "code": 40001,
  "message": "手机号格式不正确",
  "trace_id": "8f2a1c..."
}
```

**坑 3：错误信息直接抛异常堆栈**——把 `SQLException`、`NullPointerException` 的原始信息返回给前端，既泄露内部结构也不可读。

**修复**：全局异常处理，统一转成友好信息 + 服务端记日志（带 trace_id 便于排查）。

## 三、幂等性设计（重点）

### 什么是幂等

**同一个请求执行多次，结果与执行一次相同。** 网络重试、前端重复提交、MQ 重复投递都可能触发重复请求。

### 哪些操作必须幂等

| 方法 | 幂等性 | 说明 |
|------|--------|------|
| GET | 天然幂等 | 查询无副作用 |
| PUT | 天然幂等 | 全量覆盖，重复执行结果相同 |
| DELETE | 天然幂等 | 删除不存在的资源也返回成功 |
| POST | **不幂等** | 创建类操作重复执行会重复创建 |

**结论**：POST（创建、下单、转账）是幂等设计的主战场。

### 幂等方案一：唯一业务号（推荐）

```javascript
// 前端/调用方生成唯一幂等键（如 UUID），随请求带上
// POST /api/orders
// Header: Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000

// 后端：
// 1. 先查幂等表（唯一索引）
// 2. 存在 → 直接返回上次结果（幂等命中）
// 3. 不存在 → 执行业务 + 插入幂等记录（同一事务）
```

**关键实现**：幂等表用**唯一索引**兜底并发，插入冲突说明是重复请求：

```sql
CREATE TABLE idempotency (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  idempotency_key VARCHAR(64) UNIQUE NOT NULL,  -- 唯一索引防并发
  biz_type VARCHAR(32) NOT NULL,
  response TEXT,
  created_at DATETIME
);
```

```java
@Transactional
public Order createOrder(OrderReq req) {
  // 并发下两个相同 key 的请求，只有一个能插入成功
  try {
    idemDao.insert(req.getIdempotencyKey()); // 唯一键冲突抛异常
  } catch (DuplicateKeyException e) {
    return idemDao.getLastResult(req.getIdempotencyKey()); // 返回上次结果
  }
  Order order = orderService.create(req);
  idemDao.updateResult(req.getIdempotencyKey(), order);
  return order;
}
```

### 幂等方案二：状态机

适用于有明确状态的业务（订单：待支付 → 已支付 → 已发货）：

```sql
-- 只允许从"待支付"变为"已支付"
UPDATE orders SET status = 'paid' WHERE id = ? AND status = 'pending';
-- 影响行数为 0 → 重复操作，直接返回成功
```

**坑 4：状态机防重遗漏**——只判断"status 变了没"不够，还要用**条件更新**保证原子性。两个并发请求都读到 pending，必须靠 `WHERE status='pending'` 让只有一个成功。

### 幂等方案三：Token 机制（表单防重）

```
1. 进入页面：GET /api/csrf-token 获取一次性 token（存 Redis）
2. 提交时带 token，后端校验并删除（原子操作）
3. token 已消费 → 拒绝重复提交
```

适用于**前端按钮重复点击**场景（下单选套餐、抢单按钮）。

## 四、7 个实战踩坑点汇总

## 坑 1：POST 重复提交创建重复数据

**解法**：唯一幂等键 + 唯一索引（见上文），前端防抖/禁用按钮只是辅助，**服务端幂等才是根本**。

## 坑 2：分页接口数据重复/丢失

**踩坑现场**：分页查询时数据在变动，`LIMIT 100,20` 翻页出现重复或漏数据。

**修复**：

- 排序字段要有**唯一性**（如 `ORDER BY id`，不能只按 `created_at`——同名时间会乱序）。
- 数据会变动的列表用**游标分页**：`WHERE id > last_id ORDER BY id LIMIT 20`。

## 坑 3：返回了多余的敏感字段

**踩坑现场**：用户接口返回了 `password_hash`、`mobile` 给前端。

**修复**：响应 DTO 白名单，不直接序列化实体对象；全局脱敏（手机号打码）。

## 坑 4：删除接口硬删除还是软删除？

**建议**：业务数据一律**软删除**（`deleted_at` 字段 + 查询过滤），保留审计痕迹；硬删除只用于明确的可恢复丢弃数据。

**坑**：软删除后唯一索引冲突——`user_id + deleted_at` 设计唯一索引时，重复软删除会撞唯一约束，常见解法是唯一键带上时间戳或改为部分索引方案。

## 坑 5：超时与重试没有上限

**踩坑现场**：调用下游接口失败无限重试，把下游打挂。

**修复**：重试要有**上限 + 退避**（指数退避 + 抖动），配合熔断器。

## 坑 6：接口没有版本控制

**踩坑现场**：改接口字段，老客户端全部报错。

**修复**：URL 版本（`/api/v1/users`）或 Header 版本（`Accept: application/vnd.xxx.v1+json`），破坏性变更必须升版本，新老并存。

## 坑 7：没有限流与鉴权兜底

**踩坑现场**：内部接口裸奔，被刷爆、被恶意调用。

**修复**：所有接口默认鉴权（白名单除外）+ 按维度限流（见限流篇）。

## 五、接口设计自查清单

- [ ] URL 只有名词资源，方法表达动作
- [ ] 响应格式统一（code/message/data）
- [ ] 错误信息友好、带 trace_id、不泄露堆栈
- [ ] 创建类接口有幂等方案
- [ ] 分页排序字段唯一
- [ ] 响应字段白名单 + 脱敏
- [ ] 破坏性变更升版本
- [ ] 鉴权 + 限流兜底

## 总结

| 场景 | 规范 |
|------|------|
| URL | 资源名词 + HTTP 方法 |
| 响应 | 统一包装 + 友好错误 |
| 创建幂等 | 幂等键 + 唯一索引 |
| 状态流转 | 条件更新状态机 |
| 分页 | 唯一排序 + 游标 |
| 敏感数据 | DTO 白名单 + 脱敏 |

API 设计的核心心法：**接口是契约，不是实现**。契约一旦发布就要稳定、可预期、幂等安全。把规范写进团队约定并沉淀成模板，前后端联调成本会大幅下降。
