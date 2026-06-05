'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  LayoutList,
  TrendingUp,
  ArrowUpRight,
  Shuffle,
  Landmark,
  Wallet,
  Search,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import FundTable from './FundTable';

export type FundType =
  | '全部'
  | '股票型'
  | '指数型'
  | '混合型'
  | '债券型'
  | '货币型';

export interface FundRecord {
  id: number;
  fund_name: string;
  fund_code: string;
  fund_type: string;
  nav_date: string | null;
  nav: string | null;
  shouyi: string | null;
  fund_url: string | null;
}

const iconMap: Record<string, React.ElementType> = {
  LayoutList,
  TrendingUp,
  ArrowUpRight,
  Shuffle,
  Landmark,
  Wallet,
};

const fundTypes: { label: FundType; icon: string }[] = [
  { label: '全部', icon: 'LayoutList' },
  { label: '股票型', icon: 'TrendingUp' },
  { label: '指数型', icon: 'ArrowUpRight' },
  { label: '混合型', icon: 'Shuffle' },
  { label: '债券型', icon: 'Landmark' },
  { label: '货币型', icon: 'Wallet' },
];

export default function FundListPage() {
  const [activeType, setActiveType] = useState<FundType>('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [funds, setFunds] = useState<FundRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFunds = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeType !== '全部') params.set('type', activeType);
      if (searchQuery) params.set('keyword', searchQuery);

      const res = await fetch(`/api/funds?${params.toString()}`);
      const json = await res.json();
      if (json.data) setFunds(json.data);
    } catch (err) {
      console.error('查询基金数据失败', err);
    } finally {
      setLoading(false);
    }
  }, [activeType, searchQuery]);

  useEffect(() => {
    fetchFunds();
  }, [fetchFunds]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-[1400px] px-6 py-6">
        {/* 页面标题 */}
        <h1 className="mb-6 text-2xl font-bold text-gray-800">基金产品列表</h1>

        {/* Tab 导航 + 搜索栏 */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          {/* Tab 导航 — fund_type 分类 */}
          <div className="flex flex-wrap gap-2">
            {fundTypes.map(({ label, icon }) => {
              const IconComp = iconMap[icon];
              const isActive = activeType === label;
              return (
                <button
                  key={label}
                  onClick={() => setActiveType(label)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#333] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {IconComp && <IconComp className="h-4 w-4" />}
                  {label}
                </button>
              );
            })}
          </div>

          {/* 搜索栏 */}
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="搜索基金代码 / 名称"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-lg border-gray-200 bg-gray-50 pl-10 text-sm"
            />
          </div>
        </div>

        {/* 数据表格 */}
        <FundTable funds={funds} loading={loading} />

        {/* 热门资讯区域 */}
        <div className="mt-10 space-y-8">
          {/* 汇丰晋信热门资讯 */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
              <h2 className="text-base font-semibold text-gray-800">热门资讯</h2>
              <span className="text-xs text-gray-400">来源：汇丰晋信</span>
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              <iframe
                src="https://www.hsbcjt.cn/rmzx/scgd"
                className="h-[500px] w-full"
                sandbox="allow-scripts allow-same-origin"
                referrerPolicy="no-referrer"
                title="汇丰晋信热门资讯"
              />
            </div>
          </div>

          {/* 东方财富热门资讯 */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500" />
              <h2 className="text-base font-semibold text-gray-800">热门资讯</h2>
              <span className="text-xs text-gray-400">来源：东方财富网</span>
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              <iframe
                src="https://finance.eastmoney.com/"
                className="h-[500px] w-full"
                sandbox="allow-scripts allow-same-origin"
                referrerPolicy="no-referrer"
                title="东方财富热门资讯"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}