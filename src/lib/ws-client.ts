/** WebSocket 客户端工具 */

export interface WsMessage<T = unknown> {
  type: string;
  payload: T;
}

export interface WsOptions {
  path: string;
  onMessage: (msg: WsMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
  reconnect?: boolean;
  heartbeatMs?: number;
}

/**
 * 创建 WebSocket 连接
 * 后端 WS 端点路径统一为 /ws/* 前缀
 */
export function createWsConnection(opts: WsOptions): {
  send: (msg: WsMessage) => void;
  close: () => void;
} {
  const {
    path,
    onMessage,
    onOpen,
    onClose,
    reconnect = true,
    heartbeatMs = 30000,
  } = opts;

  let ws: WebSocket;
  let heartbeatTimer: ReturnType<typeof setInterval>;
  let closed = false;

  function connect() {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${protocol}//${location.host}${path}`);

    ws.onopen = () => {
      heartbeatTimer = setInterval(
        () => ws.send(JSON.stringify({ type: 'ping', payload: null })),
        heartbeatMs,
      );
      onOpen?.();
    };

    ws.onmessage = (e) => {
      const msg: WsMessage = JSON.parse(e.data);
      if (msg.type === 'pong') return;
      onMessage(msg);
    };

    ws.onclose = () => {
      clearInterval(heartbeatTimer);
      onClose?.();
      if (reconnect && !closed) setTimeout(connect, 1000);
    };
  }

  connect();

  return {
    send: (msg) => ws.readyState === WebSocket.OPEN && ws.send(JSON.stringify(msg)),
    close: () => {
      closed = true;
      ws.close();
    },
  };
}