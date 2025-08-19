type PistonRuntime = {
  language: string;
  version: string;
};

let cachedRuntimes: PistonRuntime[] | null = null;

async function getRuntimes(): Promise<PistonRuntime[]> {
  if (cachedRuntimes) return cachedRuntimes;
  const res = await fetch("https://emkc.org/api/v2/piston/runtimes", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch runtimes");
  const data = (await res.json()) as PistonRuntime[];
  cachedRuntimes = data;
  return data;
}

function selectLanguageVersion(runtimes: PistonRuntime[], languageId: string): { language: string; version: string } {
  const found = runtimes.find((r) => r.language === languageId);
  if (!found) {
    throw new Error(`Language not supported by runner: ${languageId}`);
  }
  return { language: found.language, version: found.version };
}

export type JudgeTestCase = {
  id: number;
  input: any;
  expected: any;
};

export type JudgeResult = {
  testNumber: number;
  input: any;
  expectedOutput: any;
  actualOutput: any;
  passed: boolean;
  executionTimeMs?: number;
  stderr?: string;
};

export async function runCpp(questionId: string, userCode: string, tests: JudgeTestCase[]): Promise<JudgeResult[]> {
  const runtimes = await getRuntimes();
  const { language, version } = selectLanguageVersion(runtimes, "cpp");

  const { mainFileName, files } = buildCppHarness(questionId, userCode, tests);

  const res = await fetch("https://emkc.org/api/v2/piston/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language,
      version,
      files,
    }),
  });

  if (!res.ok) {
    throw new Error("Runner request failed");
  }

  const data = await res.json();
  const run = data.run as { stdout: string; stderr: string }; // compile?.code etc ignored for brevity

  // Each line of stdout will be a JSON object string with result details
  const lines = (run.stdout || "").trim().split(/\n+/).filter(Boolean);
  const results: JudgeResult[] = lines.map((line) => {
    try {
      const o = JSON.parse(line);
      return {
        testNumber: o.testNumber,
        input: o.input,
        expectedOutput: o.expected,
        actualOutput: o.actual,
        passed: !!o.passed,
        executionTimeMs: o.timeMs,
      };
    } catch {
      return {
        testNumber: -1,
        input: null,
        expectedOutput: null,
        actualOutput: line,
        passed: false,
        stderr: run.stderr,
      };
    }
  });

  return results;
}

