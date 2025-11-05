/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Fix for Vercel deployment with grouped routes
  outputFileTracingIncludes: {
    '/*': ['./lib/**/*', './components/**/*', './types/**/*'],
  },
}

module.exports = nextConfig
