# Timeline severity chips (Agent runs tab)

status: implemented on branch feat/severity-counters

Code: `src/app/repos/[repoId]/pulls/[number]/_components/RunHistory/RunHistory.tsx` (the "Timeline"), fed from `FindingsTab`. Page flow: [`../docs/pr-review-page.md`](../docs/pr-review-page.md).

## Acceptance criteria

1. **Chips per run.** Each run tile in the Timeline shows severity chips (icon + count per non-zero level) for that run's findings.
2. **Client-side.** Counts are computed in the client from `reviews` (`usePrReviews`, key `["reviews", prId]`), **joined to runs by `run_id`** (`ReviewRecord.run_id` === `RunSummary.run_id`). The `RunSummary` contract has only `findings_count` and `blockers`, no per-severity numbers (`server/src/vendor/shared/contracts/trace.ts`), and no API change is needed.
3. **No review, no chips.** Running, failed, cancelled runs, and `done` runs without a matching review (e.g. review deleted) show no chips.
4. **Zero findings.** A matching review with no findings shows no chips (outcome badge "approved" already covers it).
5. **Stays in sync.** Chips update when `["reviews", prId]` is invalidated (accept/dismiss, new run, delete review/run) — no separate cache.
6. **Consistent with the counters.** Chips use `countBySeverity` over all `review.findings` (no hide-low), so they equal that run's `FindingsPanel` counters while "Hide low confidence" is off (the panel counts after hide-low).
7. **No new request** — reuses data the page already loads.
8. Existing behaviour unchanged: outcome badge from `blockers`/`findings_count`, row click opens the trace, agent-name click scrolls to the accordion, delete button.
