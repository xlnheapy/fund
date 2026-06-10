/**
 * 生产环境打包脚本
 * 将 Next.js 构建产物打包成 zip 文件，便于部署
 */

import { createWriteStream } from 'fs';
import { ZipArchive } from 'archiver';

async function createZip() {
  const output = createWriteStream('dist/fund-product-list.zip');
  const archive = new ZipArchive({ zlib: { level: 9 } });

  output.on('close', () => {
    console.log(`✓ 打包完成: ${archive.pointer()} bytes`);
    console.log(`  文件: dist/fund-product-list.zip`);
  });

  archive.on('error', (err: Error) => {
    throw err;
  });

  archive.pipe(output);

  // 添加必要文件（纯 Next.js 项目，无需自定义 server）
  archive.directory('.next/', '.next');
  archive.directory('public/', 'public');
  archive.file('package.json', { name: 'package.json' });
  archive.file('package-lock.json', { name: 'package-lock.json' });
  archive.file('next.config.ts', { name: 'next.config.ts' });

  await archive.finalize();
}

createZip().catch(console.error);
