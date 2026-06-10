/**
 * =============================================================================
 * Qlik WebSocket 数据服务（QlikService）
 * =============================================================================
 *
 * 【作用】
 *   通过 WebSocket Secure (WSS) 协议连接 Qlik 后台引擎，查询 fund_test 表中的
 *   基金产品数据。开发环境默认使用内置 mock 数据页面可直接展示，生产环境可
 *   一键切换为真实 Qlik WSS 连接。
 *
 * 【enigma.js 说明】
 *   enigma.js 是 Qlik 官方提供的 JavaScript SDK，封装了 WSS 握手和 Qlik Engine
 *   API 调用。但当前代码未强制依赖它——下方的 wssQuery() 方法使用原生 WebSocket
 *   直接与 Qlik 通信，这样更通用、不依赖第三方包。
 *   如果你需要使用 enigma.js，安装方式：
 *     pnpm add enigma.js
 *   然后用 enigma.create({ schema, url }) 替换下方的原生 WS 实现。
 *
 * 【切换为真实 Qlik 的步骤】
 *   1. 修改环境变量 QLIK_WSS_URL，指向你的 Qlik 引擎地址
 *      例如：wss://your-qlik-server:4747/app/engineData
 *   2. 调用 qlikService.enableLiveMode('wss://...')
 *   3. 根据 Qlik 返回的实际数据格式调整 wssQuery() 中的解析逻辑
 *   4. mock 数据只是开发演示用，上线后去掉
 *
 * =============================================================================
 */

// ──────────────────────────────────────────────────────────────────────────────
// 基金数据类型定义 （与数据库 fund_test 表字段一一对应）
// ──────────────────────────────────────────────────────────────────────────────
export interface QlikFundRecord {
  id: number;           // 自增主键
  fund_name: string;    // 基金简称  ← 来自 qlik fund_test.fund_name
  fund_code: string;    // 基金代码  ← 来自 qlik fund_test.fund_code
  fund_type: string;    // 基金类型  ← 来自 qlik fund_test.fund_type（用于 Tab 分类）
  nav_date: string | null;     // 净值日期  ← 来自 qlik fund_test.nav_date
  nav: string | null;          // 单位净值  ← 来自 qlik fund_test.nav
  shouyi: string | null;       // 近一年收益率(%) ← 来自 qlik fund_test.shouyi
  fund_url: string | null;     // 基金详情页链接 ← 来自 qlik fund_test.fund_url
}

// ──────────────────────────────────────────────────────────────────────────────
// Mock 数据 —— 15 只基金产品
// 开发环境使用这些数据展示页面，真实上线后替换为 Qlik 查询结果
// ──────────────────────────────────────────────────────────────────────────────
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

// ──────────────────────────────────────────────────────────────────────────────
// 查询参数类型
// ──────────────────────────────────────────────────────────────────────────────
export interface QlikQueryParams {
  /** 基金类型筛选，对应 fund_type 字段，如 "股票型"、"债券型" */
  type?: string;
  /** 搜索关键词，匹配 fund_name 或 fund_code */
  keyword?: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// QlikService 构造选项
// ──────────────────────────────────────────────────────────────────────────────
export interface QlikWsOptions {
  /**
   * Qlik WebSocket 服务器地址
   * 真实环境示例：wss://qlik-server.company.com:4747/app/engineData
   * 开发环境（mock 模式）下此字段不生效，仅为占位
   */
  url: string;
  /**
   * 是否使用本地 Mock 数据
   * - true（默认）→ 返回上方 mockFunds 数组，无需真实 Qlik 连接
   * - false       → 通过 WSS 连接真实 Qlik 引擎查询
   */
  useMock?: boolean;
  /** WSS 连接超时时间（毫秒），默认 10000ms */
  timeoutMs?: number;
}

// ──────────────────────────────────────────────────────────────────────────────
// QlikService 类
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Qlik 数据服务类
 *
 * 【职责】
 *   封装与 Qlik 引擎的 WSS 通信，对外提供 queryFunds() 统一查询接口。
 *   调用方（API 路由 / 前端）无需关心数据来自 mock 还是真实 Qlik。
 *
 * 【使用方式】
 *   const qlik = getQlikService();
 *   const funds = await qlik.queryFunds({ type: '债券型' });
 *
 * 【接入真实 Qlik 步骤】
 *   1. 确定 Qlik 引擎的 WSS 地址（如 wss://192.168.1.100:4747/app/engineData）
 *   2. 调用 qlik.enableLiveMode('wss://真实地址')
 *   3. 根据真实 Qlik 返回的数据格式，调整下方 wssQuery() 中的
 *      消息结构和解析逻辑（第 166~208 行）
 */
export class QlikService {
  private options: QlikWsOptions;
  private ws: WebSocket | null = null;

