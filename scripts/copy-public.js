/**
 * 复制 public 目录到 dist/public
 * 用于生产构建，确保静态资源在 dist 目录中
 */

const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`[copy-public] 源目录不存在: ${src}，跳过复制`);
    return;
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const publicDir = path.join(__dirname, '..', 'public');
const distPublicDir = path.join(__dirname, '..', 'dist', 'public');

copyDir(publicDir, distPublicDir);
console.log(`[copy-public] ✓ 已复制 public -> dist/public`);
