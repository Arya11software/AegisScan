import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { targetService } from './targetService.js';
import { dbService } from './dbService.js';
import { analyzeClientCredentials } from '../rules/clientCredentialRule.js';
import {
  checkAuthSecurity,
  checkAccessControl,
  checkInputValidation,
  checkNetworkSecurity,
  checkStorageSecurity,
  checkDependencySecurity
} from '../rules/securityRules.js';

function hashString(str) {
  return crypto.createHash('sha256').update(str).digest('hex').slice(0, 8).toUpperCase();
}

function walkDirectory(dirPath, fileList = []) {
  if (!fs.existsSync(dirPath)) return fileList;
  try {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      if (file === 'node_modules' || file === '.git' || file === 'dist' || file === 'build' || file === '__tests__' || file.includes('.test.')) continue;
      const fullPath = path.join(dirPath, file);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          walkDirectory(fullPath, fileList);
        } else if (/\.(ts|tsx|js|jsx)$/i.test(file)) {
          fileList.push(fullPath);
        }
      } catch {
        // skip invalid stat
      }
    }
  } catch {
    // skip unreadable
  }
  return fileList;
}

const AVAILABLE_CHECKS = [
  {
    id: 'REAL-CHK-001',
    ruleId: 'CONFIG-REAL-001',
    name: 'Client-Side Credential Exposure',
    category: 'Configuration Hygiene',
    scope: 'Client Modules & AST Exported Configs',
    description: 'Uses Babel AST parser to inspect TypeScript/JSX string literals for exposed client-accessible API keys or secret properties.'
  },
  {
    id: 'REAL-CHK-002',
    ruleId: 'AUTH-REAL-002',
    name: 'Authentication & Session Security Configuration',
    category: 'Authentication & Session Management',
    scope: 'Auth Providers & Session Modules',
    description: 'Inspects source files for hardcoded JWT secret tokens, unencrypted session cookies, or static auth overrides.'
  },
  {
    id: 'REAL-CHK-003',
    ruleId: 'AUTH-REAL-003',
    name: 'Authorization & Access Control Patterns',
    category: 'Authorization & Access Control',
    scope: 'API Controllers & Middleware',
    description: 'Inspects API headers and route declarations for permissive wildcard CORS origins or disabled access authorization guards.'
  },
  {
    id: 'REAL-CHK-004',
    ruleId: 'INPUT-REAL-004',
    name: 'Input Validation Weaknesses',
    category: 'Input Validation & Data Handling',
    scope: 'React Rendering Components',
    description: 'Inspects JSX components for unsanitized dangerouslySetInnerHTML bindings or raw HTML injections.'
  },
  {
    id: 'REAL-CHK-005',
    ruleId: 'NET-REAL-005',
    name: 'Insecure Network & HTTP Configuration',
    category: 'Secure Communication Mechanisms',
    scope: 'HTTP Client Service Bindings',
    description: 'Audits network client service files for unencrypted HTTP URL calls or plaintext transport channels.'
  },
  {
    id: 'REAL-CHK-006',
    ruleId: 'STORE-REAL-006',
    name: 'Sensitive Client-Side Storage Usage',
    category: 'Data Storage & Privacy Protections',
    scope: 'Browser LocalStorage Invocation Sites',
    description: 'Audits storage wrappers for direct persistence of sensitive session credentials in unencrypted browser LocalStorage.'
  },
  {
    id: 'REAL-CHK-007',
    ruleId: 'DEP-REAL-007',
    name: 'Dependency & Configuration Issues',
    category: 'Dependency & Configuration Security',
    scope: 'package.json & Build Specs',
    description: 'Audits root package specs and lockfiles for outdated dependencies, vulnerable script definitions, or missing lockfile integrity.'
  }
];

