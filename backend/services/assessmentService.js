/**
 * Backend Assessment Service
 * Orchestrates the full security assessment pipeline:
 * Target Configuration -> Authorization & Scope -> Application Discovery -> Intelligent Test Plan ->
 * Automated Security Testing (with live domain-by-domain progress) -> Candidate Findings -> Risk Scoring
 */

import { dbService } from './dbService.js';
import { discoveryService } from './discoveryService.js';
import { testEngine } from './testEngine.js';
import { findingEngine } from './findingEngine.js';
import { riskService } from './riskService.js';

// In-memory execution state tracker for live progress
const executionProgress = new Map();

// Discovery is a PREPARATION phase, not one of the 7 security test domains
const DOMAIN_STEPS = [
  { id: 'discovery', name: 'Application Discovery', domainKey: 'DISCOVERY', isPrep: true },
  { id: 'auth', name: 'Authentication & Session', domainKey: 'AUTHENTICATION & SESSION' },
  { id: 'authz', name: 'Authorization & RBAC', domainKey: 'AUTHORIZATION & RBAC' },
  { id: 'api', name: 'API Security', domainKey: 'API SECURITY' },
  { id: 'input', name: 'Input Validation', domainKey: 'INPUT VALIDATION' },
  { id: 'client', name: 'Client-Side Security', domainKey: 'CLIENT-SIDE SECURITY' },
  { id: 'transport', name: 'Transport Security', domainKey: 'TRANSPORT SECURITY' },
  { id: 'data', name: 'Data & Privacy', domainKey: 'DATA & PRIVACY' }
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const assessmentService = {
  /**
   * 1. Create New Assessment with Target Configuration & Authorization
   */
  createAssessment({
    name,
    targetUrl,
    environment = 'Sandbox',
    applicationType = 'Web',
    description = '',
    authorizationConfirmed = false,
    authAccount = '',
    scopes = []
  }) {
    if (!authorizationConfirmed) {
      throw new Error('Authorization Required: You must confirm authorization before creating an assessment.');
    }

    const timestamp = new Date().toISOString();
    const id = `ASM-2026-${Date.now().toString().slice(-6)}`;

    const defaultScopes = [
      'Authentication',
      'Authorization',
      'Session Management',
      'API Security',
      'Input Validation',
      'Client Security',
      'Secure Communication',
      'Data Protection'
    ];

    const assessment = {
      id,
      name: name || `Security Assessment (${environment})`,
      targetName: name || 'Target Web Application',
      targetUrl: targetUrl || 'http://localhost:3000',
      environment: environment || 'Sandbox',
      applicationType: applicationType || 'Web',
      description: description || 'Authorized web application security assessment.',
      authorizationConfirmed: true,
      authorizedBy: 'Authorized Security Assessor',
      authAccount: authAccount || 'Test Security Account',
      status: 'CONFIGURED',
      createdAt: timestamp,
      completedAt: null,
      scopes: scopes && scopes.length > 0 ? scopes : defaultScopes,
      riskIndex: 0,
      riskRating: 'Pending',
      totalFindingsCount: 0,
      candidateCount: 0,
      validatedCount: 0,
      verifiedCount: 0,
      retestCount: 0,
      discoverySummary: null,
      discovery: null,
      testPlanSummary: null,
      testPlan: null,
      testExecutions: [],
      executionProgress: null
    };

    dbService.saveAssessment(assessment);
    dbService.addAuditLog('ASSESSMENT_CREATED', 'Security Analyst', assessment.id, `Created assessment for ${assessment.targetUrl}`);
    return assessment;
  },

  /**
   * 2. Discovery Phase
   */
  async runDiscovery(assessmentId) {
    let assessment = dbService.getAssessment(assessmentId);
    if (!assessment) {
      // Create a fallback draft assessment if draft requested
      assessment = this.createAssessment({
        name: 'Target Application Assessment',
        targetUrl: 'http://localhost:3000',
        environment: 'Sandbox',
        authorizationConfirmed: true
      });
    }

    assessment.status = 'DISCOVERING';
    dbService.saveAssessment(assessment);

    const discoveryResult = await discoveryService.discover(assessment.targetUrl, assessment.environment);
    assessment.discovery = discoveryResult;
    assessment.discoverySummary = discoveryResult.summary;
    assessment.status = 'DISCOVERED';

    dbService.saveAssessment(assessment);
    dbService.addAuditLog('DISCOVERY_COMPLETE', 'Discovery Service', assessment.id, `Discovered ${discoveryResult.summary.pagesCount} pages and ${discoveryResult.summary.apiEndpointsCount} API routes.`);
    return discoveryResult;
  },

  /**
   * 3. Generate Intelligent Test Plan
   */
  generateTestPlan(assessmentId) {
    let assessment = dbService.getAssessment(assessmentId);
    if (!assessment) {
      assessment = dbService.getAssessments()[0];
      if (!assessment) throw new Error(`Assessment ${assessmentId} not found`);
    }

    const plan = testEngine.generateTestPlan(assessment.discovery || {}, assessment.scopes || []);
    assessment.testPlan = plan;
    assessment.testPlanSummary = {
      total: plan.totalTests,
      passed: 0,
      failed: 0,
      pending: plan.totalTests
    };
    assessment.status = 'TEST_PLAN_GENERATED';

    dbService.saveAssessment(assessment);
    dbService.addAuditLog('TEST_PLAN_GENERATED', 'Test Engine', assessment.id, `Generated ${plan.totalTests} security tests across 7 domains with dynamic selection rationale.`);
    return plan;
  },

  /**
   * 4. Full Assessment Execution with Live Domain-by-Domain Progress
   */
  async startAssessment(assessmentId) {
    let assessment = dbService.getAssessment(assessmentId);
    if (!assessment) {
      assessment = dbService.getAssessments()[0];
      if (!assessment) throw new Error(`Assessment ${assessmentId} not found`);
    }

    // Ensure authorization
    if (!assessment.authorizationConfirmed) {
      throw new Error('Assessment cannot run without explicit authorization confirmation.');
    }

    // Initialize domain progress tracker
    const domainProgressList = DOMAIN_STEPS.map(d => ({
      id: d.id,
      name: d.name,
      isPrep: d.isPrep || false,
      status: 'Pending', // 'Pending' | 'Running' | 'Passed' | 'Findings Detected'
      testsCount: 0,
      findingsCount: 0,
      details: 'Awaiting execution'
    }));

    const updateLiveProgress = (percent, message, currentDomainId, isFinished = false) => {
      const state = {
        assessmentId: assessment.id,
        targetUrl: assessment.targetUrl,
        percent,
        message,
        currentDomain: currentDomainId,
        domains: [...domainProgressList],
        isFinished
      };
      executionProgress.set(assessment.id, state);
      return state;
    };

    // Set status to RUNNING
    assessment.status = 'RUNNING';
    updateLiveProgress(5, 'Initializing automated security test pipeline...', 'discovery');
    dbService.saveAssessment(assessment);

    // 1. STEP 1: APPLICATION DISCOVERY
    const discDomain = domainProgressList.find(d => d.id === 'discovery');
    discDomain.status = 'Running';
    discDomain.details = 'Crawling routes, endpoints, and security headers...';
    updateLiveProgress(10, 'Discovering application attack surface...', 'discovery');

    await sleep(250);
    const discoveryResult = await discoveryService.discover(assessment.targetUrl, assessment.environment);
    assessment.discovery = discoveryResult;
    assessment.discoverySummary = discoveryResult.summary;

    discDomain.status = 'Passed';
    discDomain.details = `${discoveryResult.summary.pagesCount} pages, ${discoveryResult.summary.apiEndpointsCount} API routes, ${discoveryResult.summary.parametersCount} parameters mapped`;
    updateLiveProgress(20, 'Application footprint discovery completed.', 'discovery');

    // 2. STEP 2: TEST PLAN COMPILATION
    const testPlan = testEngine.generateTestPlan(discoveryResult, assessment.scopes);
    assessment.testPlan = testPlan;
    updateLiveProgress(25, `Compiled ${testPlan.totalTests} security checks with selection rationale across 7 domains.`, 'auth');

    // 3. STEP 3: DOMAIN-BY-DOMAIN AUTOMATED TESTING
    const allTestResults = [];
    const generatedFindings = [];
    const evidenceArtifacts = [];

    // Group tests by domain
    const testsByDomain = {};
    for (const test of testPlan.tests) {
      const domainKey = test.domain;
      if (!testsByDomain[domainKey]) testsByDomain[domainKey] = [];
      testsByDomain[domainKey].push(test);
    }

    const testDomainsToRun = DOMAIN_STEPS.filter(d => d.id !== 'discovery');
    const domainPercentStep = 60 / testDomainsToRun.length;

    for (let idx = 0; idx < testDomainsToRun.length; idx++) {
      const domStep = testDomainsToRun[idx];
      const tracker = domainProgressList.find(d => d.id === domStep.id);
      tracker.status = 'Running';
      tracker.details = `Executing tests in ${domStep.name}...`;

      const currentProgressPercent = Math.round(25 + (idx * domainPercentStep));
      updateLiveProgress(currentProgressPercent, `Testing domain: ${domStep.name}...`, domStep.id);
      await sleep(250);

      // Execute tests for this domain
      const testsInDomain = testsByDomain[domStep.domainKey] || [];
      tracker.testsCount = testsInDomain.length;

      let domainFailures = 0;
      for (const test of testsInDomain) {
        const outcome = testEngine.evaluateTest(test, {
          targetUrl: assessment.targetUrl,
          environment: assessment.environment
        });
        allTestResults.push(outcome);

        if (outcome.status === 'FAILED') {
          domainFailures++;
          const finding = findingEngine.createFindingFromTestResult(assessment.id, outcome, outcome.evidence);
          generatedFindings.push(finding);
          evidenceArtifacts.push(outcome.evidence);
        }
      }

      tracker.findingsCount = domainFailures;
      if (domainFailures > 0) {
        tracker.status = 'Findings Detected';
        tracker.details = `${domainFailures} vulnerability condition(s) detected (${testsInDomain.length - domainFailures} clean)`;
      } else {
        tracker.status = 'Passed';
        tracker.details = `All ${testsInDomain.length} tests passed cleanly`;
      }
    }

    // 4. STEP 4: CVSS MAPPING & RISK SCORING
    updateLiveProgress(90, 'Computing CVSS 3.1 base metrics and aggregate risk rating...', 'data');
    await sleep(200);

    const allAssessmentFindings = dbService.getFindings().filter(f => f.assessmentId === assessment.id);
    const { riskIndex, riskRating } = riskService.calculateAggregateRisk(allAssessmentFindings);

    const timestamp = new Date().toISOString();
    assessment.status = 'COMPLETED';
    assessment.completedAt = timestamp;
    assessment.riskIndex = riskIndex;
    assessment.riskRating = riskRating;
    assessment.totalFindingsCount = allAssessmentFindings.length;
    // Step 6 & 7: Findings start as Candidate, so confirmed validated count is 0 until validated
    assessment.candidateCount = allAssessmentFindings.filter(f => f.status === 'Candidate').length;
    assessment.validatedCount = allAssessmentFindings.filter(f => f.status === 'Validated').length;
    assessment.verifiedCount = allAssessmentFindings.filter(f => f.status === 'Verified').length;
    assessment.retestCount = allAssessmentFindings.filter(f => f.retest?.executedAt || f.status === 'Verified' || f.status === 'Regression').length;

    assessment.testPlanSummary = {
      total: testPlan.totalTests,
      passed: allTestResults.filter(r => r.status === 'PASSED').length,
      failed: allTestResults.filter(r => r.status === 'FAILED').length,
      pending: 0
    };
    assessment.testExecutions = allTestResults;
    assessment.executionProgress = updateLiveProgress(100, 'Security assessment completed successfully across all 7 domains.', null, true);

    dbService.saveAssessment(assessment);
    dbService.addAuditLog(
      'ASSESSMENT_COMPLETED',
      'Assessment Engine',
      assessment.id,
      `Assessment completed with ${allAssessmentFindings.length} candidate findings. Risk rating: ${riskRating} (${riskIndex}/100)`
    );

    return {
      success: true,
      assessment,
      discovery: discoveryResult,
      testPlan,
      findings: allAssessmentFindings,
      risk: { riskIndex, riskRating },
      domainProgress: domainProgressList
    };
  },

  /**
   * Get progress for an active assessment
   */
  getProgress(assessmentId) {
    if (executionProgress.has(assessmentId)) {
      return executionProgress.get(assessmentId);
    }
    const assessment = dbService.getAssessment(assessmentId);
    if (assessment?.executionProgress) {
      return assessment.executionProgress;
    }
    return {
      assessmentId,
      percent: 0,
      message: 'Idle / Ready for execution',
      currentDomain: null,
      domains: DOMAIN_STEPS.map(d => ({
        id: d.id,
        name: d.name,
        status: 'Pending',
        testsCount: 0,
        findingsCount: 0,
        details: 'Awaiting execution'
      })),
      isFinished: false
    };
  }
};
