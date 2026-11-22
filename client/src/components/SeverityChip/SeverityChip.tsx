import { Icon, SEV } from "@devdigest/ui";

export type ChipSeverity = "CRITICAL" | "WARNING" | "SUGGESTION";

/** Severity icon + count, coloured by severity. */
export function SeverityChip({ sev, count }: { sev: ChipSeverity; count: number }) {
  const I = Icon[SEV[sev].icon];
  return (
    <span
      className="tnum"
      aria-label={`${count} ${sev.toLowerCase()}`}
      style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 12.5, color: SEV[sev].c }}
    >
      <I size={13} />
      {count}
    </span>
  );
}
