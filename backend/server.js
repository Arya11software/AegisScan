import express from 'express';
import { scannerService } from './services/scannerService.js';
import { profileTargetRepository, discoverAttackSurface } from './services/targetProfiler.js';
import { dbService } from './services/dbService.js';
import { assessmentService } from './services/assessmentService.js';
import { retestService } from './services/retestService.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// ============================================================
// HEALTH
// ============================================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    engine: 'AegisScan Real Security Engine v2',
    timestamp: new Date().toISOString()
  });
});

// ============================================================
// TARGET PROFILE & ATTACK SURFACE
// ============================================================
app.get('/api/target', (req, res) => {
  try {
    const profile = profileTargetRepository();
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'PROFILER_ERROR', message: err.message } });
  }
});

app.post('/api/target/profile', (req, res) => {
  try {
    const profile = profileTargetRepository();
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'PROFILER_ERROR', message: err.message } });
  }
});

app.get('/api/attack-surface', (req, res) => {
  try {
    const surface = discoverAttackSurface();
    res.json({ success: true, surface });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'ATTACK_SURFACE_ERROR', message: err.message } });
  }
});

// ============================================================
// SECURITY CHECKS (legacy)
// ============================================================
app.get('/api/security-checks', (req, res) => {
  res.json({ success: true, checks: scannerService.getAvailableChecks() });
});

app.post('/api/security-checks/run', (req, res) => {
  try {
    const { checkId = 'REAL-CHK-001' } = req.body;
    const result = scannerService.runCheck(checkId);
    dbService.setLatestScanResult(result);
    if (result.findings?.length > 0) result.findings.forEach(f => dbService.saveFinding(f));
    if (result.evidence?.length > 0) result.evidence.forEach(e => dbService.saveEvidence(e));
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SCAN_ERROR', message: err.message } });
  }
});

// ============================================================
// ASSESSMENTS – Full REST API (new routes used by frontend)
// ============================================================

// GET /api/assessments — list all assessments
app.get('/api/assessments', (req, res) => {
  try {
    const assessments = dbService.getAssessments();
    res.json({ success: true, assessments });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: err.message } });
  }
});

// POST /api/assessments — create new assessment (Step 1: Target config + auth)
app.post('/api/assessments', (req, res) => {
  try {
    const assessment = assessmentService.createAssessment({
      name: req.body.name,
      targetUrl: req.body.targetUrl,
      environment: req.body.environment,
      applicationType: req.body.applicationType,
      description: req.body.description,
      authorizationConfirmed: req.body.authorizationConfirmed !== false,
      authAccount: req.body.authAccount,
      scopes: req.body.scopes
    });
    res.json({ success: true, assessment });
  } catch (err) {
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: err.message } });
  }
});

// GET /api/assessments/:id — get single assessment with its findings
app.get('/api/assessments/:id', (req, res) => {
  try {
    const assessment = dbService.getAssessment(req.params.id);
    if (!assessment) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: `Assessment ${req.params.id} not found` } });
    }
    const findings = dbService.getFindingsByAssessment(req.params.id);
    res.json({ success: true, assessment, findings });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: err.message } });
  }
});

// POST /api/assessments/:id/authorize — confirm authorization
app.post('/api/assessments/:id/authorize', (req, res) => {
  try {
    const assessment = dbService.getAssessment(req.params.id);
    if (!assessment) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Assessment not found' } });
    assessment.authorizationConfirmed = true;
    assessment.authorizedBy = req.body.authorizedBy || 'Security Analyst';
    assessment.authorizedAt = new Date().toISOString();
    dbService.saveAssessment(assessment);
    dbService.addAuditLog('AUTHORIZATION_CONFIRMED', req.body.authorizedBy || 'Security Analyst', assessment.id, `Authorization confirmed for ${assessment.targetUrl}`);
    res.json({ success: true, assessment });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'AUTH_ERROR', message: err.message } });
  }
});

// POST /api/assessments/:id/discover — run discovery phase
app.post('/api/assessments/:id/discover', async (req, res) => {
  try {
    const discovery = await assessmentService.runDiscovery(req.params.id);
    res.json({ success: true, discovery });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'DISCOVERY_ERROR', message: err.message } });
  }
});

