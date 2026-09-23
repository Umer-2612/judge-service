/** Thin client for a self-hosted Judge0 CE instance. Judge0 does the actual OS-level
 * sandboxing (isolate/cgroups), this only base64-encodes the request, waits for the
 * synchronous result, and decodes the response, nothing here executes code itself. */

export interface RunSubmissionParams {
  languageId: number;
  sourceCode: string;
  stdin?: string;
}

export interface RunSubmissionResult {
  stdout: string;
  stderr: string;
  compileOutput: string;
  message: string;
  status: { id: number; description: string } | null;
  time: string | null;
  memory: number | null;
}

interface Judge0RawResult {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  status: { id: number; description: string } | null;
  time: string | null;
  memory: number | null;
}

function toBase64(value: string): string {
  return Buffer.from(value ?? "", "utf-8").toString("base64");
}

function fromBase64(value: string | null | undefined): string {
  return value ? Buffer.from(value, "base64").toString("utf-8") : "";
}

export async function runSubmission({ languageId, sourceCode, stdin = "" }: RunSubmissionParams): Promise<RunSubmissionResult> {
  const judge0Url = process.env.JUDGE0_URL ?? "http://localhost:2358";

  const response = await fetch(`${judge0Url}/submissions?base64_encoded=true&wait=true`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language_id: languageId,
      source_code: toBase64(sourceCode),
      stdin: toBase64(stdin),
    }),
  });

  if (!response.ok) {
    throw new Error(`Judge0 responded with ${response.status}`);
  }

  const result = (await response.json()) as Judge0RawResult;

  return {
    stdout: fromBase64(result.stdout),
    stderr: fromBase64(result.stderr),
    compileOutput: fromBase64(result.compile_output),
    message: fromBase64(result.message),
    status: result.status,
    time: result.time,
    memory: result.memory,
  };
}
