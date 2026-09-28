import path from 'path';

const AUTHORIZED_TARGET_ROOT = path.resolve('C:/Users/HP/worldmonitor');

export const targetService = {
  getAuthorizedRoot() {
    return AUTHORIZED_TARGET_ROOT;
  },

  validateAndResolvePath(relativePath = '') {
    const resolvedPath = path.resolve(AUTHORIZED_TARGET_ROOT, relativePath);

    // Guardrail: Strict path traversal prevention
    const relativeToRoot = path.relative(AUTHORIZED_TARGET_ROOT, resolvedPath);
    if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot) && relativeToRoot !== '') {
      throw new Error('Security Boundary Violation: Requested target path is outside the authorized World Monitor root.');
    }

    return resolvedPath;
  }
};
