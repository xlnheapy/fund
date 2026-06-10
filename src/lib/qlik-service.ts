/**
 * =============================================================================
 * Qlik 数据服务（QlikService）— 使用 enigma.js 对接 Qlik Engine
 * =============================================================================
 *
 * 【作用】
 *   通过 enigma.js（Qlik 官方 JS SDK）连接 Qlik Engine，查询 fund_test 表中的
 *   基金产品数据。开发环境默认使用内置 mock 数据，生产环境连接真实 Qlik。
 *
 * 【enigma.js 说明】
 *   enigma.js 是 Qlik 官方提供的 JavaScript SDK，封装了 WSS 握手和 Qlik Engine
 *   JSON-RPC 协议。通过它可以打开 Qlik App、创建 Session Object、查询数据。
 *
 * 【环境变量】
 *   QLIK_WSS_URL  — Qlik Engine WSS 地址，如 wss://qlik-server:4747/app/engineData
 *   QLIK_APP_ID   — Qlik App ID（.qvf 文件对应的 GUID）
 *
 * 【切换为真实 Qlik 的步骤】
 *   1. 设置环境变量 QLIK_WSS_URL 和 QLIK_APP_ID
 *   2. 根据 Qlik 实际数据模型调整 buildHyperCube() 中的字段映射
 *   3. 未配置 QLIK_WSS_URL 时自动使用 mock 数据
 *
 * =============================================================================
 */

import enigma from 'enigma.js';
import schema from 'enigma.js/schemas/12.2015.0.json';

// ──────────────────────────────────────────────────────────────────────────────
// 基金数据类型定义（与 fund_test 表字段一一对应）
// ──────────────────────────────────────────────────────────────────────────────
export interface QlikFundRecord {
  id: number;           // 自增主键
  fund_name: string;    // 基金简称
  fund_code: string;    // 基金代码
  fund_type: string;    // 基金类型（用于 Tab 分类）
  nav_date: string | null;     // 净值日期
  nav: string | null;          // 单位净值
  shouyi: string | null;       // 近一年收益率(%)
  fund_url: string | null;     // 基金详情页链接
}

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
// Mock 数据 — 15 只基金产品（开发环境使用）
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
// QlikService 类 — 使用 enigma.js 连接 Qlik Engine
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Qlik 数据服务类
 *
 * 【职责】
 *   封装与 Qlik Engine 的通信（通过 enigma.js），对外提供 queryFunds() 统一查询接口。
 *   调用方（API 路由）无需关心数据来自 mock 还是真实 Qlik。
 *
 * 【使用方式】
 *   const qlik = getQlikService();
 *   const funds = await qlik.queryFunds({ type: '债券型' });
 *
 * 【接入真实 Qlik 步骤】
 *   1. 设置环境变量 QLIK_WSS_URL（如 wss://192.168.1.100:4747/app/engineData）
 *   2. 设置环境变量 QLIK_APP_ID（Qlik App 的 GUID）
 *   3. 根据实际数据模型调整 buildHyperCubeDef() 中的字段定义
 */
export class QlikService {
  private wssUrl: string;
  private appId: string;
  private useMock: boolean;

  constructor(options: { wssUrl: string; appId: string; useMock: boolean }) {
    this.wssUrl = options.wssUrl;
    this.appId = options.appId;
    this.useMock = options.useMock;
  }

