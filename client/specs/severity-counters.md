# Severity counters + filter (Agent runs tab)

status: implemented on branch feat/severity-counters

Code: `src/app/repos/[repoId]/pulls/[number]/_components/FindingsPanel/` (`FindingsPanel.tsx`, `helpers.ts`, `constants.ts`, `styles.ts`); strings in `messages/en/prReview.json` (`panel.severityCount.*`, `panel.noMatch*`); tests in `FindingsPanel.test.tsx`. Flow context: [`../docs/pr-review-page.md`](../docs/pr-review-page.md).

## Acceptance criteria

1. **Row.** Each run's `FindingsPanel` (inside its `ReviewRunAccordion`) shows a counters row above the finding cards: `N CRITICAL · N WARNING · N SUGGESTION`, each level a button with its `SEV` icon.
2. **Filter.** Clicking a level shows only findings of that severity; the button has `aria-pressed=true`.
3. **Clear.** Clicking the active level again clears the filter; clicking another level switches (only one active level at a time).
4. **Highlight.** The active level is drawn in its `SEV` colour; when a filter is active the other levels are dimmed (`s.counter(sev, active, anyActive)`).
5. **Zero levels hidden**, except the currently active level (so it can still be cleared): `levels = keys.filter(count > 0 || sev === sevFilter)`.
6. **Combined with Hide low confidence.** Counts are taken **after** hide-low (confidence `<= 0.7` removed) and **before** the severity filter. Toggling hide-low changes the counts; selecting a level does not.
7. **Single source.** List and counters both derive from `visibleFindings(findings, hideLow, severity)`, so they cannot drift.
8. **Empty state.** If nothing matches (filter and/or hide-low) the panel shows `EmptyState` "No findings match" with the hint to adjust filters or run a review.
9. **No network.** Clicking a counter only sets local state (`sevFilter`) and resets keyboard focus to the first card; it fires no request and never mutates findings (test "never mutates findings when clicking counters").
10. **Follows accept/dismiss.** Accept/dismiss invalidates `["reviews", prId]`; the refetched findings feed the same derivation, so the row re-renders from fresh data. Dismissed/accepted findings are only muted, **not** excluded, so they stay in the counts (`countBySeverity` has no dismissed filter).
11. **Per run.** The filter is per `FindingsPanel` instance (per accordion); runs don't share state.

## Notes

- `countBySeverity` returns zeros for all three levels; `INFO` exists in `SEV` and `SEVERITY_ORDER` but not in the counters (the `Severity` contract has three levels).
- Only `import type` from `@devdigest/shared` (see [`../docs/gotchas.md`](../docs/gotchas.md)).
