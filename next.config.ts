import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Initialize OpenNext Cloudflare for development
initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Optimize images for Cloudflare Pages
  images: {
    unoptimized: true,
  },

  // Output configuration for Cloudflare deployment
  output: "standalone",

  // Fix workspace root warning
  outputFileTracingRoot: __dirname,

  // Experimental features for Cloudflare compatibility
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  // Headers configuration
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },

          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
        ],
      },
    ];
  },
};

export default nextConfig;
