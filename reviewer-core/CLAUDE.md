# reviewer-core (@devdigest/reviewer-core)

## Stack
Pure TypeScript ESM library: zod schemas, `openai` SDK (OpenRouter provider), vitest. **npm** (`package-lock.json`), Node ≥ 22. Imported as raw source by `server/` via a tsconfig alias — its deps must be installed (`npm ci`) or the API fails to boot.

## Commands (run in `reviewer-core/`)
- Install: `npm ci`
- Typecheck: `npm run typecheck` · tests: `npm test` · single file: `npx vitest run <path>`

## Iron rule
No I/O — no DB, fs, GitHub, or persistence. Only the injected `LLMProvider`. The same code
runs in the studio (server) and in CI. Keep it pure.

## Before answering
Search `reviewer-core/docs/`, `reviewer-core/specs/`, `reviewer-core/INSIGHTS.md` first.

## Conventions (not obvious from code)
- The grounding gate (`src/grounding.ts`) is mandatory; score is computed from findings that SURVIVED grounding, not the model's self-report.
- skills/memory/specs arrive as RESOLVED strings (slug→body is the caller's job).

## Use when
- Pipeline overview → read `reviewer-core/README.md`
- Deep-dives → read `reviewer-core/docs/` · specs → read `reviewer-core/specs/` · findings → read `reviewer-core/INSIGHTS.md`
