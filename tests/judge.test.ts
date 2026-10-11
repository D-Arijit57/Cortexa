import { describe, expect, it } from "vitest";
import { buildCppHarness, buildTestsFromExamples, parseCustomTests } from "@/lib/judge";

describe("buildTestsFromExamples", () => {
  it("parses two-sum examples", () => {
    const t = buildTestsFromExamples("two-sum", [{ input: "nums = [2,7,11,15], target = 9", output: "[0,1]" }]);
    expect(t).toEqual([{ id: 1, input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] }]);
  });

  it("parses negative numbers", () => {
    const t = buildTestsFromExamples("two-sum", [{ input: "nums = [-3,4,3,90], target = 0", output: "[0,2]" }]);
    expect(t[0].input).toEqual({ nums: [-3, 4, 3, 90], target: 0 });
  });

  it("parses reverse-string examples and strips quotes", () => {
    const t = buildTestsFromExamples("reverse-string", [{ input: 's = ["h","i"]', output: '["i","h"]' }]);
    expect(t[0].input).toEqual({ s: ["h", "i"] });
    expect(t[0].expected).toEqual(["i", "h"]);
  });

  it("parses palindrome-number examples to booleans", () => {
    const t = buildTestsFromExamples("palindrome-number", [
      { input: "x = 121", output: "true" },
      { input: "x = -121", output: "false" },
    ]);
    expect(t.map((x) => x.expected)).toEqual([true, false]);
    expect(t[1].input).toEqual({ x: -121 });
  });

  it("skips malformed examples and unknown questions", () => {
    expect(buildTestsFromExamples("two-sum", [{ input: "garbage", output: "[]" }])).toEqual([]);
    expect(buildTestsFromExamples("nope", [{ input: "x = 1", output: "true" }])).toEqual([]);
  });

  it("keeps original example numbering when one is skipped", () => {
    const t = buildTestsFromExamples("palindrome-number", [
      { input: "bad", output: "true" },
      { input: "x = 7", output: "true" },
    ]);
    expect(t.map((x) => x.id)).toEqual([2]);
  });
});

describe("parseCustomTests", () => {
  it("returns [] for empty / invalid / non-array input", () => {
    expect(parseCustomTests("two-sum", undefined)).toEqual([]);
    expect(parseCustomTests("two-sum", null)).toEqual([]);
    expect(parseCustomTests("two-sum", "")).toEqual([]);
    expect(parseCustomTests("two-sum", "{not json")).toEqual([]);
    expect(parseCustomTests("two-sum", '{"a":1}')).toEqual([]);
  });

  it("maps a JSON array into numbered test cases", () => {
    const t = parseCustomTests("two-sum", '[{"nums":[1,2],"target":3,"expected":[0,1]}]');
    expect(t).toHaveLength(1);
    expect(t[0].id).toBe(1);
    expect(t[0].expected).toEqual([0, 1]);
  });
});

describe("buildCppHarness", () => {
  const user = "class Solution { public: bool isPalindrome(int x){ return true; } };";

  it("embeds user code and generated test data", () => {
    const tests = buildTestsFromExamples("palindrome-number", [{ input: "x = 121", output: "true" }]);
    const { mainFileName, files } = buildCppHarness("palindrome-number", user, tests);
    expect(mainFileName).toBe("main.cpp");
    expect(files[0].content).toContain(user);
    expect(files[0].content).toContain("vector<int> xs = {121};");
    expect(files[0].content).toContain("int main()");
  });

  it("generates two-sum and reverse-string drivers", () => {
    const two = buildTestsFromExamples("two-sum", [{ input: "nums = [2,7], target = 9", output: "[0,1]" }]);
    expect(buildCppHarness("two-sum", "", two).files[0].content).toContain("numsList = {{2,7}}");
    const rev = buildTestsFromExamples("reverse-string", [{ input: 's = ["a","b"]', output: '["b","a"]' }]);
    expect(buildCppHarness("reverse-string", "", rev).files[0].content).toContain("sList = {{'a','b'}}");
  });

  it("rejects unsupported questions", () => {
    expect(() => buildCppHarness("unknown", "", [])).toThrow(/Unsupported question/);
  });
});
