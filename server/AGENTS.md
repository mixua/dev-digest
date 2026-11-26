# server (@devdigest/api)

## Stack
Fastify 5 (zod type provider, SSE) · Drizzle ORM over postgres-js · Postgres + pgvector (Docker) · Octokit, simple-git, ripgrep, ast-grep · vitest + testcontainers. pnpm, Node ≥ 22. API on `127.0.0.1:3001`.

## Commands (run in `server/`)
- Dev API (watch): `pnpm dev` · needs Postgres up and migrations applied
- DB: `pnpm db:migrate` (not run on boot) · `pnpm db:seed` (idempotent) · `pnpm db:generate` after editing `src/db/schema/*` (never hand-write SQL)
- Typecheck: `pnpm typecheck`
- Unit (hermetic, no Docker): `pnpm exec vitest run --exclude '**/*.it.test.ts'`
- Integration (Docker / testcontainers): `pnpm exec vitest run .it.test` · all: `pnpm test`
- Single file: `pnpm exec vitest run test/pulls-findings.test.ts`

## Before answering
Search `server/docs/`, `server/specs/`, `server/INSIGHTS.md` for the topic before reading code.

## Conventions (not obvious from code)
- Multi-tenancy: every domain table has `workspace_id`; queries are scoped by the base-repository guard.
- DI via `src/platform/container.ts`: services depend on interfaces (`@devdigest/shared`), not classes; tests inject mocks via `ContainerOverrides`.
- repo-intel is reached ONLY through the facade `container.repoIntel.*` — never touch the pipeline directly.
- Context enrichment is best-effort: on error/unindexed, omit the section, don't throw.
- New feature = new module + one line in `src/modules/index.ts`; new columns = your own migration only.

## Use when
- Overview, commands, route/API map → read `server/README.md`
- Indexer internals → read `server/src/modules/repo-intel/README.md`
- Deep-dives → read `server/docs/` · feature specs/acceptance → read `server/specs/` · gotchas/findings → read `server/INSIGHTS.md`
