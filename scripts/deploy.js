#!/usr/bin/env node
/**
 * gh-pages 一键部署脚本
 * 用法: npm run deploy
 *
 * 构建后自动推送 dist/ 到 GitHub 仓库的 main 分支
 */
import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { resolve } from 'path'

const GIT_REPO = 'https://github.com/DreamXJ/my_blog_vue.git'
const distDir = resolve(process.cwd(), 'dist')

if (!existsSync(distDir)) {
  console.log('⚠️  dist 目录不存在，请先执行 npm run build')
  process.exit(1)
}

console.log('')
console.log('🚀  部署到 GitHub Pages...')
console.log('')

const dateStr = new Date().toISOString().slice(0, 10)
const customMsg = process.argv[2]
const COMMIT_MSG = customMsg ? `deploy: ${customMsg}` : `deploy: 更新静态资源 ${dateStr}`

console.log(`📝  提交信息: ${COMMIT_MSG}`)

try {
  execSync(`npx gh-pages -d dist -b main --repo ${GIT_REPO} --dotfiles -m "${COMMIT_MSG}"`, {
    stdio: 'inherit',
    cwd: process.cwd()
  })
  console.log('')
  console.log('✅  部署成功！')
  console.log('')
  console.log('🌐  仓库地址: https://github.com/DreamXJ/my_blog_vue')
  console.log('')
} catch (err) {
  console.error('')
  console.error('❌  部署失败:', err.message)
  console.error('')
  process.exit(1)
}
