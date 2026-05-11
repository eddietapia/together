import * as fs from 'fs';
import * as path from 'path';
import { getDb } from './db.js';
import {
  SEED_DATA_DIR,
  SEED_PROJECT_FILES_DIR,
  WORKSPACE_DIR,
  WORKSPACE_PROJECT_FILES_DIR,
} from './paths.js';

interface ManifestFile {
  id: string;
  filename: string;
  path?: string;
  target_path: string;
  mime_type?: string;
  size?: number;
  action: 'created' | 'updated' | 'deleted';
  message?: string;
}

interface ManifestSubmission {
  id: string;
  title: string;
  description?: string;
  author?: string;
  created_at: string;
  files: ManifestFile[];
}

interface Manifest {
  submissions: ManifestSubmission[];
}

function listFilesRecursive(dir: string, base: string = dir): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listFilesRecursive(full, base));
    } else if (entry.isFile()) {
      out.push(path.relative(base, full));
    }
  }
  return out;
}

function copyDirRecursive(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(s, d);
    } else if (entry.isFile()) {
      fs.copyFileSync(s, d);
    }
  }
}

export function ensureWorkspace(): void {
  fs.mkdirSync(WORKSPACE_DIR, { recursive: true });

  const projectFilesExisted = fs.existsSync(WORKSPACE_PROJECT_FILES_DIR);
  if (!projectFilesExisted) {
    if (!fs.existsSync(SEED_PROJECT_FILES_DIR)) {
      throw new Error(
        `Seed project-files directory missing at ${SEED_PROJECT_FILES_DIR}`
      );
    }
    copyDirRecursive(SEED_PROJECT_FILES_DIR, WORKSPACE_PROJECT_FILES_DIR);
    console.log(`[bootstrap] copied seed project-files → workspace/`);
  }

  const db = getDb();
  const eventCount = db
    .prepare('SELECT COUNT(*) AS c FROM activity_events')
    .get() as { c: number };

  if (eventCount.c === 0) {
    const seededFiles = listFilesRecursive(WORKSPACE_PROJECT_FILES_DIR).sort();
    const now = Date.now();

    const insertEvent = db.prepare(
      `INSERT INTO activity_events (type, timestamp, submission_id, submission_title, payload)
       VALUES (?, ?, NULL, NULL, ?)`
    );
    const insertProvenance = db.prepare(
      `INSERT OR REPLACE INTO project_file_provenance
       (target_path, merged_at, source_submission_id, source_submission_title, action)
       VALUES (?, ?, NULL, NULL, ?)`
    );

    const tx = db.transaction(() => {
      insertEvent.run(
        'init',
        now,
        JSON.stringify({
          files: seededFiles.map(f => ({ targetPath: f, action: 'init' })),
        })
      );
      for (const f of seededFiles) {
        insertProvenance.run(f, now, 'init');
      }
    });
    tx();
    console.log(
      `[bootstrap] seeded init event with ${seededFiles.length} files`
    );
  }

  const submissionCount = db
    .prepare('SELECT COUNT(*) AS c FROM submissions')
    .get() as { c: number };

  if (submissionCount.c === 0) {
    const manifestPath = path.join(SEED_DATA_DIR, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
      console.warn(
        `[bootstrap] manifest.json missing at ${manifestPath}, skipping submission seed`
      );
      return;
    }
    const manifest: Manifest = JSON.parse(
      fs.readFileSync(manifestPath, 'utf-8')
    );

    const insertSubmission = db.prepare(
      `INSERT INTO submissions (id, title, description, author, created_at, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`
    );
    const insertFile = db.prepare(
      `INSERT INTO submission_files
       (id, submission_id, filename, path, target_path, mime_type, size, action, message, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`
    );

    let totalFiles = 0;
    const tx = db.transaction(() => {
      for (const sub of manifest.submissions) {
        const createdAt = Date.parse(sub.created_at);
        if (Number.isNaN(createdAt)) {
          throw new Error(
            `Invalid created_at on submission ${sub.id}: ${sub.created_at}`
          );
        }
        insertSubmission.run(
          sub.id,
          sub.title,
          sub.description ?? null,
          sub.author ?? null,
          createdAt
        );
        for (const f of sub.files) {
          insertFile.run(
            f.id,
            sub.id,
            f.filename,
            f.path ?? null,
            f.target_path,
            f.mime_type ?? null,
            f.size ?? null,
            f.action,
            f.message ?? null
          );
          totalFiles++;
        }
      }
    });
    tx();
    console.log(
      `[bootstrap] seeded ${manifest.submissions.length} submissions with ${totalFiles} files`
    );
  }
}
