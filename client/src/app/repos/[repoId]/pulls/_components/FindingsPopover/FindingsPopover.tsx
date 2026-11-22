"use client";

import type { CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { Icon, SEV, CategoryTag } from "@devdigest/ui";
import { usePrReviews } from "@/lib/hooks/reviews";
import { latestRunFindings } from "./helpers";

const card = (r: DOMRect): CSSProperties => ({
  position: "fixed",
  top: r.bottom, // flush with the cell so the pointer can move into the card without a leave

  left: r.left,
  width: 420,
  maxHeight: 360,
  overflow: "auto",
  zIndex: 50,
  background: "var(--bg-elevated)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  boxShadow: "0 8px 24px rgba(0,0,0,.25)",
  cursor: "default",
});
const head: CSSProperties = {
  padding: "10px 14px",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "var(--text-muted)",
  borderBottom: "1px solid var(--border)",
};
const item: CSSProperties = { padding: "10px 14px", borderBottom: "1px solid var(--border)" };
const line: CSSProperties = { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" };
const meta: CSSProperties = { fontSize: 11.5, color: "var(--text-muted)" };
const rationale: CSSProperties = {
  marginTop: 4,
  fontSize: 12.5,
  color: "var(--text-secondary)",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

/** Hover card listing the findings of the latest run per agent. Mount only while hovered. */
export function FindingsPopover({ prId, anchorRect }: { prId: string; anchorRect: DOMRect }) {
  const t = useTranslations("prReview");
  const { data, isLoading } = usePrReviews(prId);
  const findings = latestRunFindings(data ?? []);
  return (
    <div style={card(anchorRect)} onClick={(e) => e.stopPropagation()}>
      {isLoading ? (
        <div style={{ ...head, borderBottom: "none" }}>{t("list.findingsPopover.loading")}</div>
      ) : (
        <>
          <div style={head}>{t("list.findingsPopover.title", { count: findings.length })}</div>
          {findings.map((f) => {
            const I = Icon[SEV[f.severity].icon];
            return (
              <div key={f.id} style={item}>
                <div style={line}>
                  <I size={13} style={{ color: SEV[f.severity].c, flexShrink: 0 }} />
                  <strong style={{ fontSize: 13 }}>{f.title}</strong>
                  <CategoryTag category={f.category} />
                </div>
                <div style={{ ...line, marginTop: 4 }}>
                  <span className="mono" style={meta}>{`${f.file}:${f.start_line}`}</span>
                  <span style={meta}>{`${Math.round(f.confidence * 100)}% conf`}</span>
                </div>
                <div style={rationale}>{f.rationale}</div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
