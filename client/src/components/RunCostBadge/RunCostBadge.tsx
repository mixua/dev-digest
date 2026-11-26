"use client";

import React from "react";
import { formatCost, formatTokens } from "@/lib/cost";

/** Run cost: `compact` = cost only; `detail` = cost · tokens_in→tokens_out. */
export function RunCostBadge({
  costUsd,
  tokensIn,
  tokensOut,
  variant = "compact",
}: {
  costUsd: number | null | undefined;
  tokensIn?: number | null;
  tokensOut?: number | null;
  variant?: "compact" | "detail";
}) {
  const showTokens = variant === "detail" && costUsd != null && tokensIn != null && tokensOut != null;
  return (
    <span
      className="mono tnum"
      style={{ fontSize: variant === "detail" ? 12.5 : 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}
    >
      {formatCost(costUsd)}
      {showTokens && ` · ${formatTokens(tokensIn!)}→${formatTokens(tokensOut!)}`}
    </span>
  );
}
