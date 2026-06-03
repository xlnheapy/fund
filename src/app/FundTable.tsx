'use client';

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
import { Search } from 'lucide-react';
import type { FundProduct } from '@/data/funds';

interface FundTableProps {
  funds: FundProduct[];
}

function formatNav(value: number): string {
  return value.toFixed(4);
}

function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export default function FundTable({ funds }: FundTableProps) {
  if (funds.length === 0) {
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
            <TableHead className="w-[100px] text-left text-xs font-semibold text-gray-600">
              基金代码
            </TableHead>
            <TableHead className="w-[100px] text-left text-xs font-semibold text-gray-600">
              强定投代码
            </TableHead>
            <TableHead className="w-[100px] text-left text-xs font-semibold text-gray-600">
              净值日期
            </TableHead>
            <TableHead className="w-[110px] text-right text-xs font-semibold text-gray-600">
              单位净值
            </TableHead>
            <TableHead className="w-[100px] text-right text-xs font-semibold text-gray-600">
              日增长率
            </TableHead>
            <TableHead className="w-[110px] text-right text-xs font-semibold text-gray-600">
              累计净值
            </TableHead>
            <TableHead className="w-[130px] text-right text-xs font-semibold text-gray-600">
              近一年收益率
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
          {funds.map((fund) => (
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