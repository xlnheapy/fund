# 基金产品列表

基于 Next.js 16 + React 19 + TypeScript 5 的基金产品列表展示系统，支持 Tab 分类筛选、搜索、数据表格排序、热门资讯嵌入等功能。

## 功能特性

- Tab 分类筛选（全部、股票型、指数型、混合型、债券型、货币型）
- 关键词搜索
- 数据表格（基金代码、名称、净值、收益率等）
- 列排序功能
- 热门资讯嵌入（汇丰晋信、东方财富）
- Qlik 数据源对接（enigma.js，开发环境使用 Mock 数据）
- 响应式设计

## 技术栈

- **框架**: Next.js 16 (App Router)
- **UI**: React 19 + TypeScript 5
- **样式**: Tailwind CSS v4 + shadcn/ui
- **数据源**: Qlik Engine API（enigma.js SDK）
- **开发环境**: Mock 数据（自动切换）

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5000

> **说明**: 开发环境自动使用 Mock 数据（15 只基金），无需配置 Qlik 连接。

## 生产部署

### 1. 构建并打包

```bash
npm run build
```

构建完成后会在 `dist/` 目录生成：
- `fund-product-list.zip` — 完整部署包（包含 .next、public、package.json 等）

### 2. 部署到服务器

**方式一：使用 zip 包**

```bash
unzip dist/fund-product-list.zip -d fund-app
cd fund-app
npm install --production
npm start
```

**方式二：直接部署**

将以下文件/目录上传到服务器：
- `.next/` — Next.js 构建产物
- `public/` — 静态资源
- `package.json` + `package-lock.json` — 依赖配置
- `next.config.ts` — Next.js 配置

在服务器上执行：
```bash
npm install --production
npm start
```

### 3. 环境变量配置

生产环境需要配置 Qlik 连接：

```bash
# .env.production
QLIK_WSS_URL=wss://your-qlik-server:4747/app/engineData
QLIK_APP_ID=your-qlik-app-guid
```

如果不配置 `QLIK_WSS_URL`，将自动使用 Mock 数据。

## 数据源说明

### 开发环境
- 自动使用 Mock 数据（15 只基金）
- 无需配置 Qlik 连接

### 生产环境
- 通过 enigma.js（Qlik 官方 SDK）连接 Qlik Engine
- 查询 `fund_test` 表数据
- 字段：fund_name, fund_code, fund_type, nav, nav_date, shouyi, fund_url
- 只读查询，不推送数据到 Qlik

### 接入真实 Qlik 步骤
1. 设置环境变量 `QLIK_WSS_URL` 和 `QLIK_APP_ID`
2. 确保 Qlik App 中存在 `fund_test` 表
3. 如果字段名不同，修改 `src/lib/qlik-service.ts` 中 `buildHyperCubeDef()` 的 `qFieldDefs`

## 项目结构

```
.
├── src/
│   ├── app/
│   │   ├── page.tsx              # 主页面（Tab、搜索、表格、资讯）
│   │   ├── FundTable.tsx         # 基金数据表格组件
│   │   └── api/
│   │       └── funds/
│   │           └── route.ts      # 基金数据 API
│   ├── lib/
│   │   └── qlik-service.ts       # Qlik 服务（enigma.js + Mock）
│   └── components/ui/            # shadcn/ui 组件
├── public/                       # 静态资源
├── scripts/
│   └── build-zip.ts              # 生产打包脚本
└── package.json
```

## 常见问题

### 1. Qlik 连接失败

检查环境变量 `QLIK_WSS_URL` 和 `QLIK_APP_ID` 是否正确配置。

### 2. 构建失败

确保 Node.js 版本 >= 18。

### 3. 数据字段不匹配

修改 `src/lib/qlik-service.ts` 中 `buildHyperCubeDef()` 方法的 `qFieldDefs`，使其与 Qlik App 中的实际字段名一致。

## License

MIT
