import type { ActivityEvent, TreeNode } from '@/types/project';

export async function fetchTree(): Promise<TreeNode[]> {
  const res = await fetch('/api/project-files/tree');
  if (!res.ok) throw new Error(`tree fetch failed: ${res.status}`);
  const data = (await res.json()) as { tree: TreeNode[] };
  return data.tree;
}

export async function fetchActivity(): Promise<ActivityEvent[]> {
  const res = await fetch('/api/project-files/activity');
  if (!res.ok) throw new Error(`activity fetch failed: ${res.status}`);
  const data = (await res.json()) as { events: ActivityEvent[] };
  return data.events;
}
