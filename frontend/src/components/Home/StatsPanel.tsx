export function StatsPanel({
  total,
  pending,
  reviewed,
}: {
  total: number;
  pending: number;
  reviewed: number;
}) {
  const progress = total > 0 ? reviewed / total : 0;

  return (
    <div
      className="rounded-xl border border-border/70 px-3 py-2.5 select-none"
      style={{
        background:
          'linear-gradient(135deg, hsla(40, 60%, 96%, 0.7), hsla(36, 50%, 93%, 0.55))',
        boxShadow:
          '0 1px 0 hsla(40, 60%, 100%, 0.6) inset, 0 4px 16px hsla(20, 40%, 30%, 0.06)',
      }}
    >
      <div className="flex items-baseline justify-between gap-2">
        <Stat label="Total" value={total} />
        <Divider />
        <Stat label="Pending" value={pending} accent="warm" />
        <Divider />
        <Stat label="Reviewed" value={reviewed} />
      </div>

      <div className="mt-2.5 h-1 rounded-full overflow-hidden bg-foreground/[0.06]">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${progress * 100}%`,
            background:
              'linear-gradient(90deg, hsla(28, 70%, 65%, 0.8), hsla(20, 75%, 55%, 0.85))',
          }}
        />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent = 'neutral',
}: {
  label: string;
  value: number;
  accent?: 'neutral' | 'warm';
}) {
  return (
    <div className="flex flex-col items-start min-w-0">
      <span
        className={`text-sm font-semibold tabular-nums leading-tight ${
          accent === 'warm' ? 'text-[hsl(20,70%,42%)]' : 'text-foreground'
        }`}
      >
        {value}
      </span>
      <span className="text-[9px] uppercase tracking-wider text-muted-foreground/80 font-medium">
        {label}
      </span>
    </div>
  );
}

function Divider() {
  return <span aria-hidden className="w-px h-6 bg-border/70 flex-shrink-0" />;
}
