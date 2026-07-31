# 故障排查清单：GitHub Pages + Vue3/Vite 自动部署

> 排查顺序建议：**先看 Actions 运行日志（哪个步骤红 X）**，再按症状对号入座。
> 修改配置后 → commit → push develop 重新触发，或直接 Run workflow 手动重跑。

---

## 一、页面白屏 / 空白页

**现象**：打开 `https://<用户名>.github.io/<仓库名>/` 一片空白，控制台报资源 404。

### 1. base 路径配置错误（最常见原因）

| 现象 | 原因 | 解决 |
|---|---|---|
| 页面能打开但 js/css 全部 404 | 普通仓库（`用户名.github.io/仓库名`）却把 base 设成了 `/` | `vite.config.js` 中 `base: '/<仓库名>/'` |
| 页面能打开但 js/css 全部 404 | 个人主页仓库（`用户名.github.io`）却把 base 设成了 `/仓库名/` | `base: '/'` |

排查方法：
```bash
# 打开页面 → F12 → Network 面板，看失败请求的完整 URL
# 对比预期地址：
#   普通仓库： https://<用户名>.github.io/<仓库名>/assets/index-xxxx.js
#   个人主页： https://<用户名>.github.io/assets/index-xxxx.js
```

> ⚠️ 修改 base 后**必须重新构建并重新触发部署**，本地 `npm run dev` 的路径和线上
> 不一定一致，本地正常不代表线上正常。

### 2. 修改 base 后没生效（浏览器缓存）

- 强制刷新：`Ctrl + F5` / `Cmd + Shift + R`
- 无痕窗口验证一次，确认不是缓存问题后再查配置

### 3. JS 报错导致渲染中断

- F12 → Console 面板查看具体报错（如 `Uncaught SyntaxError`、`Failed to fetch`）
- 常见：构建时代码有误但构建未报错（如运行时访问了不存在的 API）、
  `blog-data.json` 等公共数据文件路径带上了 base 前缀导致请求 404

---

## 二、静态资源 404（图片 / 字体 / 数据文件）

### 1. 下划线开头的资源被 Jekyll 过滤

**现象**：`_assets/`、`_data/` 之类的文件 404，其余正常。

**原因**：GitHub Pages 默认用 Jekyll 处理，会忽略下划线开头的文件。

**解决**：确认 `dist/.nojekyll` 存在（CI 中已自动生成）：
```bash
# 本地验证产物
ls dist/.nojekyll
# 线上验证：直接访问 https://<用户名>.github.io/<仓库名>/.nojekyll 应返回 200
```
若缺失，检查 deploy.yml 中 `Create .nojekyll` 步骤是否在 `publish_dir` 目录内生成。

### 2. public/ 目录资源引用路径问题

- Vite 中 `public/` 下的文件打包后位于产物根目录，引用时**不要加 `/public/` 前缀**；
- 应使用 `base + '/xxx.png'`（或直接相对路径），不要写死绝对路径。

### 3. 大小写 / 路径拼写错误

- GitHub Pages 文件系统区分大小写，`Img.png` 与 `img.png` 不同；
- 检查部署产物 `dist/` 中实际文件名与页面引用的 URL 是否完全一致。

---

## 三、路由刷新 / 直接访问子页面 404

### 1. hash 模式（本项目当前使用，默认安全）

本项目 `src/router/index.js` 使用 `createWebHashHistory()`，地址形如
`https://<用户名>.github.io/<仓库名>/#/post/xxx`，`#` 后面的路径不会发到服务器，
**刷新和直接访问都不会 404**，无需额外处理。

### 2. history 模式（若日后切换为 createWebHistory）

**现象**：首页正常，但直接访问/刷新 `/post/xxx` 等子路径返回 404。

**原因**：GitHub Pages 是纯静态托管，没有服务端重写规则，找不到对应物理文件就 404。

**解决**（二选一）：
- **方案 A（推荐）**：保持 hash 模式，`createRouter({ history: createWebHashHistory() })`；
- **方案 B**：切回 history 模式并把 `index.html` 复制为 `404.html`，
  GitHub Pages 对 404 会返回该文件，SPA 可借此兜底：
  ```js
  // vite.config.js 中追加
  plugins: [vue(), blogPlugin(), {
    name: 'copy-index-to-404',
    closeBundle() {
      const fs = require('node:fs')
      fs.copyFileSync('dist/index.html', 'dist/404.html')
    }
  }]
  ```
  ⚠️ 兜底方案只是把 404 页面渲染成 SPA 入口，SEO 仍不理想，且链接分享时 URL 不变，
  仍建议优先用 hash 模式。

---

## 四、Actions 运行失败

### 1. 权限失败：Permission denied / Could not push to main

**现象**：日志中 `peaceiris/actions-gh-pages` 步骤报
`remote: Permission to <用户>/<仓库>.git denied to github-actions[bot]`。

