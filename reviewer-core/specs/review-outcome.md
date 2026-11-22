# ReviewOutcome and finding invariants

Types: `ReviewOutcome` in `src/review/run.ts:244`; `Finding`, `Review`, `Severity`, `Verdict` in `@devdigest/shared` (`server/src/vendor/shared/contracts/findings.ts`). Flow: [`../docs/pipeline.md`](../docs/pipeline.md).

## ReviewOutcome fields

| Field | Meaning |
|---|---|
| `review` | `{verdict, summary, score, findings}` — findings are only those that **survived grounding** |
| `grounding` | `"kept/total passed"`, e.g. `3/4 passed` |
| `dropped` | `{finding, reason}[]` removed by grounding |
| `mode` | `single-pass` or `map-reduce` |
| `assembly` | `PromptAssembly` for the run trace |
| `chunks` | `{label}[]` — `all files` or one per file |
| `tokensIn`, `tokensOut` | summed over all chunks and retries |
| `costUsd` | `number \| null` |
| `raw` | raw model outputs joined by `\n---\n` |

## Invariants (verified)

1. **Severity** is exactly `CRITICAL | WARNING | SUGGESTION` (`Severity` zod enum). Structured output that violates the schema is rejected and re-prompted, never passed through.
2. **Confidence** is a number in `0..1` (`z.number().min(0).max(1)`).
3. **Location must be in the diff.** After `groundFindings`, every kept finding's file is present in the diff, and for normal findings `[start_line, end_line]` intersects a new-side diff line (any overlap — not both endpoints). Exception: kinds `secret_leak`, `lethal_trifecta`, `phantom`, `hook` only need the file in the diff (`grounding.ts:75,125`). `start_line`/`end_line` are swapped-safe (`min`/`max`).
4. **Score** is `100 - penalties` over the grounded findings, clamped 0..100 (CRITICAL 35, WARNING 12, SUGGESTION 3); no findings -> 100. It is never the model's number.
5. **Tokens** are the sum over all chunks (and repair retries); `costUsd` is `null` if **any** chunk's cost was `null`, otherwise the sum (`run.ts:333`).
6. **`grounding`** counts `kept + dropped` as the total.

## Verdict — where the brief's rule does and doesn't hold

- `ReviewOutcome.review.verdict` is **not** derived from findings. It is the model's verdict, or for map-reduce the worst partial verdict (`request_changes` > `comment` > `approve`) — `run.ts` spreads `...merged` and only overrides `findings` and `score`. So it can disagree with the findings (e.g. `approve` with a CRITICAL).
- The deterministic rule lives in `toReviewPayload` (`src/output/to-review.ts:156`): event = `APPROVE` if no findings; `REQUEST_CHANGES` if `gateTriggered(findings, failOn)`; else `COMMENT`. With the default `failOn='critical'` that is "REQUEST_CHANGES iff at least one CRITICAL"; with `warning` the gate trips on WARNING or CRITICAL, with `any` on any finding, with `never` never.
- The same gate yields `countBlockers(findings, failOn)` (findings with severity rank >= the gate minimum), which the server stores as `agent_runs.blockers` and the UI timeline colours on.
