import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReviewRecord } from "@devdigest/shared";
import messages from "../../../../../../../messages/en/prReview.json";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const review = vi.hoisted(() => (({
  id: "r1",
  pr_id: "pr1",
  agent_id: "a1",
  run_id: "run1",
  kind: "review",
  verdict: null,
  summary: null,
  score: 50,
  model: null,
  created_at: "2026-06-11T00:00:00Z",
  findings: [
    {
      id: "f1",
      severity: "CRITICAL",
      category: "security",
      title: "Hardcoded secret",
      file: "src/config.ts",
      start_line: 11,
      end_line: 11,
      rationale: "A secret is committed.",
      suggestion: null,
      confidence: 0.95,
      kind: "finding",
      trifecta_components: null,
      evidence: null,
      review_id: "r1",
      accepted_at: null,
      dismissed_at: null,
    },
  ],
}) as unknown) as ReviewRecord);
vi.mock("@/lib/hooks/reviews", () => ({
  usePrReviews: () => ({ data: [review], isLoading: false }),
}));

import { PRRow } from "./PRRow";

afterEach(cleanup);

const base = {
  id: "pr1",
  number: 7,
  title: "Add thing",
  author: "ann",
  branch: "b",
  base: "main",
  head_sha: "abc",
  additions: 1,
  deletions: 1,
  files_count: 1,
  status: "reviewed" as const,
};

function renderRow(pr: Parameters<typeof PRRow>[0]["pr"]) {
  return render(
    <NextIntlClientProvider locale="en" messages={{ prReview: messages }}>
      <PRRow pr={pr} repoId="repo1" />
    </NextIntlClientProvider>,
  );
}

describe("PRRow findings cell", () => {
  it("renders chips for non-zero severities only", () => {
    renderRow({ ...base, score: 50, findings_critical: 2, findings_warning: 0, findings_suggestion: 3 });
    expect(screen.getByLabelText("2 critical")).toBeInTheDocument();
    expect(screen.getByLabelText("3 suggestion")).toBeInTheDocument();
    expect(screen.queryByLabelText(/warning/)).not.toBeInTheDocument();
  });

  it("shows a dash for an unreviewed PR", () => {
    renderRow({ ...base, score: null, findings_critical: null });
    expect(screen.queryByLabelText(/critical/)).not.toBeInTheDocument();
    expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(2); // score + findings
  });

  it("hover opens the popover with finding details and no Accept button", () => {
    renderRow({ ...base, score: 50, findings_critical: 1, findings_warning: 0, findings_suggestion: 0 });
    expect(screen.queryByText("Hardcoded secret")).not.toBeInTheDocument();
    fireEvent.mouseEnter(screen.getByLabelText("1 critical").parentElement!);
    expect(screen.getByText("1 finding in this run")).toBeInTheDocument();
    expect(screen.getByText("Hardcoded secret")).toBeInTheDocument();
    expect(screen.getByText("security")).toBeInTheDocument();
    expect(screen.getByText("src/config.ts:11")).toBeInTheDocument();
    expect(screen.getByText("95% conf")).toBeInTheDocument();
    expect(screen.queryByText(/accept/i)).not.toBeInTheDocument();
  });
});
