# 部署文档：GitHub Actions 自动部署到 GitHub Pages

> 本文档对应 `.github/workflows/deploy.yml`，约定如下：
> - **develop**：开发分支，所有业务代码（源码、配置、md 内容）只在该分支维护
> - **main**：部署分支，只存放打包后的静态资源（`dist/` 内容），**禁止手动提交代码到 main**
> - 推送 develop → 自动构建 → 产物自动推送 main → GitHub Pages 从 main 根目录发布

---

## 一、本地 Git 分支操作

> ⚠️ 以下命令在**项目根目录**（本仓库）执行。若仓库尚未配置远程地址，先执行
> `git remote add origin https://github.com/<用户名>/<仓库名>.git`。

### 1.1 首次创建 develop 分支并推送（一次性）

```bash
# ① 从当前分支（master/main）创建 develop 分支并切换过去
git checkout -b develop

# ② 推送 develop 到远程，并设置上游跟踪
git push -u origin develop
```

### 1.2 日常开发流程（每次提交代码）

```bash
# ① 切到 develop（开发分支）
git checkout develop

# ② 拉取最新代码
git pull origin develop

# ③ 查看改动 / 暂存 / 提交
git status                      # 查看改动
git add .                       # 暂存所有改动（或 git add <具体文件>）
git commit -m "feat: 新增 xxx"   # 提交，建议使用 Conventional Commits 规范

# ④ 推送 develop：推送成功即自动触发 GitHub Actions 构建+部署
git push origin develop
```

### 1.3 部署结果验证

```bash
# 推送后等 1~3 分钟，检查 main 分支上是否已出现构建产物
git fetch origin
git log origin/main --oneline -5     # 应看到 "deploy: 自动部署 xxx" 之类的提交

# 或直接打开页面验证：
#   https://<用户名>.github.io/<仓库名>/
```

### 1.4 分支管理注意事项

| 操作 | 命令 | 说明 |
|---|---|---|
| 查看本地分支 | `git branch` | 当前分支前有 `*` 标记 |
| 查看远程分支 | `git branch -r` | 确认 develop / main 都存在 |
| 合并到 develop | `git merge <分支>` | 所有功能先合并到 develop，再推送触发部署 |
| 删除本地分支 | `git branch -d <分支>` | 仅用于清理已合并的临时分支 |

> ⚠️ **严禁在 main 分支上开发或提交**：main 只存放打包产物，手动提交会造成下次
> 部署被覆盖或产生冲突。如果误切到了 main，立即 `git checkout develop` 切回。

---

## 二、GitHub 仓库必要配置（一次性）

### 2.1 Actions 工作流读写权限（关键，不配会报权限错误）

打开：**仓库 Settings → Actions → General → Workflow permissions**

- 选中 **Read and write permissions**（读和写权限）
- 勾选 **Allow GitHub Actions to create and approve pull requests**（可选，本流程不创建 PR，可不勾）
- 点击 **Save** 保存

> 💡 说明：虽然 `deploy.yml` 里已显式声明 `permissions: contents: write`，但 GitHub
> 默认的仓库级 Workflow permissions 是 **Read-only**，二者配合才能稳定生效。
> 保险起见**仓库级也设置成 Read and write**，避免个别情况下策略覆盖导致失败。

### 2.2 GitHub Pages 来源配置

打开：**仓库 Settings → Pages**

- **Build and deployment → Source**：选择 **Deploy from a branch**（从分支部署）
- **Branch**：选择 **main**，目录选择 **/ (root)**（根目录）
- 点击 **Save**

> ⚠️ 不要选择 "GitHub Actions" 来源方案 —— 本流程使用 peaceiris/actions-gh-pages
> 直接推送产物到 main 分支，因此必须选择 **Deploy from a branch / main / root**。

### 2.3 其他可选配置

- **分支保护**（强烈建议）：Settings → Branches → Add branch protection rule，
  对 `main` 开启 **Require a pull request before merging**，防止任何人（包括你自己）
  直接推送源码到 main，从机制上保证 "main 只存产物"。
  ⚠️ 开启后务必确认已勾选 **Allow specified actors to bypass** 并加入 Actions 机器人，
  或直接只保护 main（Actions 推送通常不受该规则限制，但建议实测一次）。

---

## 三、完整部署流程说明

### 3.1 一次部署的生命周期

```
你 push develop
      │
      ▼
┌───────────────────────────── GitHub Actions ─────────────────────────────┐
│  1. checkout 拉取 develop 源码                                           │
│  2. setup-node 安装 Node 24                                               │
│  3. npm ci         按 package-lock.json 精确安装依赖                      │
│  4. npm run build  Vite 打包 → ./dist                                    │
│  5. touch dist/.nojekyll  防止 Jekyll 过滤下划线资源                      │
│  6. peaceiris/actions-gh-pages 将 dist/ 内容推送到 main 分支              │
└──────────────────────────────────────────────────────────────────────────┘
      │
      ▼
GitHub Pages 检测到 main 分支更新 → 自动发布 https://<用户名>.github.io/<仓库名>/
```

### 3.2 首次部署流程（从零开始）

1. **本地**：按第一节命令创建并推送 develop 分支；
2. **远程**：确认 `.github/workflows/deploy.yml` 已在 develop 分支上（若没有，
   `git add .github && git commit -m "ci: 添加自动部署工作流" && git push origin develop`）；
3. **等构建完成**：仓库 **Actions** 页面可看到 `Deploy to GitHub Pages` 工作流运行，
   全部步骤显示绿色 ✓；
4. **配置 Pages**：按第二节配置 Actions 权限与 Pages 来源（main / root）；
5. **验证发布**：打开 `https://<用户名>.github.io/<仓库名>/`，首次发布 GitHub 可能需要
   等待 1~2 分钟生效。

### 3.3 日常更新流程

```bash
# 改代码 → 提交 → 推送，剩下交给 Actions
git checkout develop
git add .
git commit -m "feat: 更新文章"
git push origin develop
```

推送后 Actions 自动完成：构建 → 推送 main → Pages 更新。全程无需手动操作。

### 3.4 手动触发构建（workflow_dispatch）

场景：只想重新部署当前 develop 最新代码、或上次部署失败需要重跑：

1. 打开仓库 **Actions** 页面；
2. 左侧选择 **Deploy to GitHub Pages** 工作流；
3. 点击右侧 **Run workflow** 按钮；
4. 点击绿色 **Run workflow** 确认，等待构建完成。

### 3.5 部署失败时的处理顺序

1. 打开 **Actions** 页面，点击失败的运行，查看是哪个步骤红 X；
2. 对照本文档 **故障排查清单（TROUBLESHOOTING.md）** 定位原因；
3. 修改代码/配置 → commit → push develop 重新触发；
4. 也可用 3.4 的手动触发直接重跑，无需再次提交代码。

---

## 四、文件清单核对

| 文件 | 作用 | 分支 |
|---|---|---|
| `.github/workflows/deploy.yml` | CI/CD 工作流定义 | develop（随源码走） |
| `vite.config.js` | base 路径配置（场景1：`/仓库名/`） | develop |
| `package.json` / `package-lock.json` | 构建依赖，lock 文件**必须提交** | develop |
| `dist/` | 构建产物（CI 自动生成，**不要提交**） | 仅存在于 main |
| `main` 分支 | 仅存静态资源 | 由 Actions 自动维护 |

> 若 `.gitignore` 未忽略 `dist/`，建议追加一行 `dist/`，防止本地误提交产物到 develop。