  constructor(options: QlikWsOptions) {
    // 默认配置：useMock=true（开发环境使用 mock），超时 10 秒
    this.options = {
      useMock: true,
      timeoutMs: 10000,
      ...options,
    };
  }

  /**
   * 统一查询入口 —— 所有外部调用都走此方法
   *
   * @param params 查询参数（type=基金类型，keyword=搜索词）
   * @returns 匹配的基金记录数组
   *
   * 【工作流程】
   *   1. useMock=true  → 直接走本地 mockQuery()，无网络请求
   *   2. useMock=false → 走 wssQuery()，通过 WebSocket 连接真实 Qlik
   */
  async queryFunds(params: QlikQueryParams): Promise<QlikFundRecord[]> {
    if (this.options.useMock) {
      return this.mockQuery(params);       // ← 开发环境：本地过滤 mock 数据
    }
    return this.wssQuery(params);          // ← 生产环境：连接真实 Qlik
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Mock 查询（本地数据模拟）
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * 在本地 mockFunds 数组中执行过滤，模拟 Qlik 查询效果
   *
   * 【参数说明】
   *   params.type    — 基金类型（对应 fund_type 字段）
   *   params.keyword — 搜索关键词（匹配 fund_name 或 fund_code）
   *
   * 【返回】
   *   过滤后的 QlikFundRecord[]，字段格式与真实 Qlik 返回一致
   */
  private mockQuery(params: QlikQueryParams): QlikFundRecord[] {
    let data = [...mockFunds];

    // 按基金类型筛选（"全部"不过滤）
    if (params.type && params.type !== '全部') {
      data = data.filter((f) => f.fund_type === params.type);
    }

    // 按关键词搜索基金名称或代码
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

  // ═══════════════════════════════════════════════════════════════════════════
  // 真实 Qlik WSS 查询（生产环境使用）
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * 通过 WebSocket 连接真实 Qlik 引擎，发送查询请求并获取结果
   *
   * 【通信流程】
   *   1. 创建 WebSocket 连接 → this.options.url
   *   2. 连接建立后发送 JSON 查询消息（详见 onopen 回调）
   *   3. 监听 message 事件，解析 Qlik 返回的数据
   *   4. 超时/错误时 reject
   *
   * 【消息格式说明】
   *   下方发送的 JSON 结构是示例格式，实际需根据 Qlik Engine API
   *   （Qlik Associative Engine 或 Qlik Core）调整：
   *     - Qlik Engine API 老版本：发送 JSON-RPC 格式
   *     - enigma.js 方式：使用 enigma.create({ schema, url }) 连接
   *       然后通过 session.app.createSessionObject() 获取数据
   *     - Qlik Cloud：使用 REST API 替代 WSS
   *
   * 【请根据你的 Qlik 版本修改以下内容】
   *
   * @param params 查询参数
   * @returns Promise<QlikFundRecord[]>
   */
  private wssQuery(params: QlikQueryParams): Promise<QlikFundRecord[]> {
    return new Promise((resolve, reject) => {
      // ── 建立 WSS 连接 ──────────────────────────────────────────────
      const ws = new WebSocket(this.options.url);

      // 设置超时定时器，防止连接挂死
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error('Qlik WSS 连接超时'));
      }, this.options.timeoutMs);

      // ── 连接成功：发送查询请求 ────────────────────────────────────
      // 【TODO】根据 Qlik 引擎实际的消息协议修改以下内容
      ws.onopen = () => {
        // 示例：发送一个简单的 JSON 查询
        // 如果使用 enigma.js，此处应替换为：
        //   const session = enigma.create({ schema, url: this.options.url });
        //   const engine = await session.open();
        //   const app = await engine.openDoc('your-app.qvf');
        //   table = await app.createSessionObject({ ... });
        const query = {
          method: 'query',                    // 方法名（示例）
          params: {
            table: 'fund_test',               // 查询表名
            fields: [                         // 查询字段列表
              'fund_name', 'fund_code', 'fund_type',
              'nav_date', 'nav', 'shouyi', 'fund_url',
            ],
            filter: {
              // 按类型筛选（"全部"不传筛选条件）
              ...(params.type && params.type !== '全部'
                ? { fund_type: params.type }
                : {}),
              // 关键词搜索
              ...(params.keyword
                ? { keyword: params.keyword }
                : {}),
            },
          },
        };
        ws.send(JSON.stringify(query));
      };

      // ── 收到 Qlik 返回数据 ────────────────────────────────────────
      // 【TODO】根据 Qlik 引擎实际的返回格式修改解析逻辑
      ws.onmessage = (event) => {
        clearTimeout(timeout);
        try {
          const response = JSON.parse(event.data as string);
          // 假设 Qlik 返回 { data: QlikFundRecord[] }
          // 请根据实际返回结构调整
          if (response.data) {
            resolve(response.data as QlikFundRecord[]);
          } else {
            reject(new Error('Qlik 返回数据格式异常，缺少 data 字段'));
          }
        } catch {
          reject(new Error('Qlik 返回数据 JSON 解析失败'));
        }
        ws.close(); // 查询完成，关闭连接
      };

      // ── 连接错误 ──────────────────────────────────────────────────
      ws.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Qlik WSS 连接失败，请检查服务器地址和网络'));
      };

      // ── 连接关闭 ──────────────────────────────────────────────────
      ws.onclose = () => {
        clearTimeout(timeout);
      };
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 生命周期方法
  // ═══════════════════════════════════════════════════════════════════════════

  /** 主动断开当前 WSS 连接 */
  disconnect(): void {
    this.ws?.close();
    this.ws = null;
  }

  /**
   * 切换为真实 Qlik 模式
   * 调用此方法后，queryFunds() 将走 wssQuery() 连接真实 Qlik
   *
   * @param url Qlik 引擎的 WSS 地址
   *
   * 示例:
   *   qlikService.enableLiveMode('wss://192.168.1.100:4747/app/engineData');
   */
  enableLiveMode(url: string): void {
    this.options.url = url;
    this.options.useMock = false;
  }

  /** 切回 Mock 模式 */
  enableMockMode(): void {
    this.options.useMock = true;
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// 工厂函数 & 单例
// ──────────────────────────────────────────────────────────────────────────────

/**
 * 创建 QlikService 实例
 *
 * @param useMock 是否启用 mock（开发环境=true，生产环境=false）
 * @returns QlikService 实例
 *
 * 【环境变量】
 *   可通过 QLIK_WSS_URL 环境变量指定 Qlik 服务器地址
 *   如果未设置，默认使用占位地址
 */
export function createQlikService(useMock = true): QlikService {
  return new QlikService({
    url: process.env.QLIK_WSS_URL || 'wss://qlik-server.example.com/app/engine',
    useMock,
  });
}

/**
 * 全局单例（推荐使用）
 *
 * 【自动判断模式】
 *   - 开发环境（NODE_ENV=development）→ useMock=true
 *   - 生产环境 → useMock=false（需设置 QLIK_WSS_URL）
 *
 * 【使用方式】
 *   import { getQlikService } from '@/lib/qlik-service';
 *   const funds = await getQlikService().queryFunds({ type: '股票型' });
 */
let defaultInstance: QlikService | null = null;

export function getQlikService(): QlikService {
  if (!defaultInstance) {
    defaultInstance = createQlikService(
      // 开发环境或没有配置 QLIK_WSS_URL 时自动使用 mock 数据
      process.env.NODE_ENV === 'development' || !process.env.QLIK_WSS_URL,
    );
  }
  return defaultInstance;
}