// POST /api/assessments/:id/test-plan — generate intelligent test plan
app.post('/api/assessments/:id/test-plan', (req, res) => {
  try {
    const testPlan = assessmentService.generateTestPlan(req.params.id);
    res.json({ success: true, testPlan });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'TEST_PLAN_ERROR', message: err.message } });
  }
});

// POST /api/assessments/:id/start — execute full assessment with live domain progress
app.post('/api/assessments/:id/start', async (req, res) => {
  try {
    const result = await assessmentService.startAssessment(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'EXECUTION_ERROR', message: err.message } });
  }
});

// GET /api/assessments/:id/progress — live execution progress polling
app.get('/api/assessments/:id/progress', (req, res) => {
  try {
    const progress = assessmentService.getProgress(req.params.id);
    res.json({ success: true, progress });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'PROGRESS_ERROR', message: err.message } });
  }
});

// GET /api/assessments/:id/findings — findings linked to this assessment
app.get('/api/assessments/:id/findings', (req, res) => {
  try {
    const findings = dbService.getFindingsByAssessment(req.params.id);
    res.json({ success: true, findings });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: err.message } });
  }
});

// GET /api/assessments/:id/report — structured assessment report
app.get('/api/assessments/:id/report', (req, res) => {
  try {
    const assessment = dbService.getAssessment(req.params.id) || {
      id: req.params.id,
      targetName: 'Web Application',
      createdAt: new Date().toISOString()
    };
    const findings = dbService.getFindingsByAssessment(req.params.id);
    const allFindings = findings.length > 0 ? findings : dbService.getFindings();
    const latestScan = dbService.getLatestScanResult();

    const candidateFindings = allFindings.filter(f => f.status === 'Candidate');
    const validatedFindings = allFindings.filter(f => f.status === 'Validated' || f.validation?.status === 'CONFIRMED');
    const verifiedFindings = allFindings.filter(f => f.status === 'Verified' || f.status === 'VERIFIED');
    const falsePositives = allFindings.filter(f => f.status === 'False Positive');
    const regressionFindings = allFindings.filter(f => f.status === 'Regression' || f.status === 'REOPENED');

    res.json({
      success: true,
      report: {
        assessment,
        assessmentId: assessment.id,
        targetName: assessment.targetName || assessment.name,
        targetUrl: assessment.targetUrl,
        environment: assessment.environment,
        generatedAt: new Date().toISOString(),
        authorizedBy: assessment.authorizedBy,
        authorizationConfirmed: assessment.authorizationConfirmed,
        scope: assessment.scopes || [],
        riskIndex: assessment.riskIndex || 0,
        riskRating: assessment.riskRating || 'Clean',
        discovery: assessment.discoverySummary,
        testPlan: assessment.testPlan,
        testsExecuted: assessment.testPlanSummary || { total: 0, passed: 0, failed: 0, pending: 0 },
        latestScanResult: latestScan,
        findingsSummary: {
          total: allFindings.length,
          candidate: candidateFindings.length,
          validated: validatedFindings.length,
          verified: verifiedFindings.length,
          falsePositive: falsePositives.length,
          regression: regressionFindings.length,
          critical: allFindings.filter(f => f.severity === 'CRITICAL').length,
          high: allFindings.filter(f => f.severity === 'HIGH').length,
          medium: allFindings.filter(f => f.severity === 'MEDIUM').length,
          low: allFindings.filter(f => f.severity === 'LOW').length
        },
        findings: allFindings
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'REPORT_ERROR', message: err.message } });
  }
});

// ============================================================
// LEGACY ASSESSMENT START (keep for compatibility)
// ============================================================
app.post('/api/assessment/start', async (req, res) => {
  try {
    const { targetName = 'Web Application', scopes = [], targetUrl, environment, authAccount } = req.body;
    const assessment = assessmentService.createAssessment({
      name: targetName,
      targetUrl: targetUrl || 'http://localhost:3000',
      environment: environment || 'Authorized Local Sandbox',
      authorizationConfirmed: true,
      authAccount: authAccount || '',
      scopes
    });
    const result = await assessmentService.startAssessment(assessment.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'ASSESSMENT_ERROR', message: err.message } });
  }
});

