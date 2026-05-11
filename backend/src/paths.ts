import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve from backend/src/ → project root
export const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
export const SEED_DATA_DIR = path.join(PROJECT_ROOT, 'seed-data');
export const SEED_PROJECT_FILES_DIR = path.join(SEED_DATA_DIR, 'project-files');
export const SEED_SUBMISSIONS_DIR = path.join(SEED_DATA_DIR, 'submissions');
export const WORKSPACE_DIR = path.join(PROJECT_ROOT, 'workspace');
export const WORKSPACE_PROJECT_FILES_DIR = path.join(WORKSPACE_DIR, 'project-files');
export const DB_FILE = path.join(WORKSPACE_DIR, 'db.sqlite');
