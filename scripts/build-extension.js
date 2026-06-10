/**
 * Qlik Sense Extension 打包脚本
 * 
 * 将 Extension 文件打包成 zip 格式，用于上传到 Qlik Sense
 * 
 * zip 包结构：
 * fund-list.zip
 * └── fund-list/
 *     ├── fund-list.qext
 *     ├── fund-list.js
 *     └── style.css
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const EXTENSION_NAME = 'fund-list';
const DIST_DIR = path.join(__dirname, '..', 'dist');
const EXTENSION_DIR = path.join(DIST_DIR, EXTENSION_NAME);
const ZIP_FILE = path.join(DIST_DIR, `${EXTENSION_NAME}.zip`);

// 需要打包的文件
const FILES_TO_COPY = [
  { src: `${EXTENSION_NAME}.qext`, dest: `${EXTENSION_NAME}.qext` },
  { src: `${EXTENSION_NAME}.js`, dest: `${EXTENSION_NAME}.js` },
  { src: 'style.css', dest: 'style.css' },
];

function build() {
  console.log('[build-extension] 开始构建 Qlik Sense Extension...\n');

  // 1. 清理旧的 dist 目录
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true });
  }
  fs.mkdirSync(EXTENSION_DIR, { recursive: true });
  console.log(`✓ 创建目录: ${EXTENSION_DIR}`);

  // 2. 复制文件到 dist/fund-list/
  FILES_TO_COPY.forEach(file => {
    const srcPath = path.join(__dirname, '..', file.src);
    const destPath = path.join(EXTENSION_DIR, file.dest);

    if (!fs.existsSync(srcPath)) {
      console.error(`✗ 源文件不存在: ${file.src}`);
      process.exit(1);
    }

    fs.copyFileSync(srcPath, destPath);
    console.log(`✓ 复制: ${file.src} -> dist/${EXTENSION_NAME}/${file.dest}`);
  });

  // 3. 打包成 zip
  try {
    // 删除旧的 zip 文件
    if (fs.existsSync(ZIP_FILE)) {
      fs.unlinkSync(ZIP_FILE);
    }

    // 使用系统 zip 命令打包
    // 注意：zip 包内必须包含 fund-list/ 目录
    execSync(`cd "${DIST_DIR}" && zip -r "${ZIP_FILE}" "${EXTENSION_NAME}"`, {
      stdio: 'inherit'
    });

    const stats = fs.statSync(ZIP_FILE);
    console.log(`\n✓ 打包完成: dist/${EXTENSION_NAME}.zip (${(stats.size / 1024).toFixed(2)} KB)`);
  } catch (error) {
    console.error('\n✗ 打包失败，请确认系统已安装 zip 命令');
    console.error('  Windows: 使用 PowerShell 执行 Compress-Archive');
    console.error('  Linux/Mac: apt install zip / brew install zip');
    process.exit(1);
  }

  console.log('\n[build-extension] 构建完成！');
  console.log(`\n上传到 Qlik Sense:`);
  console.log(`  1. 打开 Qlik Sense Management Console`);
  console.log(`  2. 进入 Extensions 管理页面`);
  console.log(`  3. 点击 "Upload" 或 "Import"`);
  console.log(`  4. 选择 dist/${EXTENSION_NAME}.zip 文件`);
  console.log(`  5. 等待上传完成`);
}

build();
