import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../../../../messages/en/conventions.json";

const update = vi.fn();
let candidates: unknown[] = [];
vi.mock("next/navigation", () => ({ useParams: () => ({ repoId: "r1" }) }));
vi.mock("@/components/app-shell", () => ({ AppShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock("./_components/CreateSkillModal", () => ({ CreateSkillModal: () => <div>modal</div> }));
vi.mock("@/lib/hooks/conventions", () => ({
  useConventions: () => ({
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    data: { candidates, meta: { sample_files: 12, last_scan_at: null, repo_full_name: "o/r", default_branch: "main" } },
  }),
  useExtractConventions: () => ({ mutate: vi.fn(), isPending: false, isError: false }),
  useUpdateConvention: () => ({ mutate: update }),
}));

import ConventionsPage from "./page";

afterEach(() => {
  cleanup();
  update.mockClear();
});

const cand = (id: string, status: string) => ({
  id,
  rule: `rule ${id}`,
  evidence_path: "a.js",
  evidence_snippet: "x",
  confidence: 0.6,
  accepted: status === "accepted",
  status,
});

function setup() {
  render(
    <NextIntlClientProvider locale="en" messages={{ conventions: messages }}>
      <ConventionsPage />
    </NextIntlClientProvider>,
  );
}

describe("ConventionsPage", () => {
  it("shows the empty state", () => {
    candidates = [];
    setup();
    expect(screen.getByText("No conventions extracted yet")).toBeInTheDocument();
  });

  it("disables Create skill with 0 accepted and PATCHes status on Accept", () => {
    candidates = [cand("a", "pending")];
    setup();
    expect(screen.getByRole("button", { name: /Create skill/ })).toBeDisabled();
    expect(screen.getByText("0 of 1 accepted")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Accept/ }));
    expect(update).toHaveBeenCalledWith({ id: "a", status: "accepted" });
  });

  it("enables Create skill when something is accepted", () => {
    candidates = [cand("a", "accepted"), cand("b", "rejected")];
    setup();
    expect(screen.getByRole("button", { name: /Create skill/ })).toBeEnabled();
    expect(screen.getByText("1 of 2 accepted")).toBeInTheDocument();
  });
});
