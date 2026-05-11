import * as path from 'path';

/**
 * Returns true if absPath is safely within rootDir (prevents path traversal).
 */
export function safeResolveInside(absPath: string, rootDir: string): boolean {
  const root = path.resolve(rootDir);
  const resolved = path.resolve(absPath);
  return resolved === root || resolved.startsWith(root + path.sep);
}
