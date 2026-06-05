import { NextResponse } from 'next/server';
import { getQlikService } from '@/lib/qlik-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const keyword = searchParams.get('keyword');

  const service = getQlikService();
  const data = await service.queryFunds({ type: type ?? undefined, keyword: keyword ?? undefined });

  return NextResponse.json({ data });
}