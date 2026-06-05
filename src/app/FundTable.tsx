'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown, Loader2, ExternalLink } from 'lucide-react';
import type { FundRecord } from './page';

interface FundTableProps {
  funds: FundRecord[];
  loading?: boolean;
}

type SortKey = 'fund_code' | 'nav' | 'shouyi';
type SortDir = 'asc' | 'desc';

const sortableColumns: {
  key: SortKey;
  label: string;
  align: 'right' | 'left';
}[] = [
  { key: 'fund_code', label: '基金代码', align: 'left' },
  { key: 'nav', label: '单位净值', align: 'right' },
  { key: 'shouyi', label: '近一年收益率', align: 'right' },
];

function formatNav(value: string | null): string {
  return value ? Number(value).toFixed(4) : '—';
}

function formatPercent(value: string | null): string {
  if (!value) return '—';
  const num = Number(value);
  const sign = num > 0 ? '+' : '';
  return `${sign}${num.toFixed(2)}%`;
}

export default function FundTable({ funds, loading }: FundTableProps) {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      if (sortDir === 'desc') {
        setSortDir('asc');
      } else {
        setSortKey(null);
        setSortDir('desc');
      }
    } else {
      setSortKey(key);
      setSortDir(key === 'shouyi' ? 'desc' : 'asc');
    }
  };

  const sortedFunds = useMemo(() => {
    if (!sortKey) return funds;
    return [...funds].sort((a, b) => {
      const aVal = a[sortKey] ?? '';
      const bVal = b[sortKey] ?? '';
      const aNum = Number(aVal);
      const bNum = Number(bVal);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortDir === 'asc' ? aNum - bNum : bNum - aNum;
      }
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [funds, sortKey, sortDir]);

  const renderSortIcon = (key: SortKey) => {
    if (sortKey !== key) {
      return <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />;
    }
    return sortDir === 'asc' ? (
      <ArrowUp className="ml-1 h-3 w-3 text-gray-800" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3 text-gray-800" />
    );
  };

  const handleDetailClick = useCallback((url: string | null) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white p-12 shadow-sm">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-400">加载中...</span>
      </div>
    );
  }

  if (sortedFunds.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
        <p className="text-gray-400">暂无匹配的基金产品</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 hover:bg-gray-50">
            <TableHead className="w-[200px] text-left text-xs font-semibold text-gray-600">
              基金简称
            </TableHead>
            <TableHead
              className="w-[100px] cursor-pointer select-none text-left text-xs font-semibold text-gray-600 hover:text-gray-900"
              onClick={() => handleSort('fund_code')}
            >
              <span className="inline-flex items-center">
                基金代码
                {renderSortIcon('fund_code')}
              </span>
            </TableHead>
            <TableHead className="w-[100px] text-left text-xs font-semibold text-gray-600">
              净值日期
            </TableHead>
            <TableHead
              className="w-[120px] cursor-pointer select-none text-right text-xs font-semibold text-gray-600 hover:text-gray-900"
              onClick={() => handleSort('nav')}
            >
              <span className="inline-flex items-center justify-end">
                单位净值
                {renderSortIcon('nav')}
              </span>
            </TableHead>
            <TableHead
              className="w-[140px] cursor-pointer select-none text-right text-xs font-semibold text-gray-600 hover:text-gray-900"
              onClick={() => handleSort('shouyi')}
            >
              <span className="inline-flex items-center justify-end">
                近一年收益率
                {renderSortIcon('shouyi')}
              </span>
            </TableHead>
            <TableHead className="w-[120px] text-center text-xs font-semibold text-gray-600">
              基金详情
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedFunds.map((fund) => {
            const shouyiNum = Number(fund.shouyi);
            return (
              <TableRow
                key={fund.id}
                className="border-b border-gray-100 transition-colors hover:bg-gray-50/50"
              >
                <TableCell className="text-sm font-medium text-gray-900">
                  {fund.fund_name}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {fund.fund_code}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {fund.nav_date ?? '—'}
                </TableCell>
                <TableCell className="text-right text-sm tabular-nums text-gray-900">
                  {formatNav(fund.nav)}
                </TableCell>
                <TableCell
                  className={`text-right text-sm tabular-nums ${
                    shouyiNum > 0
                      ? 'text-red-600'
                      : shouyiNum < 0
                        ? 'text-green-600'
                        : 'text-gray-900'
                  }`}
                >
                  {formatPercent(fund.shouyi)}
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleDetailClick(fund.fund_url)}
                    className="h-7 gap-1 rounded-md bg-red-600 px-3 text-xs font-medium text-white hover:bg-red-700"
                  >
                    <ExternalLink className="h-3 w-3" />
                    查看
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}