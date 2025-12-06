import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.ignoreWarnings = [/Failed to parse source map/];
    return config;
  },
  /* config options here */
};

export default nextConfig;
