import { useEffect, useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { fetchActivity, fetchTree } from '@/api/projectFiles';
import { fetchSubmissions } from '@/api/submissions';
import type { ActivityEvent, TreeNode } from '@/types/project';
import type { SubmissionSummary } from '@/types/submission';
import { Section } from './TopNav';
import { ContextualPanel } from './ContextualPanel';
import { CollapsedRail } from './CollapsedRail';
import { ProjectFilesView } from './ProjectFiles/ProjectFilesView';
import { SubmissionsView } from './Submissions/SubmissionsView';
import { StatusFilter } from './Submissions/SubmissionsPanel';
import { Home } from './Home/Home';
import type { SubmissionCategory } from './Home/submissionVisuals';

export function AppShell() {
  const [active, setActiveStored] = useLocalStorage<Section>(
    'together.active-section',
    'home'
  );
  const [collapsed, setCollapsed] = useLocalStorage<boolean>(
    'together.sidebar-collapsed',
    false
  );

  // Project Files state
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [projectFilter, setProjectFilter] = useState('');

  // Submissions state
  const [submissions, setSubmissions] = useState<SubmissionSummary[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [submissionsError, setSubmissionsError] = useState<string | null>(null);
  const [submissionsFilter, setSubmissionsFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [homeSearchFilter, setHomeSearchFilter] = useState('');
  const [homeCategoryFilter, setHomeCategoryFilter] =
    useState<SubmissionCategory | null>(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<
    string | null
  >(null);

  // Reset selected submission when leaving the section
  function setActive(next: Section) {
    if (next !== 'submissions') setSelectedSubmissionId(null);
    setActiveStored(next);
  }

  // Used by Home sidebar — open a submission's detail view from anywhere.
  function openSubmission(id: string) {
    setSelectedSubmissionId(id);
    setActiveStored('submissions');
  }

  // Listen for navigate:submission events sent from the tray window via Electron IPC.
  useEffect(() => {
    if (!window.electronAPI) return;
    return window.electronAPI.onNavigateToSubmission((id) => {
      setSelectedSubmissionId(id);
      setActiveStored('submissions');
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    setProjectLoading(true);
    Promise.all([fetchTree(), fetchActivity()])
      .then(([t, a]) => {
        if (cancelled) return;
        setTree(t);
        setActivity(a);
        setProjectError(null);
      })
      .catch(err => {
        if (cancelled) return;
        setProjectError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setProjectLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setSubmissionsLoading(true);
    fetchSubmissions()
      .then(s => {
        if (!cancelled) {
          setSubmissions(s);
          setSubmissionsError(null);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setSubmissionsError(
            err instanceof Error ? err.message : String(err)
          );
        }
      })
      .finally(() => {
        if (!cancelled) setSubmissionsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="h-screen flex bg-[#fefdf8] overflow-hidden">
      {collapsed ? (
        <CollapsedRail
          active={active}
          onSelect={setActive}
          onExpand={() => setCollapsed(false)}
        />
      ) : (
        <ContextualPanel
          active={active}
          onSelect={setActive}
          onToggleCollapse={() => setCollapsed(true)}
          recentActivity={activity}
          projectFilter={projectFilter}
          onProjectFilterChange={setProjectFilter}
          submissions={submissions}
          submissionsLoading={submissionsLoading}
          submissionsError={submissionsError}
          submissionsFilter={submissionsFilter}
          onSubmissionsFilterChange={setSubmissionsFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          selectedSubmissionId={selectedSubmissionId}
          onSelectSubmission={setSelectedSubmissionId}
          onOpenSubmission={openSubmission}
          homeSearchFilter={homeSearchFilter}
          homeCategoryFilter={homeCategoryFilter}
          onHomeCategoryFilterChange={setHomeCategoryFilter}
        />
      )}

      <main className="flex-1 flex flex-col overflow-hidden">
        {active === 'home' && (
          <Home
            submissions={submissions}
            loading={submissionsLoading}
            error={submissionsError}
            searchFilter={homeSearchFilter}
            onSearchFilterChange={setHomeSearchFilter}
            categoryFilter={homeCategoryFilter}
            onCategoryFilterChange={setHomeCategoryFilter}
            onOpenSubmission={openSubmission}
          />
        )}
        {active === 'project-files' && (
          <ProjectFilesView
            tree={tree}
            activity={activity}
            loading={projectLoading}
            error={projectError}
            filter={projectFilter}
          />
        )}
        {active === 'submissions' && (
          <SubmissionsView
            submissions={submissions}
            loading={submissionsLoading}
            error={submissionsError}
            filter={submissionsFilter}
            selectedId={selectedSubmissionId}
            onSelect={setSelectedSubmissionId}
          />
        )}
      </main>
    </div>
  );
}
