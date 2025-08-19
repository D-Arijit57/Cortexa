import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Helper function to extract first name from email or full name
function extractFirstName(email: string, fullName?: string): string {
  if (fullName) {
    // If we have a full name, take the first part
    const nameParts = fullName.trim().split(' ');
    return nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase();
  }
  
  // Extract from email (before the @ symbol)
  const emailName = email.split('@')[0];
  
  // Remove numbers and special characters, keep only letters
  const cleanName = emailName.replace(/[^a-zA-Z]/g, '');
  
  // Capitalize first letter
  return cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase();
}

export const syncUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    clerkId: v.string(),
    image: v.optional(v.string()),
    role: v.optional(v.union(v.literal("candidate"), v.literal("interviewer"))),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      // If user exists and we're trying to set a role, update it
      if (args.role && existingUser.role !== args.role) {
        const firstName = extractFirstName(args.email, args.name);
        await ctx.db.patch(existingUser._id, { 
          role: args.role,
          name: firstName,
          email: args.email
        });
      }
      return existingUser._id;
    }

    // Create new user with sanitized name
    const firstName = extractFirstName(args.email, args.name);
    return await ctx.db.insert("users", {
      ...args,
      name: firstName,
      role: args.role || "candidate",
    });
  },
});

export const getUsers = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    // Gracefully handle unauthenticated state to avoid client-side crashes
    if (!identity) return [];

    const users = await ctx.db.query("users").collect();

    return users;
  },
});

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    return user;
  },
});

// Simplified role setting mutation
export const createUserWithRole = mutation({
  args: { 
    role: v.union(v.literal("candidate"), v.literal("interviewer")),
    clerkId: v.string(),
    email: v.string(),
    fullName: v.optional(v.string()),
    image: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    try {
      console.log("=== createUserWithRole called ===");
      console.log("Args:", JSON.stringify(args, null, 2));
      
      const identity = await ctx.auth.getUserIdentity();
      console.log("Identity result:", identity ? "Found" : "Not found");
      
      if (!identity) {
        console.error("No user identity found");
        throw new Error("Unauthorized: No user identity found");
      }

      console.log("Creating/updating user with role:", args.clerkId, "to:", args.role);
      console.log("User identity:", identity);

      // Validate required fields
      if (!args.clerkId || !args.email || !args.role) {
        throw new Error("Missing required fields: clerkId, email, or role");
      }

      // Extract first name
      const firstName = extractFirstName(args.email, args.fullName);
      console.log("Extracted first name:", firstName);

      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
        .first();

      console.log("Existing user:", existingUser ? "Found" : "Not found");

      if (!existingUser) {
        // Create a new user
        console.log("Creating new user with role:", args.role);
        const userId = await ctx.db.insert("users", {
          clerkId: args.clerkId,
          email: args.email,
          name: firstName,
          image: args.image,
          role: args.role,
        });
        console.log("Created user with ID:", userId);
        return { success: true, userId };
      }

      // Update existing user
      console.log("Updating existing user:", existingUser._id, "to role:", args.role);
      await ctx.db.patch(existingUser._id, { 
        role: args.role,
        name: firstName,
        email: args.email,
        image: args.image
      });
      return { success: true, userId: existingUser._id };
    } catch (error) {
      console.error("Error in createUserWithRole:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
      throw error;
    }
  },
});

// Test mutation to verify authentication
export const testAuth = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("No user identity found");
    }
    
    return {
      success: true,
      userId: identity.subject,
      email: identity.email,
      name: identity.name,
    };
  },
});

// Simple test mutation to create user without auth (for debugging)
export const createTestUser = mutation({
  args: { 
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("candidate"), v.literal("interviewer")),
  },
  handler: async (ctx, args) => {
    try {
      console.log("Creating test user:", args);
      
      const userId = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: args.email,
        name: args.name,
        role: args.role,
      });
      
      console.log("Created test user with ID:", userId);
      return { success: true, userId };
    } catch (error) {
      console.error("Error in createTestUser:", error);
      throw error;
    }
  },
});

// Test environment variables and auth setup
export const testEnvAndAuth = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("=== Testing Environment and Auth ===");
    
    // Test environment variable
    const domain = process.env.CLERK_JWT_ISSUER_DOMAIN;
    console.log("CLERK_JWT_ISSUER_DOMAIN:", domain);
    
    // Test authentication
    const identity = await ctx.auth.getUserIdentity();
    console.log("Identity:", identity ? "Found" : "Not found");
    
    return {
      success: true,
      domain: domain,
      hasIdentity: !!identity,
    };
  },
});

// Very simple test mutation (no auth)
export const simpleTest = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("=== Simple Test Called ===");
    return {
      success: true,
      message: "Simple test successful",
      timestamp: Date.now(),
    };
  },
});
