import { Router, Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { getDb } from '../db.js';
import { mimeTypeFor } from '../mime.js';
import {
  WORKSPACE_DIR,
  WORKSPACE_PROJECT_FILES_DIR,
} from '../paths.js';
import { ensureWorkspace } from '../bootstrap.js';
import { safeResolveInside } from '../pathUtils.js';

interface Provenance {
  source_submission_id: string | null;
  source_submission_title: string | null;
  merged_at: number;
  action: string;
}

type FileLeaf = {
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

type DirNode = {
  kind: 'dir';
  name: string;
  path: string;
  children: TreeNode[];
};

type TreeNode = FileLeaf | DirNode;

function buildTree(
  absDir: string,
  rootDir: string,
  provenance: Map<string, Provenance>
): TreeNode[] {
  const entries = fs.readdirSync(absDir, { withFileTypes: true });
  const dirs: DirNode[] = [];
  const files: FileLeaf[] = [];

  for (const entry of entries) {
    const abs = path.join(absDir, entry.name);
    const rel = path.relative(rootDir, abs);
    if (entry.isDirectory()) {
      dirs.push({
        kind: 'dir',
        name: entry.name,
        path: rel,
        children: buildTree(abs, rootDir, provenance),
      });
    } else if (entry.isFile()) {
      const stat = fs.statSync(abs);
      const prov = provenance.get(rel);
      files.push({
        kind: 'file',
        name: entry.name,
        path: rel,
        size: stat.size,
        mimeType: mimeTypeFor(entry.name),
        sourceSubmissionId: prov?.source_submission_id ?? null,
        sourceSubmissionTitle: prov?.source_submission_title ?? null,
        mergedAt: prov?.merged_at ?? null,
        action: prov?.action ?? null,
      });
    }
  }

  dirs.sort((a, b) => a.name.localeCompare(b.name));
  files.sort((a, b) => a.name.localeCompare(b.name));
  return [...dirs, ...files];
}

function resolveProjectFilePath(rel: string): string | null {
  const resolved = path.resolve(WORKSPACE_PROJECT_FILES_DIR, rel);
  return safeResolveInside(resolved, WORKSPACE_PROJECT_FILES_DIR) ? resolved : null;
}

export function projectFilesRouter(): Router {
  const router = Router();

  router.get('/tree', (_req: Request, res: Response) => {
    const db = getDb();
    const rows = db
      .prepare(
        `SELECT target_path, source_submission_id, source_submission_title, merged_at, action
         FROM project_file_provenance`
      )
      .all() as Array<Provenance & { target_path: string }>;

    const provenance = new Map<string, Provenance>();
    for (const r of rows) {
      provenance.set(r.target_path, {
        source_submission_id: r.source_submission_id,
        source_submission_title: r.source_submission_title,
        merged_at: r.merged_at,
        action: r.action,
      });
    }

    const tree = buildTree(
      WORKSPACE_PROJECT_FILES_DIR,
      WORKSPACE_PROJECT_FILES_DIR,
      provenance
    );
    res.json({ tree });
  });

  router.get('/activity', (_req: Request, res: Response) => {
    const db = getDb();
    const rows = db
      .prepare(
        `SELECT id, type, timestamp, submission_id, submission_title, payload
         FROM activity_events
         ORDER BY timestamp DESC, id DESC`
      )
      .all() as Array<{
      id: number;
      type: string;
      timestamp: number;
      submission_id: string | null;
      submission_title: string | null;
      payload: string;
    }>;

    const events = rows.map(r => {
      let payload: unknown = null;
      try {
        payload = JSON.parse(r.payload);
      } catch {
        console.error(`[activity] malformed JSON in event id=${r.id}`);
      }
      return {
        id: r.id,
        type: r.type,
        timestamp: r.timestamp,
        submissionId: r.submission_id,
        submissionTitle: r.submission_title,
        payload,
      };
    });
    res.json({ events });
  });

  router.get('/content', (req: Request, res: Response) => {
    const rel = typeof req.query.path === 'string' ? req.query.path : '';
    if (!rel) {
      res.status(400).json({ error: 'path query parameter required' });
      return;
    }
    const abs = resolveProjectFilePath(rel);
    if (!abs) {
      res.status(400).json({ error: 'invalid path' });
      return;
    }
    if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
      res.status(404).json({ error: 'file not found' });
      return;
    }
    res.setHeader('Content-Type', mimeTypeFor(path.basename(abs)));
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.sendFile(abs);
  });

  return router;
}

export function resetWorkspace(): void {
  if (fs.existsSync(WORKSPACE_DIR)) {
    fs.rmSync(WORKSPACE_DIR, { recursive: true, force: true });
  }
  ensureWorkspace();
}
