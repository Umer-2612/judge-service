import { Router } from "express";
import { executeSchema } from "./execute.dto";
import { runSubmission } from "./judge0.service";

export const executeRouter = Router();

executeRouter.post("/", async (req, res) => {
  const parsed = executeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.issues[0]?.message ?? "Invalid request" });
    return;
  }

  try {
    const result = await runSubmission({
      languageId: parsed.data.language_id,
      sourceCode: parsed.data.code,
      stdin: parsed.data.stdin,
    });
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error("Judge0 execution error:", err);
    res.status(502).json({ success: false, error: "Code execution engine unavailable" });
  }
});
