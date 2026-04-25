/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  rewrites: async () => [
    { source: '/api/:path*', destination: '/api/proxy?_path=:path*' },
  ],
};

module.exports = nextConfig;