import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel 部署不需要静态导出
  // 移除 output: 'export'
  // 移除 basePath 和 assetPrefix
};

export default nextConfig;
