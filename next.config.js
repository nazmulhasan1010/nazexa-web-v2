/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@radix-ui/react-label', '@radix-ui/react-slot', 'lucide-react'],
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
