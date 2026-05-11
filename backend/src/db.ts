import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import { DB_FILE } from './paths.js';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS activity_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  submission_id TEXT,
  submission_title TEXT,
  payload TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS project_file_provenance (
  target_path TEXT PRIMARY KEY,
  merged_at INTEGER NOT NULL,
  source_submission_id TEXT,
  source_submission_title TEXT,
  action TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  author TEXT,
  created_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS submission_files (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  path TEXT,
  target_path TEXT NOT NULL,
  mime_type TEXT,
  size INTEGER,
  action TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  review_comment TEXT,
  FOREIGN KEY (submission_id) REFERENCES submissions(id)
);

CREATE INDEX IF NOT EXISTS idx_submission_files_submission_id
  ON submission_files(submission_id);
`;

let _db: Database.Database | null = null;

function migrate(db: Database.Database): void {
  const cols = db
    .prepare(`PRAGMA table_info(submission_files)`)
    .all() as Array<{ name: string }>;
  if (!cols.some(c => c.name === 'review_comment')) {
    db.exec(`ALTER TABLE submission_files ADD COLUMN review_comment TEXT`);
  }
}

export function getDb(): Database.Database {
  if (_db) return _db;
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
  const db = new Database(DB_FILE);
  db.pragma('journal_mode = WAL');
  db.exec(SCHEMA);
  migrate(db);
  _db = db;
  return db;
}

export function closeDb(): void {
  if (_db) {
    _db.close();
    _db = null;
  }
}

