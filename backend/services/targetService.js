import fs from 'fs';
import path from 'path';

let customTargetRoot = null;

export const targetService = {
  getAuthorizedRoot() {
    if (customTargetRoot && fs.existsSync(customTargetRoot)) {
      return customTargetRoot;
    }
    const hpPath = path.resolve('C:/Users/HP/worldmonitor');
    if (fs.existsSync(hpPath)) {
      return hpPath;
    }
    // Fallback to current project root as authorized sandbox
    return path.resolve('.');
  },

  setAuthorizedRoot(newPath) {
    if (newPath) {
      customTargetRoot = path.resolve(newPath);
    }
  },

  validateAndResolvePath(relativePath = '') {
    const root = this.getAuthorizedRoot();
    const resolvedPath = path.resolve(root, relativePath);

    // Strict path traversal prevention
    const relativeToRoot = path.relative(root, resolvedPath);
    if (relativeToRoot.startsWith('..') || (path.isAbsolute(relativeToRoot) && relativeToRoot !== '')) {
      throw new Error('Security Boundary Violation: Requested target path is outside the authorized target root.');
    }

    return resolvedPath;
  }
};
