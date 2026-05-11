import { Router, Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { getDb } from '../db.js';
import { mimeTypeFor } from '../mime.js';
import {
  SEED_DATA_DIR,
  SEED_SUBMISSIONS_DIR,
  WORKSPACE_PROJECT_FILES_DIR,
} from '../paths.js';
import { safeResolveInside } from '../pathUtils.js';

interface SubmissionRow {
  id: string;
  title: string;
  description: string | null;
  author: string | null;
  created_at: number;
  status: string;
}

interface SubmissionSummaryRow extends SubmissionRow {
  file_count: number;
  created_count: number;
  updated_count: number;
  deleted_count: number;
}

interface SubmissionFileRow {
  id: string;
  submission_id: string;
  filename: string;
  path: string | null;
  target_path: string;
  mime_type: string | null;
  size: number | null;
  action: string;
  message: string | null;
  status: string;
  review_comment: string | null;
}

function summaryToApi(row: SubmissionSummaryRow) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    author: row.author,
    createdAt: row.created_at,
    status: row.status,
    fileCount: row.file_count,
    fileActions: {
      created: row.created_count,
      updated: row.updated_count,
      deleted: row.deleted_count,
    },
  };
}

function submissionToApi(row: SubmissionRow) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    author: row.author,
    createdAt: row.created_at,
    status: row.status,
  };
}

function fileToApi(row: SubmissionFileRow) {
  return {
    id: row.id,
    submissionId: row.submission_id,
    filename: row.filename,
    path: row.path,
    targetPath: row.target_path,
    mimeType: row.mime_type,
    size: row.size,
    action: row.action,
    message: row.message,
    status: row.status,
    reviewComment: row.review_comment,
  };
}

const VALID_ID = /^[A-Za-z0-9_\-]+$/;

export function submissionsRouter(): Router {
  const router = Router();

  router.get('/', (_req: Request, res: Response) => {
    const db = getDb();
    const rows = db
      .prepare(
        `SELECT
           s.id, s.title, s.description, s.author, s.created_at, s.status,
           COUNT(f.id) AS file_count,
           COALESCE(SUM(CASE WHEN f.action = 'created' THEN 1 ELSE 0 END), 0) AS created_count,
           COALESCE(SUM(CASE WHEN f.action = 'updated' THEN 1 ELSE 0 END), 0) AS updated_count,
           COALESCE(SUM(CASE WHEN f.action = 'deleted' THEN 1 ELSE 0 END), 0) AS deleted_count
         FROM submissions s
         LEFT JOIN submission_files f ON f.submission_id = s.id
         GROUP BY s.id
         ORDER BY s.created_at DESC, s.id DESC`
      )
      .all() as SubmissionSummaryRow[];

    res.json({ submissions: rows.map(summaryToApi) });
  });

  router.get('/:id', (req: Request, res: Response) => {
    const id = req.params.id;
    if (!id || !VALID_ID.test(id)) {
      res.status(400).json({ error: 'invalid submission id' });
      return;
    }

    const db = getDb();
    const submission = db
      .prepare(
        `SELECT id, title, description, author, created_at, status
         FROM submissions WHERE id = ?`
      )
      .get(id) as SubmissionRow | undefined;

    if (!submission) {
      res.status(404).json({ error: 'submission not found' });
      return;
    }

    const files = db
      .prepare(
        `SELECT id, submission_id, filename, path, target_path, mime_type,
                size, action, message, status, review_comment
         FROM submission_files
         WHERE submission_id = ?
         ORDER BY target_path ASC`
      )
      .all(id) as SubmissionFileRow[];

    res.json({
      submission: submissionToApi(submission),
      files: files.map(fileToApi),
    });
  });

  router.get('/:subId/files/:fileId/content', (req: Request, res: Response) => {
    const subId = req.params.subId;
    const fileId = req.params.fileId;
    if (!subId || !VALID_ID.test(subId) || !fileId || !VALID_ID.test(fileId)) {
      res.status(400).json({ error: 'invalid id' });
      return;
    }
    const version = req.query.version === 'current' ? 'current' : 'proposed';

    const db = getDb();
    const row = db
      .prepare(
        `SELECT id, submission_id, filename, path, target_path, mime_type,
                size, action, message, status, review_comment
         FROM submission_files
         WHERE submission_id = ? AND id = ?`
      )
      .get(subId, fileId) as SubmissionFileRow | undefined;

    if (!row) {
      res.status(404).json({ error: 'file not found' });
      return;
    }

    let absPath: string;
    let allowedRoot: string;
    let displayName: string;

    if (version === 'proposed') {
      if (!row.path) {
        res
          .status(410)
          .json({ error: 'no proposed bytes for deleted file' });
        return;
      }
      // row.path is stored relative to seed-data/ (e.g. "submissions/submission_1/file.csv");
      // we still constrain the resolved path to live under SEED_SUBMISSIONS_DIR.
      absPath = path.resolve(SEED_DATA_DIR, row.path);
      allowedRoot = path.resolve(SEED_SUBMISSIONS_DIR);
      displayName = row.filename;
    } else {
      absPath = path.resolve(WORKSPACE_PROJECT_FILES_DIR, row.target_path);
      allowedRoot = path.resolve(WORKSPACE_PROJECT_FILES_DIR);
      displayName = path.basename(row.target_path);
    }

    if (!safeResolveInside(absPath, allowedRoot)) {
      res.status(400).json({ error: 'invalid path' });
      return;
    }

    if (!fs.existsSync(absPath) || !fs.statSync(absPath).isFile()) {
      res.status(404).json({ error: 'file not found on disk' });
      return;
    }

    res.setHeader(
      'Content-Type',
      row.mime_type ?? mimeTypeFor(displayName)
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.sendFile(absPath);
  });

  router.patch('/:subId/files/:fileId/status', (req: Request, res: Response) => {
    const subId = req.params.subId;
    const fileId = req.params.fileId;
    if (!subId || !VALID_ID.test(subId) || !fileId || !VALID_ID.test(fileId)) {
      res.status(400).json({ error: 'invalid id' });
      return;
    }

    const body = (req.body ?? {}) as {
      status?: unknown;
      comment?: unknown;
    };
    const status = body.status;
    if (
      status !== 'pending' &&
      status !== 'approved' &&
      status !== 'rejected'
    ) {
      res.status(400).json({ error: 'invalid status' });
      return;
    }

    let comment: string | null = null;
    if (typeof body.comment === 'string' && body.comment.trim() !== '') {
      comment = body.comment.trim();
    }
    if (status === 'rejected' && !comment) {
      res.status(400).json({ error: 'comment required to reject' });
      return;
    }

    const db = getDb();
    const existing = db
      .prepare(
        `SELECT id FROM submission_files WHERE submission_id = ? AND id = ?`
      )
      .get(subId, fileId) as { id: string } | undefined;
    if (!existing) {
      res.status(404).json({ error: 'file not found' });
      return;
    }

    db.prepare(
      `UPDATE submission_files
       SET status = ?, review_comment = ?
       WHERE submission_id = ? AND id = ?`
    ).run(status, status === 'rejected' ? comment : null, subId, fileId);

    const row = db
      .prepare(
        `SELECT id, submission_id, filename, path, target_path, mime_type,
                size, action, message, status, review_comment
         FROM submission_files
         WHERE submission_id = ? AND id = ?`
      )
      .get(subId, fileId) as SubmissionFileRow;

    res.json({ file: fileToApi(row) });
  });

  return router;
}
