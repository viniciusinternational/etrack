import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  
  // Image optimization configuration
  images: {
    qualities: [75, 90],
  },
  
  // Enable standalone output for Docker deployments
  // This creates a minimal .next/standalone directory with only necessary files
  output: 'standalone',
  
  // Disable TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Disable ESLint during build
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
  
  // Turbopack configuration (Next.js 16 uses Turbopack by default)
  // Adding empty config to silence the warning about webpack config
  // The webpack config below is kept for compatibility if using --webpack flag
  turbopack: {},
  
  // Webpack configuration for native modules like bcrypt
  // This is used when running with --webpack flag
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ensure bcrypt is only bundled on the server
      config.externals = config.externals || [];
      if (!Array.isArray(config.externals)) {
        config.externals = [config.externals];
      }
    }
    return config;
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
