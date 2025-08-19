export default {
  providers: [
    {
      // Update this to your actual Clerk domain from your Clerk dashboard
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN || "https://your-actual-clerk-domain.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};
