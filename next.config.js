/** @type {import('next').NextConfig} */
const path = require('path');
const nextConfig = {
  // Disable Turbopack to use webpack (better PostCSS compatibility)
  experimental: {
    // Use webpack instead of turbopack
  },
  // Use webpack for building
  webpack: (config) => {
    return config;
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
