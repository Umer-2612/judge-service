import { afterEach, describe, expect, it, vi } from "vitest";
import { runSubmission } from "./judge0.service";

describe("runSubmission", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("base64-encodes the request and decodes the response", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        stdout: Buffer.from("hello\n").toString("base64"),
        stderr: null,
        compile_output: null,
        message: null,
        status: { id: 3, description: "Accepted" },
        time: "0.01",
        memory: 3400,
      }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await runSubmission({ languageId: 63, sourceCode: 'console.log("hello")', stdin: "" });

    expect(result.stdout).toBe("hello\n");
    expect(result.status?.description).toBe("Accepted");
    expect(result.memory).toBe(3400);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/submissions?base64_encoded=true&wait=true");
    const body = JSON.parse(init.body as string) as { language_id: number; source_code: string };
    expect(body.language_id).toBe(63);
    expect(Buffer.from(body.source_code, "base64").toString("utf-8")).toBe('console.log("hello")');
  });

  it("decodes compile_output and stderr when present", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        stdout: null,
        stderr: Buffer.from("boom").toString("base64"),
        compile_output: Buffer.from("syntax error").toString("base64"),
        message: null,
        status: { id: 6, description: "Compilation Error" },
        time: null,
        memory: null,
      }),
    }) as unknown as typeof fetch;

    const result = await runSubmission({ languageId: 54, sourceCode: "int main() {" });

    expect(result.compileOutput).toBe("syntax error");
    expect(result.stderr).toBe("boom");
    expect(result.status?.description).toBe("Compilation Error");
  });

  it("throws when Judge0 responds with a non-ok status", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;

    await expect(runSubmission({ languageId: 63, sourceCode: "x" })).rejects.toThrow("Judge0 responded with 500");
  });
});
