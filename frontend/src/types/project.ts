export type FileLeaf = {
  kind: 'file';
  name: string;
  path: string;
  size: number;
  mimeType: string;
  sourceSubmissionId: string | null;
  sourceSubmissionTitle: string | null;
  mergedAt: number | null;
  action: string | null;
};

export type DirNode = {
  kind: 'dir';
  name: string;
  path: string;
  children: TreeNode[];
};

export type TreeNode = FileLeaf | DirNode;

export type ActivityFileEntry = {
  targetPath: string;
  action: 'init' | 'created' | 'updated' | 'deleted';
};

export type ActivityEvent = {
  id: number;
  type: 'init' | 'merge';
  timestamp: number;
  submissionId: string | null;
  submissionTitle: string | null;
  payload: { files: ActivityFileEntry[] };
};
