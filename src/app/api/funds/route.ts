import { NextResponse } from 'next/server';
import { getQlikService } from '@/lib/qlik-service';

/**
 * 基金产品列表查询接口
 * 
 * 【数据来源说明】
 *   ⚠️ 开发环境（pnpm dev）→ 使用 MOCK 数据，不连接 Qlik，断网也能跑
 *   ✅ 生产部署后 → 自动连接真实 Qlik 引擎（需配置 QLIK_WSS_URL 环境变量）
 * 
 * 详见 qlik-service.ts 中 getQlikService() 的自动判断逻辑
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const keyword = searchParams.get('keyword');

  const service = getQlikService();
  const data = await service.queryFunds({ type: type ?? undefined, keyword: keyword ?? undefined });

  return NextResponse.json({ data });
}