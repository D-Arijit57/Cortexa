import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireInterviewPanelist, requireRole } from "./lib/auth";

const INTERVIEW_STATUSES = ["upcoming", "completed", "succeeded", "failed"] as const;

export const getAllInterviews = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    // Gracefully handle unauthenticated state to avoid client-side crashes
    if (!identity) return [];

    const interviews = await ctx.db.query("interviews").collect();

    return interviews;
  },
});

export const getMyInterviews = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const interviews = await ctx.db
      .query("interviews")
      .withIndex("by_candidate_id", (q) => q.eq("candidateId", identity.subject))
      .collect();

    return interviews!;
  },
});

export const getInterviewByStreamCallId = query({
  args: { streamCallId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("interviews")
      .withIndex("by_stream_call_id", (q) => q.eq("streamCallId", args.streamCallId))
      .first();
  },
});

export const createInterview = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    status: v.string(),
    streamCallId: v.string(),
    candidateId: v.string(),
    interviewerIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Only interviewers schedule interviews.
    await requireRole(ctx, "interviewer");

    return await ctx.db.insert("interviews", {
      ...args,
    });
  },
});

export const updateInterviewStatus = mutation({
  args: {
    id: v.id("interviews"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    // Only an interviewer on this interview's panel can move its status.
    await requireInterviewPanelist(ctx, args.id);

    if (!INTERVIEW_STATUSES.includes(args.status as (typeof INTERVIEW_STATUSES)[number])) {
      throw new Error(`Invalid status: "${args.status}"`);
    }

    return await ctx.db.patch(args.id, {
      status: args.status,
      ...(args.status === "completed" ? { endTime: Date.now() } : {}),
    });
  },
});
