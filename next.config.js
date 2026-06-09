/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output produces a self-contained server in .next/standalone
  // Required for efficient Docker deployments (no node_modules in final image)
  output: 'standalone',
  typescript: {
    tsconfigPath: './tsconfig.json',
    ignoreBuildErrors: true,
  },
  experimental: {
    taint: true,
    optimizePackageImports: [
      'lucide-react',
      'lodash',
      'date-fns'],
  },
  async redirects() {
    return [
      {
        source: '/note/notes',
        destination: '/note',
        permanent: true,
      },
      {
        source: '/note/notes/:path*',
        destination: '/note/:path*',
        permanent: true,
      },
      {
        source: '/vault/dashboard',
        destination: '/vault',
        permanent: true,
      },
      {
        source: '/vault/dashboard/:path*',
        destination: '/vault/:path*',
        permanent: true,
      },
      {
        source: '/flow/goals',
        destination: '/flow',
        permanent: true,
      },
      {
        source: '/flow/goals/:path*',
        destination: '/flow/:path*',
        permanent: true,
      },
      {
        source: '/flow/tasks',
        destination: '/flow',
        permanent: true,
      },
      {
        source: '/flow/tasks/:path*',
        destination: '/flow/:path*',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
