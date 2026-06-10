/**
 * 生产环境服务器
 * 处理静态文件和 API 请求
 */

const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Qlik 连接配置
const QLIK_WSS_URL = process.env.QLIK_WSS_URL || '';
const QLIK_APP_ID = process.env.QLIK_APP_ID || '';

// 判断是否配置了 Qlik 连接
const hasQlikConfig = QLIK_WSS_URL && QLIK_APP_ID;

// 静态文件服务
app.use('/fund_portal', express.static(path.join(__dirname, 'dist')));

// API 路由
app.get('/api/funds', async (req, res) => {
  if (hasQlikConfig) {
    // 生产环境：从 Qlik 获取数据
    try {
      const funds = await getFundsFromQlik();
      res.json({ data: funds });
    } catch (error) {
      console.error('从 Qlik 获取数据失败:', error);
      res.status(500).json({ 
        error: '获取数据失败', 
        message: error instanceof Error ? error.message : '未知错误' 
      });
    }
  } else {
    // 开发环境：返回 mock 数据
    const mockFunds = getMockFunds();
    res.json({ data: mockFunds });
  }
});

// 所有其他路由返回 index.html（SPA 路由支持）
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

/**
 * 从 Qlik 获取基金数据
 */
async function getFundsFromQlik() {
  const enigma = require('enigma.js');
  const schema = require('enigma.js/schemas/12.67.2.json');
  const WebSocket = require('ws');

  const hyperCubeDef = {
    qInitialDataFetch: [{ qTop: 0, qLeft: 0, qWidth: 7, qHeight: 1000 }],
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
    qSuppressZero: false,
    qSuppressMissing: true,
  };

  const session = enigma.create({
    schema,
    url: QLIK_WSS_URL,
    createSocket: (url) =>
      new WebSocket(url, {
        headers: {
          'X-Qlik-User': 'UserDirectory=INTERNAL;UserId=sa_repository',
        },
        rejectUnauthorized: false,
      }),
  });

  const global = await session.open();
  const app = await global.openDoc(QLIK_APP_ID);
  
  const sessionObj = await app.createSessionObject({
    qInfo: { qType: 'fund-list' },
    qHyperCubeDef: hyperCubeDef,
  });

  const layout = await sessionObj.getLayout();
  const matrix = layout.qHyperCube.qDataPages[0].qMatrix;

  const funds = matrix.map((row) => ({
    fund_name: row[0]?.qText || '',
    fund_code: row[1]?.qText || '',
    fund_type: row[2]?.qText || '',
    nav_date: row[3]?.qText || '',
    nav: row[4]?.qText || '',
    shouyi: row[5]?.qText || '',
    fund_url: row[6]?.qText || '',
  }));

  await session.close();
  return funds;
}

/**
 * Mock 数据（开发环境使用）
 */
function getMockFunds() {
  return [
    { fund_name: '汇丰晋信大盘股票A', fund_code: '540006', fund_type: '股票型', nav_date: '2024-01-15', nav: '2.3456', shouyi: '12.35', fund_url: 'https://example.com/fund/540006' },
    { fund_name: '汇丰晋信动态策略混合A', fund_code: '540003', fund_type: '混合型', nav_date: '2024-01-15', nav: '1.8765', shouyi: '8.92', fund_url: 'https://example.com/fund/540003' },
    { fund_name: '汇丰晋信低碳先锋股票A', fund_code: '540008', fund_type: '股票型', nav_date: '2024-01-15', nav: '3.1234', shouyi: '-5.67', fund_url: 'https://example.com/fund/540008' },
    { fund_name: '汇丰晋信货币A', fund_code: '540011', fund_type: '货币型', nav_date: '2024-01-15', nav: '1.0000', shouyi: '2.15', fund_url: 'https://example.com/fund/540011' },
    { fund_name: '汇丰晋信沪深300指数A', fund_code: '540007', fund_type: '指数型', nav_date: '2024-01-15', nav: '1.5678', shouyi: '15.23', fund_url: 'https://example.com/fund/540007' },
    { fund_name: '汇丰晋信珠三角债券A', fund_code: '540012', fund_type: '债券型', nav_date: '2024-01-15', nav: '1.2345', shouyi: '4.56', fund_url: 'https://example.com/fund/540012' },
    { fund_name: '汇丰晋信消费红利股票A', fund_code: '540009', fund_type: '股票型', nav_date: '2024-01-15', nav: '2.7890', shouyi: '-2.34', fund_url: 'https://example.com/fund/540009' },
    { fund_name: '汇丰晋信科技先锋股票A', fund_code: '540010', fund_type: '股票型', nav_date: '2024-01-15', nav: '4.5678', shouyi: '23.45', fund_url: 'https://example.com/fund/540010' },
    { fund_name: '汇丰晋信中小盘股票A', fund_code: '540005', fund_type: '股票型', nav_date: '2024-01-15', nav: '1.9876', shouyi: '6.78', fund_url: 'https://example.com/fund/540005' },
    { fund_name: '汇丰晋信平稳增利债券A', fund_code: '540013', fund_type: '债券型', nav_date: '2024-01-15', nav: '1.3456', shouyi: '3.21', fund_url: 'https://example.com/fund/540013' },
    { fund_name: '汇丰晋信中证500指数A', fund_code: '540014', fund_type: '指数型', nav_date: '2024-01-15', nav: '1.6789', shouyi: '-8.90', fund_url: 'https://example.com/fund/540014' },
    { fund_name: '汇丰晋信双核策略混合A', fund_code: '540015', fund_type: '混合型', nav_date: '2024-01-15', nav: '2.1234', shouyi: '11.23', fund_url: 'https://example.com/fund/540015' },
    { fund_name: '汇丰晋信大盘波动股票A', fund_code: '540016', fund_type: '股票型', nav_date: '2024-01-15', nav: '3.4567', shouyi: '18.76', fund_url: 'https://example.com/fund/540016' },
    { fund_name: '汇丰晋信短债债券A', fund_code: '540017', fund_type: '债券型', nav_date: '2024-01-15', nav: '1.0567', shouyi: '2.89', fund_url: 'https://example.com/fund/540017' },
    { fund_name: '汇丰晋信创新先锋混合A', fund_code: '540018', fund_type: '混合型', nav_date: '2024-01-15', nav: '2.5678', shouyi: '-3.45', fund_url: 'https://example.com/fund/540018' },
  ];
}

app.listen(PORT, () => {
  console.log(`服务器已启动: http://localhost:${PORT}`);
  console.log(`访问地址: http://localhost:${PORT}/fund_portal/`);
  if (hasQlikConfig) {
    console.log('Qlik 连接: 已配置');
  } else {
    console.log('Qlik 连接: 未配置，使用 Mock 数据');
  }
});
