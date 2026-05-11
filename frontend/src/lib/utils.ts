import { format, isThisYear } from "date-fns";
import type { SubmissionSummary } from "@/types/submission";

export function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

/**
 * Date label for when something was submitted/merged.
 *   this year → absolute month/day ("May 9")
 *   older     → absolute with year ("May 9, 2025")
 */
export function formatSubmittedDate(date: Date | number): string {
  const d = typeof date === "number" ? new Date(date) : date;
  return isThisYear(d) ? format(d, "MMM d") : format(d, "MMM d, yyyy");
}

const RELATIVE_THRESHOLDS: Array<[number, Intl.RelativeTimeFormatUnit]> = [
  [60, "second"],
  [60, "minute"],
  [24, "hour"],
  [7, "day"],
  [4.34524, "week"],
  [12, "month"],
  [Number.POSITIVE_INFINITY, "year"],
];

const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

export function formatRelativeTime(date: Date, now: Date = new Date()): string {
  let delta = (date.getTime() - now.getTime()) / 1000;
  for (const [step, unit] of RELATIVE_THRESHOLDS) {
    if (Math.abs(delta) < step) return rtf.format(Math.round(delta), unit);
    delta /= step;
  }
  return rtf.format(Math.round(delta), "year");
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

export function matchesSubmissionFilter(
  s: SubmissionSummary,
  query: string
): boolean {
  const lower = query.trim().toLowerCase();
  if (!lower) return true;
  return (
    s.title.toLowerCase().includes(lower) ||
    (s.description?.toLowerCase().includes(lower) ?? false) ||
    s.id.toLowerCase().includes(lower)
  );
}
