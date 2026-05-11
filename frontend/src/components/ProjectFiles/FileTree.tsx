import { ChevronRight, FileText, Image as ImageIcon, Sheet, Braces, FolderClosed, FolderOpen } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { FileLeaf, TreeNode } from '@/types/project';
import { formatBytes, formatRelativeTime } from '@/lib/utils';
import { ACTION_TONE } from '@/components/shared/ActionBadge';

function iconForFile(mimeType: string) {
  if (mimeType.startsWith('image/')) return ImageIcon;
  if (mimeType === 'text/csv' || mimeType === 'text/tab-separated-values') return Sheet;
  if (mimeType === 'application/json' || mimeType.startsWith('application/yaml')) return Braces;
  return FileText;
}

function filterTree(nodes: TreeNode[], q: string): TreeNode[] {
  if (!q.trim()) return nodes;
  const lower = q.toLowerCase();
  const result: TreeNode[] = [];
  for (const n of nodes) {
    if (n.kind === 'file') {
      if (n.name.toLowerCase().includes(lower) || n.path.toLowerCase().includes(lower)) {
        result.push(n);
      }
    } else {
      const filteredChildren = filterTree(n.children, q);
      if (filteredChildren.length > 0) {
        result.push({ ...n, children: filteredChildren });
      }
    }
  }
  return result;
}

export function FileTree({
  nodes,
  filter,
}: {
  nodes: TreeNode[];
  filter: string;
}) {
  const [collapsed, setCollapsed] = useLocalStorage<string[]>(
    'together.collapsed-dirs',
    []
  );

  const filtered = filterTree(nodes, filter);
  const collapsedSet = new Set(filter.trim() ? [] : collapsed);

  if (filtered.length === 0) {
    return (
      <p className="text-xs text-muted-foreground px-3 py-4">
        {filter.trim() ? 'No files match.' : 'No project files yet.'}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      {filtered.map(node => (
        <TreeRow
          key={node.path}
          node={node}
          depth={0}
          collapsedSet={collapsedSet}
          onToggle={p =>
            setCollapsed(prev =>
              prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
            )
          }
          forceExpanded={!!filter.trim()}
        />
      ))}
    </div>
  );
}

function TreeRow({
  node,
  depth,
  collapsedSet,
  onToggle,
  forceExpanded,
}: {
  node: TreeNode;
  depth: number;
  collapsedSet: Set<string>;
  onToggle: (path: string) => void;
  forceExpanded: boolean;
}) {
  if (node.kind === 'dir') {
    const isOpen = forceExpanded || !collapsedSet.has(node.path);
    return (
      <>
        <button
          onClick={() => onToggle(node.path)}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm text-foreground hover:bg-black/5 transition-colors text-left"
          style={{ paddingLeft: `${8 + depth * 14}px` }}
        >
          <ChevronRight
            className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${
              isOpen ? 'rotate-90' : ''
            }`}
          />
          {isOpen ? (
            <FolderOpen className="w-4 h-4 text-muted-foreground" />
          ) : (
            <FolderClosed className="w-4 h-4 text-muted-foreground" />
          )}
          <span className="font-medium">{node.name}</span>
        </button>
        {isOpen && (
          <div>
            {node.children.length === 0 ? (
              <p
                className="text-xs text-muted-foreground py-1"
                style={{ paddingLeft: `${8 + (depth + 1) * 14 + 20}px` }}
              >
                empty
              </p>
            ) : (
              node.children.map(child => (
                <TreeRow
                  key={child.path}
                  node={child}
                  depth={depth + 1}
                  collapsedSet={collapsedSet}
                  onToggle={onToggle}
                  forceExpanded={forceExpanded}
                />
              ))
            )}
          </div>
        )}
      </>
    );
  }

  return <FileRow leaf={node} depth={depth} />;
}

function FileRow({ leaf, depth }: { leaf: FileLeaf; depth: number }) {
  const Icon = iconForFile(leaf.mimeType);
  return (
    <div
      className="group flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-black/5 transition-colors"
      style={{ paddingLeft: `${8 + depth * 14 + 20}px` }}
    >
      <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      <span className="text-sm text-foreground truncate flex-1 min-w-0">
        {leaf.name}
      </span>
      <span className="text-[10px] text-muted-foreground/70 flex-shrink-0">
        {formatBytes(leaf.size)}
      </span>
      <Provenance leaf={leaf} />
    </div>
  );
}

function Provenance({ leaf }: { leaf: FileLeaf }) {
  if (!leaf.action) {
    return (
      <span className="text-[10px] text-muted-foreground/50 flex-shrink-0">
        unknown
      </span>
    );
  }
  const label =
    leaf.action === 'init'
      ? 'init'
      : (leaf.sourceSubmissionId ?? leaf.action);
  const tone = ACTION_TONE[leaf.action ?? ''] ?? 'bg-stone-100 text-stone-600';
  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <span
        className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${tone}`}
        title={leaf.sourceSubmissionTitle ?? undefined}
      >
        {label}
      </span>
      {leaf.mergedAt && (
        <span className="text-[10px] text-muted-foreground/70">
          {formatRelativeTime(new Date(leaf.mergedAt))}
        </span>
      )}
    </div>
  );
}
