import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Static export is used later to generate extension popup assets
  // output: 'export',
  // distDir: 'dist-web',
};

export default nextConfig;
