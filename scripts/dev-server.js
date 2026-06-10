/**
 * 本地开发服务器
 * 
 * 启动一个简单的 HTTP 服务器，用于本地预览 Qlik Sense Extension
 * 使用 Mock 数据模拟 Qlik 环境
 * 
 * 使用方法：npm run dev
 * 访问地址：http://localhost:3000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT_DIR = path.join(__dirname, '..');

// MIME 类型映射
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// 创建 HTTP 服务器
const server = http.createServer((req, res) => {
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(ROOT_DIR, filePath);

  // 获取文件扩展名
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  // 读取文件
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 文件不存在');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 服务器错误');
      }
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

// 启动服务器
server.listen(PORT, () => {
  console.log(`\n🚀 Qlik Sense Extension 本地预览服务器已启动`);
  console.log(`\n   访问地址: http://localhost:${PORT}`);
  console.log(`   数据模式: Mock 数据\n`);
  console.log(`   按 Ctrl+C 停止服务器\n`);
});
