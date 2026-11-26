# client (@devdigest/web)

## Stack
Next.js 15 (app router, webpack dev) · React 19 · TanStack Query 5 · next-intl (`en` only) · vendored `@devdigest/ui` + `@devdigest/shared` via tsconfig aliases · vitest + jsdom + Testing Library. pnpm, Node ≥ 22. Web on `:3000`, talks to API `:3001`.

## Commands (run in `client/`)
- Dev: `pnpm dev` (needs the API running — `server/`)
- Typecheck: `pnpm typecheck` · tests: `pnpm test` · single file: `pnpm exec vitest run <path>`
- Production build check: `pnpm build`
- After UI changes open the page in the running app — a runtime import from `@devdigest/shared` passes tests but 500s in Next.

## Before answering
Search `client/docs/`, `client/specs/`, `client/INSIGHTS.md` first.

## Conventions (not obvious from code)
- Types/contracts come from `@devdigest/shared` (Zod) — never hand-duplicate them.
- All API access goes through `src/lib/api.ts`.

## Use when
- Page/route map, commands → read `client/README.md`
- Deep-dives → read `client/docs/` · UI/flow specs → read `client/specs/` · findings → read `client/INSIGHTS.md`
