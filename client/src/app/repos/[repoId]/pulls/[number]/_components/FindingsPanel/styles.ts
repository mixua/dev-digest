import type { CSSProperties } from "react";
import { SEV } from "@devdigest/ui";
import type { Severity } from "@devdigest/shared";

/** Co-located styles for FindingsPanel (extracted from inline styles). */
export const s = {
  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
    flexWrap: "wrap",
  } satisfies CSSProperties,
  counters: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    color: "var(--text-secondary)",
  } satisfies CSSProperties,
  counter: (sev: Severity, active: boolean, anyActive: boolean): CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "3px 9px",
    borderRadius: 5,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    color: active ? SEV[sev].c : "var(--text-secondary)",
    background: active ? SEV[sev].bg : "transparent",
    border: `1px solid ${active ? SEV[sev].c : "var(--border)"}`,
    opacity: anyActive && !active ? 0.5 : 1,
  }),
  divider: {
    width: 1,
    height: 18,
    background: "var(--border)",
    margin: "0 2px",
  } satisfies CSSProperties,
  toggleGroup: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 13,
    color: "var(--text-secondary)",
  } satisfies CSSProperties,
  list: { display: "flex", flexDirection: "column", gap: 12 } satisfies CSSProperties,
} as const;
