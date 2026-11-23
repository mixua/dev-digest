# e2e (@devdigest/e2e)

## Stack
TypeScript flows run with `tsx` against the real stack (Postgres + API + web), driven by agent-browser; no LLM calls. **npm**, Node ≥ 22.

## Commands (run in `e2e/`)
- Hermetic run (own ephemeral Postgres + API/web on alternate ports, safe next to a dev stack): `npm run e2e:hermetic` (→ `../scripts/e2e.sh`)
- Against an already running stack: `npm test` · typecheck: `npm run typecheck`
- Prerequisites and flow format → `e2e/README.md`

## Before answering
Search `e2e/docs/`, `e2e/specs/`, `e2e/INSIGHTS.md` first.

## Conventions (not obvious from code)
- Flows are deterministic; no LLM is called — behavior is stable across runs.

## Use when
- How to run, structure → read `e2e/README.md`
- Flow scenarios → read `e2e/specs/*.flow.json` · findings → read `e2e/INSIGHTS.md`
