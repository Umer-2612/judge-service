# judge-service

Runs submitted code and grades it against test cases.

Full plan: see the `platform` repo's README (sibling folder).

**Build order:** #4 (alongside `collab-service`).

**Build fresh — no reusable judge exists in any cloned repo:**
- `Codeinterview/backend/src/routes/execute.js` runs JS with `new Function()` in-process — not sandboxed, escapable (`this.constructor.constructor('return process')()`). Python route is a stub, no execution.
- `CodingInterviewPlatform` has no server-side execution at all (browser-only, Pyodide + `new Function()`).

**Plan:** self-host **Judge0** or **Piston**; run submissions inside the same sandbox container `sandbox-orchestrator` provisions, rather than maintaining a second execution system.
