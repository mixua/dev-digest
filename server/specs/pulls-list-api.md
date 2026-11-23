# `GET /repos/:id/pulls`

Route: `src/modules/pulls/routes.ts` (list handler). Helpers: `src/modules/pulls/findings.ts`, `src/modules/pulls/status.ts`. Response contract: `PrMeta[]` in `src/vendor/shared/contracts/platform.ts` (`PrMeta`). Consumer spec: [`../../client/specs/pr-list-findings.md`](../../client/specs/pr-list-findings.md).

## Behaviour

1. `:id` is the repo uuid, scoped to the caller's workspace; unknown -> 404 `Repo not found`.
2. **Local-first sync.** When a GitHub client is available it upserts PRs by `(repo_id, number)` (title, head sha, status, updated_at only on conflict) and backfills diff stats for up to 10 rows with all-zero stats. Any GitHub failure is logged and ignored: persisted PRs are still served.
3. Returns every `pull_requests` row of the repo (no pagination, no server filter).

## Response fields (`PrMeta`)

| Field | Rule |
|---|---|
| `id`, `number`, `title`, `author`, `branch`, `base`, `head_sha`, `additions`, `deletions`, `files_count`, `opened_at`, `updated_at` | straight from the row |
| `status` | `deriveReviewStatus(...)` (below), not the raw column |
| `score` | `reviews.score` of the **newest** review of the PR (`kind='review'`, any agent), `null` if never reviewed. Can itself be `null` for a review without a score |
| `findings_critical`, `findings_warning`, `findings_suggestion` | integer **sums over the newest review of EACH agent** of that PR (`kind='review'`); `null` when the PR has no review at all. A reviewed PR with no findings yields `0,0,0` |

### Severity sums

- Review rows are read newest-first (`created_at desc`) for all PRs in one `IN` query; `latestReviewIdsPerAgent` keeps the first row per `prId:agentId` (reviews with a null `agent_id` share one bucket `none`).
- One `GROUP BY review_id, severity` count query over the picked review ids; `sumSeverity` adds the three levels across the picked reviews.
- Counts include accepted/dismissed findings (no filter on `accepted_at`/`dismissed_at`) and findings of any confidence.
- Older reviews of the same agent are ignored — re-running an agent replaces its contribution rather than adding to it. Deleting a review changes the picked set accordingly.

### `status` derivation (`status.ts`, `deriveReviewStatus`)

- GitHub `merged` / `closed` -> returned as is.
- Open PR: `needs_review` if never reviewed (`last_reviewed_sha` null) **or** `last_reviewed_sha !== head_sha`; else `stale` if `updated_at` is older than `STALE_DAYS` (7); else `reviewed`.
- `last_reviewed_sha` is written by the run executor after each persisted review (`markReviewed`).

## Tests

`server/test/pulls-findings.test.ts` covers the rollup helpers.
