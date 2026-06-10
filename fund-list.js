/**
 * Qlik Sense Extension - 基金产品列表
 * 
 * 功能：
 * - Tab 分类筛选（全部、股票型、指数型、混合型、债券型、货币型）
 * - 关键词搜索
 * - 数据表格（基金代码、名称、净值、收益率等）
 * - 列排序功能
 * - 热门资讯嵌入
 * 
 * 数据来源：
 * - 通过 Qlik HyperCube 查询 fund_test 表
 * - 字段：fund_name, fund_code, fund_type, nav_date, nav, shouyi, fund_url
 */

define([
  'qlik',
  'text!./style.css'
], function(qlik, cssContent) {
  'use strict';

  // 注入样式
  $('<style>').html(cssContent).appendTo('head');

  // Tab 类型定义
  var FUND_TYPES = ['全部', '股票型', '指数型', '混合型', '债券型', '货币型'];

  return {
    definition: {
      type: 'items',
      component: 'accordion',
      items: {
        appearance: {
          uses: 'settings'
        }
      }
    },

    initialProperties: {
      qHyperCubeDef: {
        qDimensions: [
          { qDef: { qFieldDefs: ['fund_name'], qFieldLabels: ['基金简称'] } },
          { qDef: { qFieldDefs: ['fund_code'], qFieldLabels: ['基金代码'] } },
          { qDef: { qFieldDefs: ['fund_type'], qFieldLabels: ['基金类型'] } },
          { qDef: { qFieldDefs: ['nav_date'], qFieldLabels: ['净值日期'] } },
          { qDef: { qFieldDefs: ['nav'], qFieldLabels: ['单位净值'] } },
          { qDef: { qFieldDefs: ['shouyi'], qFieldLabels: ['近一年收益率'] } },
          { qDef: { qFieldDefs: ['fund_url'], qFieldLabels: ['基金详情链接'] } }
        ],
        qInitialDataFetch: [
          {
            qTop: 0,
            qLeft: 0,
            qWidth: 7,
            qHeight: 1000
          }
        ]
      }
    },

    paint: function($element, layout) {
      var self = this;
      var qMatrix = layout.qHyperCube.qDataPages[0].qMatrix;

      // 解析数据
      var funds = qMatrix.map(function(row, index) {
        return {
          id: index + 1,
          fund_name: row[0].qText || '',
          fund_code: row[1].qText || '',
          fund_type: row[2].qText || '',
          nav_date: row[3].qText || '',
          nav: row[4].qText || '',
          shouyi: row[5].qText || '',
          fund_url: row[6].qText || ''
        };
      });

      // 渲染 UI
      var html = [
        '<div class="fund-list-extension">',
        '  <div class="fund-header">',
        '    <h2 class="fund-title">基金产品列表</h2>',
        '    <div class="fund-search">',
        '      <input type="text" class="search-input" placeholder="搜索基金代码或名称..." />',
        '    </div>',
        '  </div>',
        '  <div class="fund-tabs">',
        FUND_TYPES.map(function(type, index) {
          return '<button class="tab-btn' + (index === 0 ? ' active' : '') + '" data-type="' + type + '">' + type + '</button>';
        }).join(''),
        '  </div>',
        '  <div class="fund-table-container">',
        '    <table class="fund-table">',
        '      <thead>',
        '        <tr>',
        '          <th>基金简称</th>',
        '          <th class="sortable" data-sort="fund_code">基金代码 <span class="sort-icon">⇅</span></th>',
        '          <th>净值日期</th>',
        '          <th class="sortable" data-sort="nav">单位净值 <span class="sort-icon">⇅</span></th>',
        '          <th class="sortable" data-sort="shouyi">近一年收益率 <span class="sort-icon">⇅</span></th>',
        '          <th>基金详情</th>',
        '        </tr>',
        '      </thead>',
        '      <tbody class="fund-tbody"></tbody>',
        '    </table>',
        '  </div>',
        '  <div class="news-section">',
        '    <h3 class="news-title">热门资讯</h3>',
        '    <div class="news-container">',
        '      <iframe src="https://www.hsbcjt.cn/rmzx/scgd" class="news-iframe" frameborder="0"></iframe>',
        '      <iframe src="https://www.eastmoney.com" class="news-iframe" frameborder="0"></iframe>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('');

      $element.html(html);

      // 状态管理
      var state = {
        currentType: '全部',
        keyword: '',
        sortField: null,
        sortDirection: 'asc'
      };

      // 渲染表格
      function renderTable() {
        var filtered = funds.filter(function(fund) {
          var typeMatch = state.currentType === '全部' || fund.fund_type === state.currentType;
          var keywordMatch = !state.keyword || 
            fund.fund_name.toLowerCase().indexOf(state.keyword.toLowerCase()) !== -1 ||
            fund.fund_code.toLowerCase().indexOf(state.keyword.toLowerCase()) !== -1;
          return typeMatch && keywordMatch;
        });

        // 排序
        if (state.sortField) {
          filtered.sort(function(a, b) {
            var aVal = a[state.sortField];
            var bVal = b[state.sortField];
            
            if (state.sortField === 'nav' || state.sortField === 'shouyi') {
              aVal = parseFloat(aVal) || 0;
              bVal = parseFloat(bVal) || 0;
            }
            
            var result = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            return state.sortDirection === 'asc' ? result : -result;
          });
        }

        var tbody = $element.find('.fund-tbody');
        tbody.empty();

        if (filtered.length === 0) {
          tbody.append('<tr><td colspan="6" class="no-data">暂无数据</td></tr>');
          return;
        }

        filtered.forEach(function(fund) {
          var shouyiClass = parseFloat(fund.shouyi) >= 0 ? 'positive' : 'negative';
          var row = [
            '<tr>',
            '  <td>' + fund.fund_name + '</td>',
            '  <td>' + fund.fund_code + '</td>',
            '  <td>' + fund.nav_date + '</td>',
            '  <td>' + fund.nav + '</td>',
            '  <td class="' + shouyiClass + '">' + fund.shouyi + '%</td>',
            '  <td><a href="' + fund.fund_url + '" target="_blank" class="detail-link">查看</a></td>',
            '</tr>'
          ].join('');
          tbody.append(row);
        });
      }

      // Tab 切换事件
      $element.find('.tab-btn').on('click', function() {
        $element.find('.tab-btn').removeClass('active');
        $(this).addClass('active');
        state.currentType = $(this).data('type');
        renderTable();
      });

      // 搜索事件
      $element.find('.search-input').on('input', function() {
        state.keyword = $(this).val();
        renderTable();
      });

      // 排序事件
      $element.find('.sortable').on('click', function() {
        var field = $(this).data('sort');
        if (state.sortField === field) {
          state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
          state.sortField = field;
          state.sortDirection = 'asc';
        }
        
        // 更新排序图标
        $element.find('.sortable').removeClass('sort-asc sort-desc');
        $(this).addClass('sort-' + state.sortDirection);
        
        renderTable();
      });

      // 初始渲染
      renderTable();
    }
  };
});
