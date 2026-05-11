import { useEffect, useMemo, useState } from 'react';
import type { ActivityEvent, FileLeaf, TreeNode } from '@/types/project';
import { FileTree } from './FileTree';
import { ActivityTimeline } from './ActivityTimeline';
import { ProjectFileDetail } from './ProjectFileDetail';

export function ProjectFilesView({
  tree,
  activity,
  loading,
  error,
  filter,
}: {
  tree: TreeNode[];
  activity: ActivityEvent[];
  loading: boolean;
  error: string | null;
  filter: string;
}) {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const selectedFile = useMemo(() => findFile(tree, selectedPath), [tree, selectedPath]);

  useEffect(() => {
    if (selectedPath && !selectedFile) setSelectedPath(null);
  }, [selectedFile, selectedPath]);

  return (
    <>
      <header className="flex-shrink-0 bg-[#faf7f0] border-b border-border px-6 py-4">
        <h1 className="text-base font-semibold text-foreground">Project Files</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          The trusted state of the project. Only reviewed and approved files live here.
        </p>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-5 space-y-8">
          <div
            className={
              selectedFile
                ? 'grid gap-5 lg:grid-cols-[minmax(260px,0.85fr)_minmax(0,1.15fr)]'
                : 'grid gap-5'
            }
          >
            <section>
              <SectionHeader>Files</SectionHeader>
              {loading ? (
                <Loading label="Loading project files…" />
              ) : error ? (
                <ErrorBanner message={error} />
              ) : (
                <FileTree
                  nodes={tree}
                  filter={filter}
                  selectedPath={selectedPath}
                  onSelectFile={file => setSelectedPath(file.path)}
                />
              )}
            </section>

            {!loading && !error && selectedFile && (
              <ProjectFileDetail file={selectedFile} />
            )}
          </div>

          <section>
            <SectionHeader>Activity</SectionHeader>
            {loading ? (
              <Loading label="Loading activity…" />
            ) : error ? null : (
              <ActivityTimeline events={activity} />
            )}
          </section>
        </div>
      </div>
    </>
  );
}

function findFile(nodes: TreeNode[], path: string | null): FileLeaf | null {
  if (!path) return null;
  for (const node of nodes) {
    if (node.kind === 'file') {
      if (node.path === path) return node;
      continue;
    }
    const found: FileLeaf | null = findFile(node.children, path);
    if (found) return found;
  }
  return null;
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium mb-2 px-2">
      {children}
    </h2>
  );
}

function Loading({ label }: { label: string }) {
  return (
    <div className="px-2 py-3">
      <p className="text-xs text-muted-foreground animate-pulse">{label}</p>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="px-3 py-2.5 rounded-md bg-red-50 border border-red-200">
      <p className="text-xs text-red-800 font-medium">Failed to load.</p>
      <p className="text-[11px] text-red-700/80 mt-0.5">{message}</p>
    </div>
  );
}