  /**
   * 统一查询入口
   *
   * @param params 查询参数（type=基金类型，keyword=搜索词）
   * @returns 匹配的基金记录数组
   *
   * 【工作流程】
   *   1. useMock=true  → 本地 mockQuery()，无网络请求
   *   2. useMock=false → enigmaQuery()，通过 enigma.js 连接真实 Qlik
   */
  async queryFunds(params: QlikQueryParams): Promise<QlikFundRecord[]> {
    if (this.useMock) {
      return this.mockQuery(params);
    }
    return this.enigmaQuery(params);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Mock 查询（本地数据模拟）
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * 在本地 mockFunds 数组中执行过滤，模拟 Qlik 查询效果
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
  // enigma.js 真实 Qlik 查询（生产环境使用）
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * 通过 enigma.js 连接 Qlik Engine，查询 fund_test 表数据
   *
   * 【通信流程】
   *   1. enigma.create() 创建会话 → 通过 WSS 连接 Qlik Engine
   *   2. session.open() → 获取全局接口（Global）
   *   3. global.openDoc(appId) → 打开指定 Qlik App
   *   4. app.createSessionObject(hyperCubeDef) → 创建临时对象查询数据
   *   5. 从 hyperCube 数据矩阵中解析出 QlikFundRecord[]
   *   6. session.close() → 关闭连接
   *
   * 【数据模型假设】
   *   Qlik App 中存在 fund_test 表，包含以下字段：
   *   fund_name, fund_code, fund_type, nav_date, nav, shouyi, fund_url
   *   如果实际字段名不同，请修改 buildHyperCubeDef() 中的 qFieldDefs
   */
  private async enigmaQuery(params: QlikQueryParams): Promise<QlikFundRecord[]> {
    let session: ReturnType<typeof enigma.create> | null = null;

    try {
      // ── 1. 创建 enigma 会话并连接 ──
      session = enigma.create({
        schema,
        url: this.wssUrl,
      });

      // 监听连接事件（调试用）
      session.on('opened', () => {
        console.log('[Qlik] enigma.js 会话已连接');
      });
      session.on('closed', () => {
        console.log('[Qlik] enigma.js 会话已关闭');
      });
      session.on('notification', (data: unknown) => {
        console.log('[Qlik] 通知:', data);
      });

      // ── 2. 打开全局接口 ──
      const global = await session.open() as any;

      // ── 3. 打开 Qlik App ──
      const app = await global.openDoc(this.appId) as any;

      // ── 4. 创建 Session Object（HyperCube 查询） ──
      const hyperCubeDef = this.buildHyperCubeDef(params);

      const sessionObj = await app.createSessionObject({
        qInfo: { qType: 'fund-list' },
        qHyperCubeDef: hyperCubeDef,
      }) as any;

      // ── 5. 获取数据布局 ──
      const layout = await sessionObj.getLayout() as any;
      const hyperCube = layout.qHyperCube;

      if (!hyperCube || !hyperCube.qDataPages || hyperCube.qDataPages.length === 0) {
        console.warn('[Qlik] 未返回数据页');
        return [];
      }

      // ── 6. 解析 HyperCube 数据矩阵 → QlikFundRecord[] ──
      const dataPage = hyperCube.qDataPages[0];
      const matrix: any[][] = dataPage.qMatrix || [];

      const funds: QlikFundRecord[] = [];
      for (let i = 0; i < matrix.length; i++) {
        const row = matrix[i];
        // 每行有 7 列，对应 HyperCube 中定义的 7 个维度
        // 列顺序: fund_name(0), fund_code(1), fund_type(2), nav_date(3), nav(4), shouyi(5), fund_url(6)
        funds.push({
          id: i + 1,
          fund_name: row[0]?.qText ?? '',
          fund_code: row[1]?.qText ?? '',
          fund_type: row[2]?.qText ?? '',
          nav_date: row[3]?.qText ?? null,
          nav: row[4]?.qText ?? null,
          shouyi: row[5]?.qText ?? null,
          fund_url: row[6]?.qText ?? null,
        });
      }

      // ── 7. 本地过滤（如果 Qlik 端未做筛选） ──
      // 注意：如果 Qlik 数据模型已配置好 Selection/Filter，此处可省略
      let result = funds;

      if (params.type && params.type !== '全部') {
        result = result.filter((f) => f.fund_type === params.type);
      }
      if (params.keyword) {
        const kw = params.keyword.toLowerCase();
        result = result.filter(
          (f) =>
            f.fund_name.toLowerCase().includes(kw) ||
            f.fund_code.toLowerCase().includes(kw),
        );
      }

      return result;
    } catch (error) {
      console.error('[Qlik] enigma.js 查询失败:', error);
      throw new Error(
        `Qlik 查询失败: ${error instanceof Error ? error.message : '未知错误'}`,
      );
    } finally {
      // ── 8. 关闭会话 ──
      if (session) {
        try {
          await session.close();
        } catch {
          // 忽略关闭错误
        }
      }
    }
  }

  /**
   * 构建 HyperCube 定义 — 定义要从 Qlik 查询的字段
   *
   * 【重要】
   *   qFieldDefs 中的字段名必须与 Qlik App 数据模型中的字段名一致。
   *   如果实际字段名不同（如大小写、前缀等），请在此处修改。
   *
   * @param params 查询参数（当前用于日志记录，实际筛选可在 Qlik 端通过 Selection 实现）
   * @returns Qlik HyperCube 定义对象
   */
  private buildHyperCubeDef(params: QlikQueryParams) {
    return {
      qDimensions: [
        { qDef: { qFieldDefs: ['fund_name'], qFieldLabels: ['基金简称'] } },
        { qDef: { qFieldDefs: ['fund_code'], qFieldLabels: ['基金代码'] } },
        { qDef: { qFieldDefs: ['fund_type'], qFieldLabels: ['基金类型'] } },
        { qDef: { qFieldDefs: ['nav_date'], qFieldLabels: ['净值日期'] } },
        { qDef: { qFieldDefs: ['nav'], qFieldLabels: ['单位净值'] } },
        { qDef: { qFieldDefs: ['shouyi'], qFieldLabels: ['近一年收益率'] } },
        { qDef: { qFieldDefs: ['fund_url'], qFieldLabels: ['基金详情链接'] } },
      ],
      qMeasures: [],
      qInitialDataFetch: [
        {
          qTop: 0,
          qLeft: 0,
          qWidth: 7,   // 7 个字段
          qHeight: 1000, // 最多取 1000 行
        },
      ],
    };
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// 工厂函数 & 单例
// ──────────────────────────────────────────────────────────────────────────────

/**
 * 全局单例
 *
 * 【自动判断模式】
 *   - 未配置 QLIK_WSS_URL → useMock=true（开发环境，使用 mock 数据）
 *   - 已配置 QLIK_WSS_URL → useMock=false（生产环境，连接真实 Qlik）
 *
 * 【环境变量】
 *   QLIK_WSS_URL  — Qlik Engine WSS 地址
 *   QLIK_APP_ID   — Qlik App ID
 *
 * 【使用方式】
 *   import { getQlikService } from '@/lib/qlik-service';
 *   const funds = await getQlikService().queryFunds({ type: '股票型' });
 */
let defaultInstance: QlikService | null = null;

export function getQlikService(): QlikService {
  if (!defaultInstance) {
    const wssUrl = process.env.QLIK_WSS_URL || '';
    const appId = process.env.QLIK_APP_ID || '';
    const useMock = !wssUrl; // 未配置 WSS 地址时自动使用 mock

    defaultInstance = new QlikService({ wssUrl, appId, useMock });
  }
  return defaultInstance;
}
