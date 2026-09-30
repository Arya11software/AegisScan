import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// ES-module-safe __dirname equivalent (always relative to THIS file's location)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Resolve the authorized target root in a deployment-safe way.
 *
 * Resolution order (first directory that exists wins):
 *  1. process.env.TARGET_ROOT  — explicit override (absolute or relative to process.cwd())
 *  2. <backend-root>/target/worldmonitor — bundled target shipped inside the repo
 *
 * On Render (or any cloud host) set:
 *   TARGET_ROOT=./target/worldmonitor
 *
 * For local development the default resolves to:
 *   <repo-root>/backend/target/worldmonitor
 */
function resolveTargetRoot() {
  if (process.env.TARGET_ROOT) {
    const envPath = path.isAbsolute(process.env.TARGET_ROOT)
      ? process.env.TARGET_ROOT
      : path.resolve(process.cwd(), process.env.TARGET_ROOT);
    return envPath;
  }

  // Default: <backend>/target/worldmonitor  (two levels up from services/)
  const backendRoot = path.resolve(__dirname, '..');
  return path.join(backendRoot, 'target', 'worldmonitor');
}

const AUTHORIZED_TARGET_ROOT = resolveTargetRoot();

export const targetService = {
  getAuthorizedRoot() {
    return AUTHORIZED_TARGET_ROOT;
  },

  isTargetAvailable() {
    return fs.existsSync(AUTHORIZED_TARGET_ROOT);
  },

  validateAndResolvePath(relativePath = '') {
    const resolvedPath = path.resolve(AUTHORIZED_TARGET_ROOT, relativePath);

    // Strict path-traversal prevention
    const relativeToRoot = path.relative(AUTHORIZED_TARGET_ROOT, resolvedPath);
    if (relativeToRoot.startsWith('..') || (path.isAbsolute(relativeToRoot) && relativeToRoot !== '')) {
      throw new Error('Security Boundary Violation: Requested target path is outside the authorized root.');
    }

    return resolvedPath;
  }
};
