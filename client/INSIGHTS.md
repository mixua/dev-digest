# Insights — client

Non-obvious findings and gotchas. Add an entry whenever something surprised you,
so the next agent/session doesn't relearn it. Append-only — see the
`engineering-insights` skill for how entries are captured.

## What Works


## What Doesn't Work

- **2026-11-21** — Importing a VALUE (e.g. the `Severity` zod enum, `Severity.options`) from `@devdigest/shared` in client code passes `pnpm test` + `pnpm typecheck` but breaks the Next dev build: the page returns 500 with `Module not found: Can't resolve './contracts/findings.js'` (the shared barrel uses `.js` ESM specifiers Next/webpack can't resolve). Use `import type` only; derive runtime values locally. Always open the page in the running app, not just tests. Evidence: `client/src/vendor/shared/index.ts:17`, `client/src/app/repos/[repoId]/pulls/[number]/_components/FindingsPanel/FindingsPanel.tsx:8,41`.

## Codebase Patterns

- **2026-06-14** — Cross-route shared components live in `src/components/<Name>/` with an `index.ts` barrel, imported via `@/components/<Name>` (e.g. `diff-viewer`, `page-shell`). Vendored UI primitives (`Badge`, `CircularScore`) live in `src/vendor/ui` under `@devdigest/ui` — different home. Evidence: `client/src/components/diff-viewer/`.
- **2026-06-14** — The PR-list table is driven by two parallel constants that MUST stay length-aligned: `COLUMN_KEYS` (header keys + order) and `GRID` (CSS grid-template tracks). Adding a column = add to both AND render a matching cell in `PRRow.tsx`, else header/cells misalign silently. Evidence: `client/src/app/repos/[repoId]/pulls/constants.ts`.
- **2026-06-14** — i18n has only the `en` locale (`client/messages/en/`); new UI strings need a key under the right namespace file (e.g. `prReview.json`, `runs.json`) read via `useTranslations("<ns>")`. A missing key renders the raw key, not an error.

## Tool & Library Notes

## Recurring Errors & Fixes

- **2026-11-21** — Dev overlay "Updating a style property during rerender (borderColor) when a conflicting property is set (borderLeftColor)" comes from `FindingCard`: `borderColor` is itself a shorthand (all 4 sides) mixed with `borderLeftColor`, despite the "All-longhand" comment. Fires whenever a card's `focused` flips (j/k nav, severity filter). Fix: set `borderTopColor`/`borderRightColor`/`borderBottomColor` separately. Not fixed yet (HW L01 forbade touching `FindingCard`). Evidence: `client/src/app/repos/[repoId]/pulls/[number]/_components/FindingCard/styles.ts:10-13`.

## Session Notes

### 2026-11-21
- Severity counters + one-level filter in `FindingsPanel`; list and counters both come from `visibleFindings(findings, hideLow, severity)` so they can't drift (counts taken after hide-low, before the severity filter).
- Hide low confidence now hides confidence ≤ 0.7 (`> LOW_CONFIDENCE_THRESHOLD` stays visible); boundary test in `FindingsPanel.test.tsx`.

## Open Questions
