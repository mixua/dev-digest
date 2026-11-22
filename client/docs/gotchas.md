# Client gotchas

Short form of [`../INSIGHTS.md`](../INSIGHTS.md) (append-only source of truth — read it for dates and evidence).

| Trap | Why / fix | Where |
|---|---|---|
| **Runtime value imports from `@devdigest/shared` break the Next build.** | `pnpm test` and `pnpm typecheck` pass, but the page 500s with `Can't resolve './contracts/findings.js'`: the shared barrel uses `.js` ESM specifiers webpack can't resolve. Use `import type` only; derive runtime lists locally (e.g. `Object.keys(counts) as Severity[]`, not `Severity.options`). Always open the page in the running app. | `src/vendor/shared/index.ts:17`, `FindingsPanel.tsx:8,41` |
| **PR-list `COLUMN_KEYS` and `GRID` must stay the same length.** | Header keys and CSS grid tracks are parallel constants. A new column needs an entry in both **and** a matching cell in `PRRow.tsx`, plus a `list.columns.<key>` i18n string; otherwise header and cells misalign silently. | `src/app/repos/[repoId]/pulls/constants.ts` (`GRID`, `COLUMN_KEYS`) |
| **Missing i18n key renders the raw key.** | No error is thrown. Add the key to the right `messages/en/<ns>.json`. Only `en` exists. | `messages/en/`, `src/i18n/request.ts` |
| **`FindingCard` border style warning.** | React dev overlay "Updating a style property during rerender (borderColor) when a conflicting property is set (borderLeftColor)": `borderColor` is a shorthand mixed with `borderLeftColor`. Fires whenever `focused` flips. Fix = set the four longhands separately. Known, not fixed. | `FindingCard/styles.ts:10-13` |
| **Shared components have two homes.** | Cross-route components: `src/components/<Name>/` + `index.ts`, imported as `@/components/<Name>`. UI primitives: `src/vendor/ui` via `@devdigest/ui`. | `src/components/`, `src/vendor/ui` |
| **"Hide low confidence" is `<= 0.7`, not `< 0.7`.** | Boundary is covered by a test; keep it when changing the constant. | `FindingsPanel/constants.ts`, `FindingsPanel.test.tsx` |
