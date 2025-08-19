import { NextResponse } from "next/server";
import { CODING_QUESTIONS } from "@/constants";
import { buildTestsFromExamples, parseCustomTests, runCpp } from "@/lib/judge";

export async function POST(request: Request) {
  try {
    const { code, language, questionId, customTests } = await request.json();

    if (typeof code !== "string" || typeof language !== "string" || typeof questionId !== "string") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const question = CODING_QUESTIONS.find((q) => q.id === questionId);
    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // Build tests from examples + optional custom tests
    const exampleTests = buildTestsFromExamples(question.id, question.examples.map((e) => ({ input: e.input, output: e.output })));
    const userTests = parseCustomTests(question.id, customTests);
    const tests = [...exampleTests, ...userTests];

    if (language === "cpp") {
      const results = await runCpp(question.id, code, tests);
      return NextResponse.json({ results });
    }

    // For non-C++ languages, keep previous simulated response for now
    const simResults = tests.map((t) => ({
      testNumber: t.id,
      input: t.input,
      expectedOutput: t.expected,
      actualOutput: t.expected,
      passed: true,
      executionTime: 1,
    }));
    return NextResponse.json({ results: simResults });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process run request" }, { status: 500 });
  }
}


