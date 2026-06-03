export type FundType =
  | '全部'
  | '股票型'
  | '指数型'
  | '混合型'
  | '债券型'
  | '货币型'
  | 'FOF基金'
  | '内地互认基金'
  | '香港互认基金';

export interface FundProduct {
  id: string;
  name: string;           // 基金简称
  code: string;           // 基金代码
  strongCode: string;     // 强定投代码
  navDate: string;        // 净值日期
  unitNav: number;        // 单位净值
  dayGrowth: number;      // 日增长率 (%)
  accumNav: number;       // 累计净值
  yearReturn: number;     // 近一年收益率 (%)
  status: string;         // 状态
  type: FundType;         // 基金类型
}

export const fundTypes: { label: FundType; icon: string }[] = [
  { label: '全部', icon: 'LayoutList' },
  { label: '股票型', icon: 'TrendingUp' },
  { label: '指数型', icon: 'ArrowUpRight' },
  { label: '混合型', icon: 'Shuffle' },
  { label: '债券型', icon: 'Landmark' },
  { label: '货币型', icon: 'Wallet' },
  
];

export const funds: FundProduct[] = [
  {
    id: '1',
    name: '易方达蓝筹精选混合',
    code: '005827',
    strongCode: '',
    navDate: '2025-06-02',
    unitNav: 1.5823,
    dayGrowth: 1.22,
    accumNav: 1.5823,
    yearReturn: -7.35,
    status: '正常开放',
    type: '混合型',
  },
  {
    id: '2',
    name: '招商中证白酒指数(LOF)A',
    code: '161725',
    strongCode: '',
    navDate: '2025-06-02',
    unitNav: 0.9321,
    dayGrowth: 0.87,
    accumNav: 2.5840,
    yearReturn: -12.45,
    status: '正常开放',
    type: '指数型',
  },
  {
    id: '3',
    name: '中欧医疗健康混合A',
    code: '003095',
    strongCode: '',
    navDate: '2025-06-02',
    unitNav: 1.2456,
    dayGrowth: -0.34,
    accumNav: 1.2456,
    yearReturn: -18.23,
    status: '正常开放',
    type: '混合型',
  },
  {
    id: '4',
    name: '富国天惠成长混合(LOF)A',
    code: '161005',
    strongCode: '',
    navDate: '2025-06-02',
    unitNav: 2.3456,
    dayGrowth: 0.56,
    accumNav: 5.6789,
    yearReturn: -5.12,
    status: '正常开放',
    type: '混合型',
  },
  {
    id: '5',
    name: '华夏沪深300ETF联接A',
    code: '000051',
    strongCode: '',
    navDate: '2025-06-02',
    unitNav: 1.5678,
    dayGrowth: 0.32,
    accumNav: 1.5678,
    yearReturn: 8.45,
    status: '正常开放',
    type: '指数型',
  },
  {
    id: '6',
    name: '易方达消费行业股票',
    code: '110022',
    strongCode: '',
    navDate: '2025-06-02',
    unitNav: 3.4567,
    dayGrowth: 1.05,
    accumNav: 3.4567,
    yearReturn: 2.15,
    status: '正常开放',
    type: '股票型',
  },
  {
    id: '7',
    name: '天弘永利债券A',
    code: '420002',
    strongCode: '',
    navDate: '2025-06-02',
    unitNav: 1.2345,
    dayGrowth: 0.03,
    accumNav: 1.8567,
    yearReturn: 3.25,
    status: '正常开放',
    type: '债券型',
  },
  {
    id: '8',
    name: '南方中证500ETF联接A',
    code: '160119',
    strongCode: '',
    navDate: '2025-06-02',
    unitNav: 1.7890,
    dayGrowth: -0.45,
    accumNav: 1.7890,
    yearReturn: 5.67,
    status: '正常开放',
    type: '指数型',
  },
  {
    id: '9',
    name: '广发稳健增长混合A',
    code: '270002',
    strongCode: '',
    navDate: '2025-06-02',
    unitNav: 1.5678,
    dayGrowth: 0.27,
    accumNav: 4.1234,
    yearReturn: -0.24,
    status: '正常开放',
    type: '混合型',
  },
  {
    id: '10',
    name: '博时信用债券A',
    code: '050011',
    strongCode: '',
    navDate: '2025-06-02',
    unitNav: 1.4567,
    dayGrowth: 0.05,
    accumNav: 1.8901,
    yearReturn: 4.12,
    status: '正常开放',
    type: '债券型',
  },
  {
    id: '11',
    name: '嘉实沪深300ETF联接(LOF)A',
    code: '160706',
    strongCode: '',
    navDate: '2025-06-02',
    unitNav: 1.2345,
    dayGrowth: 0.28,
    accumNav: 3.4567,
    yearReturn: 7.89,
    status: '正常开放',
    type: '指数型',
  },
  {
    id: '12',
    name: '天弘余额宝货币',
    code: '000198',
    strongCode: '',
    navDate: '2025-06-02',
    unitNav: 1.0000,
    dayGrowth: 0.00,
    accumNav: 1.0000,
    yearReturn: 1.85,
    status: '正常开放',
    type: '货币型',
  },
  {
    id: '13',
    name: '兴全合润混合(LOF)',
    code: '163406',
    strongCode: '',
    navDate: '2025-06-02',
    unitNav: 1.6789,
    dayGrowth: -0.52,
    accumNav: 4.5678,
    yearReturn: -10.34,
    status: '正常开放',
    type: '混合型',
  },
  {
    id: '14',
    name: '汇添富价值精选混合A',
    code: '519069',
    strongCode: '',
    navDate: '2025-06-02',
    unitNav: 2.3456,
    dayGrowth: 0.45,
    accumNav: 3.4567,
    yearReturn: 1.23,
    status: '正常开放',
    type: '混合型',
  },
  {
    id: '15',
    name: '易方达国防军工混合A',
    code: '001475',
    strongCode: '',
    navDate: '2025-06-02',
    unitNav: 1.2345,
    dayGrowth: 2.15,
    accumNav: 1.2345,
    yearReturn: -15.67,
    status: '正常开放',
    type: '混合型',
  },
];