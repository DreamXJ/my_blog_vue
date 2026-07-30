#!/usr/bin/env node
/**
 * gh-pages 一键部署脚本
 * 用法: npm run deploy
 *
 * 构建后自动推送 dist/ 到 gh-pages 分支
 */
import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { resolve } from 'path'

const distDir = resolve(process.cwd(), 'dist')

if (!existsSync(distDir)) {
  console.log('⚠️  dist 目录不存在，请先执行 npm run build')
  process.exit(1)
}

console.log('')
console.log('🚀  部署到 GitHub Pages...')
console.log('')

try {
  execSync('npx gh-pages -d dist -b gh-pages --dotfiles', {
    stdio: 'inherit',
    cwd: process.cwd()
  })
  console.log('')
  console.log('✅  部署成功！')
  console.log('')
  console.log('🌐  访问地址: https://你的用户名.github.io/仓库名/')
  console.log('')
  console.log('⚠️  请确保:')
  console.log('  1. 仓库 Settings > Pages 中 Source 设置为 gh-pages 分支')
  console.log('  2. vite.config.js 中的 base 路径与仓库名一致')
  console.log('  3. 如果使用自定义域名，在 public/CNAME 中配置')
  console.log('')
} catch (err) {
  console.error('')
  console.error('❌  部署失败:', err.message)
  console.error('')
  process.exit(1)
}
