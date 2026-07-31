---
title: 前端工程化落地：ESLint、Prettier、Husky 与 6 个配置坑
description: 从前端规范体系到 CI 集成，讲透 lint-staged、commitlint、统一配置的最佳实践。
date: 2026-07-31
category: 前端
tags:
  - 工程化
  - ESLint
  - Prettier
  - Husky
---

# 前端工程化落地：ESLint、Prettier、Husky 与 6 个配置坑

工程化的目标不是"用更多工具"，而是**让代码风格和质量不依赖个人自觉**。本文以 Vue 3 + Vite 项目为例，落地一套"格式化 → 静态检查 → 提交拦截 → CI 兜底"的完整链路。

## 一、工具链全景

| 工具 | 职责 | 时机 |
|------|------|------|
| Prettier | 代码格式化（风格） | 保存时 |
| ESLint | 代码质量检查（规则） | 保存 + 构建 + CI |
| Stylelint | 样式检查 | 保存 + CI |
| Husky | git 钩子管理 | 提交前 |
| lint-staged | 只检查暂存文件 | 提交前 |
| commitlint | 提交信息规范 | 提交时 |

## 二、安装与基础配置

```bash
npm install -D eslint prettier eslint-plugin-vue \
  @vue/eslint-config-prettier husky lint-staged @commitlint/cli @commitlint/config-conventional
```

### ESLint 配置（.eslintrc.cjs）

```javascript
module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',   // Vue3 推荐规则
    '@vue/eslint-config-prettier',   // 关闭与 Prettier 冲突的规则
  ],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  rules: {
    'vue/multi-word-component-names': 'off', // 单文件组件名不强制多词
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
}
```

### Prettier 配置（.prettierrc）

```json
{
  "semi": false,
  "singleQuote": true,
  "printWidth": 100,
  "trailingComma": "all",
  "endOfLine": "auto"
}
```

**坑 1：ESLint 与 Prettier 规则冲突**——ESLint 里开缩进/引号/分号规则会与 Prettier 打架。解法：用 `eslint-config-prettier` 关掉冲突规则，让 Prettier 全权负责格式。

## 三、Husky + lint-staged：提交前自动检查

```bash
npx husky init
# 生成 .husky/pre-commit
```

```bash
# .husky/pre-commit
npx lint-staged
```

package.json 配置：

```json
{
  "lint-staged": {
    "*.{js,ts,vue}": ["eslint --fix", "prettier --write"],
    "*.{css,scss}": ["stylelint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

效果：git commit 时**只检查本次暂存的文件**，发现问题自动修复，修复不了就拦截提交。

**坑 2：lint-staged 匹配不到文件**——注意 glob 写法，`*.{js,ts}` 只匹配根目录，子目录文件需要 `**/*.{js,ts}` 或直接 `*.{js,ts}` 默认递归（不同版本行为不同）。建议显式写 `"*.{js,ts,vue}"`，新版 lint-staged 默认递归匹配。

## 四、commitlint：提交信息规范

```bash
# .husky/commit-msg
npx --no -- commitlint --edit $1
```

```javascript
// commitlint.config.cjs
module.exports = {
  extends: ['@commitlint/config-conventional'],
}
```

规范格式：`type(scope): subject`，例如：

```
feat(store): 新增 Pinia 全局主题状态
fix(router): 修复路由守卫死循环
```

**坑 3：commitlint 拦截到没有 scope 的提交**——`type: subject`（无括号 scope）是合法的，但很多人写成 `feat: xxx` 时配置了 `scope-enum` 导致误拦。如果不需要强制 scope，不要加 `scope-enum` 规则。

## 五、CI 集成：兜底防线

本地钩子可以被 `--no-verify` 跳过，CI 才是最后防线。GitHub Actions 示例：

```yaml
name: Lint & Type Check
on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'npm' }
      - run: npm ci
      - run: npm run lint        # eslint --fix=false
      - run: npx vue-tsc --noEmit # 类型检查
      - run: npm run build
```

**坑 4：CI 与本地 Node 版本不一致**——本地 Node 18、CI Node 20，依赖锁文件行为差异导致构建失败。用 `.nvmrc` 或 `engines` 固定版本，CI 与本地保持一致。

## 六、6 个高频配置坑汇总

## 坑 5：.gitignore 漏掉配置文件

**踩坑现场**：`.env.local` 未忽略，本地密钥被提交到仓库；或 `dist/` 未忽略导致构建产物入库。

**修复**：

```gitignore
node_modules/
dist/
*.local
.env
.env.*
!.env.example
```

## 坑 6：编辑器与 CLI 格式不一致

**踩坑现场**：VS Code 保存时格式化效果与 `npx prettier --write` 不一致，diff 反复跳动。

**修复**：

- VS Code 安装 ESLint + Prettier 插件。
- `.vscode/settings.json` 统一配置：

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.validate": ["javascript", "typescript", "vue"]
}
```

## 七、完整链路总结

```
保存文件 → Prettier 格式化 → ESLint 修复（编辑器）
提交代码 → Husky pre-commit → lint-staged 检查暂存区
         → Husky commit-msg → commitlint 校验提交信息
推送分支 → CI 跑全量 lint + 类型检查 + 构建
```

| 环节 | 工具 | 作用 |
|------|------|------|
| 开发时 | Prettier + ESLint | 即时反馈 |
| 提交时 | Husky + lint-staged | 拦截问题 |
| 提交信息 | commitlint | 规范历史 |
| CI | 全量检查 | 兜底防绕过 |

工程化的精髓是**把"该做什么"变成"不做就过不去"**——规范写进工具链，而不是靠约定和提醒。链路搭好之后，团队的代码风格和基本质量就有了底线。
