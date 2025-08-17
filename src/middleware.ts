import { clerkMiddleware } from '@clerk/nextjs/server';

// Soft-fallback for middleware runtime
const publishableKey =
  process.env.CLERK_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
if (!process.env.CLERK_PUBLISHABLE_KEY && publishableKey) {
  process.env.CLERK_PUBLISHABLE_KEY = publishableKey;
}

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};