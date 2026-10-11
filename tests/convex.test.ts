/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "../convex/_generated/api";
import schema from "../convex/schema";

const modules = import.meta.glob("../convex/**/*.ts");
const setup = () => convexTest(schema, modules);

async function seed(t: ReturnType<typeof setup>) {
  await t.run(async (ctx) => {
    await ctx.db.insert("users", { clerkId: "int1", name: "Int", email: "i1@x.com", role: "interviewer" });
    await ctx.db.insert("users", { clerkId: "int2", name: "Int2", email: "i2@x.com", role: "interviewer" });
    await ctx.db.insert("users", { clerkId: "cand1", name: "Cand", email: "c@x.com", role: "candidate" });
  });
  return {
    int1: t.withIdentity({ subject: "int1" }),
    int2: t.withIdentity({ subject: "int2" }),
    cand: t.withIdentity({ subject: "cand1" }),
  };
}

const interviewArgs = (over = {}) => ({
  title: "Mock", startTime: Date.now() + 3600_000, status: "upcoming",
  streamCallId: crypto.randomUUID(), candidateId: "cand1", interviewerIds: ["int1"], ...over,
});

describe("authorization: createInterview", () => {
  it("allows interviewers", async () => {
    const t = setup(); const { int1 } = await seed(t);
    await expect(int1.mutation(api.interviews.createInterview, interviewArgs())).resolves.toBeTruthy();
  });
  it("rejects candidates (Forbidden)", async () => {
    const t = setup(); const { cand } = await seed(t);
    await expect(cand.mutation(api.interviews.createInterview, interviewArgs())).rejects.toThrow(/Forbidden/);
  });
  it("rejects anonymous callers", async () => {
    const t = setup(); await seed(t);
    await expect(t.mutation(api.interviews.createInterview, interviewArgs())).rejects.toThrow(/Unauthorized/);
  });
  it("rejects signed-in users who skipped onboarding", async () => {
    const t = setup(); await seed(t);
    await expect(t.withIdentity({ subject: "ghost" }).mutation(api.interviews.createInterview, interviewArgs()))
      .rejects.toThrow(/finish onboarding/);
  });
});

describe("authorization: panel-only status + feedback", () => {
  it("panelist can update status; completed sets endTime", async () => {
    const t = setup(); const { int1 } = await seed(t);
    const id = await int1.mutation(api.interviews.createInterview, interviewArgs());
    await int1.mutation(api.interviews.updateInterviewStatus, { id, status: "completed" });
    const row = await t.run((ctx) => ctx.db.get(id));
    expect(row?.status).toBe("completed");
    expect(row?.endTime).toBeTypeOf("number");
  });
  it("non-panel interviewer is forbidden", async () => {
    const t = setup(); const { int1, int2 } = await seed(t);
    const id = await int1.mutation(api.interviews.createInterview, interviewArgs());
    await expect(int2.mutation(api.interviews.updateInterviewStatus, { id, status: "failed" })).rejects.toThrow(/not on this interview's panel/);
    await expect(int2.mutation(api.comments.addComment, { interviewId: id, content: "x", rating: 3 })).rejects.toThrow(/panel/);
  });
  it("candidate cannot change status", async () => {
    const t = setup(); const { int1, cand } = await seed(t);
    const id = await int1.mutation(api.interviews.createInterview, interviewArgs());
    await expect(cand.mutation(api.interviews.updateInterviewStatus, { id, status: "succeeded" })).rejects.toThrow(/Forbidden/);
  });
  it("invalid status is rejected", async () => {
    const t = setup(); const { int1 } = await seed(t);
    const id = await int1.mutation(api.interviews.createInterview, interviewArgs());
    await expect(int1.mutation(api.interviews.updateInterviewStatus, { id, status: "hired" })).rejects.toThrow(/Invalid status/);
  });
  it("comments are interviewer-only to read", async () => {
    const t = setup(); const { int1, cand } = await seed(t);
    const id = await int1.mutation(api.interviews.createInterview, interviewArgs());
    await int1.mutation(api.comments.addComment, { interviewId: id, content: "good", rating: 5 });
    expect(await int1.query(api.comments.getComments, { interviewId: id })).toHaveLength(1);
    await expect(cand.query(api.comments.getComments, { interviewId: id })).rejects.toThrow(/Forbidden/);
  });
});

describe("data scoping + identity", () => {
  it("getMyInterviews returns only the caller's candidate interviews", async () => {
    const t = setup(); const { int1, cand } = await seed(t);
    await int1.mutation(api.interviews.createInterview, interviewArgs());
    await int1.mutation(api.interviews.createInterview, interviewArgs({ candidateId: "other" }));
    expect(await cand.query(api.interviews.getMyInterviews, {})).toHaveLength(1);
  });
  it("queries return [] when signed out", async () => {
    const t = setup(); await seed(t);
    expect(await t.query(api.interviews.getAllInterviews, {})).toEqual([]);
    expect(await t.query(api.users.getUsers, {})).toEqual([]);
  });
  it("createUserWithRole takes clerkId from the session, not args", async () => {
    const t = setup();
    const me = t.withIdentity({ subject: "real-me", email: "me@x.com" });
    // @ts-expect-error clerkId is intentionally not an accepted arg
    await expect(me.mutation(api.users.createUserWithRole, { role: "interviewer", clerkId: "victim" })).rejects.toThrow();
    await me.mutation(api.users.createUserWithRole, { role: "candidate" });
    const rows = await t.run((ctx) => ctx.db.query("users").collect());
    expect(rows.map((r) => r.clerkId)).toEqual(["real-me"]);
  });
  it("re-onboarding updates the existing record instead of duplicating", async () => {
    const t = setup();
    const me = t.withIdentity({ subject: "u", email: "u@x.com" });
    await me.mutation(api.users.createUserWithRole, { role: "candidate" });
    await me.mutation(api.users.createUserWithRole, { role: "interviewer" });
    const rows = await t.run((ctx) => ctx.db.query("users").collect());
    expect(rows).toHaveLength(1);
    expect(rows[0].role).toBe("interviewer");
  });
});
