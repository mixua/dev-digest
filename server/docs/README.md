# server/docs

Deep-dives for `@devdigest/api`. Overview, commands and the API map live in [`../README.md`](../README.md); not repeated here.

- [architecture.md](architecture.md) — Fastify app, module registry, DI container, workspace scoping, config/secrets, loopback guard.
- [review-run-flow.md](review-run-flow.md) — `POST /pulls/:id/review` end to end, SSE events, repo-intel context, persistence.
- [data-model.md](data-model.md) — main tables and relations in `src/db/schema/`.

API contracts: [`../specs/`](../specs/README.md).
