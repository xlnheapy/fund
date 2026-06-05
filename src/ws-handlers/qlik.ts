/**
 * /ws/qlik WebSocket 端点处理器
 *
 * 客户端可通过此 WS 端点实时获取 Qlik 基金数据推送。
 * 当前使用 mock 数据模拟 Qlik 实时推送。
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

      // 订阅实时更新（预留 Qlik 推送）
      if (msg.type === 'funds:subscribe') {
        // TODO: 在此注册 Qlik 实时推送监听
        ws.send(
          JSON.stringify({
            type: 'funds:subscribed',
            payload: { message: '已订阅基金数据实时更新' },
          }),
        );
      }
    });

    ws.on('close', () => {
      console.log('[WS /ws/qlik] 客户端已断开');
    });
  });
}