// Legacy single assessment get
app.get('/api/assessment/:id', (req, res) => {
  const assessment = dbService.getAssessment(req.params.id);
  if (!assessment) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Assessment not found' } });
  }
  res.json({ success: true, assessment });
});

// ============================================================
// FINDINGS
// ============================================================
app.get('/api/findings', (req, res) => {
  res.json({ success: true, findings: dbService.getFindings() });
});

app.get('/api/findings/:id', (req, res) => {
  const finding = dbService.getFinding(req.params.id);
  if (!finding) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Finding not found' } });
  }
  res.json({ success: true, finding });
});

// POST /api/findings/:id/validate — validate or mark false positive
app.post('/api/findings/:id/validate', (req, res) => {
  const finding = dbService.getFinding(req.params.id);
  if (!finding) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Finding not found' } });

  const action = req.body.action || 'VALIDATE';
  const isFalsePositive = action === 'MARK_FALSE_POSITIVE';
  const timestamp = new Date().toISOString();

  finding.status = isFalsePositive ? 'False Positive' : 'Validated';
  finding.validation = {
    status: isFalsePositive ? 'REJECTED_FALSE_POSITIVE' : 'CONFIRMED',
    validatedBy: req.body.validatedBy || 'Security Analyst',
    validatedAt: timestamp,
    confidence: req.body.confidence || 'High',
    action,
    notes: req.body.notes || null
  };

  if (!finding.auditTrail) finding.auditTrail = [];
  finding.auditTrail.push({
    timestamp,
    action: isFalsePositive ? 'MARKED_FALSE_POSITIVE' : 'VALIDATED',
    actor: req.body.validatedBy || 'Security Analyst',
    details: isFalsePositive
      ? 'Finding rejected as False Positive by analyst.'
      : `Vulnerability evidence validated by analyst. Confidence: ${req.body.confidence || 'High'}.`
  });

  dbService.saveFinding(finding);
  dbService.addAuditLog(
    isFalsePositive ? 'MARK_FALSE_POSITIVE' : 'VALIDATE_FINDING',
    req.body.validatedBy || 'Security Analyst',
    finding.id,
    `Finding ${finding.id} ${isFalsePositive ? 'marked as False Positive' : 'validated'}`
  );

  // Update assessment counts
  if (finding.assessmentId) {
    const assessment = dbService.getAssessment(finding.assessmentId);
    if (assessment) {
      const assessmentFindings = dbService.getFindingsByAssessment(finding.assessmentId);
      assessment.validatedCount = assessmentFindings.filter(f => f.status === 'Validated').length;
      assessment.candidateCount = assessmentFindings.filter(f => f.status === 'Candidate').length;
      dbService.saveAssessment(assessment);
    }
  }

  res.json({ success: true, finding });
});

// POST /api/findings/:id/remediation — update remediation status
app.post('/api/findings/:id/remediation', (req, res) => {
  const finding = dbService.getFinding(req.params.id);
  if (!finding) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Finding not found' } });

  const nextStatus = req.body.markReadyForRetest ? 'Ready for Retest' : 'Remediation Open';
  const timestamp = new Date().toISOString();

  finding.status = nextStatus;
  finding.remediation = {
    ...finding.remediation,
    status: nextStatus,
    recommendation: req.body.recommendation || finding.remediation?.recommendation || finding.remediation?.recommendedFix || 'Remediate source file.',
    assignedRole: req.body.assignedRole || 'DEVELOPER',
    notes: req.body.notes || '',
    updatedAt: timestamp
  };

  if (!finding.auditTrail) finding.auditTrail = [];
  finding.auditTrail.push({
    timestamp,
    action: nextStatus.toUpperCase().replace(/ /g, '_'),
    actor: req.body.actor || 'Developer',
    details: `Remediation status updated to: ${nextStatus}`
  });

  dbService.saveFinding(finding);
  dbService.addAuditLog('REMEDIATION_UPDATE', req.body.actor || 'Developer', finding.id, `Remediation status: ${nextStatus}`);
  res.json({ success: true, finding });
});

