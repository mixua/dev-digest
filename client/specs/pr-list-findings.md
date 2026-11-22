# PR list: FINDINGS column

status: implemented on branch feat/severity-counters

Page: `src/app/repos/[repoId]/pulls/page.tsx`; row: `_components/PRRow/PRRow.tsx`; table constants: `pulls/constants.ts` (`COLUMN_KEYS`, `GRID`). Server contract: [`../../server/specs/pulls-list-api.md`](../../server/specs/pulls-list-api.md).

## Acceptance criteria

1. **Column.** A FINDINGS column sits in the PR list table. `COLUMN_KEYS` and `GRID` both get the new entry and `PRRow` renders a matching cell (otherwise header/cells misalign — see [`../docs/gotchas.md`](../docs/gotchas.md)); header string added under `list.columns` in `messages/en/prReview.json`.
2. **Cell content.** For each non-zero level, a severity icon (`SEV[sev].icon`, coloured) + its count, e.g. `CRIT 2  WARN 1`. Levels with 0 are omitted.
3. **Never reviewed.** A PR that has never been reviewed shows `—` (same muted dash as the SCORE cell, which uses `score == null`). Reviewed with zero findings also shows `—` (server sends `0/0/0` vs `null`, the cell renders both as `—`); no popover then.
4. **Counts = SUM over the latest review of EACH agent** for that PR — not only the single newest review. Computed server-side; the client just renders `findings_critical`, `findings_warning`, `findings_suggestion`.
5. **Popover on hover.** Hovering the cell opens a popover titled `N findings in this run`, listing every finding of that scope with: severity icon, title, category, `file:line`, confidence as a percentage, and a short rationale. **No Accept/Dismiss** controls (read-only).
6. **Lazy data.** The popover loads findings on first hover from `GET /pulls/:id/reviews` (`usePrReviews(prId)`, key `["reviews", prId]`); the list itself needs only the `findings_*` fields from `GET /repos/:id/pulls`. No per-row request on page load.
7. **Row click** still navigates to the PR page; hovering the cell must not break it.

## Data

| Field (`PrMeta`) | Meaning |
|---|---|
| `findings_critical`, `findings_warning`, `findings_suggestion` | integer sums, `null` when never reviewed |

Freshness: the list is refetched every 60 s and on window focus (`usePulls`); it is not invalidated by running a review or by accept/dismiss.

## Notes

- The popover title wording ("N findings in this run") comes from the review requirement; its scope is the same as the cell — latest review per agent (`FindingsPopover/helpers.ts → latestRunFindings`) — so the popover count equals the cell sum.
