import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { FindingRecord } from "@devdigest/shared";
import messages from "../../../../../../../../messages/en/prReview.json";

const mutate = vi.hoisted(() => vi.fn());
vi.mock("../../../../../../../lib/hooks/reviews", () => ({
  useFindingAction: () => ({ mutate, isPending: false }),
}));

import { FindingsPanel } from "./FindingsPanel";
import { countBySeverity, visibleFindings } from "./helpers";

afterEach(() => {
  cleanup();
  mutate.mockClear();
});

function mk(
  id: string,
  severity: FindingRecord["severity"],
  title: string,
  confidence: number,
): FindingRecord {
  return {
    id,
    severity,
    category: "security",
    title,
    file: "src/config.ts",
    start_line: 11,
    end_line: 11,
    rationale: "A secret is committed.",
    suggestion: null,
    confidence,
    kind: "finding",
    trifecta_components: null,
    evidence: null,
    review_id: "r1",
    accepted_at: null,
    dismissed_at: null,
  };
}

const FINDINGS: FindingRecord[] = [
  mk("f1", "CRITICAL", "Hardcoded secret", 0.95),
  mk("f2", "CRITICAL", "Weak hash", 0.3),
  mk("f3", "WARNING", "Risky call", 0.9),
];

function renderWithIntl(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={{ prReview: messages }}>
      {ui}
    </NextIntlClientProvider>,
  );
}

const counter = (name: string) => screen.getByRole("button", { name });

describe("FindingsPanel (smoke)", () => {
  it("renders the toolbar + a finding card", () => {
    renderWithIntl(<FindingsPanel findings={FINDINGS} prId="pr1" />);
    expect(screen.getByText("Hide low confidence")).toBeInTheDocument();
    expect(screen.getByText("Hardcoded secret")).toBeInTheDocument();
  });

  it("shows the empty state when nothing matches", () => {
    renderWithIntl(<FindingsPanel findings={[]} prId="pr1" />);
    expect(screen.getByText("No findings match")).toBeInTheDocument();
  });
});

describe("FindingsPanel severity counters", () => {
  it("shows counts and omits levels with no findings", () => {
    renderWithIntl(<FindingsPanel findings={FINDINGS} prId="pr1" />);
    expect(counter("2 CRITICAL")).toBeInTheDocument();
    expect(counter("1 WARNING")).toBeInTheDocument();
    expect(screen.queryByText(/SUGGESTION/)).not.toBeInTheDocument();
  });

  it("toggles a filter on click and off on second click", () => {
    renderWithIntl(<FindingsPanel findings={FINDINGS} prId="pr1" />);
    fireEvent.click(counter("2 CRITICAL"));
    expect(screen.getByText("Hardcoded secret")).toBeInTheDocument();
    expect(screen.getByText("Weak hash")).toBeInTheDocument();
    expect(screen.queryByText("Risky call")).not.toBeInTheDocument();
    fireEvent.click(counter("2 CRITICAL"));
    expect(screen.getByText("Risky call")).toBeInTheDocument();
  });

  it("switches filter between levels with a single active counter", () => {
    renderWithIntl(<FindingsPanel findings={FINDINGS} prId="pr1" />);
    fireEvent.click(counter("2 CRITICAL"));
    fireEvent.click(counter("1 WARNING"));
    expect(screen.getByText("Risky call")).toBeInTheDocument();
    expect(screen.queryByText("Hardcoded secret")).not.toBeInTheDocument();
    expect(counter("1 WARNING")).toHaveAttribute("aria-pressed", "true");
    expect(counter("2 CRITICAL")).toHaveAttribute("aria-pressed", "false");
  });

  it("counts respect hide-low-confidence", () => {
    renderWithIntl(<FindingsPanel findings={FINDINGS} prId="pr1" />);
    fireEvent.click(screen.getByRole("switch"));
    fireEvent.click(counter("1 CRITICAL"));
    expect(screen.getByText("Hardcoded secret")).toBeInTheDocument();
    expect(screen.queryByText("Weak hash")).not.toBeInTheDocument();
    expect(screen.queryByText("Risky call")).not.toBeInTheDocument();
  });

  it("never mutates findings when clicking counters", () => {
    renderWithIntl(<FindingsPanel findings={FINDINGS} prId="pr1" />);
    fireEvent.click(counter("2 CRITICAL"));
    fireEvent.click(counter("2 CRITICAL"));
    expect(mutate).not.toHaveBeenCalled();
  });
});

describe("findings helpers", () => {
  it("countBySeverity includes zeros", () => {
    expect(countBySeverity(FINDINGS)).toEqual({ CRITICAL: 2, WARNING: 1, SUGGESTION: 0 });
  });

  it("visibleFindings filters by severity and confidence", () => {
    expect(visibleFindings(FINDINGS, false, "CRITICAL").map((f) => f.id)).toEqual(["f1", "f2"]);
    expect(visibleFindings(FINDINGS, true, "CRITICAL").map((f) => f.id)).toEqual(["f1"]);
    expect(visibleFindings(FINDINGS, false).length).toBe(3);
  });

  it("hide-low keeps only confidence > 0.7", () => {
    const edge = [
      { ...FINDINGS[0]!, id: "e71", confidence: 0.71 },
      { ...FINDINGS[0]!, id: "e70", confidence: 0.7 },
    ];
    expect(visibleFindings(edge, true).map((f) => f.id)).toEqual(["e71"]);
  });
});
