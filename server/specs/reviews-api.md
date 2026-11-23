# Reviews API

Routes: `src/modules/reviews/routes.ts`; logic: `service.ts`, `findings.ts`, `helpers.ts` (DTOs), `repository/review.repo.ts`. All handlers resolve the workspace via `getContext`. Run endpoints (`POST /pulls/:id/review`, SSE, runs, trace): [`../docs/review-run-flow.md`](../docs/review-run-flow.md).

## `GET /pulls/:id/reviews`

- `:id` = PR uuid in the caller's workspace; unknown -> 404 `Pull request not found`.
- Returns `ReviewDto[]`, **newest first** (`created_at desc`), one per persisted review (= one per completed agent run), each with its `findings`:
  `id, pr_id, agent_id, run_id, agent_name, kind, verdict, summary, score, model, created_at, findings[]`.
- Finding DTO (`ReviewDtoFinding`): `id, severity, category, title, file, start_line, end_line, rationale, suggestion, confidence (0..1), kind, trifecta_components, evidence (always null), review_id, accepted_at, dismissed_at` (ISO strings or null).
- `agent_name` is looked up per agent; null if the agent was deleted or `agent_id` is null. `run_id` joins to `GET /pulls/:id/runs` (`RunSummary.run_id`).
- Failed/cancelled runs produce no review, so they never appear here.

## `DELETE /reviews/:id`

- Deletes one review and, by FK cascade, its findings; scoped by `workspace_id`.
- `200 {ok:true}`; not found in the workspace -> 404 `Review not found`.
- Does **not** delete the `agent_runs` row (that is `DELETE /runs/:id`, which the client says also removes the review it produced — see `deleteAgentRun`).

## `POST /findings/:id/accept` and `/dismiss`

- Registered in a loop over `['accept','dismiss']`; no body needed.
- Resolves finding -> review -> PR; if missing or the PR belongs to another workspace -> 404 `Finding not found`.
- `accept`: sets `accepted_at = now`, clears `dismissed_at`. `dismiss`: sets `dismissed_at = now`, clears `accepted_at`. They are **not toggles** — repeating the call just refreshes the timestamp.
- Response `{ finding: ReviewDtoFinding }`.
- `FindingActionKind` also lists `learn` and `reply`, but these routes only exist for accept/dismiss; the service rejects other actions with 400 `invalid_action`.
- Invalid ids are rejected by `IdParams` (422).
