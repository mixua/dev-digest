import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../../../../../../messages/en/conventions.json";

const mutate = vi.fn();
const DRAFT = { name: "repo-conventions", description: "Apply these", body: "# Body\n- rule A", accepted_count: 2 };
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/lib/toast", () => ({ useToast: () => ({ success: vi.fn(), error: vi.fn() }) }));
vi.mock("@/lib/hooks/skills", () => ({ useCreateSkill: () => ({ mutate, isPending: false }) }));
vi.mock("@/lib/hooks/conventions", () => ({
  useSkillDraft: () => ({
    isLoading: false,
    isError: false,
    data: DRAFT,
  }),
}));

import { CreateSkillModal } from "./CreateSkillModal";

afterEach(() => {
  cleanup();
  mutate.mockClear();
});

function setup() {
  render(
    <NextIntlClientProvider locale="en" messages={{ conventions: messages }}>
      <CreateSkillModal repoId="r1" repoFullName="o/r" onClose={() => {}} />
    </NextIntlClientProvider>,
  );
}

describe("CreateSkillModal", () => {
  it("shows the draft body and creates a disabled extracted convention skill", () => {
    setup();
    expect(screen.getByDisplayValue(/rule A/)).toBeInTheDocument();
    expect(screen.getByText(/Merged from 2 accepted conventions in o\/r/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Create skill/ }));
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate.mock.calls[0]![0]).toMatchObject({
      name: "repo-conventions",
      type: "convention",
      source: "extracted",
      enabled: false,
      body: "# Body\n- rule A",
    });
  });

  it("blocks an invalid slug", () => {
    setup();
    fireEvent.change(screen.getByDisplayValue("repo-conventions"), { target: { value: "Bad Name" } });
    expect(screen.getByRole("button", { name: /Create skill/ })).toBeDisabled();
    expect(screen.getByText(/lowercase letters, digits and dashes only/)).toBeInTheDocument();
  });
});
