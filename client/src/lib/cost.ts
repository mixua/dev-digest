/** Run cost / token display helpers. */

export function formatCost(v: number | null | undefined): string {
  if (v == null) return "—";
  if (v === 0) return "$0.00";
  if (v >= 1) return `$${v.toFixed(2)}`;
  if (v >= 0.01) return `$${v.toFixed(3)}`;
  // <0.01: keep 2 significant digits
  return `$${v.toFixed(1 - Math.floor(Math.log10(v)))}`;
}

export function formatTokens(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
}
