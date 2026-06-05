/**
 * Qlik WebSocket 数据服务
 * 
 * 通过 WSS 协议连接 Qlik 后台查询基金数据。
 * 开发环境使用 mock 数据，生产环境可切换为真实 Qlik WSS 连接。
 */

export interface QlikFundRecord {
  id: number;
  fund_name: string;
  fund_code: string;
  fund_type: string;
  nav_date: string | null;
  nav: string | null;
  shouyi: string | null;
  fund_url: string | null;
}

// ─── Mock 数据 ────────────────────────────

const mockFunds: QlikFundRecord[] = [
  { id: 1,  fund_name: '易方达蓝筹精选混合',       fund_code: '005827', fund_type: '混合型', nav_date: '2025-06-04', nav: '1.5823', shouyi: '-7.35',  fund_url: 'https://fund.eastmoney.com/005827.html' },
  { id: 2,  fund_name: '招商中证白酒指数(LOF)A',    fund_code: '161725', fund_type: '指数型', nav_date: '2025-06-04', nav: '0.9321', shouyi: '-12.45', fund_url: 'https://fund.eastmoney.com/161725.html' },
  { id: 3,  fund_name: '中欧医疗健康混合A',         fund_code: '003095', fund_type: '混合型', nav_date: '2025-06-04', nav: '1.2456', shouyi: '-18.23', fund_url: 'https://fund.eastmoney.com/003095.html' },
  { id: 4,  fund_name: '富国天惠成长混合(LOF)A',    fund_code: '161005', fund_type: '混合型', nav_date: '2025-06-04', nav: '2.3456', shouyi: '-5.12',  fund_url: 'https://fund.eastmoney.com/161005.html' },
  { id: 5,  fund_name: '华夏沪深300ETF联接A',       fund_code: '000051', fund_type: '指数型', nav_date: '2025-06-04', nav: '1.5678', shouyi: '8.45',   fund_url: 'https://fund.eastmoney.com/000051.html' },
  { id: 6,  fund_name: '易方达消费行业股票',         fund_code: '110022', fund_type: '股票型', nav_date: '2025-06-04', nav: '3.4567', shouyi: '2.15',   fund_url: 'https://fund.eastmoney.com/110022.html' },
  { id: 7,  fund_name: '天弘永利债券A',             fund_code: '420002', fund_type: '债券型', nav_date: '2025-06-04', nav: '1.2345', shouyi: '3.25',   fund_url: 'https://fund.eastmoney.com/420002.html' },
  { id: 8,  fund_name: '南方中证500ETF联接A',       fund_code: '160119', fund_type: '指数型', nav_date: '2025-06-04', nav: '1.7890', shouyi: '5.67',   fund_url: 'https://fund.eastmoney.com/160119.html' },
  { id: 9,  fund_name: '广发稳健增长混合A',          fund_code: '270002', fund_type: '混合型', nav_date: '2025-06-04', nav: '1.5678', shouyi: '-0.24',  fund_url: 'https://fund.eastmoney.com/270002.html' },
  { id: 10, fund_name: '博时信用债券A',             fund_code: '050011', fund_type: '债券型', nav_date: '2025-06-04', nav: '1.4567', shouyi: '4.12',   fund_url: 'https://fund.eastmoney.com/050011.html' },
  { id: 11, fund_name: '嘉实沪深300ETF联接(LOF)A',  fund_code: '160706', fund_type: '指数型', nav_date: '2025-06-04', nav: '1.2345', shouyi: '7.89',   fund_url: 'https://fund.eastmoney.com/160706.html' },
  { id: 12, fund_name: '天弘余额宝货币',            fund_code: '000198', fund_type: '货币型', nav_date: '2025-06-04', nav: '1.0000', shouyi: '1.85',   fund_url: 'https://fund.eastmoney.com/000198.html' },
  { id: 13, fund_name: '兴全合润混合(LOF)',         fund_code: '163406', fund_type: '混合型', nav_date: '2025-06-04', nav: '1.6789', shouyi: '-10.34', fund_url: 'https://fund.eastmoney.com/163406.html' },
  { id: 14, fund_name: '汇添富价值精选混合A',        fund_code: '519069', fund_type: '混合型', nav_date: '2025-06-04', nav: '2.3456', shouyi: '1.23',   fund_url: 'https://fund.eastmoney.com/519069.html' },
  { id: 15, fund_name: '易方达国防军工混合A',        fund_code: '001475', fund_type: '混合型', nav_date: '2025-06-04', nav: '1.2345', shouyi: '-15.67', fund_url: 'https://fund.eastmoney.com/001475.html' },
];

