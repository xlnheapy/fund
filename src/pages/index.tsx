import React, { useState, useEffect } from 'react';
import { Table, Input, Tabs, ConfigProvider, Spin, Checkbox } from 'antd';
import { StarFilled } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import styles from './index.less';
import { getFunds, Fund } from '@/services/qlik-service';

// 基金类型定义
const FUND_TYPES = [
  { key: 'all', label: '全部' },
  { key: '股票型', label: '股票型' },
  { key: '指数型', label: '指数型' },
  { key: '混合型', label: '混合型' },
  { key: '债券型', label: '债券型' },
  { key: '货币型', label: '货币型' },
];

// 格式化收益率
const formatReturn = (value: string) => {
  const num = parseFloat(value);
  if (isNaN(num)) return <span>{value}</span>;
  const color = num > 0 ? '#e74c3c' : num < 0 ? '#27ae60' : '#333';
  const prefix = num > 0 ? '+' : '';
  return <span style={{ color, fontWeight: 500 }}>{prefix}{num.toFixed(2)}%</span>;
};

// NaN 排在最后的排序辅助函数
const sortWithNaNLast = (aVal: string, bVal: string) => {
  const aNum = parseFloat(aVal);
  const bNum = parseFloat(bVal);
  if (isNaN(aNum) && isNaN(bNum)) return 0;
  if (isNaN(aNum)) return 1;
  if (isNaN(bNum)) return -1;
  return aNum - bNum;
};

const columns: ColumnsType<Fund> = [
  {
    title: '基金简称',
    dataIndex: 'fund_name',
    key: 'fund_name',
    render: (text: string, record: Fund) => (
      <span style={{ position: 'relative', display: 'inline-block' }}>
        {text}
        {record.recommend_flag === 'Y' && (
          <StarFilled
            style={{
              color: '#faad14',
              fontSize: 12,
              position: 'absolute',
              top: -6,
              right: -14,
            }}
          />
        )}
      </span>
    ),
  },
  {
    title: '基金代码',
    dataIndex: 'fund_code',
    key: 'fund_code',
    sorter: (a, b) => a.fund_code.localeCompare(b.fund_code),
  },
  {
    title: '净值日期',
    dataIndex: 'nav_date',
    key: 'nav_date',
  },
  {
    title: '单位净值',
    dataIndex: 'nav',
    key: 'nav',
    sorter: (a, b) => sortWithNaNLast(a.nav, b.nav),
  },
  {
    title: '近一年收益率',
    dataIndex: 'shouyi',
    key: 'shouyi',
    sorter: (a, b) => sortWithNaNLast(a.shouyi, b.shouyi),
    render: (value: string) => formatReturn(value),
  },
  {
    title: '近三年收益率',
    dataIndex: 'three_year_inc',
    key: 'three_year_inc',
    sorter: (a, b) => sortWithNaNLast(a.three_year_inc, b.three_year_inc),
    render: (value: string) => formatReturn(value),
  },
  {
    title: '基金详情',
    key: 'action',
    render: (_: any, record: Fund) => (
      <a href={record.fund_url} target="_blank" rel="noopener noreferrer" className={styles.link}>
        查看
      </a>
    ),
  },
];

export default function FundList() {
  const [funds, setFunds] = useState<Fund[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [purchaseOnly, setPurchaseOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  // 加载数据
  useEffect(() => {
    fetchFunds();
  }, []);

  const fetchFunds = async () => {
    try {
      setLoading(true);
      const data = await getFunds();
      // 重点产品排在前面
      data.sort((a, b) => {
        if (a.recommend_flag === 'Y' && b.recommend_flag !== 'Y') return -1;
        if (a.recommend_flag !== 'Y' && b.recommend_flag === 'Y') return 1;
        return 0;
      });
      setFunds(data);
    } catch (error) {
      console.error('获取基金数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 过滤数据
  const getFilteredFunds = () => {
    let filtered = [...funds];
    if (activeTab !== 'all') {
      filtered = filtered.filter(fund => fund.fund_type === activeTab);
    }
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        fund =>
          fund.fund_name.toLowerCase().includes(keyword) ||
          fund.fund_code.includes(keyword)
      );
    }
    if (purchaseOnly) {
      filtered = filtered.filter(fund => fund.purchase_flag === 'Y');
    }
    return filtered;
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <div className={styles.container}>
        {/* 页面标题 */}
        <div className={styles.header}>
          <h1 className={styles.title}>基金产品列表</h1>
        </div>

        {/* Tab 导航 */}
        <div className={styles.tabs}>
          {FUND_TYPES.map(tab => (
            <button
              key={tab.key}
              className={`${styles.tab} ${activeTab === tab.key ? styles.activeTab : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 搜索框 + 可购买筛选 */}
        <div className={styles.searchRow}>
          <Input
            placeholder="搜索基金名称或代码"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Checkbox
            checked={purchaseOnly}
            onChange={(e) => setPurchaseOnly(e.target.checked)}
          >
            仅显示可购买
          </Checkbox>
        </div>

        {/* 数据表格 */}
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={getFilteredFunds()}
            rowKey="fund_code"
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (total) => `共 ${total} 条`,
              defaultPageSize: 10,
            }}
            locale={{ emptyText: '暂无数据' }}
            scroll={{ x: 'max-content' }}
          />
        </Spin>

        {/* 资讯嵌入区域 */}
        <div className={styles.newsSection}>
          <h2 className={styles.sectionTitle}>热门资讯</h2>
          <div className={styles.iframeWrapper}>
            <iframe
              src="https://www.hsbcjt.cn/rmzx/scgd"
              className={styles.iframe}
              title="热门资讯"
              frameBorder="0"
            />
          </div>
        </div>

        <div className={styles.newsSection}>
          <h2 className={styles.sectionTitle}>东方财富热门资讯</h2>
          <div className={styles.iframeWrapper}>
            <iframe
              src="https://finance.eastmoney.com/a/cywjh.html"
              className={styles.iframe}
              title="东方财富热门资讯"
              frameBorder="0"
            />
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}