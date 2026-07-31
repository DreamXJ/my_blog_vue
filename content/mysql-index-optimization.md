---
title: MySQL 索引优化实战：从慢查询到索引设计的完整指南
description: 覆盖 explain 解读、最左前缀、索引失效场景、覆盖索引与分页优化，附 7 个实战踩坑点。
date: 2026-07-31
category: 后端
tags:
  - MySQL
  - 索引
  - 性能优化
  - 数据库
---

# MySQL 索引优化实战：从慢查询到索引设计的完整指南

索引是后端性能优化里"性价比最高"的一环——建对了查询提速百倍，建错了不仅没用还可能拖慢写入。本文从 explain 出发，把索引的设计与踩坑一次讲透。

## 一、先学会看执行计划

```sql
EXPLAIN SELECT * FROM orders WHERE user_id = 100 AND status = 1\G
```

关键列：

| 列 | 含义 | 重点关注 |
|----|------|---------|
| type | 访问类型 | ALL（全表扫描）→ 必须优化；ref/range 合格 |
| key | 实际使用的索引 | NULL = 没用到索引 |
| rows | 预估扫描行数 | 越小越好 |
| Extra | 附加信息 | Using filesort/Using temporary 都要优化 |

**第一步**：凡是 `type=ALL` 且表大的查询，都是优化目标。

## 二、索引失效的 6 大场景

## 失效场景 1：违反最左前缀原则

```sql
-- 索引 (user_id, status, create_time)
SELECT * FROM orders WHERE status = 1 -- ❌ 跳过 user_id，索引失效
SELECT * FROM orders WHERE user_id = 100 -- ✅ 用到了
SELECT * FROM orders WHERE user_id = 100 AND status = 1 -- ✅
```

**原则**：复合索引只能从最左列开始连续使用，跳过中间列会导致后续列失效。

## 失效场景 2：对索引列做运算或函数

```sql
-- 索引 user_id
SELECT * FROM users WHERE user_id + 1 = 100 -- ❌ 运算后索引失效
SELECT * FROM users WHERE DATE(create_time) = '2026-07-31' -- ❌ 函数包裹

-- ✅ 正确写法：把运算移到等号另一边
SELECT * FROM users WHERE user_id = 99
SELECT * FROM users WHERE create_time >= '2026-07-31' AND create_time < '2026-08-01'
```

## 失效场景 3：隐式类型转换

```sql
-- phone 是 varchar，但传入数字
SELECT * FROM users WHERE phone = 13800001111 -- ❌ 隐式转换，索引失效
SELECT * FROM users WHERE phone = '13800001111' -- ✅
```

**经验**：字段是什么类型，查询参数就传什么类型。ORM 里尤其容易踩——数字型 ID 传字符串或反之。

## 失效场景 4：LIKE 前导通配符

```sql
SELECT * FROM users WHERE name LIKE '%张%' -- ❌ 前导通配符无法用索引
SELECT * FROM users WHERE name LIKE '张%'  -- ✅ 前缀匹配可用索引
```

## 失效场景 5：OR 连接非索引列

```sql
-- 索引 user_id，status 无索引
SELECT * FROM orders WHERE user_id = 100 OR status = 1 -- ❌ OR 有一端无索引则全扫
```

**修复**：改为 UNION 或用覆盖索引同时覆盖两个列。

## 失效场景 6：NOT IN / != 与空值

```sql
SELECT * FROM users WHERE status != 1 -- 大概率走全表扫描
SELECT * FROM orders WHERE deleted_at IS NOT NULL -- 与 NULL 判断相关的索引使用受限
```

## 三、覆盖索引：终极提速手段

**覆盖索引**：查询的所有列都包含在索引中，**无需回表**，速度碾压。

```sql
-- 索引 (user_id, status)
SELECT user_id, status FROM orders WHERE user_id = 100
-- 需要的数据全在索引里，Extra 显示 Using index，不用回表
```

**实战**：列表接口只 select 必要的列，配合覆盖索引可以大幅减少回表 IO。

## 四、分页深翻页优化

**踩坑现场**：`LIMIT 100000, 20` 越翻越慢——MySQL 要先扫 10 万行再丢弃。

**优化方案**：

```sql
-- 方案一：延迟关联（先取 ID，再回表）
SELECT * FROM orders
JOIN (SELECT id FROM orders ORDER BY id LIMIT 100000, 20) t
  ON orders.id = t.id

-- 方案二：基于游标（记住上次位置，推荐）
SELECT * FROM orders WHERE id > 100000 ORDER BY id LIMIT 20
```

