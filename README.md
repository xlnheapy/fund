# 基金产品列表 - Qlik Sense Extension

Qlik Sense Extension，用于展示基金产品列表，支持 Tab 分类筛选、搜索、数据表格排序、热门资讯嵌入等功能。

## 功能特性

- Tab 分类筛选（全部、股票型、指数型、混合型、债券型、货币型）
- 关键词搜索（支持基金代码/名称）
- 数据表格（基金代码、名称、净值日期、单位净值、近一年收益率）
- 列排序功能（基金代码、单位净值、近一年收益率）
- 近一年收益率颜色标识（红涨绿跌）
- 基金详情链接跳转
- 热门资讯嵌入（汇丰晋信、东方财富）

## 数据来源

通过 Qlik HyperCube 查询 `fund_test` 表，字段包括：
- `fund_name` - 基金简称
- `fund_code` - 基金代码
- `fund_type` - 基金类型
- `nav_date` - 净值日期
- `nav` - 单位净值
- `shouyi` - 近一年收益率(%)
- `fund_url` - 基金详情页链接

## 构建

```bash
npm run build
```

构建完成后会在 `dist/` 目录生成：
- `fund-list/` - Extension 目录
- `fund-list.zip` - 可上传的 zip 包

## 上传到 Qlik Sense

1. 打开 Qlik Sense Management Console (QMC)
2. 进入 **Extensions** 管理页面
3. 点击 **Import** 或 **Upload**
4. 选择 `dist/fund-list.zip` 文件
5. 等待上传完成

## 使用

1. 在 Qlik Sense 中打开或创建一个 Sheet
2. 点击 **编辑** 进入编辑模式
3. 在左侧面板找到 **Fund Product List** 扩展
4. 拖拽到 Sheet 中
5. Extension 会自动从 `fund_test` 表加载数据

## 项目结构

```
.
├── fund-list.qext          # Extension manifest 文件
├── fund-list.js            # Extension 主逻辑
├── style.css               # 样式文件
├── scripts/
│   └── build-extension.js  # 构建脚本
└── dist/
    ├── fund-list/          # 构建产物目录
    └── fund-list.zip       # 可上传的 zip 包
```

## 开发说明

Qlik Sense Extension 使用 AMD 模块规范，主要文件：

- `fund-list.qext` - JSON 格式的 manifest，定义 Extension 名称、描述、版本等
- `fund-list.js` - 使用 `define()` 定义模块，通过 `paint()` 方法渲染 UI
- `style.css` - Extension 样式，通过 `text!` 插件加载

数据通过 `initialProperties.qHyperCubeDef` 定义查询字段，Qlik 会自动查询并传入 `layout.qHyperCube.qDataPages[0].qMatrix`。

## 常见问题

### 上传失败

确保 zip 包结构正确：
```
fund-list.zip
└── fund-list/
    ├── fund-list.qext
    ├── fund-list.js
    └── style.css
```

### 数据显示为空

检查 Qlik App 中是否存在 `fund_test` 表，以及字段名是否匹配。

### 样式不生效

清除浏览器缓存后刷新页面。

## License

MIT
