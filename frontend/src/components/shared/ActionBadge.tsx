export const ACTION_TONE: Record<string, string> = {
  init: 'bg-stone-100 text-stone-600',
  created: 'bg-green-100 text-green-700',
  updated: 'bg-blue-100 text-blue-700',
  deleted: 'bg-red-100 text-red-700',
};

export function ActionBadge({ action }: { action: string }) {
  const cls = ACTION_TONE[action] ?? 'bg-stone-100 text-stone-600';
  return (
    <span
      className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wider ${cls}`}
    >
      {action}
    </span>
  );
}