方案二（游标分页）是最优解：**不用 OFFSET，用条件定位**。

## 五、索引设计实战清单

### 1. 区分度优先

```sql
-- 区分度低的列不适合单独建索引（如性别只有 0/1）
-- 区分度高的列（如 user_id、order_no）值得建
```

**经验法则**：单列区分度（COUNT(DISTINCT col) / COUNT(*)）低于 20% 的列，单独建索引价值不大。

### 2. 联合索引设计顺序

```sql
-- 规则：等值条件放前面，范围条件放后面
-- 等值列：user_id  →  范围列：create_time
CREATE INDEX idx_user_time ON orders (user_id, create_time);
```

### 3. 冗余索引清理

```sql
-- 已有 (a, b) 联合索引时，(a) 单列索引就是冗余的
-- 用 SHOW INDEX FROM t 检查，删除冗余索引减少写入开销
```

### 4. 字符串前缀索引

```sql
-- 超长字符串列，只索引前缀
ALTER TABLE articles ADD INDEX idx_title (title(20));
```

## 六、7 个实战踩坑点

## 坑 1：小表也建了一堆索引

**踩坑现场**：几百行的配置表建了 5 个索引，写入变慢还没收益。

**原则**：表小于几千行时全表扫描比索引还快，别过度索引。**索引是空间换时间，小表不值得**。

## 坑 2：只给主键建索引，查询全是 ALL

**踩坑现场**：业务查询 `WHERE user_id = ?` 从不走索引，慢查询日志刷屏。

**修复**：按查询模式建索引——**先看慢查询日志（slow_query_log），按高频查询建索引**，而不是凭感觉。

```sql
SET GLOBAL slow_query_log = ON;
SET GLOBAL long_query_time = 1; -- 超过 1 秒记录
```

## 坑 3：更新频繁的列建索引拖慢写入

**踩坑现场**：`updated_at`、计数器这类高频更新列建了索引，写入性能明显下降。

**原因**：每次 UPDATE 都要同步维护索引树（B+ 树节点分裂）。

**修复**：写多读少的列慎建索引；必要时用"计数表 + 定时汇总"替代高频索引列。

## 坑 4：字符集不一致导致索引失效

**踩坑现场**：两个表 join，一个 utf8 一个 utf8mb4，关联列索引失效。

**原因**：字符集/排序规则不一致时，MySQL 需要转换，无法直接用索引。

**修复**：全库统一 `utf8mb4` + `utf8mb4_unicode_ci`；join 关联列类型、字符集必须一致。

## 坑 5：order by 字段没进索引

**踩坑现场**：`WHERE user_id=1 ORDER BY create_time` 出现 Using filesort，排序很慢。

**修复**：让排序字段进联合索引 `(user_id, create_time)`，B+ 树天然有序，直接省掉 filesort。

## 坑 6：索引没加 NOT NULL 约束

**踩坑现场**：索引列允许 NULL，查询结果与预期不符，或索引利用率下降。

**原则**：能用 NOT NULL 的列别留 NULL（业务上"无值"用 0/'' 表示），索引对 NULL 的处理更复杂，也方便后续优化。

## 坑 7：生产环境直接 ALTER 大表建索引

**踩坑现场**：几千万行的表直接 `CREATE INDEX`，锁表几十分钟，线上写操作全堵。

**修复**：用在线 DDL（`ALGORITHM=INPLACE`）并错峰执行；或先在从库/影子库演练，用 `pt-online-schema-change` 等工具平滑变更。

## 七、优化套路总结

```
遇到慢查询 →
1. EXPLAIN 看 type/rows/Extra
2. 按查询模式建/调索引（等值在前，范围在后）
3. 检查是否命中：最左前缀 / 函数运算 / 类型转换 / LIKE
4. 覆盖索引减少回表
5. 深分页用游标方案
6. 验证：EXPLAIN 对比前后 rows 与 Extra
```

| 症状 | 排查方向 |
|------|---------|
| type=ALL | 缺索引 / 索引失效 |
| Using filesort | 排序字段没进索引 |
| 深分页慢 | OFFSET 改游标 |
| join 慢 | 关联列类型/字符集一致性 |
| 写入慢 | 索引冗余 / 高频更新列索引 |

索引优化是**数据驱动**的工作：开启慢查询日志，按真实查询建索引，用 EXPLAIN 验证每一次改动。凭感觉建索引，迟早要返工。