// ─── Qlik WSS 客户端 ──────────────────────

export interface QlikQueryParams {
  type?: string;
  keyword?: string;
}

export interface QlikWsOptions {
  /** Qlik WebSocket 服务地址，如 wss://qlik-server.example.com/app/engine */
  url: string;
  /** 是否启用 mock 模式（开发环境用） */
  useMock?: boolean;
  /** 超时时间（毫秒） */
  timeoutMs?: number;
}

/**
 * Qlik WebSocket 服务类
 * 
 * 封装与 Qlik 引擎的 WSS 连接，实现基金数据查询。
 * 开发环境默认使用 mock 数据，可切换到真实 Qlik 连接。
 */
export class QlikService {
  private options: QlikWsOptions;
  private ws: WebSocket | null = null;

  constructor(options: QlikWsOptions) {
    this.options = {
      useMock: true,
      timeoutMs: 10000,
      ...options,
    };
  }

  /** 查询基金数据 */
  async queryFunds(params: QlikQueryParams): Promise<QlikFundRecord[]> {
    if (this.options.useMock) {
      return this.mockQuery(params);
    }
    return this.wssQuery(params);
  }

  // ─── Mock 查询 ──────────────────────────

  private mockQuery(params: QlikQueryParams): QlikFundRecord[] {
    let data = [...mockFunds];

    if (params.type && params.type !== '全部') {
      data = data.filter((f) => f.fund_type === params.type);
    }

    if (params.keyword) {
      const kw = params.keyword.toLowerCase();
      data = data.filter(
        (f) =>
          f.fund_name.toLowerCase().includes(kw) ||
          f.fund_code.toLowerCase().includes(kw),
      );
    }

    return data;
  }

  // ─── 真实 Qlik WSS 查询 ──────────────────

  private wssQuery(params: QlikQueryParams): Promise<QlikFundRecord[]> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(this.options.url);
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error('Qlik WSS 连接超时'));
      }, this.options.timeoutMs);

      ws.onopen = () => {
        // 发送 Qlik 引擎查询请求
        // 格式根据 Qlik 引擎 API 调整
        const query = {
          method: 'query',
          params: {
            table: 'fund_test',
            fields: ['fund_name', 'fund_code', 'fund_type', 'nav_date', 'nav', 'shouyi', 'fund_url'],
            filter: {
              ...(params.type && params.type !== '全部' ? { fund_type: params.type } : {}),
              ...(params.keyword ? { keyword: params.keyword } : {}),
            },
          },
        };
        ws.send(JSON.stringify(query));
      };

      ws.onmessage = (event) => {
        clearTimeout(timeout);
        try {
          const response = JSON.parse(event.data as string);
          // 假设 Qlik 返回格式为 { data: QlikFundRecord[] }
          if (response.data) {
            resolve(response.data as QlikFundRecord[]);
          } else {
            reject(new Error('Qlik 返回数据格式异常'));
          }
        } catch {
          reject(new Error('Qlik 返回数据解析失败'));
        }
        ws.close();
      };

      ws.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Qlik WSS 连接失败'));
      };

      ws.onclose = () => {
        clearTimeout(timeout);
      };
    });
  }

  /** 断开连接 */
  disconnect(): void {
    this.ws?.close();
    this.ws = null;
  }

  /** 切换为真实 Qlik 模式 */
  enableLiveMode(url: string): void {
    this.options.url = url;
    this.options.useMock = false;
  }

  /** 切换为 Mock 模式 */
  enableMockMode(): void {
    this.options.useMock = true;
  }
}

/** 创建全局默认 QlikService 实例 */
export function createQlikService(useMock = true): QlikService {
  return new QlikService({
    url: process.env.QLIK_WSS_URL || 'wss://qlik-server.example.com/app/engine',
    useMock,
  });
}

/** 单例导出（便于全局复用） */
let defaultInstance: QlikService | null = null;

export function getQlikService(): QlikService {
  if (!defaultInstance) {
    defaultInstance = createQlikService(
      process.env.NODE_ENV === 'development' || process.env.COZE_PROJECT_ENV === 'DEV',
    );
  }
  return defaultInstance;
}