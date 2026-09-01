import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireIdentity } from "./lib/auth";

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

// Creates the caller's own user record with a chosen role, or updates it.
// `clerkId` is intentionally NOT an argument: it always comes from the
// verified session (identity.subject), never from the client, so a caller
// can only ever create or edit their own record.
export const createUserWithRole = mutation({
  args: {
    role: v.union(v.literal("candidate"), v.literal("interviewer")),
    email: v.optional(v.string()),
    fullName: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);

    const clerkId = identity.subject;
    // Prefer verified claims off the session; fall back to what the client
    // sent (its own profile data — not a privileged field).
    const email = identity.email ?? args.email ?? "";
    const image = identity.pictureUrl ?? args.image;
    const firstName = extractFirstName(email || clerkId, args.fullName ?? identity.name);

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    if (!existingUser) {
      const userId = await ctx.db.insert("users", {
        clerkId,
        email,
        name: firstName,
        image,
        role: args.role,
      });
      return { success: true, userId };
    }

    await ctx.db.patch(existingUser._id, {
      role: args.role,
      name: firstName,
      email,
      image,
    });
    return { success: true, userId: existingUser._id };
  },
});
