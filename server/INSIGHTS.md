# Insights — server

Non-obvious findings and gotchas. Add an entry whenever something surprised you,
so the next agent/session doesn't relearn it. Append-only — see the
`engineering-insights` skill for how entries are captured.

## What Works

## What Doesn't Work

## Codebase Patterns

- **2026-06-14** — Shared contracts (`@devdigest/shared`) are vendored as TWO hand-maintained copies — `server/src/vendor/shared/` and `client/src/vendor/shared/` — resolved by tsconfig path alias, NOT auto-synced. Adding a field means editing both in lock-step; the only diffs between copies are comments. Evidence: `server/src/vendor/shared/contracts/trace.ts`, `platform.ts`.
- **2026-06-14** — `completeAgentRun`'s `values` shape is declared in TWO places that must match: the repo fn (`repository/run.repo.ts`) AND the interface wrapper (`repository.ts:151`). Adding a field needs both or typecheck fails.

## Tool & Library Notes

- **2026-06-14** — New DB columns: edit `db/schema/*.ts`, then `pnpm db:generate` (drizzle-kit) auto-generates `00NN_*.sql`. Never hand-write migration SQL; apply with `pnpm db:migrate`.

## Recurring Errors & Fixes


## Session Notes

## Open Questions