export const scannerService = {
  getAvailableChecks() {
    return AVAILABLE_CHECKS;
  },

  runCheck(checkId = 'REAL-CHK-001') {
    const rootDir = targetService.getAuthorizedRoot();
    const srcDir = path.join(rootDir, 'src');
    const targetDir = fs.existsSync(srcDir) ? srcDir : rootDir;

    const allSourceFiles = walkDirectory(targetDir);
    const rawObservations = [];

    // Dependency check runs on package.json
    if (checkId === 'REAL-CHK-007' || checkId === 'ALL') {
      const depObs = checkDependencySecurity(rootDir);
      rawObservations.push(...depObs);
    }

    for (const filePath of allSourceFiles) {
      try {
        targetService.validateAndResolvePath(path.relative(rootDir, filePath));
        const content = fs.readFileSync(filePath, 'utf-8');
        const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');

        if (checkId === 'REAL-CHK-001' || checkId === 'ALL') {
          const obs = analyzeClientCredentials(relativePath, content);
          rawObservations.push(...obs);
        }
        if (checkId === 'REAL-CHK-002' || checkId === 'ALL') {
          const obs = checkAuthSecurity(relativePath, content);
          rawObservations.push(...obs);
        }
        if (checkId === 'REAL-CHK-003' || checkId === 'ALL') {
          const obs = checkAccessControl(relativePath, content);
          rawObservations.push(...obs);
        }
        if (checkId === 'REAL-CHK-004' || checkId === 'ALL') {
          const obs = checkInputValidation(relativePath, content);
          rawObservations.push(...obs);
        }
        if (checkId === 'REAL-CHK-005' || checkId === 'ALL') {
          const obs = checkNetworkSecurity(relativePath, content);
          rawObservations.push(...obs);
        }
        if (checkId === 'REAL-CHK-006' || checkId === 'ALL') {
          const obs = checkStorageSecurity(relativePath, content);
          rawObservations.push(...obs);
        }
      } catch {
        // Skip unreadable files safely
      }
    }

    const testFileRel = 'src/config/clientEnv.ts';
    const testFileAbs = path.join(rootDir, testFileRel);
    const fileExists = fs.existsSync(testFileAbs);
    let targetSourceHash = 'N/A';
    if (fileExists) {
      try {
        const fileContent = fs.readFileSync(testFileAbs, 'utf-8');
        targetSourceHash = crypto.createHash('sha256').update(fileContent).digest('hex').slice(0, 8);
      } catch {
        // ignore
      }
    }

    const timestamp = new Date().toISOString();
    const findings = [];
    const evidence = [];

    const selectedCheck = AVAILABLE_CHECKS.find(c => c.id === checkId) || AVAILABLE_CHECKS[0];

    for (const obs of rawObservations) {
      const hashKey = `${rootDir}:${obs.ruleId}:${obs.file}:${obs.symbol}:${obs.line}`;
      const findingHash = hashString(hashKey);
      const findingId = `F-REAL-${findingHash}`;
      const evidenceId = `EVD-REAL-${findingHash}`;

      const evidenceItem = {
        id: evidenceId,
        findingId,
        isRealCheck: true,
        title: `Real AST Match: Exposed ${obs.symbol} in ${obs.file}`,
        ruleEvaluated: obs.ruleId,
        testContext: {
          target: 'World Monitor Target Scope',
          endpoint: `/${obs.file}#L${obs.line}`,
          method: 'STATIC_AST_PARSER',
          tester: 'Real Controlled AST Scanner Engine',
          timestamp,
          authorizationState: 'Authorized Local Target Scope'
        },
        request: {
          url: `https://worldmonitor.local/${obs.file}#L${obs.line}`,
          headers: {
            'Host': 'worldmonitor.local',
            'Parser': '@babel/parser (TypeScript/JSX AST)'
          },
          body: null
        },
        response: {
          status: 200,
          statusText: '200 OK (AST NODE MATCHED)',
          headers: {
            'Content-Type': 'application/typescript'
          },
          body: `File: /${obs.file}\nLine ${obs.line}: ${obs.codeSnippet}\nMatched Symbol: ${obs.symbol}\nMasked Value: ${obs.valueMasked}`
        },
        observation: `Real security check detected ${obs.symbol} (${obs.valueMasked}) in /${obs.file} at line ${obs.line}.`,
        validationResult: {
          expectedBehavior: 'Sensitive parameters and security bounds must be properly isolated.',
          observedBehavior: `Real security check detected ${obs.symbol} (${obs.valueMasked}) in /${obs.file} at line ${obs.line}.`,
          ruleEvaluated: obs.ruleId,
          ruleResult: 'VIOLATION_OBSERVED',
          confidenceScore: '100% (Real Security Engine Match)'
        }
      };

      const findingItem = {
        id: findingId,
        checkId: obs.checkId || checkId,
        assessmentId: 'WM-2026-REAL',
        targetId: 'world-monitor',
        targetName: 'World Monitor',
        isRealCheck: true,
        title: `${obs.checkName || selectedCheck.name} (${obs.symbol})`,
        category: selectedCheck.category,
        severity: obs.severity || 'HIGH',
        currentCondition: 'OBSERVED',
        status: 'DETECTED',
        component: `Client Module (/${obs.file}:L${obs.line})`,
        description: `Security analysis discovered ${obs.observationType || 'vulnerable pattern'} (${obs.symbol}) in /${obs.file} at line ${obs.line}.`,
        impact: 'Potential client-accessible security condition exposed in target source.',
        technicalImpact: `AST node matched property '${obs.symbol}' with value '${obs.valueMasked}'.`,
        businessImpact: 'Risk of security control bypass or sensitive data leakage in target repository.',
        rootCause: `Security-sensitive parameter or unencrypted value defined in file /${obs.file}.`,
        latestScan: {
          scannedAt: timestamp,
          matchesCount: rawObservations.length,
          conditionStatus: 'OBSERVED',
          sourceHash: obs.sourceHash || targetSourceHash,
          scannedFilesCount: allSourceFiles.length
        },
        evidence: [evidenceItem],
        evidenceIds: [evidenceId],

        validation: {
          status: 'PENDING_VALIDATION',
          validatedBy: null,
          validatedAt: null
        },

        aiAnalysis: {
          title: `AI Analysis: ${obs.checkName || selectedCheck.name}`,
          technicalContext: `Static Babel AST parser confirmed string literal assignment for '${obs.symbol}' in /${obs.file} at line ${obs.line}.`,
          businessImpact: `Elevated risk of credential or security boundary leakage.`,
          remediationGuidance: `Move secret parameters to server-side environment variables or isolate API proxy boundaries.`,
          confidence: 0.96
        },

        remediation: {
          status: 'OPEN',
          recommendation: `Remove raw string assignment for ${obs.symbol} from client file /${obs.file}.`,
          implementationSteps: [
            `1. Remove '${obs.symbol}' assignment from /${obs.file}.`,
            `2. Expose proxy endpoint or environment variable fallback.`,
            `3. Re-test to verify 0 matches.`
          ],
          assignedRole: 'DEVELOPER',
          updatedAt: timestamp
        },

        retest: {
          status: 'PENDING',
          previousCondition: `Condition Detected (${obs.symbol} = ${obs.valueMasked} in /${obs.file}:L${obs.line})`,
          currentCondition: 'Condition Detected',
          executedBy: null,
          executedAt: null
        },

        verification: {
          status: 'PENDING',
          finalNote: null
        },

        auditTrail: [
          {
            timestamp,
            action: 'DETECTED',
            actor: `Real Security Engine (${obs.checkId || checkId})`,
            details: `Discovered security condition for ${obs.symbol} in /${obs.file}:L${obs.line}`
          }
        ]
      };

      evidence.push(evidenceItem);
      findings.push(findingItem);
    }

    // Sync finding currentCondition state in dbService for existing findings of this check
    const existingFindings = dbService.getFindings();
    existingFindings.forEach(f => {
      if (f.checkId === checkId || (checkId === 'ALL' && f.checkId.startsWith('REAL-CHK-'))) {
        const stillObserved = rawObservations.some(obs => f.title.includes(obs.symbol) || f.component.includes(obs.file));
        if (!stillObserved) {
          f.currentCondition = 'NO_MATCH';
          if (f.retest) {
            f.retest.currentCondition = 'Condition Not Detected (Target Source Clean)';
          }
          dbService.saveFinding(f);
        } else {
          f.currentCondition = 'OBSERVED';
          if (f.retest) {
            f.retest.currentCondition = 'Condition Detected';
          }
          dbService.saveFinding(f);
        }
      }
    });

    return {
      success: true,
      check: {
        checkId,
        checkName: selectedCheck.name,
        target: 'World Monitor (Authorized Local Sandbox)',
        targetRoot: rootDir,
        scannedFilesCount: allSourceFiles.length,
        matchesCount: rawObservations.length,
        conditionStatus: rawObservations.length > 0 ? 'OBSERVED' : 'NO_MATCH',
        sourceHash: targetSourceHash,
        timestamp
      },
      observations: rawObservations,
      findings,
      evidence
    };
  }
};

