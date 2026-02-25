import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    // Lint is run separately via `npm run lint`. Don't block builds.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*', // Proxy to Express backend
      },
    ];
  },
};

export default nextConfig;
