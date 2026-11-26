/* hooks/conventions.ts — React Query hooks for the Conventions Extractor. */
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { ConventionCandidate } from "@devdigest/shared";

export type ConventionStatus = "pending" | "accepted" | "rejected";

export interface ConventionsResponse {
  candidates: ConventionCandidate[];
  meta: {
    sample_files: number | null;
    last_scan_at: string | null;
    repo_full_name: string;
    default_branch: string;
  };
}

export interface SkillDraft {
  name: string;
  description: string;
  body: string;
  accepted_count: number;
}

export function useConventions(repoId: string | null | undefined) {
  return useQuery({
    queryKey: ["conventions", repoId],
    queryFn: () => api.get<ConventionsResponse>(`/repos/${repoId}/conventions`),
    enabled: !!repoId,
  });
}

export function useExtractConventions(repoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<ConventionsResponse>(`/repos/${repoId}/conventions/extract`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conventions", repoId] }),
  });
}

export function useUpdateConvention(repoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: string; status?: ConventionStatus; rule?: string }) =>
      api.patch<ConventionCandidate>(`/conventions/${id}`, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conventions", repoId] }),
  });
}

/** Merged draft of accepted conventions; fetched only while the modal is open. */
export function useSkillDraft(repoId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["conventions", repoId, "skill-draft"],
    queryFn: () => api.get<SkillDraft>(`/repos/${repoId}/conventions/skill-draft`),
    enabled,
    gcTime: 0,
  });
}
