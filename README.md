# DreamXj 个人博客

> 一行代码，构建未来。

基于 **Vue 3 + Vite + Tailwind CSS** 构建的纯静态个人博客系统。支持 Markdown 驱动内容、多主题配色、全站搜索、标签归档、亮暗模式切换，一键部署到 GitHub Pages。

## ✨ 特性

- 📝 **Markdown 驱动** — 在 `content/` 目录新建 `.md` 文件即发布文章，无需修改代码
- 🎨 **5 套高级主题色板** — 北欧极光 / 暮色樱花 / 森林冠层 / 石墨灰调 / 落日红宝
- 🌓 **亮暗双模式** — 一键切换，偏好持久化至 `localStorage`
- 🔍 **本地全文搜索** — 构建时预生成索引，前端实时检索，无需后端
- 🏷️ **标签筛选与归档** — 按标签过滤、按年月时间线归档
- 📱 **响应式设计** — 桌面端多列网格 + 移动端单列汉堡菜单
- 🧊 **玻璃拟态 UI** — 磨砂玻璃卡片、蓝紫渐变、柔和发光
- 🚀 **一键部署** — `npm run deploy` 自动推送到 GitHub Pages

## 🛠️ 技术栈

| 技术                                                        | 用途                        |
| ----------------------------------------------------------- | --------------------------- |
| [Vue 3](https://vuejs.org/)                                 | 前端框架（Composition API） |
| [Vite](https://vitejs.dev/)                                 | 构建工具                    |
| [Tailwind CSS](https://tailwindcss.com/)                    | 实用优先的 CSS 框架         |
| [Pinia](https://pinia.vuejs.org/)                           | 状态管理                    |
| [Vue Router](https://router.vuejs.org/)                     | 路由管理                    |
| [gray-matter](https://github.com/jonschlinkert/gray-matter) | Markdown Frontmatter 解析   |
| [marked](https://marked.js.org/)                            | Markdown → HTML 渲染        |
| [highlight.js](https://highlightjs.org/)                    | 代码语法高亮                |
| [Mermaid](https://mermaid.js.org/)                          | 流程图 / 时序图渲染         |
| [gh-pages](https://github.com/tschaub/gh-pages)             | GitHub Pages 部署           |

## 📁 项目结构

```
blog/
├── content/                  # Markdown 文章目录（新增文章放这里）
│   ├── 文章示例.md
│   └── posts/
│       └── js-async-programming.md
├── public/                   # 静态资源
│   ├── favicon.svg
│   └── blog-data.json        # 构建时自动生成
├── src/
│   ├── components/           # 公共组件
│   │   ├── NavBar.vue        # 导航栏（主题选择器 + 搜索弹窗）
│   │   ├── ArticleCard.vue   # 文章卡片
│   │   ├── Footer.vue        # 页脚
│   │   └── LogoIcon.vue      # 创意 Logo
│   ├── views/                # 页面组件
│   │   ├── Home.vue          # 首页（Hero + 文章列表）
│   │   ├── Post.vue          # 文章详情页
│   │   ├── Archive.vue       # 时间归档
│   │   ├── Projects.vue      # 项目展示
│   │   └── About.vue         # 关于页面
│   ├── router/index.js       # Vue Router（hash 模式）
│   ├── store/blog.js         # Pinia 状态管理
│   ├── utils/mdParser.js     # Markdown 解析工具
│   ├── App.vue               # 根组件
│   ├── main.js               # 入口文件
│   └── style.css             # 全局样式 + 5 套主题变量
├── scripts/deploy.js         # 一键部署脚本
├── index.html
├── vite.config.js            # Vite 配置 + blog 数据生成插件
├── tailwind.config.js        # Tailwind 主题 Token
├── postcss.config.js
└── package.json
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装 & 开发

```bash
# 克隆项目
git clone https://github.com/yourusername/myblog2.git
cd myblog2

# 安装依赖
npm install

# 启动开发服务器（热更新）
npm run dev
```

### 写文章

在 `content/` 目录下创建任意 `.md` 文件，格式如下：

```markdown
---
title: "文章标题"
date: 2026-07-30
tags: ["Vue3", "Vite"]
desc: "文章简介，显示在卡片上"
category: 前端
readTime: 5
cover: "/images/cover.png"
---

## 正文

支持标准 Markdown 语法、代码块、Mermaid 流程图。
```

**字段说明：**

| 字段       | 必填 | 说明                                           |
| ---------- | ---- | ---------------------------------------------- |
| `title`    | ✅   | 文章标题                                       |
| `date`     | ✅   | 发布日期（YYYY-MM-DD）                         |
| `tags`     | ✅   | 标签数组，用于筛选                             |
| `desc`     | ❌   | 文章摘要，显示在卡片上（也支持 `description`） |
| `category` | ❌   | 分类                                           |
| `readTime` | ❌   | 阅读时长（分钟），不填自动估算                 |
| `cover`    | ❌   | 封面图片路径，放在 `public/images/` 下         |

### 构建

```bash
npm run build
```

构建产物在 `dist/` 目录，同时自动生成：

- `blog-data.json` — 文章数据
- `search-index.json` — 搜索索引
- `sitemap.xml` — 站点地图

### 本地预览构建产物

```bash
npm run preview
```

## 🌐 部署到 GitHub Pages

### 首次部署

1. 在 GitHub 创建仓库（如 `myblog2`）

2. 修改 `vite.config.js` 中的 `base` 字段为你的仓库名：

   ```js
   base: '/myblog2/',  // ← 改为你的仓库名
   ```

3. 构建并部署：

   ```bash
   npm run build
   npm run deploy "更新静态资源"
   ```

4. 进入仓库 **Settings → Pages**，将 Source 设置为 `gh-pages` 分支，根目录 `/ (root)`

5. 访问 `https://<你的用户名>.github.io/<仓库名>/`

### 更新内容

每次新增或修改文章后：

```bash
npm run build
npm run deploy
```

## 🎨 主题系统

博客内置 5 套专业配色主题，每套都支持深色/亮色双模式：

| 主题        | 暗色基底  | 主色      | 气质        |
| ----------- | --------- | --------- | ----------- |
| 🥇 北欧极光 | `#0F1218` | `#3B82F6` | 冷静 · 专业 |
| 🌸 暮色樱花 | `#1A1118` | `#F472B6` | 柔和 · 浪漫 |
| 🌿 森林冠层 | `#0C1412` | `#34D399` | 自然 · 沉静 |
| 🎯 石墨灰调 | `#0B0D12` | `#94A3B8` | 极简 · 高级 |
| 💎 落日红宝 | `#140A0A` | `#FB7185` | 热情 · 大胆 |

切换方式：导航栏调色盘图标 → 选择色板 → 下拉菜单底部切换亮暗模式。选择持久化至 `localStorage`。

## ⚙️ 配置说明

### vite.config.js

- `base` — GitHub Pages 项目站点的根路径，设置为 `/<仓库名>/`
- `blogPlugin()` — 内置 Vite 插件，扫描 `content/` 目录解析 Markdown，生成博客数据

### tailwind.config.js

- 完整的颜色、字体、阴影、动画设计 Token
- 核心色值引用 CSS 变量，跟随主题切换自动更新

### src/style.css

- 5 套主题的 CSS 变量定义（深色 + 亮色）
- 玻璃卡片、导航栏、代码块等组件样式
- 亮色模式全局覆盖

## 📄 许可证

MIT
