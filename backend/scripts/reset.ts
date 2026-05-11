import * as fs from 'fs';
import { WORKSPACE_DIR } from '../src/paths.js';

if (fs.existsSync(WORKSPACE_DIR)) {
  fs.rmSync(WORKSPACE_DIR, { recursive: true, force: true });
  console.log(`removed ${WORKSPACE_DIR}`);
} else {
  console.log(`workspace already absent at ${WORKSPACE_DIR}`);
}
