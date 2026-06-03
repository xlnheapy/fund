'use client';

import { useState, useMemo } from 'react';
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
import type { FundType } from '@/data/funds';
import { fundTypes, funds } from '@/data/funds';
import FundTable from './FundTable';

const iconMap: Record<string, React.ElementType> = {
  LayoutList,
  TrendingUp,
  ArrowUpRight,
  Shuffle,
  Landmark,
  Wallet,
};

export default function FundListPage() {
  const [activeType, setActiveType] = useState<FundType>('全部');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFunds = useMemo(() => {
    return funds.filter((fund) => {
      const matchType = activeType === '全部' || fund.type === activeType;
      const matchSearch =
        !searchQuery ||
        fund.name.includes(searchQuery) ||
        fund.code.includes(searchQuery);
      return matchType && matchSearch;
    });
  }, [activeType, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-[1400px] px-6 py-6">
        {/* 页面标题 */}
        <h1 className="mb-6 text-2xl font-bold text-gray-800">基金产品列表</h1>

        {/* Tab 导航 + 搜索栏 */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          {/* Tab 导航 */}
          <div className="flex flex-wrap items-center gap-2">
            {fundTypes.map((type) => {
              const Icon = iconMap[type.icon] || LayoutList;
              const isActive = activeType === type.label;
              return (
                <button
                  key={type.label}
                  onClick={() => setActiveType(type.label)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-800 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {type.label}
                </button>
              );
            })}
          </div>

          {/* 搜索栏 */}
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="搜索基金代码 / 名称"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 rounded-lg border-gray-200 bg-white pl-10 text-sm placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* 基金数据表格 */}
        <FundTable funds={filteredFunds} />

        {/* 底部新闻资讯嵌入区 */}
        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <h2 className="text-base font-semibold text-gray-800">
              热门资讯
            </h2>
          </div>
          <div className="overflow-hidden rounded-lg border border-gray-100">
            <iframe
              src="https://www.hsbcjt.cn/rmzx/scgd"
              title="热门资讯"
              className="h-[500px] w-full"
              sandbox="allow-scripts allow-same-origin"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>
          <p className="mt-2 text-xs text-gray-400">
            内容来源：汇丰晋信 · 资讯仅供参考
          </p>
        </div>

        {/* 东方财富网热门资讯 */}
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <h2 className="text-base font-semibold text-gray-800">
              东方财富 · 热门资讯
            </h2>
          </div>
          <div className="overflow-hidden rounded-lg border border-gray-100">
            <iframe
              src="https://finance.eastmoney.com/"
              title="东方财富热门资讯"
              className="h-[500px] w-full"
              sandbox="allow-scripts allow-same-origin"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>
          <p className="mt-2 text-xs text-gray-400">
            内容来源：东方财富网 · 资讯仅供参考
          </p>
        </div>
      </div>
    </div>
  );
}