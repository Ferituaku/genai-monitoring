import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  basePath: "/openai/ai-monitor",
  // assetPrefix: "/",
  images: {
    unoptimized: true, // Prevent Next.js from altering public images
  },
};

export default nextConfig;
