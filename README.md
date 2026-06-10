# 基金产品列表

基于 React + Umi 构建的基金产品列表展示应用。

## 功能特性

- 基金类型 Tab 分类导航（全部、股票型、指数型、混合型、债券型、货币型）
- 基金名称/代码搜索
- 数据表格（基金代码、单位净值、近一年收益率支持排序）
- 近一年收益率颜色标识（红涨绿跌）
- 热门资讯嵌入区域
- 开发环境使用 Mock 数据，生产环境对接 Qlik

## 技术栈

- **框架**: React 18 + Umi 4
- **语言**: TypeScript 5
- **数据源**: 开发环境 Mock / 生产环境 Qlik (enigma.js)
- **样式**: CSS Modules

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器（使用 Mock 数据）
npm run dev
```

访问 http://localhost:8000

## 生产构建

```bash
# 构建
npm run build

# 产物在 dist/ 目录
```

### 环境变量配置

创建 `.env.production` 文件：

```bash
QLIK_WSS_URL=wss://your-qlik-server:4747/app/engineData
QLIK_APP_ID=your-qlik-app-guid
```

| 变量名 | 说明 |
|--------|------|
| `QLIK_WSS_URL` | Qlik Engine WSS 地址 |
| `QLIK_APP_ID` | Qlik App 的 GUID |

## 项目结构

```
.
├── .umirc.ts              # Umi 配置
├── tsconfig.json          # TypeScript 配置
├── package.json           # 依赖配置
├── mock/
│   └── funds.ts           # Mock 数据（开发环境）
├── src/
│   └── pages/
│       ├── index.tsx      # 主页面
│       ├── index.less     # 页面样式
│       └── api/
│           └── funds.ts   # API 路由（生产环境对接 Qlik）
└── dist/                  # 构建产物
```

## 数据字段

| 字段 | 说明 |
|------|------|
| fund_name | 基金简称 |
| fund_code | 基金代码 |
| fund_type | 基金类型 |
| nav_date | 净值日期 |
| nav | 单位净值 |
| shouyi | 近一年收益率 |
| fund_url | 基金详情链接 |
