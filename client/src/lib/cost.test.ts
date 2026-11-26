import { describe, it, expect } from "vitest";
import { formatCost, formatTokens } from "./cost";

describe("formatCost", () => {
  it.each([
    [null, "—"],
    [undefined, "—"],
    [0, "$0.00"],
    [2.5, "$2.50"],
    [1, "$1.00"],
    [0.012, "$0.012"],
    [0.14, "$0.140"],
    [0.0013, "$0.0013"],
    [0.00041, "$0.00041"],
  ])("%s -> %s", (v, out) => expect(formatCost(v)).toBe(out));
});

describe("formatTokens", () => {
  it.each([
    [8200, "8.2K"],
    [1300, "1.3K"],
    [950, "950"],
  ])("%s -> %s", (n, out) => expect(formatTokens(n)).toBe(out));
});
