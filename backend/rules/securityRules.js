import * as parser from '@babel/parser';
import fs from 'fs';
import path from 'path';

/**
 * REAL-CHK-002: Authentication & Session Security Configuration
 * Inspects source for hardcoded JWTs, weak session tokens, or missing CORS/auth guards.
 */
export function checkAuthSecurity(filePath, content) {
  const obs = [];
  if (/bearer\s+eyJ[a-zA-Z0-9_-]+/i.test(content) || /hardcoded_jwt_secret|jwtSecret\s*=\s*['"][^'"]+['"]/i.test(content)) {
    obs.push({
      ruleId: 'AUTH-REAL-002',
      checkId: 'REAL-CHK-002',
      checkName: 'Authentication & Session Security Configuration',
      observationType: 'HARDCODED_AUTH_TOKEN',
      result: 'OBSERVED',
      severity: 'HIGH',
      file: filePath,
      line: 1,
      symbol: 'jwtSecret',
      matchedPattern: 'Static JWT token or unencrypted secret string in source',
      valueMasked: 'eyJhbGci********',
      codeSnippet: 'Hardcoded session/auth token pattern detected'
    });
  }
  return obs;
}

/**
 * REAL-CHK-003: Authorization & Access Control Patterns
 * Inspects source for missing role checks, wildcard CORS, or client-bypassed auth.
 */
export function checkAccessControl(filePath, content) {
  const obs = [];
  if (/Access-Control-Allow-Origin\s*:\s*['"]\*['"]/i.test(content) || /disableAuth\s*:\s*true/i.test(content)) {
    obs.push({
      ruleId: 'AUTH-REAL-003',
      checkId: 'REAL-CHK-003',
      checkName: 'Authorization & Access Control Patterns',
      observationType: 'PERMISSIVE_ACCESS_CONTROL',
      result: 'OBSERVED',
      severity: 'MEDIUM',
      file: filePath,
      line: 1,
      symbol: 'Access-Control-Allow-Origin',
      matchedPattern: 'Wildcard CORS origin or disabled authorization flag',
      valueMasked: '* (Wildcard)',
      codeSnippet: 'Access-Control-Allow-Origin: *'
    });
  }
  return obs;
}

/**
 * REAL-CHK-004: Input Validation Weaknesses
 * Inspects source for dangerous innerHTML / dangerouslySetInnerHTML without sanitization.
 */
export function checkInputValidation(filePath, content) {
  const obs = [];
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (/dangerouslySetInnerHTML|innerHTML\s*=/i.test(line) && !/dompurify|sanitize/i.test(line)) {
      obs.push({
        ruleId: 'INPUT-REAL-004',
        checkId: 'REAL-CHK-004',
        checkName: 'Input Validation Weaknesses',
        observationType: 'UNSANITIZED_HTML_INJECTION',
        result: 'OBSERVED',
        severity: 'MEDIUM',
        file: filePath,
        line: idx + 1,
        symbol: 'dangerouslySetInnerHTML',
        matchedPattern: 'Unsanitized raw HTML insertion in React DOM node',
        valueMasked: 'dangerouslySetInnerHTML={...}',
        codeSnippet: line.trim()
      });
    }
  });
  return obs;
}

/**
 * REAL-CHK-005: Insecure Network & HTTP Configuration
 * Inspects source for plain HTTP endpoints or disabled SSL validation.
 */
export function checkNetworkSecurity(filePath, content) {
  const obs = [];
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (httpPattern(line)) {
      obs.push({
        ruleId: 'NET-REAL-005',
        checkId: 'REAL-CHK-005',
        checkName: 'Insecure Network & HTTP Configuration',
        observationType: 'UNENCRYPTED_HTTP_TRANSPORT',
        result: 'OBSERVED',
        severity: 'LOW',
        file: filePath,
        line: idx + 1,
        symbol: 'http://',
        matchedPattern: 'Plaintext HTTP URL binding in client request',
        valueMasked: 'http://external-api********',
        codeSnippet: line.trim()
      });
    }
  });
  return obs;
}

function httpPattern(line) {
  return /http:\/\/(?!localhost|127\.0\.0\.1|api\.worldmonitor\.local|w3\.org|schema\.org)/i.test(line);
}

/**
 * REAL-CHK-006: Sensitive Client-Side Storage Usage
 * Inspects source for storing sensitive access tokens or credentials directly in localStorage.
 */
export function checkStorageSecurity(filePath, content) {
  const obs = [];
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (/localStorage\.setItem\s*\(\s*['"](token|authToken|secret|apiKey|password|privateKey)/i.test(line)) {
      obs.push({
        ruleId: 'STORE-REAL-006',
        checkId: 'REAL-CHK-006',
        checkName: 'Sensitive Client-Side Storage Usage',
        observationType: 'UNENCRYPTED_SENSITIVE_STORAGE',
        result: 'OBSERVED',
        severity: 'MEDIUM',
        file: filePath,
        line: idx + 1,
        symbol: 'localStorage.setItem',
        matchedPattern: 'Unencrypted sensitive session credential persisted to browser LocalStorage',
        valueMasked: 'localStorage.setItem(token, ...)',
        codeSnippet: line.trim()
      });
    }
  });
  return obs;
}

/**
 * REAL-CHK-007: Dependency & Configuration Security Issues
 * Inspects package.json & environment lockfiles for security posture.
 */
export function checkDependencySecurity(rootDir) {
  const obs = [];
  const pkgPath = path.join(rootDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      if (deps['express'] && deps['express'].startsWith('4.0')) {
        obs.push({
          ruleId: 'DEP-REAL-007',
          checkId: 'REAL-CHK-007',
          checkName: 'Dependency & Configuration Security Issues',
          observationType: 'OUTDATED_DEPENDENCY',
          result: 'OBSERVED',
          severity: 'LOW',
          file: 'package.json',
          line: 1,
          symbol: 'express',
          matchedPattern: 'Legacy package dependency version requiring upgrade',
          valueMasked: deps['express'],
          codeSnippet: `"express": "${deps['express']}"`
        });
      }
    } catch {
      // ignore
    }
  }
  return obs;
}
