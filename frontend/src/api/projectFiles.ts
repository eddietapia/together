import type { ActivityEvent, TreeNode } from '@/types/project';

export function projectFileContentUrl(path: string): string {
  return `/api/project-files/content?path=${encodeURIComponent(path)}`;
}

export async function fetchProjectFileText(path: string): Promise<string> {
  const res = await fetch(projectFileContentUrl(path));
  if (!res.ok) throw new Error(`file fetch failed: ${res.status}`);
  return res.text();
}

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
