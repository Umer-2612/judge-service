import { z } from "zod";

// POST /execute, no auth: a thin, public proxy to Judge0, gated only by nothing yet
// (the candidate portal is itself unauthenticated by design, see core-api's API.md).
export const executeSchema = z.object({
  language_id: z.number().int().positive(),
  code: z.string().min(1, "code is required"),
  stdin: z.string().optional(),
});
export type ExecuteDto = z.infer<typeof executeSchema>;
