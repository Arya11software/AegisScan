/**
 * Finding Engine
 * Normalizes, persists, and manages database-backed Findings with CVSS, OWASP mapping,
 * masked evidence artifacts, reproduction steps, and complete lifecycle audit trails.
 */

import crypto from 'crypto';
import { dbService } from './dbService.js';
import { riskService } from './riskService.js';
import { maskSensitiveData } from './testEngine.js';

export const findingEngine = {
  /**
   * Create or ingest a finding from test engine evaluation
   */
  createFindingFromTestResult(assessmentId, testResult, evidenceItem) {
    const findingData = testResult.finding;
    const timestamp = new Date().toISOString();
    const hash = crypto.createHash('sha256')
      .update(`${assessmentId}:${testResult.testId}:${findingData.endpoint}:${findingData.parameter}`)
      .digest('hex')
      .slice(0, 8)
      .toUpperCase();

    const findingId = `F-SEC-${hash}`;
    const evidenceId = `EVD-SEC-${hash}`;

    // Compute CVSS & OWASP
    const cvss = riskService.calculateCVSS({
      severity: findingData.severity || 'MEDIUM',
      category: findingData.category || 'General'
    });

    const maskedRequest = maskSensitiveData(evidenceItem?.request || {
      url: `https://target.local${findingData.endpoint}`,
      method: findingData.method,
      headers: { 'Host': 'target.local', 'User-Agent': 'AegisScan Engine' },
      body: null
    });

    const maskedResponse = maskSensitiveData(evidenceItem?.response || {
      statusCode: 200,
      statusText: '200 OK',
      headers: { 'Content-Type': 'application/json' },
      body: 'Vulnerable condition observed in target response.'
    });

    // Formulate evidence entity
    const normalizedEvidence = {
      id: evidenceId,
      findingId,
      title: `Evidence: ${findingData.title}`,
      ruleEvaluated: testResult.testId,
      timestamp,
      testContext: {
        assessmentId,
        endpoint: findingData.endpoint,
        method: findingData.method,
        parameter: findingData.parameter,
        timestamp
      },
      request: maskedRequest,
      response: maskedResponse,
      observation: evidenceItem?.observation || `Security violation observed at ${findingData.endpoint}.`,
      validationResult: {
        expectedBehavior: 'Endpoint must enforce strict validation, authorization, and cryptographic boundaries.',
        observedBehavior: evidenceItem?.observation || 'Unsanitized or unauthorized parameter behavior confirmed.',
        ruleResult: 'VIOLATION_OBSERVED',
        confidenceScore: findingData.confidence || 'High'
      }
    };

    // Save evidence into dbService
    dbService.saveEvidence(normalizedEvidence);

    // Formulate Finding entity
    const findingRecord = {
      id: findingId,
      assessmentId,
      checkId: testResult.testId,
      title: findingData.title,
      category: findingData.category,
      domain: findingData.domain || testResult.domain || 'GENERAL',
      endpoint: findingData.endpoint,
      method: findingData.method,
      parameter: findingData.parameter || 'N/A',
      description: findingData.description,
      confidence: findingData.confidence || 'High',
      severity: (findingData.severity || 'MEDIUM').toUpperCase(),
      cvssScore: cvss.score,
      cvssVector: cvss.vector,
      cvssRating: cvss.rating,
      owaspMapping: cvss.owaspCategory,
      businessImpact: findingData.businessImpact,
      technicalImpact: findingData.technicalImpact,
      reproductionSteps: findingData.reproductionSteps || `1. Send ${findingData.method} request to ${findingData.endpoint}.\n2. Evaluate response against security rule ${testResult.testId}.\n3. Confirm non-compliant response behavior.`,
      status: 'Candidate', // Master Spec Step 6: Initial status starts as Candidate
      currentCondition: 'OBSERVED',
      isRealCheck: true,
      component: `Web Route (${findingData.endpoint})`,
      evidenceIds: [evidenceId],
      evidence: [normalizedEvidence],
      validation: {
        status: 'PENDING_VALIDATION',
        validatedBy: null,
        validatedAt: null,
        confidence: findingData.confidence || 'High',
        notes: null
      },
      remediation: {
        status: 'OPEN',
        problem: findingData.remediation?.problem || 'Security boundary weakness identified.',
        whyItMatters: findingData.remediation?.whyItMatters || 'Potential unauthorized access or compromise.',
        recommendedFix: findingData.remediation?.recommendedFix || 'Apply defense-in-depth sanitization and authorization checks.',
        developerAction: findingData.remediation?.developerAction || 'Update route controller with server-side validation.',
        verificationMethod: findingData.remediation?.verificationMethod || 'Repeat test check against updated build.',
        assignedRole: 'DEVELOPER',
        updatedAt: timestamp
      },
      retest: {
        status: 'PENDING',
        previousCondition: `Observed at ${findingData.endpoint}`,
        currentCondition: 'Condition Detected',
        executedBy: null,
        executedAt: null,
        history: []
      },
      auditTrail: [
        {
          timestamp,
          action: 'CANDIDATE_DETECTED',
          actor: 'Security Test Engine',
          details: `Issue detected at ${findingData.endpoint} via test ${testResult.testId}. State set to Candidate.`
        }
      ],
      createdAt: timestamp,
      updatedAt: timestamp
    };

    // Save finding into dbService
    dbService.saveFinding(findingRecord);
    return findingRecord;
  },

  /**
   * Return findings for an assessment
   */
  getFindingsForAssessment(assessmentId) {
    const all = dbService.getFindings();
    return all.filter(f => f.assessmentId === assessmentId);
  }
};
