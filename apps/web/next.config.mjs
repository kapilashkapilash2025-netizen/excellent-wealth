/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@excellent-wealth/ui'],
  eslint: {
    // Linting is run separately at the workspace root via `pnpm lint`.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
