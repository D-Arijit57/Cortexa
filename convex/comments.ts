import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireInterviewPanelist, requireRole } from "./lib/auth";

// add a new comment
export const addComment = mutation({
  args: {
    interviewId: v.id("interviews"),
    content: v.string(),
    rating: v.number(),
  },
  handler: async (ctx, args) => {
    // Only an interviewer on this interview's panel can leave feedback on it.
    const { user } = await requireInterviewPanelist(ctx, args.interviewId);

    return await ctx.db.insert("comments", {
      interviewId: args.interviewId,
      content: args.content,
      rating: args.rating,
      interviewerId: user.clerkId,
    });
  },
});

// get all comments for an interview
export const getComments = query({
  args: { interviewId: v.id("interviews") },
  handler: async (ctx, args) => {
    // Feedback is interviewer-only.
    await requireRole(ctx, "interviewer");

    const comments = await ctx.db
      .query("comments")
      .withIndex("by_interview_id", (q) => q.eq("interviewId", args.interviewId))
      .collect();

    return comments;
  },
});