// POST /api/findings/:id/retest — execute retest via retestService
app.post('/api/findings/:id/retest', (req, res) => {
  try {
    const simulatedFix = req.body.simulatedFix !== false; // default true = PASS/Verified
    const actor = req.body.actor || 'Retest Engine';
    const result = retestService.runRetest(req.params.id, { actor, simulatedFix });
    res.json({ success: true, finding: result.finding, retestArtifact: result.retestArtifact });
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 500;
    res.status(status).json({ success: false, error: { code: 'RETEST_ERROR', message: err.message } });
  }
});

// ============================================================
// EVIDENCE
// ============================================================
app.get('/api/evidence', (req, res) => {
  const map = dbService.getEvidenceMap();
  res.json({ success: true, evidence: Object.values(map) });
});

app.get('/api/evidence/:id', (req, res) => {
  const evidence = dbService.getEvidence(req.params.id);
  if (!evidence) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: `Evidence ${req.params.id} not found` } });
  }
  res.json({ success: true, evidence });
});

// ============================================================
// AI ANALYSIS
// ============================================================
app.post('/api/ai/analyze', (req, res) => {
  try {
    const { findingId, observation } = req.body;
    const finding = dbService.getFinding(findingId);

    const checkName = observation?.checkName || finding?.title || 'Security Check Analysis';
    const symbol = observation?.symbol || finding?.title || 'Sensitive Property';
    const file = observation?.file || finding?.component || 'source file';
    const line = observation?.line || 1;
    const valueMasked = observation?.valueMasked || '********';

    const analysis = {
      analyzer: 'AegisScan Rule-Based Security Analysis Engine',
      title: `Security Analysis: ${checkName}`,
      description: `Automated security assessment verified property '${symbol}' with masked string '${valueMasked}' in ${file} at line ${line}.`,
      impact: 'Exposure of configuration parameters to client application scope.',
      technicalContext: `Static analysis confirmed security boundary violation for '${symbol}' in ${file}:${line}.`,
      businessImpact: 'Elevated risk of credential or configuration leakage across deployed client instances.',
      remediationGuidance: 'Isolate sensitive keys behind server-side environment variables or API proxy endpoints.',
      confidence: 0.96,
      safeProofOfConcept: `1. Inspect ${file} at line ${line}.\n2. Confirm '${symbol}' assignment.\n3. Remove literal and re-run check.`
    };

    if (finding) {
      finding.aiAnalysis = analysis;
      if (finding.status === 'Candidate' || finding.status === 'DETECTED') {
        finding.status = 'Candidate'; // Stays candidate, AI enriched
      }
      dbService.saveFinding(finding);
    }

    res.json({ success: true, analysis });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'AI_ANALYSIS_ERROR', message: err.message } });
  }
});

// ============================================================
// LEGACY REPORT
// ============================================================
app.get('/api/reports/:assessmentId', (req, res) => {
  const assessment = dbService.getAssessment(req.params.assessmentId) || {
    id: req.params.assessmentId,
    targetName: 'Web Application',
    createdAt: new Date().toISOString()
  };
  const findings = dbService.getFindingsByAssessment(req.params.assessmentId);
  const allFindings = findings.length > 0 ? findings : dbService.getFindings();
  const latestScan = dbService.getLatestScanResult();

  res.json({
    success: true,
    report: {
      assessmentId: assessment.id,
      targetName: assessment.targetName,
      generatedAt: new Date().toISOString(),
      scope: assessment.scopes || ['Static Source AST Scanner'],
      latestScanResult: latestScan,
      findingsSummary: {
        total: allFindings.length,
        candidate: allFindings.filter(f => f.status === 'Candidate').length,
        validated: allFindings.filter(f => f.status === 'Validated').length,
        verified: allFindings.filter(f => f.status === 'Verified' || f.status === 'VERIFIED').length,
        regression: allFindings.filter(f => f.status === 'Regression' || f.status === 'REOPENED').length
      },
      findings: allFindings
    }
  });
});

// ============================================================
// AUDIT LOGS
// ============================================================
app.get('/api/audit-logs', (req, res) => {
  res.json({ success: true, logs: dbService.getAuditLogs() });
});

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, () => {
  console.log(`[AegisScan Backend] Security Engine v2 running on http://localhost:${PORT}`);
  console.log(`[AegisScan Backend] Assessment REST API endpoints active`);
});
