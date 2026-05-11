import { Sparkles, GitMerge } from 'lucide-react';
import type { ActivityEvent } from '@/types/project';
import { formatRelativeTime } from '@/lib/utils';
import { ActionBadge } from '@/components/shared/ActionBadge';

export function ActivityTimeline({ events }: { events: ActivityEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="text-xs text-muted-foreground px-3 py-3">
        No activity yet.
      </p>
    );
  }
  return (
    <ol className="relative pl-6">
      <span
        aria-hidden
        className="absolute left-2.5 top-1 bottom-1 w-px bg-border"
      />
      {events.map(ev => (
        <EventRow key={ev.id} event={ev} />
      ))}
    </ol>
  );
}

function EventRow({ event }: { event: ActivityEvent }) {
  const isInit = event.type === 'init';
  const Icon = isInit ? Sparkles : GitMerge;
  const title = isInit
    ? 'Project initialized'
    : (event.submissionTitle ?? 'Submission merged');
  const fileCount = event.payload.files.length;

  return (
    <li className="relative py-2.5">
      <span
        aria-hidden
        className="absolute left-[-22px] top-3 w-5 h-5 flex items-center justify-center rounded-full bg-card border border-border"
      >
        <Icon className="w-3 h-3 text-muted-foreground" />
      </span>
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {formatRelativeTime(new Date(event.timestamp))} · {fileCount}{' '}
          {fileCount === 1 ? 'file' : 'files'}
          {event.submissionId && (
            <span className="text-muted-foreground/70"> · {event.submissionId}</span>
          )}
        </p>
        <ul className="mt-1.5 ml-2 space-y-0.5">
          {event.payload.files.slice(0, 6).map(f => (
            <li
              key={f.targetPath}
              className="text-[11px] text-muted-foreground/80 flex items-center gap-2"
            >
              <ActionBadge action={f.action} />
              <span className="truncate">{f.targetPath}</span>
            </li>
          ))}
          {event.payload.files.length > 6 && (
            <li className="text-[11px] text-muted-foreground/60 ml-1">
              + {event.payload.files.length - 6} more
            </li>
          )}
        </ul>
      </div>
    </li>
  );
}

