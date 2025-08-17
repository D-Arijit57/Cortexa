/** @type {import('next').NextConfig} */
const nextConfig = {
  // Inline env vars so Middleware (edge runtime) can access them at build time
  env: {
    CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  },
};

export default nextConfig;