**排查顺序**：
1. 确认 `deploy.yml` 顶部有 `permissions: contents: write`（已内置）；
2. 确认仓库 **Settings → Actions → General → Workflow permissions** 为
   **Read and write permissions**（仓库级配置，最容易漏）；
3. 确认 **Settings → Branches** 没有对 main 开启会让机器人无法推送的保护规则
   （若开了 "Require a pull request before merging" 且未放行 Actions，请按
   DEPLOY.md 2.3 节处理）；
4. 确认仓库是**你的个人仓库或你有写权限的组织仓库**（GITHUB_TOKEN 只有仓库写权限）。

### 2. 工作流根本没触发

**现象**：push 了 develop，Actions 页面没有出现新运行记录。

- 确认推送的是 **develop** 分支（`git branch --show-current`）；
- 确认 `deploy.yml` 在 **develop** 分支上存在且路径完全正确（`.github/workflows/deploy.yml`）；
- 确认文件名不是 `deploy.yml.txt` 之类（Windows 下容易踩）；
- push 事件走的是本地 `git push origin develop`，不是 `git push --force` 到别的分支。

### 3. npm ci 失败：lockfile 缺失 / 版本冲突

- **`npm ci` 要求 `package-lock.json` 必须存在且已提交**，检查 develop 分支是否包含它；
- `npm ci` 会删除 node_modules 重装，报 `npm error` 时看具体依赖版本冲突信息；
- Node 24 与依赖不兼容：可在报错步骤前加 `node-version: 22` 临时对比（本项目
  vite 5 + vue 3.4 在 Node 24 下正常）。

### 4. 构建失败：npm run build 红 X

- 本地先跑一遍 `npm run build` 复现，修好本地再推；
- 常见原因：语法错误、`marked`/`highlight.js` 插件版本 API 变更、
  `content/` 下 md 文件 front-matter 缺字段导致 `blogPlugin` 报错。

### 5. 手动触发按钮灰色 / Run workflow 不可点

- `workflow_dispatch` 已声明但仍不可点：确认 `deploy.yml` 语法正确
  （可先 push 一次触发 `push` 事件验证语法）；
- 某些情况下需要先刷新页面，或确认当前登录账号对该仓库有写权限。

---

## 五、部署成功但页面没更新

| 现象 | 原因 | 解决 |
|---|---|---|
| Actions 全绿，页面还是旧内容 | Pages 发布有延迟（通常 1~2 分钟） | 耐心等待，或去 **Settings → Pages** 查看部署状态 |
| 有 "Deployments" 记录但页面 404 | Pages 来源配置错误 | 确认 **Deploy from a branch → main → / (root)** |
| main 分支确实更新了但页面不变 | 浏览器/CDN 缓存 | 强制刷新；个别地区 CDN 缓存最久可达几小时 |
| main 分支提交显示的是旧内容 | `force_orphan: true` 每次生成全新提交 | 属于正常现象，看提交里的文件内容是否最新 |

验证产物是否真的推送成功：
```bash
git fetch origin
git ls-tree origin/main --name-only   # 应看到 index.html、assets/、.nojekyll 等
```

---

## 六、其他常见问题

### 1. sitemap / 站点地址写死

- `vite.config.js` 的 `blogPlugin` 里写死了
  `siteUrl = 'https://dreamxj.github.io/my_blog_vue'`，如果换了用户名或仓库名，
  **记得同步修改**，否则 sitemap.xml 里的 URL 全是错的。

### 2. 本地 npm run dev 正常，线上全挂

- 优先怀疑 **base 配置**（本地开发服务器不关心 base，线上必须正确）；
- 其次检查是否有依赖 Node 环境的代码在浏览器中不可用（如 `fs`、`path`）。

### 3. Actions 日志乱码 / 中文报错

- GitHub Actions 日志默认 UTF-8；若 npm 输出中文乱码，是 Windows 本地终端编码问题，
  与线上构建无关，可忽略。

### 4. 误提交代码到 main 了怎么办

- 不要手动修改 main，直接 push 一次 develop 重新触发部署，Actions 会用新产物
  覆盖 main（`force_orphan: true` 会整体重建 main 分支）。

---

## 七、快速定位流程图

```
页面白屏/资源404？
  ├─ 是 → F12 Network 看 URL → base 是否 = '/仓库名/' 或 '/'（按仓库类型选）→ 改完重新部署
  ├─ 是 → 资源是下划线开头？→ 检查 dist/.nojekyll 是否存在
  └─ 否 → 子路径刷新 404？→ hash 模式：无此问题；history 模式：换 hash 或加 404.html
Actions 失败？
  ├─ Permission denied → 仓库级 Workflow permissions 改 Read and write
  ├─ npm ci 失败 → package-lock.json 是否已提交
  ├─ build 失败 → 本地 npm run build 复现
  └─ 没触发 → 分支名/路径/文件名是否正确
部署成功但页面旧 → 等 1~2 分钟 / 强制刷新 / 检查 Pages 来源配置
```
