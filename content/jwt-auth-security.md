---
title: JWT 认证原理与安全实践：从签发到验证的完整指南
description: 深入 JWT 结构、签名算法、无状态会话的优缺点，覆盖 token 刷新、密钥管理、常见安全漏洞。
date: 2026-07-31
category: 后端
tags:
  - JWT
  - 认证
  - 安全
  - 后端
---

# JWT 认证原理与安全实践：从签发到验证的完整指南

JWT（JSON Web Token）是当下最流行的无状态认证方案，但"无状态"既是优点也是坑源——token 泄露、无法主动失效、算法混淆攻击……本文从原理到安全实践完整梳理。

## 一、JWT 结构

一个 JWT 由三段组成：`Header.Payload.Signature`（Base64Url 编码）。

```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0In0.6ZwE2vx3D...
│─────────────│ │─────────────│ │─────────────│
    Header          Payload         Signature
```

### Header

```json
{ "alg": "HS256", "typ": "JWT" }
```

### Payload（不要放敏感信息！）

```json
{
  "sub": "user_123",          // 主题（用户标识）
  "iat": 1753948800,          // 签发时间
  "exp": 1754035200,          // 过期时间（必设！）
  "role": "admin"             // 自定义声明
}
```

### Signature

```
HMACSHA256(base64Url(header) + "." + base64Url(payload), secret)
```

签名保证**内容未被篡改**，但不加密——payload 是明文（Base64 可逆），**千万不能放密码等敏感信息**。

## 二、认证流程

```
1. 用户登录 → 服务端校验密码 → 签发 JWT 返回客户端
2. 客户端保存 token（localStorage / cookie）
3. 每次请求带 Authorization: Bearer <token>
4. 服务端验签 → 读 payload 拿用户信息 → 放行
```

## 三、7 个安全实践与踩坑点

## 坑 1：算法混淆攻击（alg=none / 弱算法）

**踩坑现场**：攻击者把 header 的 `alg` 改成 `none`（不签名）或 `HS256`（若服务端用 RS256 且误用公钥验签），直接伪造任意 token。

**修复**：

```javascript
// ✅ 明确指定算法，禁止 alg=none
jwt.verify(token, secret, { algorithms: ['HS256'] })
```

**关键**：`verify` 时必须**白名单限定算法**，且签名密钥必须匹配算法类型（HS 用对称密钥，RS 用私钥签/公钥验）。

## 坑 2：token 泄露（XSS 窃取 / 明文传输）

**踩坑现场**：token 存 localStorage，被 XSS 直接 `localStorage.getItem` 偷走；或 HTTP 明文传输被中间人截获。

**修复**：

- 优先放 **HttpOnly + Secure + SameSite Cookie**（JS 读不到，防 XSS 窃取）。
- 必须 HTTPS，杜绝明文传输。
- 如果放 localStorage，务必配合 CSP 和严格 XSS 防护。

## 坑 3：无法主动失效（登出、改密、封号）

**踩坑现场**：用户点了登出，但 JWT 在过期前依然有效；用户改密码，旧 token 还能用。

**原因**：JWT 无状态，服务端不保存会话，无法主动作废（除非等它过期）。

**修复（按需选）**：

- **黑名单**：登出/改密时把 token 的 `jti`（唯一 ID）加入 Redis 黑名单，过期时间同 token。
- **版本号**：payload 里带 `ver`（密码版本），用户改密后 ver+1，旧 token 验签时比对 ver 拒绝。
- **短过期 + 刷新机制**：token 15 分钟过期，用 refresh token（可作废）续期，兼顾安全与体验。

## 坑 4：刷新 token 的存储与轮换

**踩坑现场**：refresh token 也放前端 localStorage，被盗后攻击者持续续期，永久有效。

**修复**：

- refresh token 放 **HttpOnly Cookie**。
- **轮换机制**：每次刷新发新的 refresh token，旧的立即失效（用 `jti` 记录已用）。
- 检测到旧 refresh token 被重放 → 判定泄露，**吊销整组 token**。

## 坑 5：payload 放了敏感信息

**踩坑现场**：把手机号、身份证号放进 payload，被解码就能看到。

**修复**：payload 只放**必要且非敏感**的标识（userId、角色），敏感信息永远走服务端查库。记住：**JWT 是签名不是加密**。

## 坑 6：密钥管理不当

**踩坑现场**：密钥硬编码在代码里提交到 Git；HS256 用弱密钥被暴力破解（如 `jwt-secret`、`secret123`）。

**修复**：

- 密钥放环境变量 / 配置中心 / KMS，不入代码仓库。
- HS256 密钥长度 ≥ 32 字节随机串。
- 非对称场景用 RS256/ES256，私钥严格保护。

## 坑 7：过期时间与时钟偏差

**踩坑现场**：token 过期时间设 30 天，泄露后攻击窗口极大；或服务端/客户端时钟偏差导致"明明没过期却被拒"。

**修复**：

- 过期时间按业务定：接口型 15min-2h，登录态配合 refresh 续期。
- 验签时设置时钟偏差容忍：`clockTolerance: 30`（秒）。

## 四、完整实践模板（Node.js 示例）

```javascript
const jwt = require('jsonwebtoken')

// 签发 access token（短时效）
function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, ver: user.pwdVersion },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m', algorithm: 'HS256' }
  )
}

// 签发 refresh token（长时效，可作废）
function signRefreshToken(user) {
  return jwt.sign(
    { sub: user.id, jti: randomUUID() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d', algorithm: 'HS256' }
  )
}

// 验签中间件
function auth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
      algorithms: ['HS256'],
    })
    // 检查黑名单 / 版本号
    if (blacklisted(payload.jti) || payload.ver !== getPwdVersion(payload.sub)) {
      return res.status(401).json({ code: 401, msg: 'token 已失效' })
    }
    req.user = payload
    next()
  } catch {
    res.status(401).json({ code: 401, msg: 'token 无效或过期' })
  }
}
```

## 五、JWT vs Session 选型

| 维度 | JWT | Session |
|------|-----|---------|
| 状态存储 | 无状态（token 自带信息） | 服务端存储 |
| 扩容 | 天然水平扩展 | 需共享存储（Redis） |
| 主动失效 | 难（需黑名单） | 容易（删 session） |
| 泄露风险 | token 泄露影响大 | 相对可控 |
| 适用场景 | 分布式/微服务/移动端 | 单体/传统 Web |

**建议**：小型单体项目用 Session + Redis 更省心；微服务、前后端分离、跨端场景 JWT 更合适——但**一定要配套短过期 + refresh 机制 + 黑名单/版本号**，别做"裸 JWT"。

## 总结速查表

| 坑 | 修复 |
|----|------|
| alg 混淆 | verify 时白名单限定算法 |
| token 泄露 | HttpOnly Cookie + HTTPS |
| 无法失效 | 黑名单 / 版本号 / 短过期 |
| refresh 泄露 | 轮换 + HttpOnly + 重放检测 |
| payload 敏感信息 | 只放必要标识 |
| 密钥泄露 | 环境变量 + 强密钥 |
| 过期太长 | 短过期 + 刷新机制 |

JWT 的核心理念：**它是"凭证"不是"账户"**——凭证会泄露、会过期、需要能吊销。把 JWT 当临时通行证来设计（短时效 + 可作废 + 安全存储），就能避开大多数认证事故。
