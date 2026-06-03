# AGENTS.md

## 项目概览
基金产品列表页面 — 金融后台管理系统，支持按基金类型 Tab 筛选、关键词搜索、数据表格展示及外部新闻嵌入。

## 构建和测试命令
- 开发：`coze dev` (HMR 热更新，端口 5000)
- 构建：`coze build`
- 生产启动：`coze start`
- TypeScript 检查：`pnpm ts-check`
- Lint：`pnpm lint:build`
- 完整检查：`pnpm validate`

## 代码风格指南
- 严格 TypeScript，禁止隐式 any
- 使用 `'use client'` 处理客户端状态
- Tailwind CSS v4 样式，shadcn/ui 组件
- 数据文件统一放在 `src/data/` 目录
- 页面组件在 `src/app/` 目录，组件可同目录或 `src/components/`

## 目录结构
```
src/
├── app/
│   ├── page.tsx          # 主页面（Tab + 搜索 + 表格 + 新闻区）
│   ├── FundTable.tsx     # 基金数据表格组件
│   ├── layout.tsx        # 根布局
│   └── globals.css       # 全局样式
├── data/
│   └── funds.ts          # 基金类型与静态数据
└── components/ui/        # shadcn/ui 组件库
```

## 数据说明
- 基金数据当前使用静态数据 (`src/data/funds.ts`)
- 后续可通过 Qlik 后台查询替换，数据接口遵循现有 `FundProduct` 类型
- 新闻区域使用 iframe 嵌入东方财富网

## 设计规范
详见 `DESIGN.md`

## 关键设计决策
- Tab 组件使用自定义 button 实现（非 shadcn Tabs），以匹配设计稿的图标+按钮样式
- 表格使用 shadcn/ui Table 组件
- 数字使用 `tabular-nums` 等宽数字便于对齐
- 涨跌颜色：红色（涨）、绿色（跌）