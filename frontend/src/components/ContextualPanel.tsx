import { useState, useRef } from 'react';
import { MessageSquare, PanelLeft, Settings, UserPlus } from 'lucide-react';
import { Section, TopNav } from './TopNav';
import { Tooltip } from './Tooltip';
import type { SubmissionSummary } from '@/types/submission';
import { HomePanel } from './Home/HomePanel';
import type { SubmissionCategory } from './Home/submissionVisuals';

export function ContextualPanel({
  active,
  onSelect,
  onToggleCollapse,
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
        <HomePanel
          submissions={submissions}
          loading={submissionsLoading}
          error={submissionsError}
          onOpenSubmission={onOpenSubmission}
          searchFilter={homeSearchFilter}
          categoryFilter={homeCategoryFilter}
          onCategoryFilterChange={onHomeCategoryFilterChange}
        />
      </div>

      <Footer />
    </aside>
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
