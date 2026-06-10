import { defineConfig } from 'umi';

export default defineConfig({
  // 部署到子路径
  base: '/fund_portal/',
  publicPath: '/fund_portal/',
  
  // 路由配置
  routes: [
    { path: '/', component: '@/pages/index' },
  ],
  
  // 代理配置（开发环境）
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    },
  },
  
  // 输出目录
  outputPath: 'dist',
});
