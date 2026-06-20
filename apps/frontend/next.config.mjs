// Next.js config (ADR-0014). Standalone output is required for the Bun-only
// Dockerfile. All first-party code lives inside the app, so no transpilePackages.
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  typedRoutes: true,
  env: {
    NEXT_PUBLIC_SERVICE_VERSION: process.env.SERVICE_VERSION ?? "dev",
    NEXT_PUBLIC_DEPLOY_ENV: process.env.DEPLOY_ENV ?? "dev",
  },
};

export default nextConfig;
