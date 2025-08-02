import type { NextConfig } from "next";

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest.json$/],
  fallbacks: {
    document: '/offline'
  }
});

const nextConfig: NextConfig = {
  eslint: {
    // Don't fail the production build because of eslint warnings
    ignoreDuringBuilds: true,
  },
};

export default withPWA(nextConfig);
