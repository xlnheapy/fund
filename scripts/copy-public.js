/**
 * 复制静态资源到 dist 目录
 * 用于生产构建，确保静态资源在 dist 目录中
 */

const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`[copy-assets] 源目录不存在: ${src}，跳过复制`);
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

function copyFile(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`[copy-assets] 源文件不存在: ${src}，跳过复制`);
    return;
  }

  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  fs.copyFileSync(src, dest);
}

const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

// 1. 复制 public 目录
const publicDir = path.join(rootDir, 'public');
const distPublicDir = path.join(distDir, 'public');
copyDir(publicDir, distPublicDir);
console.log(`[copy-assets] ✓ 已复制 public -> dist/public`);

// 2. 复制根目录下的指定文件（按需添加）
const filesToCopy = [
  { src: 'test.qext', dest: 'test.qext' },
  // 可以继续添加其他文件，例如：
  // { src: 'config.json', dest: 'config.json' },
  // { src: 'README.md', dest: 'README.md' },
];

for (const file of filesToCopy) {
  const srcPath = path.join(rootDir, file.src);
  const destPath = path.join(distDir, file.dest);
  copyFile(srcPath, destPath);
  console.log(`[copy-assets] ✓ 已复制 ${file.src} -> dist/${file.dest}`);
}
