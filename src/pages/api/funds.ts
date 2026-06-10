/**
 * 基金数据 API
 * 
 * 开发环境：使用 mock 数据（mock/funds.ts）
 * 生产环境：通过 enigma.js 连接 Qlik 获取数据
 */

import { Context } from 'umi';

// Qlik 连接配置
const QLIK_WSS_URL = process.env.QLIK_WSS_URL || '';
const QLIK_APP_ID = process.env.QLIK_APP_ID || '';

// 判断是否为生产环境（连接 Qlik）
const isProduction = process.env.NODE_ENV === 'production' && QLIK_WSS_URL;

export default function handler(req: any, res: any) {
  if (isProduction) {
    // 生产环境：从 Qlik 获取数据
    return getFundsFromQlik(req, res);
  }
  
  // 开发环境：由 mock 拦截，这里不会执行
  res.json({ data: [] });
}

/**
 * 从 Qlik 获取基金数据
 * 使用 enigma.js 连接 Qlik Engine API
 */
async function getFundsFromQlik(req: any, res: any) {
  try {
    // 动态导入 enigma.js（仅在服务端使用）
    const enigma = require('enigma.js');
    const schema = require('enigma.js/schemas/12.67.2.json');
    const WebSocket = require('ws');

    // 构建 HyperCube 查询定义
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

    // 连接 Qlik Engine
    const session = enigma.create({
      schema,
      url: QLIK_WSS_URL,
      createSocket: (url: string) =>
        new WebSocket(url, {
          headers: {
            'X-Qlik-User': 'UserDirectory=INTERNAL;UserId=sa_repository',
          },
          rejectUnauthorized: false,
        }),
    });

    const global = await session.open();
    const app = await global.openDoc(QLIK_APP_ID);
    
    // 创建会话对象查询数据
    const sessionObj = await app.createSessionObject({
      qInfo: { qType: 'fund-list' },
      qHyperCubeDef: hyperCubeDef,
    });

    const layout: any = await sessionObj.getLayout();
    const matrix = layout.qHyperCube.qDataPages[0].qMatrix;

    // 解析数据
    const funds = matrix.map((row: any[]) => ({
      fund_name: row[0]?.qText || '',
      fund_code: row[1]?.qText || '',
      fund_type: row[2]?.qText || '',
      nav_date: row[3]?.qText || '',
      nav: row[4]?.qText || '',
      shouyi: row[5]?.qText || '',
      fund_url: row[6]?.qText || '',
    }));

    // 关闭连接
    await session.close();

    res.json({ data: funds });
  } catch (error) {
    console.error('从 Qlik 获取数据失败:', error);
    res.status(500).json({ 
      error: '获取数据失败', 
      message: error instanceof Error ? error.message : '未知错误' 
    });
  }
}
