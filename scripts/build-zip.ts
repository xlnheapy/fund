/**
 * 生产环境打包脚本
 * 将 Next.js 构建产物打包成 zip 文件，便于部署
 * 使用系统 zip 命令，无需额外依赖
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';

function createZip() {
  // 确保 dist 目录存在
  if (!existsSync('dist')) {
    mkdirSync('dist', { recursive: true });
  }

  // 删除旧的 zip 包
  if (existsSync('dist/fund-product-list.zip')) {
    execSync('rm -f dist/fund-product-list.zip');
  }

  try {
    // 使用系统 zip 命令打包
    execSync(
      'zip -r dist/fund-product-list.zip .next/ public/ package.json package-lock.json next.config.ts',
      { stdio: 'inherit' },
    );
    console.log('✓ 打包完成: dist/fund-product-list.zip');
  } catch {
    console.error('✗ 打包失败，请确认系统已安装 zip 命令');
    console.error('  Windows: 使用 PowerShell 执行 Compress-Archive');
    console.error('  Linux/Mac: apt install zip / brew install zip');
  }
}

createZip();
