import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export interface FundRecord {
  id: number;
  fund_name: string;
  fund_code: string;
  fund_type: string;
  nav_date: string | null;
  unit_nav: string | null;
  year_return: string | null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const keyword = searchParams.get('keyword');

  const client = getSupabaseClient();

  let query = client
    .from('fund_test')
    .select('id, fund_name, fund_code, fund_type, nav_date, unit_nav, year_return')
    .order('id', { ascending: true });

  if (type && type !== '全部') {
    query = query.eq('fund_type', type);
  }

  if (keyword) {
    query = query.or(`fund_name.ilike.%${keyword}%,fund_code.ilike.%${keyword}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data as FundRecord[] });
}