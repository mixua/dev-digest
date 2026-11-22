/** PR-list findings rollup — pure helpers: latest review per agent + severity sums. */

export type SevCounts = { critical: number; warning: number; suggestion: number };

/** Rows newest-first → per PR, the newest review id of each agent. */
export function latestReviewIdsPerAgent(
  rows: { id: string; prId: string; agentId: string | null }[],
): Map<string, string[]> {
  const seen = new Set<string>();
  const out = new Map<string, string[]>();
  for (const r of rows) {
    const key = `${r.prId}:${r.agentId ?? 'none'}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const ids = out.get(r.prId) ?? [];
    ids.push(r.id);
    out.set(r.prId, ids);
  }
  return out;
}

export function sumSeverity(reviewIds: string[], countsByReview: Map<string, SevCounts>): SevCounts {
  const total: SevCounts = { critical: 0, warning: 0, suggestion: 0 };
  for (const id of reviewIds) {
    const c = countsByReview.get(id);
    if (!c) continue;
    total.critical += c.critical;
    total.warning += c.warning;
    total.suggestion += c.suggestion;
  }
  return total;
}
