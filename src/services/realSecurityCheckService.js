import { storageService } from './storageService';

/**
 * Real Security Check Service
 * Interacts with Node/Express Security API backend (`/api/security-checks/run`)
 * to execute non-destructive Babel AST static analysis against authorized local target (`C:\Users\HP\worldmonitor`).
 */
export const realSecurityCheckService = {
  checkDefinition: {
    id: 'REAL-CHK-001',
    ruleId: 'CONFIG-REAL-001',
    name: 'Potential Client-Side Credential Exposure',
    category: 'Configuration Hygiene',
    target: 'World Monitor (Authorized Local Sandbox)',
    source: 'authorized-local-sandbox'
  },

  async runRealCheck(onProgress) {
    if (onProgress) {
      onProgress({ stepIndex: 1, totalSteps: 4, stepName: 'Target boundary validation & filesystem discovery', progressPercent: 25 });
    }

    // Call Express API endpoint
    let response;
    try {
      response = await fetch('/api/security-checks/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkId: 'REAL-CHK-001' })
      });
    } catch (err) {
      throw new Error(`Backend security engine unavailable (http://localhost:3001): ${err.message}`);
    }

    if (onProgress) {
      onProgress({ stepIndex: 2, totalSteps: 4, stepName: 'Reading source files & running Babel AST parser', progressPercent: 50 });
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(`Security API Error: ${errData.error || response.statusText}`);
    }

    const data = await response.json();

    if (onProgress) {
      onProgress({ stepIndex: 3, totalSteps: 4, stepName: 'Generating observations & safe evidence artifacts', progressPercent: 75 });
    }

    // Synchronize evidence artifacts into StorageService
    const evidenceMap = storageService.getEvidenceMap();
    if (data.evidence && Array.isArray(data.evidence)) {
      data.evidence.forEach((ev) => {
        evidenceMap[ev.id] = ev;
      });
      localStorage.setItem('aegisscan_evidence', JSON.stringify(evidenceMap));
    }

    // Synchronize findings into StorageService
    if (data.findings && Array.isArray(data.findings)) {
      data.findings.forEach((finding) => {
        storageService.saveFinding(finding);
      });
    }

    if (onProgress) {
      onProgress({ stepIndex: 4, totalSteps: 4, stepName: 'Synchronizing findings with state machine', progressPercent: 100 });
    }

    storageService.addAuditLog(
      'REAL_CHECK_EXECUTED',
      'Real AST Security Engine',
      'World Monitor',
      `Executed REAL-CHK-001 AST scan: ${data.observations ? data.observations.length : 0} observations generated.`
    );

    return {
      success: data.success,
      check: data.check,
      observations: data.observations || [],
      findings: data.findings || [],
      evidence: data.evidence || []
    };
  }
};
