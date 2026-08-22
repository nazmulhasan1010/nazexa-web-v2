/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['@prisma/client'],
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  output: 'standalone',
};

export default nextConfig;
