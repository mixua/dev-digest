import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ConventionCandidate } from "@devdigest/shared";
import messages from "../../../../../../../messages/en/conventions.json";
import { CandidateCard } from "./CandidateCard";

afterEach(cleanup);

const C: ConventionCandidate = {
  id: "c1",
  rule: "Use async/await",
  evidence_path: "src/a.js",
  evidence_snippet: "await x()",
  confidence: 0.9,
  accepted: false,
  status: "pending",
  category: "utilities",
  evidence_line_start: 3,
  evidence_line_end: 5,
};

function setup(c: Partial<ConventionCandidate> = {}) {
  const onStatus = vi.fn();
  const onSaveRule = vi.fn();
  render(
    <NextIntlClientProvider locale="en" messages={{ conventions: messages }}>
      <CandidateCard candidate={{ ...C, ...c }} repoFullName="o/r" branch="main" onStatus={onStatus} onSaveRule={onSaveRule} />
    </NextIntlClientProvider>,
  );
  return { onStatus, onSaveRule };
}

describe("CandidateCard", () => {
  it("renders evidence link, category and confidence", () => {
    setup();
    expect(screen.getByText("src/a.js:3-5")).toHaveAttribute("href", "https://github.com/o/r/blob/main/src/a.js#L3-L5");
    expect(screen.getByText("utilities")).toBeInTheDocument();
    expect(screen.getByText("90% confidence")).toBeInTheDocument();
  });

  it("Accept and Reject set status; clicking the active one resets to pending", () => {
    const a = setup();
    fireEvent.click(screen.getByRole("button", { name: /Accept/ }));
    expect(a.onStatus).toHaveBeenCalledWith("accepted");
    fireEvent.click(screen.getByRole("button", { name: /Reject/ }));
    expect(a.onStatus).toHaveBeenCalledWith("rejected");
    cleanup();
    const b = setup({ status: "accepted", accepted: true });
    expect(screen.getByTestId("candidate-card")).toHaveAttribute("data-status", "accepted");
    fireEvent.click(screen.getAllByRole("button", { name: /Accepted/ })[0]!);
    expect(b.onStatus).toHaveBeenCalledWith("pending");
  });

  it("shows the Rejected badge", () => {
    setup({ status: "rejected" });
    expect(screen.getByText("✕ Rejected")).toBeInTheDocument();
  });

  it("edits the rule inline", () => {
    const { onSaveRule } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Edit rule" }));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "New rule" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onSaveRule).toHaveBeenCalledWith("New rule");
  });
});
