/**
 * 自定义 HTTP 服务器（Next.js + WebSocket）
 *   - HTTP + WS 共用端口 5000
 *   - WebSocket 端点：/ws/qlik（Qlik 数据推送）
 */

import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { WebSocketServer } from 'ws';
import { registerQlikHandler } from './ws-handlers/qlik';

const dev = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT || '5000', 10);

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  // ── WebSocket 路由 ──
  const qlikWss = new WebSocketServer({ noServer: true });
  registerQlikHandler(qlikWss);

  server.on('upgrade', (req, socket, head) => {
    const { pathname } = parse(req.url!);
    if (pathname === '/ws/qlik') {
      qlikWss.handleUpgrade(req, socket, head, (ws) => {
        qlikWss.emit('connection', ws, req);
      });
    } else {
      socket.destroy();
    }
  });

  server.listen(port, () => {
    console.log(
      `> Server listening at http://localhost:${port} (${dev ? 'development' : 'production'})`
    );
  });
});