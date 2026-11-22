# Server architecture

Request/DI diagram and stack: [`../README.md`](../README.md). This page records where things are wired and the rules that aren't obvious.

## App assembly (`src/app.ts`, `buildApp()`)

Order matters; plugins register **before** modules so encapsulated module plugins inherit them:

1. `loadConfig()` -> `createDb()` -> `new Container(config, db, overrides)`; container is decorated onto Fastify as `app.container`.
2. `ReviewService.reapStaleRuns()` is **awaited** before serving: any `agent_runs.status='running'` left by a dead process is marked failed (assumes a single API instance per DB).
3. `onRequest` hook: host/origin guard (below).
4. `helmet`, `cors` (origins = `config.allowedOrigins`), `fastify-sse-v2`, global rate limit 120/min (skipped when `NODE_ENV=test`); `/health` and `/health/ready` (`SELECT 1`, 503 if DB down).
5. Error handler -> `{ error: { code, message, details? } }`: zod/validation -> 422 `validation_error`; response-serialization failure -> 500 `internal_error`; `AppError` -> its `statusCode`.
6. Every plugin in `modules` is registered (`for ... of Object.values(modules)`).

`bodyLimit` is 1 MiB. Validation is schema-first via `fastify-type-provider-zod` (the `@devdigest/shared` Zod contracts are the route schemas).

## Module registry (`src/modules/index.ts`)

Static record: `settings, repos, pulls, polling, workspace, agents, reviews, repoIntel`. A module is `modules/<name>/routes.ts` exporting a default Fastify plugin, usually with `service.ts` / `repository.ts` beside it. **New feature = new module + one import and one entry** — no filesystem autoload (not portable across tsx / bundler / vitest).

## DI container (`src/platform/container.ts`)

- Holds `config`, `db`, `secrets`, `auth`, `jobs`, `runBus` (in-memory SSE bus, `platform/sse.ts`) plus lazily built adapters: `git`, `github()`, `codeIndex`, `llm(id)`, `embedder()`, `repoIntel`, `priceBook`, `agentsRepo`, `reviewRepo`.
- Services depend on **interfaces from `@devdigest/shared`** (`LLMProvider`, `GitHubClient`, ...), not classes. Tests pass `ContainerOverrides` (`secrets, auth, github, git, codeIndex, embedder, llm, repoIntel, depgraph, tokenizer`); mocks live in `src/adapters/mocks.ts`.
- `llm('openai'|'anthropic'|'openrouter')` builds from the secret key and caches; missing key -> `ConfigError`. OpenAI/Anthropic adapters are in `src/adapters/llm/`; OpenRouter comes from `@devdigest/reviewer-core` with the `PriceBook` injected for cost.
- `llmWithKey` / `githubWithToken` build uncached clients from a **candidate** key ("Test connection") so a typo can't overwrite a working key. `invalidateSecretCaches()` after saving a key.
- **repo-intel is reached only through `container.repoIntel.*`** (facade; degrades to empty results when disabled/unindexed). Indexer internals: `src/modules/repo-intel/README.md`.

## Workspace scoping

Every domain table carries `workspace_id`. Handlers call `getContext(container, req)` (`src/modules/_shared/context.ts`) which asks the `AuthProvider` for user + workspace. The only implementation is `LocalNoAuthProvider` (`src/adapters/auth/local.ts`): the seeded system user and default workspace (`pnpm db:seed` required, else it throws). Queries then filter on `workspaceId` (e.g. `pulls/routes.ts` list, `reviews` repository functions). Swapping auth = new `AuthProvider`; call sites don't change.

## Secrets and env (`src/platform/config.ts`)

- `loadConfig()` zod-parses env: `DATABASE_URL`, `API_PORT` (3001), `API_HOST` (127.0.0.1), `API_ALLOWED_HOSTS`, `WEB_PORT` (3000), `DEVDIGEST_CLONE_DIR`, `NODE_ENV`, `LOG_LEVEL`, `EMBEDDINGS_ENABLED` (default off), `REPO_INTEL_ENABLED` (default on).
- **API keys are deliberately not in config.** They are read only through `SecretsProvider` (`src/adapters/secrets/local.ts`): `~/.devdigest/secrets.json` (0600) with `process.env` fallback. Feature code must not read `process.env` for secrets.

## Loopback-only, no-auth API

There is no authentication. Protection is network-level:

- Binds to `API_HOST` = `127.0.0.1` by default; binding wider exposes every route.
- DNS-rebinding guard (`src/platform/local-only.ts`, hook in `app.ts:92`): `Host` must be in `allowedHosts` (`localhost`, `127.0.0.1`, `::1` + `API_ALLOWED_HOSTS`), else 403 `forbidden_host`; `Origin`, when present, must be `http://localhost:<WEB_PORT>` or `127.0.0.1` equivalent, else 403 `forbidden_origin`. Requests with no `Origin` (curl, CLIs) pass.
- CORS is limited to the same origins.
