# 基金产品列表

金融类基金产品列表页面，支持 Tab 筛选、关键词搜索、数据排序、热门资讯嵌入。

## 技术栈

- **Next.js 16** + React 19 + TypeScript 5
- **Tailwind CSS v4** + shadcn/ui 组件库
- **WebSocket** (ws) — 预留 Qlik 数据通道
- **Mock 数据** — 开发环境无需后端

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器（端口 5000）
pnpm dev

# 仅启动 Next.js（不启动 WebSocket 服务）
pnpm dev:next
```

浏览器访问 http://localhost:5000

## 生产构建

```bash
pnpm build
pnpm start
```

## 功能

| 功能 | 说明 |
|------|------|
| Tab 分类 | 按基金类型筛选：全部、股票型、指数型、混合型、债券型、货币型 |
| 关键词搜索 | 支持按基金代码/名称过滤 |
| 数据排序 | 支持单位净值、收益率、基金代码排序 |
| 基金详情 | 点击跳转基金详情页 |
| 热门资讯 | 嵌入外部资讯页面 |

## 数据对接

开发环境使用 Mock 数据，生产环境通过 WebSocket (WSS) 对接 Qlik 引擎。

详见 `src/lib/qlik-service.ts`

## 项目结构

```
src/
├── app/
│   ├── page.tsx              # 主页面
│   ├── FundTable.tsx          # 基金表格组件
│   ├── layout.tsx             # 根布局
│   ├── globals.css            # 全局样式
│   └── api/funds/route.ts     # 基金数据 API
├── lib/
│   ├── qlik-service.ts        # Qlik WSS 数据服务
│   └── ws-client.ts           # WebSocket 客户端工具
├── ws-handlers/
│   └── qlik.ts                # WS 消息处理
├── data/
│   └── funds.ts               # 静态数据（类型定义）
├── components/ui/             # shadcn/ui 组件
└── server.ts                  # 自定义服务器
```