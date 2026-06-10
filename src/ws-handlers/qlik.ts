/**
 * /ws/qlik WebSocket 端点处理器
 *
 * 客户端可通过此 WS 端点从 Qlik 查询基金数据（只读，不推送）。
 * 开发环境使用 mock 数据模拟 Qlik 查询。
 */

import { WebSocket, type WebSocketServer } from 'ws';
import type { WsMessage } from '../lib/ws-client';
import { getQlikService } from '../lib/qlik-service';

export function setupQlikWsHandler(wss: WebSocketServer): void {
  wss.on('connection', (ws: WebSocket) => {
    console.log('[WS /ws/qlik] 客户端已连接');

    ws.on('message', async (raw) => {
      const msg: WsMessage = JSON.parse(raw.toString());

      // 心跳
      if (msg.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', payload: null }));
        return;
      }

      // 查询基金数据
      if (msg.type === 'funds:query') {
        const { type, keyword } = msg.payload as {
          type?: string;
          keyword?: string;
        };
        const service = getQlikService();
        const data = await service.queryFunds({ type, keyword });

        ws.send(
          JSON.stringify({
            type: 'funds:result',
            payload: { data },
          }),
        );
        return;
      }
    });

    ws.on('close', () => {
      console.log('[WS /ws/qlik] 客户端已断开');
    });
  });
}