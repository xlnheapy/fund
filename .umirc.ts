import { defineConfig } from 'umi';
import fs from 'fs';
import path from 'path';

// 读取 .env.production 文件
const envPath = path.resolve(process.cwd(), '.env.production');
const envVars: Record<string, string> = {};

if (fs.existsSync(envPath)) {
  console.log('读取 .env.production 文件:', envPath);
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#][^=]*)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      envVars[key] = value;
      console.log(`  ${key} = ${value}`);
    }
  });
} else {
  console.log('.env.production 文件不存在:', envPath);
}

export default defineConfig({
  // 部署到子路径
  base: '/fund_portal/',
  publicPath: '/fund_portal/',
  
  // 使用 browser history（需要服务器配置 fallback）
  history: { type: 'browser' },
  
  // 路由配置
  routes: [
    { path: '/', component: '@/pages/index' },
    { path: '/test', component: '@/pages/test' },
  ],
  
  // 网站图标 (umi 4.6 不支持 favicon key, 用 links 代替)
  links: [{ rel: 'icon', href: '/fund_portal/favicon.ico' }],
  
  // 输出目录
  outputPath: 'dist',
  
  // 注入环境变量到前端代码
  define: {
    'process.env.UMI_PUBLIC_QLIK_WSS_URL': envVars.UMI_PUBLIC_QLIK_WSS_URL || '',
    'process.env.UMI_PUBLIC_QLIK_APP_ID': envVars.UMI_PUBLIC_QLIK_APP_ID || '',
  },
});
