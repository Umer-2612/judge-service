# judge-service

A thin, stateless Express proxy in front of a self-hosted [Judge0](https://judge0.com) CE
instance. Judge0 does the actual OS-level sandboxing (isolate/cgroups) and grading, this
service only base64-encodes the request, waits for the synchronous result, and decodes the
response, no code ever executes inside this process. Ported from
`Codeinterview/backend/src/services/judge0.js` (a clean, minimal proxy already doing exactly
this against a real Judge0 instance), not from either reference repo's in-process
`new Function()` "sandbox", which is trivially escapable
(`this.constructor.constructor('return process')()`) and was never used here.

No database, no auth. Called directly from the browser by web-frontend's candidate-portal DSA
round page (`/interview/:token/dsa`), not routed through core-api, so a slow or failing Judge0
never blocks anything else in the API.

## Running Judge0 itself

This service expects a Judge0 CE instance already running and reachable at `JUDGE0_URL`
(default `http://localhost:2358`). It does not start or manage Judge0, see
[Judge0's own docs](https://github.com/judge0/judge0) for its docker-compose setup (server +
worker + Postgres + Redis).

## Running this service

```bash
npm install
npm run dev
```

Or via the platform's `docker compose up`, see the `platform` repo's README. Inside Docker,
point `JUDGE0_URL` at `http://host.docker.internal:2358` to reach a Judge0 instance running
directly on the host (see `secrets-vault`'s `vault.env.template`).

## `POST /execute`

```json
// request
{ "language_id": 63, "code": "console.log(1)", "stdin": "" }
// response 200
{ "success": true, "stdout": "1\n", "stderr": "", "compileOutput": "", "message": "", "status": { "id": 3, "description": "Accepted" }, "time": "0.01", "memory": 3400 }
// response 502 (Judge0 unreachable or erroring)
{ "success": false, "error": "Code execution engine unavailable" }
```

`language_id` is a [Judge0 language id](https://ce.judge0.com/languages), see
`web-frontend`'s `dsa-constants.ts` for the ids this product currently offers.

## Tests

```bash
npm run test
```
