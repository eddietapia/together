import { useMemo } from "react";
import type { SubmissionStatus, SubmissionSummary } from "@/types/submission";
import { formatSubmittedDate, matchesSubmissionFilter } from "@/lib/utils";

const STATUS_DOT: Record<SubmissionStatus, string> = {
  pending: "bg-yellow-400",
  merged: "bg-green-500",
  rejected: "bg-red-500",
};

type StatusFilter = "all" | SubmissionStatus;

const STATUS_FILTERS: Array<{ key: StatusFilter; label: string }> = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "merged", label: "Merged" },
  { key: "rejected", label: "Rejected" },
];

export function SubmissionsPanel({
  submissions,
  loading,
  error,
  filter,
  onFilterChange,
  statusFilter,
  onStatusFilterChange,
  selectedId,
  onSelect,
}: {
  submissions: SubmissionSummary[];
  loading: boolean;
  error: string | null;
  filter: string;
  onFilterChange: (s: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (s: StatusFilter) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const counts = useMemo(
    () =>
      submissions.reduce<Record<SubmissionStatus, number>>(
        (acc, s) => {
          acc[s.status] += 1;
          return acc;
        },
        { pending: 0, merged: 0, rejected: 0 },
      ),
    [submissions],
  );

  const matched = useMemo(
    () =>
      submissions
        .filter((s) => statusFilter === "all" || s.status === statusFilter)
        .filter((s) => matchesSubmissionFilter(s, filter)),
    [submissions, statusFilter, filter],
  );

  return (
    <>
      <div className="px-3 pt-3 pb-2">
        <input
          type="text"
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
          placeholder="Filter checkpoints…"
          className="w-full px-2.5 py-1.5 text-xs bg-white border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
        />
      </div>

      <div className="px-3 pb-2 flex flex-wrap gap-1">
        {STATUS_FILTERS.map(({ key, label }) => {
          const isActive = statusFilter === key;
          const count =
            key === "all"
              ? submissions.length
              : counts[key as SubmissionStatus];
          return (
            <button
              key={key}
              onClick={() => onStatusFilterChange(key)}
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors ${
                isActive
                  ? "bg-foreground text-background"
                  : "bg-black/5 text-muted-foreground hover:bg-black/10"
              }`}
            >
              {label} {count > 0 && <span className="opacity-70">{count}</span>}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {loading ? (
          <p className="text-xs text-muted-foreground px-2 py-2 animate-pulse">
            Loading…
          </p>
        ) : error ? (
          <p className="text-xs text-red-700 px-2 py-2">{error}</p>
        ) : matched.length === 0 ? (
          <p className="text-xs text-muted-foreground px-2 py-2">
            {submissions.length === 0 ? "No checkpoints yet" : "No matches"}
          </p>
        ) : (
          <div className="space-y-0.5">
            {matched.map((s) => (
              <button
                key={s.id}
                onClick={() => onSelect(s.id)}
                className={`w-full flex items-start gap-2 px-2 py-1.5 rounded-md text-left transition-colors ${
                  selectedId === s.id ? "bg-black/10" : "hover:bg-black/5"
                }`}
              >
                <span
                  aria-hidden
                  className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    STATUS_DOT[s.status]
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground truncate">
                    {s.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                    {formatSubmittedDate(s.createdAt)} · {s.fileCount}{" "}
                    {s.fileCount === 1 ? "file" : "files"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export type { StatusFilter };
