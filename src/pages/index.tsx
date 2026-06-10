import React, { useState, useEffect } from 'react';
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

// 排序类型
type SortField = 'fund_code' | 'nav' | 'shouyi';
type SortOrder = 'asc' | 'desc';

export default function FundList() {
  const [funds, setFunds] = useState<Fund[]>([]);
  const [filteredFunds, setFilteredFunds] = useState<Fund[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortField, setSortField] = useState<SortField>('fund_code');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [loading, setLoading] = useState(true);

  // 加载数据
  useEffect(() => {
    fetchFunds();
  }, []);

  // 获取基金数据
  const fetchFunds = async () => {
    try {
      setLoading(true);
      const data = await getFunds();
      setFunds(data);
    } catch (error) {
      console.error('获取基金数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 过滤和搜索
  useEffect(() => {
    let filtered = [...funds];

    // Tab 过滤
    if (activeTab !== 'all') {
      filtered = filtered.filter(fund => fund.fund_type === activeTab);
    }

    // 搜索过滤
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        fund =>
          fund.fund_name.toLowerCase().includes(keyword) ||
          fund.fund_code.includes(keyword)
      );
    }

    // 排序
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'nav' || sortField === 'shouyi') {
        aVal = parseFloat(aVal);
        bVal = parseFloat(bVal);
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredFunds(filtered);
  }, [funds, activeTab, searchKeyword, sortField, sortOrder]);

  // 切换排序
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // 获取排序图标
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  // 格式化收益率（红涨绿跌）
  const formatReturn = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    
    const color = num > 0 ? '#e74c3c' : num < 0 ? '#27ae60' : '#333';
    const prefix = num > 0 ? '+' : '';
    
    return <span style={{ color, fontWeight: 500 }}>{prefix}{num.toFixed(2)}%</span>;
  };

  return (
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

      {/* 搜索框 */}
      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="搜索基金名称或代码"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* 数据表格 */}
      <div className={styles.tableWrapper}>
        {loading ? (
          <div className={styles.loading}>加载中...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>基金简称</th>
                <th 
                  className={`${styles.th} ${styles.sortable}`}
                  onClick={() => handleSort('fund_code')}
                >
                  基金代码 {getSortIcon('fund_code')}
                </th>
                <th className={styles.th}>净值日期</th>
                <th 
                  className={`${styles.th} ${styles.sortable}`}
                  onClick={() => handleSort('nav')}
                >
                  单位净值 {getSortIcon('nav')}
                </th>
                <th 
                  className={`${styles.th} ${styles.sortable}`}
                  onClick={() => handleSort('shouyi')}
                >
                  近一年收益率 {getSortIcon('shouyi')}
                </th>
                <th className={styles.th}>基金详情</th>
              </tr>
            </thead>
            <tbody>
              {filteredFunds.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.empty}>
                    暂无数据
                  </td>
                </tr>
              ) : (
                filteredFunds.map((fund, index) => (
                  <tr key={fund.fund_code} className={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                    <td className={styles.td}>{fund.fund_name}</td>
                    <td className={styles.td}>{fund.fund_code}</td>
                    <td className={styles.td}>{fund.nav_date}</td>
                    <td className={styles.td}>{fund.nav}</td>
                    <td className={styles.td}>{formatReturn(fund.shouyi)}</td>
                    <td className={styles.td}>
                      <a
                        href={fund.fund_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.link}
                      >
                        查看
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

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
  );
}
