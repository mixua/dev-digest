/* CandidateCard — one extracted convention: editable rule, evidence, confidence, Accept/Reject. */
"use client";

import React from "react";
import { useTranslations } from "next-intl";
import type { ConventionCandidate } from "@devdigest/shared";
import { Button, IconBtn, ProgressBar, Textarea } from "@devdigest/ui";
import { githubBlobUrl } from "@/lib/github-urls";
import type { ConventionStatus } from "@/lib/hooks/conventions";

function confidenceColor(c: number) {
  return c >= 0.8 ? "var(--ok)" : c >= 0.5 ? "var(--warn)" : "var(--text-muted)";
}

export function CandidateCard({
  candidate: c,
  repoFullName,
  branch,
  onStatus,
  onSaveRule,
}: {
  candidate: ConventionCandidate;
  repoFullName: string;
  branch: string;
  onStatus: (status: ConventionStatus) => void;
  onSaveRule: (rule: string) => void;
}) {
  const t = useTranslations("conventions.card");
  const status: ConventionStatus = c.status ?? (c.accepted ? "accepted" : "pending");
  const accepted = status === "accepted";
  const rejected = status === "rejected";
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(c.rule);

  const start = c.evidence_line_start ?? undefined;
  const end = c.evidence_line_end ?? undefined;
  const range = start != null ? `:${start}${end != null && end !== start ? `-${end}` : ""}` : "";
  const href = githubBlobUrl(repoFullName, branch, c.evidence_path, start, end);
  const pct = Math.round(c.confidence * 100);
  const color = confidenceColor(c.confidence);

  const save = () => {
    const rule = draft.trim();
    if (rule && rule !== c.rule) onSaveRule(rule);
    setEditing(false);
  };

  return (
    <div
      data-testid="candidate-card"
      data-status={status}
      style={{
        background: "var(--bg-surface)",
        border: `1px solid ${accepted ? "var(--ok)" : "var(--border)"}`,
        borderLeft: accepted ? "4px solid var(--ok)" : undefined,
        borderRadius: 10,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        opacity: rejected ? 0.6 : 1,
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {editing ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Textarea value={draft} onChange={setDraft} rows={3} />
              <div style={{ display: "flex", gap: 8 }}>
                <Button kind="primary" size="sm" onClick={save}>{t("save")}</Button>
                <Button
                  kind="secondary"
                  size="sm"
                  onClick={() => {
                    setDraft(c.rule);
                    setEditing(false);
                  }}
                >
                  {t("cancel")}
                </Button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
              <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.45 }}>{c.rule}</div>
              <IconBtn icon="Edit" label={t("edit")} onClick={() => { setDraft(c.rule); setEditing(true); }} />
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center", flexWrap: "wrap" }}>
            {c.category && (
              <span
                style={{
                  fontSize: 11,
                  padding: "2px 8px",
                  borderRadius: 99,
                  background: "var(--bg-hover)",
                  color: "var(--text-secondary)",
                }}
              >
                {c.category}
              </span>
            )}
            {accepted && <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ok)" }}>✓ {t("accepted")}</span>}
            {rejected && <span style={{ fontSize: 11, fontWeight: 600, color: "var(--crit)" }}>✕ {t("rejected")}</span>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            kind={accepted ? "primary" : "secondary"}
            size="sm"
            onClick={() => onStatus(accepted ? "pending" : "accepted")}
          >
            ✓ {accepted ? t("accepted") : t("accept")}
          </Button>
          <Button
            kind={rejected ? "danger" : "secondary"}
            size="sm"
            onClick={() => onStatus(rejected ? "pending" : "rejected")}
          >
            ✕ {t("reject")}
          </Button>
        </div>
      </div>

      <div style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 10px",
            background: "var(--bg-elevated)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="mono"
            style={{ fontSize: 12, flex: 1, color: "var(--accent)", overflow: "hidden", textOverflow: "ellipsis" }}
          >
            {c.evidence_path}
            {range}
          </a>
          <IconBtn
            icon="Copy"
            label={t("copy")}
            onClick={() => void navigator.clipboard?.writeText(c.evidence_snippet)}
          />
        </div>
        <pre className="mono" style={{ margin: 0, padding: 10, fontSize: 12, overflow: "auto", maxHeight: 160 }}>
          {c.evidence_snippet}
        </pre>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 160 }}>
          <ProgressBar value={pct} color={color} />
        </div>
        <span style={{ fontSize: 12, color, fontWeight: 600 }}>{t("confidenceLabel", { pct })}</span>
      </div>
    </div>
  );
}
