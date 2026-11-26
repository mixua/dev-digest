/* Conventions — /repos/:repoId/conventions. Extract house rules, accept/reject, merge into a skill. */
"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button, EmptyState, ErrorState, Skeleton } from "@devdigest/ui";
import { AppShell } from "@/components/app-shell";
import { useConventions, useExtractConventions, useUpdateConvention } from "@/lib/hooks/conventions";
import { relativeTime } from "../pulls/helpers";
import { CandidateCard } from "./_components/CandidateCard";
import { CreateSkillModal } from "./_components/CreateSkillModal";

export default function ConventionsPage() {
  const t = useTranslations("conventions.page");
  const { repoId } = useParams<{ repoId: string }>();
  const { data, isLoading, isError, refetch } = useConventions(repoId);
  const extract = useExtractConventions(repoId);
  const update = useUpdateConvention(repoId);
  const [modalOpen, setModalOpen] = React.useState(false);

  const candidates = data?.candidates ?? [];
  const meta = data?.meta;
  const repoName = meta?.repo_full_name ?? t("repoFallback");
  const acceptedCount = candidates.filter((c) => (c.status ?? (c.accepted ? "accepted" : "pending")) === "accepted").length;
  const scanning = extract.isPending;

  const rel = relativeTime(meta?.last_scan_at);
  const lastScan = rel === "now" ? t("justNow") : t("ago", { time: rel });

  return (
    <AppShell crumb={[{ label: t("crumbLab") }, { label: t("crumbConventions") }]}>
      {modalOpen && <CreateSkillModal repoId={repoId} repoFullName={repoName} onClose={() => setModalOpen(false)} />}
      <div style={{ padding: "24px 32px", maxWidth: 960, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700 }}>
              {t("headingPrefix")}
              <span className="mono">{repoName}</span>
            </h1>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
              {candidates.length > 0
                ? t("detected", { count: meta?.sample_files ?? 0, time: lastScan })
                : t("subtitle")}
            </div>
          </div>
          {candidates.length > 0 && (
            <>
              <span style={{ fontSize: 13, color: "var(--text-secondary)", alignSelf: "center" }}>
                {t("acceptedCount", { accepted: acceptedCount, total: candidates.length })}
              </span>
              <Button kind="secondary" icon="RefreshCw" onClick={() => extract.mutate()} disabled={scanning} loading={scanning}>
                {t("rescan")}
              </Button>
              <Button kind="primary" icon="Sparkles" onClick={() => setModalOpen(true)} disabled={acceptedCount === 0 || scanning}>
                {t("createSkill")}
              </Button>
            </>
          )}
        </div>

        {extract.isError && (
          <div
            role="alert"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 14px",
              marginBottom: 16,
              borderRadius: 8,
              background: "var(--crit-bg)",
              color: "var(--crit)",
              fontSize: 13,
            }}
          >
            <span style={{ flex: 1 }}>
              <strong>{t("extractionFailed")}:</strong> {extract.error.message}
            </span>
            <Button kind="secondary" size="sm" icon="RefreshCw" onClick={() => extract.mutate()} disabled={scanning}>
              {t("retry")}
            </Button>
          </div>
        )}

        {isLoading && <Skeleton height={140} />}
        {isError && <ErrorState title={t("loadError")} onRetry={() => void refetch()} />}

        {scanning && candidates.length === 0 && (
          <EmptyState icon="RefreshCw" title={t("scanning")} body={t("scanningBody")} />
        )}
        {!isLoading && !isError && !scanning && candidates.length === 0 && (
          <EmptyState
            icon="ListChecks"
            title={t("empty.title")}
            body={t("empty.body")}
            cta={t("empty.cta")}
            onCta={() => extract.mutate()}
          />
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {candidates.map((c) => (
            <CandidateCard
              key={c.id}
              candidate={c}
              repoFullName={repoName}
              branch={meta?.default_branch ?? "main"}
              onStatus={(status) => update.mutate({ id: c.id, status })}
              onSaveRule={(rule) => update.mutate({ id: c.id, rule })}
            />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
