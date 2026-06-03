'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { FundProduct } from '@/data/funds';

interface FundTableProps {
  funds: FundProduct[];
}

type SortKey = 'unitNav' | 'dayGrowth' | 'accumNav' | 'yearReturn' | 'code';
type SortDir = 'asc' | 'desc';

const sortableColumns: {
  key: SortKey;
  label: string;
  align: 'right' | 'left';
}[] = [
  { key: 'code', label: '基金代码', align: 'left' },
  { key: 'unitNav', label: '单位净值', align: 'right' },
  { key: 'dayGrowth', label: '日增长率', align: 'right' },
  { key: 'accumNav', label: '累计净值', align: 'right' },
  { key: 'yearReturn', label: '近一年收益率', align: 'right' },
];

function formatNav(value: number): string {
  return value.toFixed(4);
}

function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export default function FundTable({ funds }: FundTableProps) {
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
      setSortDir(key === 'dayGrowth' || key === 'yearReturn' ? 'desc' : 'asc');
    }
  };

  const sortedFunds = useMemo(() => {
    if (!sortKey) return funds;
    return [...funds].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
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

  const isSortable = (key: string): key is SortKey =>
    sortableColumns.some((c) => c.key === key);

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
            <TableHead className="w-[180px] text-left text-xs font-semibold text-gray-600">
              基金简称
            </TableHead>
            <TableHead
              className="w-[100px] cursor-pointer select-none text-left text-xs font-semibold text-gray-600 hover:text-gray-900"
              onClick={() => handleSort('code')}
            >
              <span className="inline-flex items-center">
                基金代码
                {renderSortIcon('code')}
              </span>
            </TableHead>
            <TableHead className="w-[100px] text-left text-xs font-semibold text-gray-600">
              强定投代码
            </TableHead>
            <TableHead className="w-[100px] text-left text-xs font-semibold text-gray-600">
              净值日期
            </TableHead>
            <TableHead
              className="w-[110px] cursor-pointer select-none text-right text-xs font-semibold text-gray-600 hover:text-gray-900"
              onClick={() => handleSort('unitNav')}
            >
              <span className="inline-flex items-center justify-end">
                单位净值
                {renderSortIcon('unitNav')}
              </span>
            </TableHead>
            <TableHead
              className="w-[100px] cursor-pointer select-none text-right text-xs font-semibold text-gray-600 hover:text-gray-900"
              onClick={() => handleSort('dayGrowth')}
            >
              <span className="inline-flex items-center justify-end">
                日增长率
                {renderSortIcon('dayGrowth')}
              </span>
            </TableHead>
            <TableHead
              className="w-[110px] cursor-pointer select-none text-right text-xs font-semibold text-gray-600 hover:text-gray-900"
              onClick={() => handleSort('accumNav')}
            >
              <span className="inline-flex items-center justify-end">
                累计净值
                {renderSortIcon('accumNav')}
              </span>
            </TableHead>
            <TableHead
              className="w-[130px] cursor-pointer select-none text-right text-xs font-semibold text-gray-600 hover:text-gray-900"
              onClick={() => handleSort('yearReturn')}
            >
              <span className="inline-flex items-center justify-end">
                近一年收益率
                {renderSortIcon('yearReturn')}
              </span>
            </TableHead>
            <TableHead className="w-[100px] text-center text-xs font-semibold text-gray-600">
              状态
            </TableHead>
            <TableHead className="w-[100px] text-center text-xs font-semibold text-gray-600">
              购买渠道
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedFunds.map((fund) => (
            <TableRow
              key={fund.id}
              className="border-b border-gray-100 transition-colors hover:bg-gray-50/50"
            >
              <TableCell className="text-sm font-medium text-gray-900">
                {fund.name}
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {fund.code}
              </TableCell>
              <TableCell className="text-sm text-gray-400">
                {fund.strongCode || '--'}
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {fund.navDate}
              </TableCell>
              <TableCell className="text-right text-sm tabular-nums text-gray-900">
                {formatNav(fund.unitNav)}
              </TableCell>
              <TableCell
                className={`text-right text-sm tabular-nums ${
                  fund.dayGrowth > 0
                    ? 'text-red-600'
                    : fund.dayGrowth < 0
                      ? 'text-green-600'
                      : 'text-gray-900'
                }`}
              >
                {formatPercent(fund.dayGrowth)}
              </TableCell>
              <TableCell className="text-right text-sm tabular-nums text-gray-900">
                {formatNav(fund.accumNav)}
              </TableCell>
              <TableCell
                className={`text-right text-sm tabular-nums ${
                  fund.yearReturn > 0
                    ? 'text-red-600'
                    : fund.yearReturn < 0
                      ? 'text-green-600'
                      : 'text-gray-900'
                }`}
              >
                {formatPercent(fund.yearReturn)}
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  variant="secondary"
                  className="bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 hover:bg-green-50"
                >
                  {fund.status}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Button
                  variant="default"
                  size="sm"
                  className="h-7 gap-1 rounded-md bg-red-600 px-3 text-xs font-medium text-white hover:bg-red-700"
                >
                  <Search className="h-3 w-3" />
                  查看
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}