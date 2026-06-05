/**
 * 自定义 HTTP + WebSocket 服务器
 * HTTP 与 WS 共用 5000 端口
 */

import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { WebSocketServer } from 'ws';
import type { IncomingMessage } from 'http';
import type { Duplex } from 'stream';
import { setupQlikWsHandler } from './ws-handlers/qlik';

const dev = process.env.COZE_PROJECT_ENV !== 'PROD';
const hostname = process.env.HOSTNAME || 'localhost';
const PORT = parseInt(process.env.DEPLOY_RUN_PORT || '5000', 10);

const app = next({ dev, hostname, port: PORT });
const handle = app.getRequestHandler();

// ─── WS 路由注册 ─────────────────────────
const wssMap = new Map<string, WebSocketServer>();

function registerWsEndpoint(path: string): WebSocketServer {
  const wss = new WebSocketServer({ noServer: true });
  wssMap.set(path, wss);
  return wss;
}

function handleUpgrade(req: IncomingMessage, socket: Duplex, head: Buffer) {
  const { pathname } = new URL(req.url!, `http://${req.headers.host}`);
  const wss = wssMap.get(pathname);
  if (wss) {
    wss.handleUpgrade(req, socket, head, (ws) =>
      wss.emit('connection', ws, req),
    );
  } else if (!dev) {
    socket.destroy();
  }
}

// ─── 注册端点 ────────────────────────────
const qlikWss = registerWsEndpoint('/ws/qlik');
setupQlikWsHandler(qlikWss);

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  server.once('error', (err) => {
    console.error(err);
    process.exit(1);
  });

  server.on('upgrade', handleUpgrade);

  server.listen(PORT, () => {
    console.log(
      `> Server listening at http://${hostname}:${PORT} as ${
        dev ? 'development' : process.env.COZE_PROJECT_ENV
      }`,
    );
  });
});