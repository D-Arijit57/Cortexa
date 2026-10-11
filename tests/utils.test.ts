import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  calculateRecordingDuration,
  getCandidateInfo,
  getInterviewerInfo,
  getMeetingStatus,
  groupInterviews,
} from "@/lib/utils";

const NOW = new Date("2026-01-15T12:00:00Z").getTime();
const HOUR = 3600_000;
const iv = (over: Record<string, unknown> = {}): any => ({
  _id: "i", _creationTime: 0, title: "t", status: "upcoming", streamCallId: "s",
  candidateId: "c", interviewerIds: ["x"], startTime: NOW + HOUR, ...over,
});

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(NOW); });
afterEach(() => vi.useRealTimers());

describe("groupInterviews", () => {
  it("buckets by status, then by time relative to now", () => {
    const g = groupInterviews([
      iv({ _id: "a", status: "succeeded" }),
      iv({ _id: "b", status: "failed" }),
      iv({ _id: "c", startTime: NOW - HOUR }),
      iv({ _id: "d", startTime: NOW + HOUR }),
    ]);
    expect(g.succeeded.map((x: any) => x._id)).toEqual(["a"]);
    expect(g.failed.map((x: any) => x._id)).toEqual(["b"]);
    expect(g.completed.map((x: any) => x._id)).toEqual(["c"]);
    expect(g.upcoming.map((x: any) => x._id)).toEqual(["d"]);
  });

  it("returns {} for empty/undefined input", () => {
    expect(groupInterviews([])).toEqual({});
    expect(groupInterviews(undefined as any)).toEqual({});
  });
});

describe("getMeetingStatus", () => {
  it("is live within the 1h window after start", () => {
    expect(getMeetingStatus(iv({ startTime: NOW - 30 * 60_000 }))).toBe("live");
    expect(getMeetingStatus(iv({ startTime: NOW }))).toBe("live");
  });
  it("is upcoming before start and completed after the window", () => {
    expect(getMeetingStatus(iv({ startTime: NOW + HOUR }))).toBe("upcoming");
    expect(getMeetingStatus(iv({ startTime: NOW - 2 * HOUR }))).toBe("completed");
  });
  it("terminal statuses always read as completed", () => {
    for (const status of ["completed", "failed", "succeeded"])
      expect(getMeetingStatus(iv({ status, startTime: NOW }))).toBe("completed");
  });
});

describe("user lookups", () => {
  const users: any[] = [{ clerkId: "u1", name: "Ada Lovelace", image: "img" }];
  it("finds candidate/interviewer info and builds initials", () => {
    expect(getCandidateInfo(users, "u1")).toEqual({ name: "Ada Lovelace", image: "img", initials: "AL" });
    expect(getInterviewerInfo(users, "u1").initials).toBe("AL");
  });
  it("falls back for unknown ids", () => {
    expect(getCandidateInfo(users, "zz")).toEqual({ name: "Unknown Candidate", image: "", initials: "UC" });
    expect(getInterviewerInfo(users, "zz").initials).toBe("UI");
  });
});

describe("calculateRecordingDuration", () => {
  it("formats h:mm:ss, m:ss and seconds", () => {
    expect(calculateRecordingDuration("2026-01-01T00:00:00Z", "2026-01-01T01:02:03Z")).toBe("1:02:03");
    expect(calculateRecordingDuration("2026-01-01T00:00:00Z", "2026-01-01T00:05:07Z")).toBe("5:07");
    expect(calculateRecordingDuration("2026-01-01T00:00:00Z", "2026-01-01T00:00:09Z")).toBe("9 seconds");
  });
});
