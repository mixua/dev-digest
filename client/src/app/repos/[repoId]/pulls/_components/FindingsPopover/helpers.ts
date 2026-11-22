import type { FindingRecord, ReviewRecord } from "@devdigest/shared";
import { SEVERITY_ORDER } from "../../[number]/_components/FindingsPanel/constants";

/** Findings of the newest review per agent (reviews arrive newest-first), by severity. */
export function latestRunFindings(reviews: ReviewRecord[]): FindingRecord[] {
  const seen = new Set<string>();
  const out: FindingRecord[] = [];
  for (const r of reviews) {
    if (r.kind !== "review") continue;
    const key = r.agent_id ?? "none";
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(...r.findings);
  }
  return out.sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9));
}
