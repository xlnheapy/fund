/**
 * Qlik 数据服务
 * 开发环境：使用 mock 数据
 * 生产环境：通过 enigma.js 连接 Qlik Engine
 */

import enigma from 'enigma.js';
import schema from 'enigma.js/schemas/12.612.0.json';

// 基金数据类型
export interface Fund {
  fund_name: string;
  fund_code: string;
  fund_type: string;
  nav_date: string;
  nav: string;
  shouyi: string;
  fund_url: string;
}

// Mock 数据（开发环境使用）
const MOCK_DATA: Fund[] = [
  { fund_name: '汇丰晋信大盘股票A', fund_code: '540006', fund_type: '股票型', nav_date: '2024-01-15', nav: '3.2450', shouyi: '12.56', fund_url: 'https://www.hsbcjt.cn/fund/540006' },
  { fund_name: '汇丰晋信动态策略混合A', fund_code: '540003', fund_type: '混合型', nav_date: '2024-01-15', nav: '2.8760', shouyi: '8.32', fund_url: 'https://www.hsbcjt.cn/fund/540003' },
  { fund_name: '汇丰晋信2026周期混合', fund_code: '540007', fund_type: '混合型', nav_date: '2024-01-15', nav: '1.9540', shouyi: '-3.21', fund_url: 'https://www.hsbcjt.cn/fund/540007' },
  { fund_name: '汇丰晋信货币基金A', fund_code: '540001', fund_type: '货币型', nav_date: '2024-01-15', nav: '1.0000', shouyi: '1.85', fund_url: 'https://www.hsbcjt.cn/fund/540001' },
  { fund_name: '汇丰晋信低碳先锋股票A', fund_code: '540008', fund_type: '股票型', nav_date: '2024-01-15', nav: '2.1340', shouyi: '15.67', fund_url: 'https://www.hsbcjt.cn/fund/540008' },
  { fund_name: '汇丰晋信消费红利股票A', fund_code: '540009', fund_type: '股票型', nav_date: '2024-01-15', nav: '1.8760', shouyi: '-5.43', fund_url: 'https://www.hsbcjt.cn/fund/540009' },
  { fund_name: '汇丰晋信科技先锋股票A', fund_code: '540010', fund_type: '股票型', nav_date: '2024-01-15', nav: '2.5430', shouyi: '22.18', fund_url: 'https://www.hsbcjt.cn/fund/540010' },
  { fund_name: '汇丰晋信中小盘股票A', fund_code: '540011', fund_type: '股票型', nav_date: '2024-01-15', nav: '2.0870', shouyi: '6.75', fund_url: 'https://www.hsbcjt.cn/fund/540011' },
  { fund_name: '汇丰晋信龙腾混合型', fund_code: '540002', fund_type: '混合型', nav_date: '2024-01-15', nav: '3.1230', shouyi: '9.87', fund_url: 'https://www.hsbcjt.cn/fund/540002' },
  { fund_name: '汇丰晋信平稳增利债券A', fund_code: '540004', fund_type: '债券型', nav_date: '2024-01-15', nav: '1.2340', shouyi: '3.45', fund_url: 'https://www.hsbcjt.cn/fund/540004' },
  { fund_name: '汇丰晋信恒生A股行业龙头指数A', fund_code: '540012', fund_type: '指数型', nav_date: '2024-01-15', nav: '1.4560', shouyi: '-2.34', fund_url: 'https://www.hsbcjt.cn/fund/540012' },
  { fund_name: '汇丰晋信大盘波动股票A', fund_code: '540013', fund_type: '股票型', nav_date: '2024-01-15', nav: '1.7650', shouyi: '11.23', fund_url: 'https://www.hsbcjt.cn/fund/540013' },
  { fund_name: '汇丰晋信双核策略混合A', fund_code: '540015', fund_type: '混合型', nav_date: '2024-01-15', nav: '1.5430', shouyi: '-1.56', fund_url: 'https://www.hsbcjt.cn/fund/540015' },
  { fund_name: '汇丰晋信珠三角债券A', fund_code: '540014', fund_type: '债券型', nav_date: '2024-01-15', nav: '1.1230', shouyi: '4.12', fund_url: 'https://www.hsbcjt.cn/fund/540014' },
  { fund_name: '汇丰晋信慧生活货币A', fund_code: '540016', fund_type: '货币型', nav_date: '2024-01-15', nav: '1.0000', shouyi: '2.15', fund_url: 'https://www.hsbcjt.cn/fund/540016' },
];

// 判断是否为开发环境
const isDev = process.env.NODE_ENV === 'development';

/**
 * 从 Qlik 获取基金数据
 * 生产环境使用 enigma.js 连接 Qlik Engine
 */
async function fetchFromQlik(): Promise<Fund[]> {
  // 从环境变量获取 Qlik 连接信息（UMI 要求前端环境变量以 UMI_PUBLIC_ 开头）
  const wssUrl = process.env.UMI_PUBLIC_QLIK_WSS_URL || '';
  const appId = process.env.UMI_PUBLIC_QLIK_APP_ID || '';

  if (!wssUrl || !appId) {
    console.warn('Qlik 配置缺失，使用 mock 数据');
    return MOCK_DATA;
  }

  try {
    console.log('连接 Qlik Engine...', { wssUrl, appId });

    // 创建 enigma session
    const session = enigma.create({
      schema,
      url: wssUrl,
    });

    // 打开全局会话
    const global = await session.open();
    console.log('Qlik 连接成功');

    // 打开指定的 App
    const app = await global.openDoc(appId);
    console.log('打开 App 成功:', appId);

    // 创建 HyperCube 查询
    const hyperCube = await app.createSessionObject({
      qInfo: { qType: 'fund-list' },
      qHyperCubeDef: {
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
        qInitialDataFetch: [{ qTop: 0, qLeft: 0, qWidth: 7, qHeight: 1000 }],
      },
    });

    // 获取数据
    const layout = await hyperCube.getLayout();
    const matrix = layout.qHyperCube?.qDataPages?.[0]?.qMatrix || [];

    console.log('获取到数据行数:', matrix.length);

    // 解析数据
    const funds: Fund[] = matrix.map(row => ({
      fund_name: String(row[0]?.qText || ''),
      fund_code: String(row[1]?.qText || ''),
      fund_type: String(row[2]?.qText || ''),
      nav_date: String(row[3]?.qText || ''),
      nav: String(row[4]?.qText || ''),
      shouyi: String(row[5]?.qText || ''),
      fund_url: String(row[6]?.qText || ''),
    }));

    // 关闭 session
    await session.close();

    return funds;
  } catch (error) {
    console.error('Qlik 查询失败:', error);
    // 查询失败时返回 mock 数据作为降级
    return MOCK_DATA;
  }
}

/**
 * 获取基金数据
 * 开发环境返回 mock 数据，生产环境从 Qlik 获取
 */
export async function getFunds(): Promise<Fund[]> {
  if (isDev) {
    console.log('开发环境，使用 mock 数据');
    return MOCK_DATA;
  }
  return fetchFromQlik();
}
