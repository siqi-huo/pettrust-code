/** @type {import('next').NextConfig} */
const path = require('path');
const nextConfig = {
  // Ensure proper module resolution
  experimental: {
    // Use webpack instead of turbopack for better compatibility
  },
  // Output file tracing root for monorepo support
  outputFileTracingRoot: path.resolve(__dirname),
  // Allowed dev origins
  allowedDevOrigins: ['*.dev.coze.site'],
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

module.exports = nextConfig;