function escapeStringForCppJson(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function buildCppHarness(questionId: string, userCode: string, tests: JudgeTestCase[]): { mainFileName: string; files: Array<{ name: string; content: string }> } {
  const includes = [
    "#include <bits/stdc++.h>",
  ].join("\n");

  const helpers = `
using namespace std;

static string vecToJson(const vector<int>& v){
  string s = "[";
  for(size_t i=0;i<v.size();++i){ s += to_string(v[i]); if(i+1<v.size()) s += ","; }
  s += "]"; return s;
}
static string charVecToJson(const vector<char>& v){
  string s = "[";
  for(size_t i=0;i<v.size();++i){ s += string("\"") + v[i] + "\""; if(i+1<v.size()) s += ","; }
  s += "]"; return s;
}
static void printResultJson(int testNumber, const string& input, const string& expected, const string& actual, bool passed){
  cout << "{\"testNumber\":" << testNumber
       << ",\"input\":\"" << input << "\""
       << ",\"expected\":\"" << expected << "\""
       << ",\"actual\":\"" << actual << "\""
       << ",\"passed\":" << (passed?"true":"false")
       << "}" << endl;
}
`;

  const cppUser = userCode;

  let mainBody = "";
  if (questionId === "two-sum") {
    const numsList = tests.map(t => t.input.nums as number[]);
    const targets = tests.map(t => t.input.target as number);
    const expecteds = tests.map(t => t.expected as number[]);
    const numsDecl = `vector<vector<int>> numsList = {${numsList.map(v => `{${v.join(',')}}`).join(',')}};`;
    const targetsDecl = `vector<int> targets = {${targets.join(',')}};`;
    const expectedDecl = `vector<vector<int>> expected = {${expecteds.map(v => `{${v.join(',')}}`).join(',')}};`;
    mainBody = `
  ${numsDecl}
  ${targetsDecl}
  ${expectedDecl}
  for(size_t i=0;i<numsList.size();++i){
    vector<int> actual = Solution().twoSum(numsList[i], targets[i]);
    string inputStr = string("nums=") + vecToJson(numsList[i]) + ",target=" + to_string(targets[i]);
    string expectedStr = vecToJson(expected[i]);
    string actualStr = vecToJson(actual);
    bool pass = (actual == expected[i]);
    printResultJson((int)i+1, inputStr, expectedStr, actualStr, pass);
  }
`;
  } else if (questionId === "reverse-string") {
    const sList = tests.map(t => {
      const arr = Array.isArray(t.input.s) ? t.input.s as string[] : String(t.input.s).split("");
      return arr;
    });
    const expecteds = tests.map(t => {
      const arr = Array.isArray(t.expected) ? t.expected as string[] : String(t.expected).split("");
      return arr;
    });
    const sDecl = `vector<vector<char>> sList = {${sList.map(v => `{${v.map(ch => `'${escapeStringForCppJson(ch)}'`).join(',')}}`).join(',')}};`;
    const expectedDecl = `vector<vector<char>> expected = {${expecteds.map(v => `{${v.map(ch => `'${escapeStringForCppJson(ch)}'`).join(',')}}`).join(',')}};`;
    mainBody = `
  ${sDecl}
  ${expectedDecl}
  for(size_t i=0;i<sList.size();++i){
    vector<char> s = sList[i];
    Solution().reverseString(s);
    string inputStr = string("s=") + charVecToJson(sList[i]);
    string expectedStr = charVecToJson(expected[i]);
    string actualStr = charVecToJson(s);
    bool pass = (s == expected[i]);
    printResultJson((int)i+1, inputStr, expectedStr, actualStr, pass);
  }
`;
  } else if (questionId === "palindrome-number") {
    const xs = tests.map(t => Number(t.input.x));
    const expecteds = tests.map(t => Boolean(t.expected));
    const xDecl = `vector<int> xs = {${xs.join(',')}};`;
    const expectedDecl = `vector<bool> expected = {${expecteds.map(b => b ? 'true' : 'false').join(',')}};`;
    mainBody = `
  ${xDecl}
  ${expectedDecl}
  for(size_t i=0;i<xs.size();++i){
    bool actual = Solution().isPalindrome(xs[i]);
    string inputStr = string("x=") + to_string(xs[i]);
    string expectedStr = string(expected[i] ? "true" : "false");
    string actualStr = string(actual ? "true" : "false");
    bool pass = (actual == expected[i]);
    printResultJson((int)i+1, inputStr, expectedStr, actualStr, pass);
  }
`;
  } else {
    throw new Error(`Unsupported question for C++ harness: ${questionId}`);
  }

  const main = `${includes}
${helpers}
${cppUser}
int main(){
${mainBody}
  return 0;
}
`;

  return {
    mainFileName: "main.cpp",
    files: [{ name: "main.cpp", content: main }],
  };
}

export function buildTestsFromExamples(questionId: string, examples: Array<{ input: string; output: string }>): JudgeTestCase[] {
  const tests: JudgeTestCase[] = [];
  examples.forEach((ex, idx) => {
    if (questionId === "two-sum") {
      const m = ex.input.match(/nums\s*=\s*\[(.*?)\]\s*,\s*target\s*=\s*([\-0-9]+)/);
      if (m) {
        const nums = m[1].split(',').map((x) => Number(x.trim()));
        const target = Number(m[2]);
        const expected = ex.output.replace(/\[|\]/g, '').split(',').map((x) => Number(x.trim()));
        tests.push({ id: idx + 1, input: { nums, target }, expected });
      }
    } else if (questionId === "reverse-string") {
      const m = ex.input.match(/s\s*=\s*\[(.*)\]/);
      if (m) {
        const s = m[1]
          .split(',')
          .map((x) => x.trim())
          .map((x) => x.replace(/^\"|\"$/g, ''));
        const expected = ex.output
          .replace(/\[|\]/g, '')
          .split(',')
          .map((x) => x.trim())
          .map((x) => x.replace(/^\"|\"$/g, ''));
        tests.push({ id: idx + 1, input: { s }, expected });
      }
    } else if (questionId === "palindrome-number") {
      const m = ex.input.match(/x\s*=\s*([\-0-9]+)/);
      if (m) {
        const x = Number(m[1]);
        const expected = ex.output.trim().toLowerCase() === 'true';
        tests.push({ id: idx + 1, input: { x }, expected });
      }
    }
  });
  return tests;
}

export function parseCustomTests(questionId: string, raw: string | undefined | null): JudgeTestCase[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.map((obj: any, i: number) => ({ id: i + 1, input: obj, expected: obj.expected })) as JudgeTestCase[];
  } catch {
    return [];
  }
}


