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
        source: '/vault/dashboard',
        destination: '/vault',
        permanent: true,
      },
      {
        source: '/flow/goals',
        destination: '/flow',
        permanent: true,
      },
      {
        source: '/flow/tasks',
        destination: '/flow',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
