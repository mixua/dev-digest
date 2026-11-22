# reviewer-core/docs

Deep-dives for `@devdigest/reviewer-core`. Overview and the one-picture pipeline are in [`../README.md`](../README.md); the iron rule (no I/O) is in [`../CLAUDE.md`](../CLAUDE.md).

- [pipeline.md](pipeline.md) — `reviewPullRequest` step by step: prompt, strategy, LLM, reduce, grounding, score, outcome.
- [providers.md](providers.md) — the `LLMProvider` seam, which provider lives where, cost accounting.

Invariants: [`../specs/`](../specs/README.md).
