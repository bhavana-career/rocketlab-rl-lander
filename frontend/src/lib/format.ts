/** Small helpers for displaying possibly-missing numbers. */

export const DASH = "—";

export function fmt(value: number | null, digits = 2, signed = false): string {
  if (value === null) return DASH;
  const sign = signed && value >= 0 ? "+" : "";
  return sign + value.toFixed(digits);
}

export function fmtPercent(part: number | null, total: number | null): string {
  if (part === null || total === null || total === 0) return DASH;
  return `${Math.round((part / total) * 100)}%`;
}

/** "8 / 10 (80%)" or "—" when anything is missing. */
export function fmtCount(part: number | null, total: number | null): string {
  if (part === null || total === null) return DASH;
  return `${part} / ${total} (${fmtPercent(part, total)})`;
}
