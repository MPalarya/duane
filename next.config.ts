import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
  async redirects() {
    return [
      { source: '/community/blog', destination: '/community#stories', permanent: true },
      { source: '/community/mentors', destination: '/community#note-board', permanent: true },
      { source: '/community/stories', destination: '/community#stories', permanent: true },
      { source: '/community/spotlight', destination: '/community#spotlights', permanent: true },
    ];
  },
};

export default nextConfig;
