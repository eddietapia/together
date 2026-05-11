import { useState, useRef } from 'react';
import { MessageSquare, PanelLeft, Settings, UserPlus } from 'lucide-react';
import { Section, TopNav } from './TopNav';
import { Tooltip } from './Tooltip';
import type { ActivityEvent } from '@/types/project';
import type { SubmissionSummary } from '@/types/submission';
import { formatRelativeTime } from '@/lib/utils';
import { HomePanel } from './Home/HomePanel';
import type { SubmissionCategory } from './Home/submissionVisuals';

export function ContextualPanel({
  active,
  onSelect,
  onToggleCollapse,
  recentActivity,
  projectFilter,
  onProjectFilterChange,
  submissions,
  submissionsLoading,
  submissionsError,
  onOpenSubmission,
  homeSearchFilter,
  homeCategoryFilter,
  onHomeCategoryFilterChange,
}: {
  active: Section;
  onSelect: (s: Section) => void;
  onToggleCollapse: () => void;
  recentActivity: ActivityEvent[];
  projectFilter: string;
  onProjectFilterChange: (s: string) => void;
  submissions: SubmissionSummary[];
  submissionsLoading: boolean;
  submissionsError: string | null;
  onOpenSubmission: (id: string) => void;
  homeSearchFilter: string;
  homeCategoryFilter: SubmissionCategory | null;
  onHomeCategoryFilterChange: (category: SubmissionCategory | null) => void;
}) {
  return (
    <aside className="w-72 flex-shrink-0 flex flex-col h-full bg-[#f5f2eb] border-r border-border">
      <div className="flex items-center gap-1 px-3 pt-3 pb-2">
        <TopNav active={active} onSelect={onSelect} />
        <button
          onClick={onToggleCollapse}
          aria-label="Collapse sidebar"
          className="w-9 h-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors flex-shrink-0"
        >
          <PanelLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex flex-col min-h-0 border-t border-border">
        {active === 'home' || active === 'submissions' ? (
          <HomePanel
            submissions={submissions}
            loading={submissionsLoading}
            error={submissionsError}
            onOpenSubmission={onOpenSubmission}
            searchFilter={homeSearchFilter}
            categoryFilter={homeCategoryFilter}
            onCategoryFilterChange={onHomeCategoryFilterChange}
          />
        ) : active === 'project-files' ? (
          <ProjectFilesPanel
            recentActivity={recentActivity}
            filter={projectFilter}
            onFilterChange={onProjectFilterChange}
          />
        ) : null}
      </div>

      <Footer />
    </aside>
  );
}

function ProjectFilesPanel({
  recentActivity,
  filter,
  onFilterChange,
}: {
  recentActivity: ActivityEvent[];
  filter: string;
  onFilterChange: (s: string) => void;
}) {
  return (
    <>
      <div className="px-3 pt-3 pb-2">
        <input
          type="text"
          value={filter}
          onChange={e => onFilterChange(e.target.value)}
          placeholder="Filter files…"
          className="w-full px-2.5 py-1.5 text-xs bg-white border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
        />
      </div>

      <div className="px-4 pt-3 pb-2">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">
          Recent
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {recentActivity.length === 0 ? (
          <p className="text-xs text-muted-foreground px-2 py-2">
            No activity yet
          </p>
        ) : (
          <div className="space-y-0.5">
            {recentActivity.slice(0, 5).map(ev => (
              <div
                key={ev.id}
                className="px-2 py-1.5 rounded-md hover:bg-black/5 transition-colors"
              >
                <p className="text-xs font-medium text-foreground truncate">
                  {ev.type === 'init'
                    ? 'Project initialized'
                    : (ev.submissionTitle ?? 'Merge')}
                </p>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                  {formatRelativeTime(new Date(ev.timestamp))} ·{' '}
                  {ev.payload.files.length}{' '}
                  {ev.payload.files.length === 1 ? 'file' : 'files'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function Footer() {
  const [hovered, setHovered] = useState<'feedback' | 'settings' | null>(null);
  const feedbackRef = useRef<HTMLButtonElement>(null);
  const settingsRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-3 border-t border-border">
      <button
        type="button"
        className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors min-w-0"
      >
        <UserPlus className="w-4 h-4 flex-shrink-0" />
        <span className="truncate">Invite members</span>
      </button>

      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          ref={feedbackRef}
          type="button"
          aria-label="Give feedback"
          onMouseEnter={() => setHovered('feedback')}
          onMouseLeave={() => setHovered(null)}
          className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          {hovered === 'feedback' && feedbackRef.current && (
            <Tooltip text="Give feedback" anchor={feedbackRef.current} />
          )}
        </button>
        <button
          ref={settingsRef}
          type="button"
          aria-label="Settings"
          onMouseEnter={() => setHovered('settings')}
          onMouseLeave={() => setHovered(null)}
          className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors"
        >
          <Settings className="w-3.5 h-3.5" />
          {hovered === 'settings' && settingsRef.current && (
            <Tooltip text="Settings" anchor={settingsRef.current} />
          )}
        </button>
      </div>
    </div>
  );
}
