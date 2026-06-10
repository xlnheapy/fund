import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 构建输出目录改为 dist
  distDir: 'dist',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
