import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";

type AnyCtx = QueryCtx | MutationCtx;

/**
 * Every exported Convex function is a public endpoint, so authorization has to
 * live inside the handler. These helpers are the single place that happens.
 */

/** Require a signed-in caller. Does not require a `users` row (used at onboarding). */
export async function requireIdentity(ctx: AnyCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized: you must be signed in");
  }
  return identity;
}

/** Resolve the caller's `users` record, or throw. */
export async function requireUser(ctx: AnyCtx): Promise<Doc<"users">> {
  const identity = await requireIdentity(ctx);
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .first();
  if (!user) {
    throw new Error("Unauthorized: no user record; finish onboarding first");
  }
  return user;
}

/** Resolve the caller and assert an exact role, or throw. */
export async function requireRole(
  ctx: AnyCtx,
  role: Doc<"users">["role"]
): Promise<Doc<"users">> {
  const user = await requireUser(ctx);
  if (user.role !== role) {
    throw new Error(`Forbidden: this action requires the "${role}" role`);
  }
  return user;
}

/**
 * Assert the caller is an interviewer AND on this interview's panel.
 * Returns both the caller and the interview so handlers don't re-fetch.
 */
export async function requireInterviewPanelist(
  ctx: AnyCtx,
  interviewId: Id<"interviews">
): Promise<{ user: Doc<"users">; interview: Doc<"interviews"> }> {
  const user = await requireRole(ctx, "interviewer");
  const interview = await ctx.db.get(interviewId);
  if (!interview) {
    throw new Error("Interview not found");
  }
  if (!interview.interviewerIds.includes(user.clerkId)) {
    throw new Error("Forbidden: you are not on this interview's panel");
  }
  return { user, interview };
}
