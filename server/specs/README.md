# server/specs

API contracts and acceptance criteria for `@devdigest/api`. Architecture background: [`../docs/`](../docs/README.md).

- [pulls-list-api.md](pulls-list-api.md) — `GET /repos/:id/pulls` -> `PrMeta[]`: score, severity sums, derived status.
- [reviews-api.md](reviews-api.md) — `GET /pulls/:id/reviews`, `DELETE /reviews/:id`, `POST /findings/:id/accept|dismiss`.
