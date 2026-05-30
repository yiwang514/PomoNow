import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',  // 启用静态导出
  images: {
    unoptimized: true,  // GitHub Pages 不支持图片优化
  },
  trailingSlash: true,  // GitHub Pages 需要尾部斜杠
};

export default nextConfig;
